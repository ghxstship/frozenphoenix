import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: send-comm-template
 *
 * Triggered by pg_notify on requirement_status_change and collaborator_status_change channels.
 * Looks up the appropriate comm template, renders merge variables, and sends via email.
 *
 * Invocation: POST with { record, type } payload from pg_notify trigger
 * or direct invocation from API routes.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "noreply@playbook.app";
const FROM_NAME = Deno.env.get("FROM_NAME") ?? "Playbook";

interface CommPayload {
    template_key: string;
    project_id: string;
    collaborator_id?: string;
    recipient_email: string;
    recipient_name: string;
    variables?: Record<string, string>;
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers":
                    "authorization, content-type, x-client-info, apikey",
            },
        });
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    try {
        const payload = (await req.json()) as CommPayload;

        if (!payload.template_key || !payload.project_id || !payload.recipient_email) {
            return new Response(
                JSON.stringify({
                    error: "template_key, project_id, and recipient_email are required",
                }),
                { status: 400 }
            );
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // Fetch the project comm template
        const { data: template, error: templateError } = await supabase
            .from("project_comm_templates")
            .select("*")
            .eq("project_id", payload.project_id)
            .eq("template_key", payload.template_key)
            .eq("is_active", true)
            .single();

        if (templateError || !template) {
            // Fallback: try org-level template
            const { data: project } = await supabase
                .from("projects")
                .select("organization_id")
                .eq("id", payload.project_id)
                .single();

            if (project) {
                const { data: orgTemplate } = await supabase
                    .from("org_comm_templates")
                    .select("*")
                    .eq("organization_id", project.organization_id)
                    .eq("template_key", payload.template_key)
                    .eq("is_active", true)
                    .single();

                if (!orgTemplate) {
                    console.warn(
                        `[send-comm-template] No template found for key: ${payload.template_key}`
                    );
                    return new Response(
                        JSON.stringify({ warning: "Template not found, email not sent" }),
                        { status: 200 }
                    );
                }

                // Use org template
                return await sendEmail(supabase, orgTemplate, payload);
            }

            return new Response(JSON.stringify({ warning: "Template not found" }), { status: 200 });
        }

        return await sendEmail(supabase, template, payload);
    } catch (err) {
        console.error("[send-comm-template] Unhandled error:", err);
        return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
    }
});

async function sendEmail(
    supabase: ReturnType<typeof createClient>,
    template: Record<string, unknown>,
    payload: CommPayload
): Promise<Response> {
    // Render merge variables
    let subject = String(template.subject ?? "");
    let bodyHtml = String(template.body_html ?? "");

    const vars: Record<string, string> = {
        recipient_name: payload.recipient_name,
        recipient_email: payload.recipient_email,
        ...(payload.variables ?? {}),
    };

    // Fetch project details for common variables
    const { data: project } = await supabase
        .from("projects")
        .select("name, client, start_date, end_date")
        .eq("id", payload.project_id)
        .single();

    if (project) {
        vars.project_name = project.name ?? "";
        vars.client_name = project.client ?? "";
        vars.project_start_date = project.start_date ?? "";
        vars.project_end_date = project.end_date ?? "";
    }

    // Replace {{variable}} placeholders
    for (const [key, value] of Object.entries(vars)) {
        const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi");
        subject = subject.replace(pattern, value);
        bodyHtml = bodyHtml.replace(pattern, value);
    }

    // Send via SendGrid if configured
    if (SENDGRID_API_KEY) {
        try {
            const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${SENDGRID_API_KEY}`,
                },
                body: JSON.stringify({
                    personalizations: [
                        {
                            to: [{ email: payload.recipient_email, name: payload.recipient_name }],
                        },
                    ],
                    from: { email: FROM_EMAIL, name: FROM_NAME },
                    subject,
                    content: [{ type: "text/html", value: bodyHtml }],
                }),
            });

            if (!sgRes.ok) {
                const sgError = await sgRes.text();
                console.error("[send-comm-template] SendGrid error:", sgError);
            }
        } catch (sgErr) {
            console.error("[send-comm-template] SendGrid fetch error:", sgErr);
        }
    } else {
        console.log(
            `[send-comm-template] SendGrid not configured. Would send to: ${payload.recipient_email}`
        );
        console.log(`[send-comm-template] Subject: ${subject}`);
    }

    // Log the sent email in email_messages table
    const orgId = project
        ? (
              await supabase
                  .from("projects")
                  .select("organization_id")
                  .eq("id", payload.project_id)
                  .single()
          ).data?.organization_id
        : null;

    await supabase.from("email_messages").insert({
        organization_id: orgId,
        entity_type: "project_collaborator",
        entity_id: payload.collaborator_id ?? payload.project_id,
        from_address: FROM_EMAIL,
        from_name: FROM_NAME,
        to_addresses: [payload.recipient_email],
        subject,
        body_html: bodyHtml,
        direction: "outbound",
    });

    // Update template send_count + last_sent_at
    await supabase
        .from("project_comm_templates")
        .update({
            send_count: ((template.send_count as number) ?? 0) + 1,
            last_sent_at: new Date().toISOString(),
        })
        .eq("id", template.id);

    return new Response(JSON.stringify({ success: true, to: payload.recipient_email }), {
        status: 200,
    });
}
