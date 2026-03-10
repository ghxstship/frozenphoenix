import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { csvResponse, generateTemplateCsv } from "@/lib/csv/csv-utils";
import { getEntityTemplate, getImportableFields } from "@/lib/csv/csv-templates";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    const { entity } = await params;

    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const template = getEntityTemplate(entity);
    if (!template) {
        return ApiErrors.badRequest(`Unknown entity: ${entity}`);
    }

    if (!template.importEnabled) {
        return ApiErrors.badRequest(`Import is not enabled for entity: ${entity}`);
    }

    // Build template headers from importable fields only
    const importableFields = getImportableFields(template);
    const headers = importableFields.map((f) => ({
        key: f.dbColumn,
        label: f.csvHeader,
        description: f.description + (f.required ? " (REQUIRED)" : "") +
            (f.enumValues ? ` [${f.enumValues.join(" | ")}]` : ""),
        example: f.example,
    }));

    const csv = generateTemplateCsv(headers);
    const filename = `${template.entity}_import_template.csv`;

    return csvResponse(csv, filename);
}
