#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * generate-catalog-seed.ts
 *
 * Parses ADVANCING_CATALOG_SEED.md and generates SQL migration files:
 *   - 100_catalog_seed_items.sql (351 catalog_items)
 *   - 101_catalog_seed_pricing.sql (351 × 3 pricing tiers)
 *
 * Usage: npx tsx scripts/generate-catalog-seed.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const SEED_PATH = join(__dirname, "..", "docs", "ADVANCING_CATALOG_SEED.md");
const ITEMS_OUT = join(__dirname, "..", "supabase", "migrations", "100_catalog_seed_items.sql");
const PRICING_OUT = join(__dirname, "..", "supabase", "migrations", "102_catalog_seed_pricing.sql");

const md = readFileSync(SEED_PATH, "utf-8");
const lines = md.split("\n");

// ─── Types ───────────────────────────────────────────────────────────────────

interface CatalogItem {
    sku: string;
    displayName: string;
    unspsc: string;
    commonName: string;
    searchAliases: string[];
    description: string;
    specifications: string;
    options: string[];
    modifiers: string;
    prerequisites: string;
    pricingUnit: string;
    leadTimeHours: number;
    setupTime: string;
    strikeTime: string;
    crewRequired: string;
    power: string;
    footprint: string;
    truckSpace: string;
    weather: string;
    complianceTags: string[];
    sustainabilityTags: string[];
    subcategorySlug: string; // resolved from SKU
}

interface PricingRow {
    sku: string;
    displayName: string;
    unit: string;
    basicLow: number;
    basicHigh: number;
    standardLow: number;
    standardHigh: number;
    premiumLow: number;
    premiumHigh: number;
}

// ─── SKU → Subcategory slug mapping ──────────────────────────────────────────

const SKU_PREFIX_TO_SUBCATEGORY: Record<string, string> = {
    "SITE-INFR-FENC": "fencing-barriers",
    "SITE-INFR-TENT": "tents-structures",
    "SITE-INFR-FLOR": "flooring-surfaces",
    "SITE-INFR-PORT": "portable-facilities",
    "SITE-VEHI-UTIL": "utility-vehicles",
    "SITE-VEHI-TRUK": "trucks-transport",
    "SITE-VEHI-SPEC": "specialty-vehicles",
    "SITE-HEQP-AERI": "aerial-lifts",
    "SITE-HEQP-FORK": "forklifts-loaders",
    "SITE-HEQP-CRAN": "cranes",
    "SITE-SERV-POWR": "power-electrical",
    "SITE-SERV-WATR": "water-plumbing",
    "SITE-SERV-WAST": "waste-management",
    "SITE-SERV-CLIM": "climate-control",
    "SITE-SERV-INET": "internet-connectivity",
    "SITE-TOOL-SAFE": "safety-equipment",
    "SITE-TOOL-HDWR": "general-tools-hardware",
    "SITE-TOOL-EXPD": "expendables-consumables",
    "SITE-SIGN-DIRE": "directional-signage",
    "SITE-SIGN-DGTL": "digital-signage",
    "SITE-SIGN-SCEN": "scenic-decorative",
    "TECH-AUDI-PASY": "pa-systems",
    "TECH-AUDI-DJEQ": "dj-equipment",
    "TECH-AUDI-MICR": "microphones-di",
    "TECH-AUDI-CONS": "mixing-consoles",
    "TECH-AUDI-AINF": "audio-infrastructure",
    "TECH-LITE-AUTO": "automated-fixtures",
    "TECH-LITE-STAT": "static-fixtures",
    "TECH-LITE-ATMO": "atmospheric-effects",
    "TECH-LITE-CTRL": "lighting-control",
    "TECH-VIDO-LEDW": "led-walls-displays",
    "TECH-VIDO-CAMR": "cameras-capture",
    "TECH-VIDO-PROJ": "projection",
    "TECH-VIDO-PLAY": "playback-processing",
    "TECH-STAG-DECK": "stage-decks-risers",
    "TECH-STAG-SINF": "stage-infrastructure",
    "TECH-RIGG-TRUS": "truss",
    "TECH-RIGG-MOTR": "motors-chain-hoists",
    "TECH-RIGG-RGHW": "rigging-hardware",
    "TECH-BKLN-AMPL": "amplifiers-cabinets",
    "TECH-BKLN-KEYS": "keyboards-controllers",
    "TECH-BKLN-DRUM": "drum-kits",
    "TECH-BKLN-MISC": "miscellaneous-backline",
    "HOSP-CATR-ARTC": "artist-crew-catering",
    "HOSP-CATR-VIPC": "guest-vip-catering",
    "HOSP-GRHP-ARTH": "artist-hospitality",
    "HOSP-GRHP-VIPL": "vip-lounge",
    "HOSP-GRHP-AMEN": "amenities-services",
    "FNB-BARR-BEQP": "bar-equipment",
    "FNB-BARR-BCON": "bar-consumables",
    "FNB-REST-SEQP": "service-equipment",
    "FNB-KTCH-KEQP": "kitchen-equipment",
    "FNB-KTCH-CART": "concessions-carts",
    "FNBV-BARR-BEQP": "bar-equipment",
    "FNBV-BARR-BCON": "bar-consumables",
    "FNBV-REST-SEQP": "service-equipment",
    "FNBV-KTCH-KEQP": "kitchen-equipment",
    "FNBV-KTCH-CART": "concessions-carts",
    "RETL-MRCH-DISP": "display-fixtures",
    "RETL-MRCH-POST": "pos-technology",
    "RETL-MRCH-PACK": "packaging-supplies",
    "RETL-VMKT-VINF": "vendor-infrastructure",
    "WORK-ACCS-CRED": "credentials",
    "WORK-ACCS-ACTC": "access-control",
    "WORK-COMM-RDIO": "two-way-radios",
    "WORK-COMM-INTC": "intercoms",
    "WORK-UNIF-APRL": "staff-apparel",
    "WORK-FURN-OFFC": "office-production",
    "WORK-FURN-LNGE": "lounge-vip",
    "WORK-HLTH-MEDL": "medical",
    "WORK-HLTH-PPEE": "ppe",
    "WORK-HLTH-SECU": "security-systems",
    "TRVL-AIRF-FLIT": "flights",
    "TRVL-LODG-HOTL": "hotels",
    "TRVL-LODG-ALTL": "alternative-lodging",
    "TRVL-TRNS-GRND": "ground-transport-sub",
    "TRVL-TRNS-WTRT": "water-transport",
    "TRVL-RENT-CARS": "cars-trucks",
    "TRVL-RENT-SPCR": "specialty-rentals",
    "LABR-LEAD-PMGT": "production-management",
    "LABR-LEAD-DEPT": "department-heads",
    "LABR-OPER-CERT": "certified-operators",
    "LABR-SKIL-TCRE": "technical-crew",
    "LABR-SKIL-CREA": "creative-specialty",
    "LABR-GENL-HAND": "stagehands",
    "LABR-GENL-EVST": "event-staff",
    "LABR-GENL-SPST": "specialty-staff",
};

// ─── Parse item detail blocks ────────────────────────────────────────────────

function parseItems(): CatalogItem[] {
    const items: CatalogItem[] = [];
    let i = 0;

    while (i < lines.length) {
        // Find item blocks: they start with ###### (h6) followed by a table
        const currentLine = lines[i] ?? "";
        if (currentLine.startsWith("######") && !currentLine.startsWith("#######")) {
            const displayName = currentLine.replace(/^#+\s*/, "").trim();

            // Read the table rows that follow
            const fields: Record<string, string> = {};
            let j = i + 1;
            // Skip blank lines and table header
            while (
                j < lines.length &&
                ((lines[j] ?? "").trim() === "" || (lines[j] ?? "").startsWith("| |"))
            )
                j++;
            if (j < lines.length && (lines[j] ?? "").startsWith("|---")) j++;

            while (j < lines.length && (lines[j] ?? "").startsWith("|")) {
                const parts = (lines[j] ?? "").split("|").map((p) => p.trim());
                // parts[0] is empty (before first |), parts[1] is the key, parts[2..n-1] are values, parts[n] is empty (after last |)
                if (parts.length >= 3) {
                    const key = (parts[1] ?? "").replace(/\*\*/g, "").trim();
                    // Join all value cells (index 2 through length-2) with | to preserve pipe-delimited multi-values
                    const valueParts = parts
                        .slice(2, -1)
                        .map((p) => p.replace(/`/g, "").trim())
                        .filter(Boolean);
                    const value = valueParts.join(" | ");
                    if (key && value) fields[key] = value;
                }
                j++;
            }

            // Skip items without SKU (not catalog items)
            if (fields["SKU"]) {
                const sku = fields["SKU"] ?? "";
                const skuPrefix = sku.split("-").slice(0, 3).join("-");
                const subcategorySlug = SKU_PREFIX_TO_SUBCATEGORY[skuPrefix] || "";

                if (!subcategorySlug) {
                    console.warn(
                        `WARNING: No subcategory mapping for SKU prefix: ${skuPrefix} (${displayName})`
                    );
                }

                const parseLeadTime = (s: string): number => {
                    const m = s.match(/(\d+)/);
                    return m ? parseInt(m[1] ?? "0", 10) : 0;
                };

                const parseTagList = (s: string): string[] => {
                    if (!s) return [];
                    return s
                        .split("|")
                        .map((t) => t.trim())
                        .filter(Boolean);
                };

                const parseAliases = (s: string): string[] => {
                    if (!s) return [];
                    return s
                        .split("|")
                        .map((t) => t.trim())
                        .filter(Boolean);
                };

                const parseOptions = (s: string): string[] => {
                    if (!s) return [];
                    return s
                        .split("|")
                        .map((t) => t.trim())
                        .filter(Boolean);
                };

                items.push({
                    sku,
                    displayName,
                    unspsc: fields["UNSPSC"] || "",
                    commonName: fields["Common Name"] || "",
                    searchAliases: parseAliases(fields["Search Aliases"] || ""),
                    description: fields["Description"] || "",
                    specifications: fields["Specifications"] || "",
                    options: parseOptions(fields["Options"] || ""),
                    modifiers: fields["Modifiers"] || "",
                    prerequisites: fields["Prerequisites"] || "",
                    pricingUnit: fields["Pricing Unit"] || "",
                    leadTimeHours: parseLeadTime(fields["Lead Time"] || "0"),
                    setupTime: fields["Setup Time"] || "",
                    strikeTime: fields["Strike Time"] || "",
                    crewRequired: fields["Crew Required"] || "",
                    power: fields["Power"] || "",
                    footprint: fields["Footprint"] || "",
                    truckSpace: fields["Truck Space"] || "",
                    weather: (fields["Weather"] || "not_applicable").toLowerCase(),
                    complianceTags: parseTagList(fields["Compliance"] || ""),
                    sustainabilityTags: parseTagList(fields["Sustainability"] || ""),
                    subcategorySlug,
                });
            }

            i = j;
        } else {
            i++;
        }
    }

    return items;
}

// ─── Parse pricing table ─────────────────────────────────────────────────────

function parsePricing(): PricingRow[] {
    const rows: PricingRow[] = [];
    let inPricingSection = false;

    for (const line of lines) {
        if (line.includes("### Pricing by Item (USD)")) {
            inPricingSection = true;
            continue;
        }
        if (inPricingSection && line.startsWith("*Full 8-country")) {
            break;
        }
        if (!inPricingSection) continue;
        if (!line.startsWith("| `")) continue;

        // | `SITE-1001` | Barricade - Bike Rack - 8ft | per section/day | $7 - 9 | $10 - 14 | $15 - 21 |
        const parts = line.split("|").map((p) => p.trim());
        if (parts.length < 7) continue;

        const code = (parts[1] ?? "").replace(/`/g, "").trim();
        const displayName = (parts[2] ?? "").trim();
        const unit = (parts[3] ?? "").trim();

        const parseRange = (s: string): [number, number] => {
            const cleaned = s.replace(/[$,]/g, "").trim();
            const match = cleaned.match(/([\d.]+)\s*-\s*([\d.]+)/);
            if (match) return [parseFloat(match[1] ?? "0"), parseFloat(match[2] ?? "0")];
            const single = parseFloat(cleaned);
            return [single, single];
        };

        const [bLow, bHigh] = parseRange(parts[4] ?? "0");
        const [sLow, sHigh] = parseRange(parts[5] ?? "0");
        const [pLow, pHigh] = parseRange(parts[6] ?? "0");

        rows.push({
            sku: code,
            displayName,
            unit,
            basicLow: bLow,
            basicHigh: bHigh,
            standardLow: sLow,
            standardHigh: sHigh,
            premiumLow: pLow,
            premiumHigh: pHigh,
        });
    }

    return rows;
}

// ─── SQL escaping ────────────────────────────────────────────────────────────

function esc(s: string): string {
    return s.replace(/'/g, "''");
}

function sqlArray(arr: string[]): string {
    if (arr.length === 0) return "'{}'";
    return `ARRAY[${arr.map((a) => `'${esc(a)}'`).join(", ")}]`;
}

// ─── Generate items migration ────────────────────────────────────────────────

function generateItemsSQL(items: CatalogItem[]): string {
    const header = `-- ============================================================================
-- Migration 100: Seed 351 Catalog Items (Universal Advance Seed Catalog v6.0)
--
-- Auto-generated by scripts/generate-catalog-seed.ts
-- DO NOT EDIT MANUALLY — re-run the generator script to update.
--
-- All items are platform-level (organization_id IS NULL, is_custom = false).
-- Items reference subcategories seeded in migration 099.
-- Dependencies: 047 (catalog tables), 098 (enriched columns), 099 (categories)
-- ============================================================================

`;

    const inserts: string[] = [];
    let sortOrder = 0;

    for (const item of items) {
        sortOrder++;
        const insert = `INSERT INTO catalog_items (
    organization_id, category_id, name, description, sku, hierarchical_sku,
    common_name, search_aliases, options, modifiers_summary, prerequisites,
    pricing_unit, lead_time_hours, setup_time, strike_time, crew_required,
    power_requirements, footprint, truck_space, weather, compliance_tags,
    sustainability_tags, unspsc_code, specifications, unit_of_measure,
    is_custom, is_critical_path, client_visible, status, sort_order
) VALUES (
    NULL,
    (SELECT id FROM catalog_categories WHERE slug = '${esc(item.subcategorySlug)}' AND depth = 2 AND organization_id IS NULL),
    '${esc(item.displayName)}',
    '${esc(item.description)}',
    '${esc(item.sku)}',
    '${esc(item.sku)}',
    '${esc(item.commonName)}',
    ${sqlArray(item.searchAliases)},
    ${sqlArray(item.options)},
    ${item.modifiers ? `'${esc(item.modifiers)}'` : "NULL"},
    ${item.prerequisites ? `'${esc(item.prerequisites)}'` : "NULL"},
    ${item.pricingUnit ? `'${esc(item.pricingUnit)}'` : "'each'"},
    ${item.leadTimeHours},
    ${item.setupTime ? `'${esc(item.setupTime)}'` : "NULL"},
    ${item.strikeTime ? `'${esc(item.strikeTime)}'` : "NULL"},
    ${item.crewRequired ? `'${esc(item.crewRequired)}'` : "NULL"},
    ${item.power ? `'${esc(item.power)}'` : "NULL"},
    ${item.footprint ? `'${esc(item.footprint)}'` : "NULL"},
    ${item.truckSpace ? `'${esc(item.truckSpace)}'` : "NULL"},
    '${item.weather}'::weather_rating,
    ${sqlArray(item.complianceTags)},
    ${sqlArray(item.sustainabilityTags)},
    '${esc(item.unspsc)}',
    jsonb_build_object('text', '${esc(item.specifications)}'),
    '${esc(item.pricingUnit || "each")}',
    false, false, true, 'active', ${sortOrder}
)
ON CONFLICT DO NOTHING;`;

        inserts.push(insert);
    }

    const validation = `
-- ─────────────────────────────────────────────────────────────────────────────
-- VALIDATION
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT count(*) INTO v_count FROM catalog_items WHERE organization_id IS NULL AND deleted_at IS NULL;
    IF v_count < 351 THEN
        RAISE WARNING 'Expected >= 351 platform catalog items, got %', v_count;
    END IF;
    RAISE NOTICE 'Platform catalog items: %', v_count;
END $$;
`;

    return header + inserts.join("\n\n") + "\n" + validation;
}

// ─── Generate pricing migration ──────────────────────────────────────────────

function generatePricingSQL(pricing: PricingRow[]): string {
    const header = `-- ============================================================================
-- Migration 101: Seed 3-Tier Pricing for 351 Catalog Items (USD)
--
-- Auto-generated by scripts/generate-catalog-seed.ts
-- DO NOT EDIT MANUALLY — re-run the generator script to update.
--
-- Inserts Basic, Standard, and Premium price ranges for each item.
-- Other currencies can be derived via the currency multipliers in the seed doc.
-- Dependencies: 098 (catalog_pricing_tiers table), 100 (catalog items)
-- ============================================================================

`;

    const inserts: string[] = [];

    for (const row of pricing) {
        // Match item by hierarchical_sku (which equals the seed SKU)
        // The pricing table uses legacy codes (SITE-1001) but we need to map them to hierarchical SKUs
        // We'll look up by name since that's unique enough
        inserts.push(`-- ${row.sku}: ${row.displayName}
INSERT INTO catalog_pricing_tiers (catalog_item_id, tier, currency, price_low, price_high)
SELECT id, 'basic'::pricing_tier, 'USD', ${row.basicLow}, ${row.basicHigh}
FROM catalog_items WHERE name = '${esc(row.displayName)}' AND organization_id IS NULL
ON CONFLICT (catalog_item_id, tier, currency) DO NOTHING;

INSERT INTO catalog_pricing_tiers (catalog_item_id, tier, currency, price_low, price_high)
SELECT id, 'standard'::pricing_tier, 'USD', ${row.standardLow}, ${row.standardHigh}
FROM catalog_items WHERE name = '${esc(row.displayName)}' AND organization_id IS NULL
ON CONFLICT (catalog_item_id, tier, currency) DO NOTHING;

INSERT INTO catalog_pricing_tiers (catalog_item_id, tier, currency, price_low, price_high)
SELECT id, 'premium'::pricing_tier, 'USD', ${row.premiumLow}, ${row.premiumHigh}
FROM catalog_items WHERE name = '${esc(row.displayName)}' AND organization_id IS NULL
ON CONFLICT (catalog_item_id, tier, currency) DO NOTHING;`);
    }

    const validation = `
-- ─────────────────────────────────────────────────────────────────────────────
-- VALIDATION
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT count(*) INTO v_count FROM catalog_pricing_tiers WHERE currency = 'USD';
    RAISE NOTICE 'USD pricing tiers seeded: % (expected ~1053 = 351 items x 3 tiers)', v_count;
END $$;
`;

    return header + inserts.join("\n\n") + "\n" + validation;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
    console.log("Parsing catalog items...");
    const items = parseItems();
    console.log(`Found ${items.length} items`);

    // Fix: specifications should be stored as text in the specifications column, not as JSONB
    // The catalog_items.specifications column is JSONB, so we need to wrap it
    const fixedItems = items.map((item) => ({
        ...item,
        specifications: item.specifications,
    }));

    console.log("Parsing pricing...");
    const pricing = parsePricing();
    console.log(`Found ${pricing.length} pricing rows`);

    console.log("Generating items SQL...");
    const itemsSQL = generateItemsSQL(fixedItems);
    writeFileSync(ITEMS_OUT, itemsSQL, "utf-8");
    console.log(`Written: ${ITEMS_OUT}`);

    console.log("Generating pricing SQL...");
    const pricingSQL = generatePricingSQL(pricing);
    writeFileSync(PRICING_OUT, pricingSQL, "utf-8");
    console.log(`Written: ${PRICING_OUT}`);

    // Summary
    const unmapped = items.filter((i) => !i.subcategorySlug);
    if (unmapped.length > 0) {
        console.warn(`\n⚠️  ${unmapped.length} items have no subcategory mapping:`);
        unmapped.forEach((i) => console.warn(`  - ${i.sku}: ${i.displayName}`));
    }

    console.log(`\n✅ Done. ${items.length} items, ${pricing.length} pricing rows.`);
}

main();
