/* ═══════════════════════════════════════════════════════════════
   COMMUNICATION TEMPLATE CONFIG — SSOT for project comm templates
   
   Defines all template keys, their metadata, available merge
   variables, and default HTML bodies. Used by the auto-generation
   engine to populate project_comm_templates on project creation.
   ═══════════════════════════════════════════════════════════════ */

export interface CommTemplateDefinition {
    key: string;
    name: string;
    description: string;
    variables: string[];
    defaultSubject: string;
    defaultBodyHtml: string;
}

export const COMM_TEMPLATE_DEFINITIONS: CommTemplateDefinition[] = [
    {
        key: "collaborator_invitation",
        name: "Collaborator Invitation",
        description: "Sent when a collaborator is invited to the project",
        variables: [
            "project_name",
            "client_name",
            "collaborator_name",
            "collaborator_company",
            "portal_url",
            "scope_summary",
            "start_date",
            "end_date",
        ],
        defaultSubject: "You've been invited to {{project_name}}",
        defaultBodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Project Invitation</h2>
  <p>Hi {{collaborator_name}},</p>
  <p>You've been invited to collaborate on <strong>{{project_name}}</strong> for {{client_name}}.</p>
  <p><strong>Scope:</strong> {{scope_summary}}</p>
  <p><strong>Timeline:</strong> {{start_date}} – {{end_date}}</p>
  <p>Please accept your invitation to access the project portal:</p>
  <p><a href="{{portal_url}}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Accept Invitation</a></p>
</div>`,
    },
    {
        key: "onboarding_welcome",
        name: "Onboarding Welcome",
        description: "Sent when a collaborator accepts the invitation and portal goes live",
        variables: [
            "project_name",
            "collaborator_name",
            "portal_url",
            "deadline_contracts",
            "deadline_coi",
            "deadline_advance",
            "deadline_crew",
        ],
        defaultSubject: "Welcome to {{project_name}} — Next Steps",
        defaultBodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Welcome Aboard</h2>
  <p>Hi {{collaborator_name}},</p>
  <p>Your portal for <strong>{{project_name}}</strong> is now active. Here's what we need from you:</p>
  <ul>
    <li><strong>Contracts:</strong> Due by {{deadline_contracts}}</li>
    <li><strong>Certificate of Insurance:</strong> Due by {{deadline_coi}}</li>
    <li><strong>Production Advance Manifest:</strong> Due by {{deadline_advance}}</li>
    <li><strong>Crew Roster:</strong> Due by {{deadline_crew}}</li>
  </ul>
  <p><a href="{{portal_url}}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Open Portal</a></p>
</div>`,
    },
    {
        key: "contract_issued",
        name: "Contract Issued",
        description: "Sent when a contract is issued for e-signature",
        variables: [
            "project_name",
            "collaborator_name",
            "contract_title",
            "contract_type",
            "signing_url",
            "deadline",
        ],
        defaultSubject: "Contract Ready for Signature — {{project_name}}",
        defaultBodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Contract for Review & Signature</h2>
  <p>Hi {{collaborator_name}},</p>
  <p>A <strong>{{contract_type}}</strong> contract has been issued for <strong>{{project_name}}</strong>:</p>
  <p><strong>{{contract_title}}</strong></p>
  <p>Please review and sign by <strong>{{deadline}}</strong>.</p>
  <p><a href="{{signing_url}}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Review & Sign</a></p>
</div>`,
    },
    {
        key: "coi_request",
        name: "COI Request",
        description: "Sent when a Certificate of Insurance is requested",
        variables: [
            "project_name",
            "collaborator_name",
            "coverage_minimum",
            "deadline",
            "upload_url",
        ],
        defaultSubject: "Certificate of Insurance Required — {{project_name}}",
        defaultBodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Certificate of Insurance Required</h2>
  <p>Hi {{collaborator_name}},</p>
  <p>We require a Certificate of Insurance for <strong>{{project_name}}</strong>.</p>
  <p><strong>Minimum coverage:</strong> {{coverage_minimum}}</p>
  <p><strong>Deadline:</strong> {{deadline}}</p>
  <p>Please upload your COI through the portal:</p>
  <p><a href="{{upload_url}}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Upload COI</a></p>
</div>`,
    },
    {
        key: "advance_manifest_request",
        name: "Advance Manifest Request",
        description: "Sent when production advance items are assigned to a collaborator",
        variables: [
            "project_name",
            "collaborator_name",
            "item_count",
            "total_value",
            "deadline",
            "portal_url",
        ],
        defaultSubject: "Production Advance — Items Assigned ({{project_name}})",
        defaultBodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Production Advance Items Assigned</h2>
  <p>Hi {{collaborator_name}},</p>
  <p><strong>{{item_count}}</strong> items ({{total_value}}) have been assigned to you for <strong>{{project_name}}</strong>.</p>
  <p>Please review the items, confirm quantities and specifications, and submit your delivery manifest by <strong>{{deadline}}</strong>.</p>
  <p><a href="{{portal_url}}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Review Items</a></p>
</div>`,
    },
    {
        key: "crew_roster_request",
        name: "Crew Roster Request",
        description: "Sent when crew roster submission is required",
        variables: [
            "project_name",
            "collaborator_name",
            "crew_count_estimate",
            "deadline",
            "portal_url",
        ],
        defaultSubject: "Crew Roster Submission Required — {{project_name}}",
        defaultBodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Crew Roster Submission</h2>
  <p>Hi {{collaborator_name}},</p>
  <p>Please submit your crew roster for <strong>{{project_name}}</strong>.</p>
  <p><strong>Estimated crew size:</strong> {{crew_count_estimate}}</p>
  <p>For each crew member, we'll need: name, role, credentials, parking, radio, uniform needs, travel/lodging, and dietary requirements.</p>
  <p><strong>Deadline:</strong> {{deadline}}</p>
  <p><a href="{{portal_url}}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Submit Roster</a></p>
</div>`,
    },
    {
        key: "deadline_reminder",
        name: "Deadline Reminder",
        description: "Automated reminder for approaching submission deadlines",
        variables: [
            "project_name",
            "collaborator_name",
            "item_type",
            "deadline",
            "days_remaining",
            "portal_url",
        ],
        defaultSubject: "Reminder: {{item_type}} due in {{days_remaining}} days — {{project_name}}",
        defaultBodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Deadline Approaching</h2>
  <p>Hi {{collaborator_name}},</p>
  <p>This is a reminder that your <strong>{{item_type}}</strong> submission for <strong>{{project_name}}</strong> is due in <strong>{{days_remaining}} days</strong> ({{deadline}}).</p>
  <p>Please complete your submission as soon as possible:</p>
  <p><a href="{{portal_url}}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Open Portal</a></p>
</div>`,
    },
    {
        key: "submission_approved",
        name: "Submission Approved",
        description: "Sent when a collaborator submission is approved",
        variables: ["project_name", "collaborator_name", "submission_type", "approved_by"],
        defaultSubject: "{{submission_type}} Approved — {{project_name}}",
        defaultBodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Submission Approved</h2>
  <p>Hi {{collaborator_name}},</p>
  <p>Your <strong>{{submission_type}}</strong> for <strong>{{project_name}}</strong> has been approved by {{approved_by}}.</p>
  <p>No further action is needed for this item.</p>
</div>`,
    },
    {
        key: "submission_rejected",
        name: "Submission Rejected",
        description: "Sent when a collaborator submission is rejected with reason",
        variables: [
            "project_name",
            "collaborator_name",
            "submission_type",
            "rejection_reason",
            "portal_url",
        ],
        defaultSubject: "Action Required: {{submission_type}} Needs Revision — {{project_name}}",
        defaultBodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Revision Required</h2>
  <p>Hi {{collaborator_name}},</p>
  <p>Your <strong>{{submission_type}}</strong> for <strong>{{project_name}}</strong> requires revision.</p>
  <p><strong>Reason:</strong> {{rejection_reason}}</p>
  <p>Please update and resubmit through the portal:</p>
  <p><a href="{{portal_url}}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Open Portal</a></p>
</div>`,
    },
];

export const COMM_TEMPLATE_MAP = Object.fromEntries(
    COMM_TEMPLATE_DEFINITIONS.map((t) => [t.key, t])
) as Record<string, CommTemplateDefinition>;

export const COMM_TEMPLATE_KEYS = COMM_TEMPLATE_DEFINITIONS.map((t) => t.key);
