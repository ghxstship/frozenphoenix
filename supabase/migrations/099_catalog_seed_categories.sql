-- ============================================================================
-- Migration 099: Seed Catalog Category Hierarchy
--
-- Seeds the 3-level catalog_categories hierarchy from Universal Advance Seed
-- Catalog v6.0:
--   Depth 0: 8 Collections (Site, Technical, Hospitality, etc.)
--   Depth 1: 32 Categories
--   Depth 2: 82 Subcategories (with UNSPSC, NIGP, NAICS codes)
--
-- Platform categories have organization_id IS NULL.
-- Replaces the flat depth-0 categories from migration 047.
--
-- Dependencies: 047 (catalog_categories table), 098 (enriched columns + enums)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: Remove old platform categories (047 seed) that conflict
-- Only remove platform (org_id IS NULL) categories that have no items
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM catalog_categories
WHERE organization_id IS NULL
  AND item_count = 0
  AND id NOT IN (SELECT DISTINCT category_id FROM catalog_items WHERE deleted_at IS NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: DEPTH 0 — Collections (8)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, description, sort_order, depth)
VALUES
    (NULL, NULL, 'Site',                     'site',                     'site',          'Site infrastructure, vehicles, equipment, services, and signage', 100, 0),
    (NULL, NULL, 'Technical',                'technical',                'technical',     'Audio, lighting, video, staging, rigging, and backline',          200, 0),
    (NULL, NULL, 'Hospitality',              'hospitality',              'hospitality',   'Catering, green room, and hospitality services',                 300, 0),
    (NULL, NULL, 'Food & Beverage',          'food-beverage',            'food_beverage', 'Bar, restaurant, and kitchen equipment and consumables',         400, 0),
    (NULL, NULL, 'Retail',                   'retail',                   'retail',        'Merchandise, POS, and vendor marketplace infrastructure',        500, 0),
    (NULL, NULL, 'Workplace',                'workplace',                'workplace',     'Access, communications, uniforms, furnishings, and safety',      600, 0),
    (NULL, NULL, 'Travel & Accommodations',  'travel-accommodations',    'travel',        'Airfare, lodging, transportation, and rental vehicles',          700, 0),
    (NULL, NULL, 'Labor',                    'labor',                    'labor',         'Leadership, operators, skilled labor, and general labor',         800, 0)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: DEPTH 1 — Categories (32)
-- Uses subqueries to resolve parent_id from collection slug.
-- ─────────────────────────────────────────────────────────────────────────────

-- Site (6 categories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site' AND depth = 0 AND organization_id IS NULL), 'Site Assets & Infrastructure', 'site-assets-infrastructure', 'site', 'INFR', 'Fencing, tents, flooring, and portable facilities', 110, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site' AND depth = 0 AND organization_id IS NULL), 'Site Vehicles',                'site-vehicles',              'site', 'VEHI', 'Utility vehicles, trucks, and specialty vehicles',  120, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site' AND depth = 0 AND organization_id IS NULL), 'Heavy Equipment',              'heavy-equipment',            'site', 'HEQP', 'Aerial lifts, forklifts, and cranes',              130, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site' AND depth = 0 AND organization_id IS NULL), 'Site Services',                'site-services',              'site', 'SERV', 'Power, water, waste, climate, and connectivity',   140, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site' AND depth = 0 AND organization_id IS NULL), 'Site Equipment & Tools',       'site-equipment-tools',       'site', 'TOOL', 'Safety equipment, tools, and consumables',         150, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site' AND depth = 0 AND organization_id IS NULL), 'Signage & Wayfinding',         'signage-wayfinding',         'site', 'SIGN', 'Directional, digital, and scenic signage',         160, 1)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Technical (6 categories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'technical' AND depth = 0 AND organization_id IS NULL), 'Audio',     'audio',     'technical', 'AUDI', 'PA systems, DJ equipment, microphones, consoles, infrastructure', 210, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'technical' AND depth = 0 AND organization_id IS NULL), 'Lighting',  'lighting',  'technical', 'LITE', 'Automated fixtures, static fixtures, atmospheric, control',       220, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'technical' AND depth = 0 AND organization_id IS NULL), 'Video',     'video',     'technical', 'VIDO', 'LED walls, cameras, projection, playback and processing',         230, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'technical' AND depth = 0 AND organization_id IS NULL), 'Staging',   'staging',   'technical', 'STAG', 'Stage decks, risers, and stage infrastructure',                   240, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'technical' AND depth = 0 AND organization_id IS NULL), 'Rigging',   'rigging',   'technical', 'RIGG', 'Truss, motors, chain hoists, and rigging hardware',               250, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'technical' AND depth = 0 AND organization_id IS NULL), 'Backline',  'backline',  'technical', 'BKLN', 'Amplifiers, keyboards, drum kits, and miscellaneous',             260, 1)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Hospitality (2 categories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'hospitality' AND depth = 0 AND organization_id IS NULL), 'Catering',                'catering',                'hospitality', 'CATR', 'Artist, crew, guest, and VIP catering',                310, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'hospitality' AND depth = 0 AND organization_id IS NULL), 'Green Room & Hospitality', 'green-room-hospitality',  'hospitality', 'GRHP', 'Artist hospitality, VIP lounges, and amenities',       320, 1)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Food & Beverage (3 categories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'food-beverage' AND depth = 0 AND organization_id IS NULL), 'Bar',        'bar',        'food_beverage', 'BARR', 'Bar equipment and consumables',         410, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'food-beverage' AND depth = 0 AND organization_id IS NULL), 'Restaurant', 'restaurant', 'food_beverage', 'REST', 'Food service equipment',                420, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'food-beverage' AND depth = 0 AND organization_id IS NULL), 'Kitchen',    'kitchen',    'food_beverage', 'KTCH', 'Kitchen equipment and concession carts', 430, 1)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Retail (2 categories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'retail' AND depth = 0 AND organization_id IS NULL), 'Merchandise',        'merchandise',        'retail', 'MRCH', 'Display fixtures, POS, and packaging',    510, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'retail' AND depth = 0 AND organization_id IS NULL), 'Vendor Marketplace', 'vendor-marketplace', 'retail', 'VMKT', 'Vendor infrastructure and activation',     520, 1)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Workplace (5 categories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'workplace' AND depth = 0 AND organization_id IS NULL), 'Access & Credentials',    'access-credentials-wp',    'workplace', 'ACCS', 'Credentials and access control',                  610, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'workplace' AND depth = 0 AND organization_id IS NULL), 'Radio & Communications',  'radio-communications',     'workplace', 'COMM', 'Two-way radios and intercoms',                    620, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'workplace' AND depth = 0 AND organization_id IS NULL), 'Uniforms',                'uniforms',                 'workplace', 'UNIF', 'Staff apparel',                                   630, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'workplace' AND depth = 0 AND organization_id IS NULL), 'Furnishings',             'furnishings',              'workplace', 'FURN', 'Office, production, lounge, and VIP furnishings', 640, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'workplace' AND depth = 0 AND organization_id IS NULL), 'Health & Safety',         'health-safety',            'workplace', 'HLTH', 'Medical, PPE, and security systems',              650, 1)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Travel & Accommodations (4 categories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'travel-accommodations' AND depth = 0 AND organization_id IS NULL), 'Airfare',          'airfare',          'travel', 'AIRF', 'Domestic and international flights',     710, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'travel-accommodations' AND depth = 0 AND organization_id IS NULL), 'Lodging',          'lodging',          'travel', 'LODG', 'Hotels and alternative lodging',          720, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'travel-accommodations' AND depth = 0 AND organization_id IS NULL), 'Transportation',   'transportation',   'travel', 'TRNS', 'Ground and water transport',              730, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'travel-accommodations' AND depth = 0 AND organization_id IS NULL), 'Rental Vehicles',  'rental-vehicles',  'travel', 'RENT', 'Cars, trucks, and specialty rentals',     740, 1)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Labor (4 categories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'labor' AND depth = 0 AND organization_id IS NULL), 'Leadership',               'leadership',               'labor', 'LEAD', 'Production management and department heads',       810, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'labor' AND depth = 0 AND organization_id IS NULL), 'Heavy Equipment Operators', 'heavy-equipment-operators', 'labor', 'OPER', 'Certified equipment operators',                    820, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'labor' AND depth = 0 AND organization_id IS NULL), 'Skilled Labor',            'skilled-labor',            'labor', 'SKIL', 'Technical crew and creative specialty',             830, 1),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'labor' AND depth = 0 AND organization_id IS NULL), 'General Labor',            'general-labor',            'labor', 'GENL', 'Stagehands, event staff, and specialty personnel', 840, 1)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: DEPTH 2 — Subcategories (82) with classification codes
-- ─────────────────────────────────────────────────────────────────────────────

-- Site > Site Assets & Infrastructure (4 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-assets-infrastructure' AND depth = 1 AND organization_id IS NULL), 'Fencing & Barriers',    'fencing-barriers',    'site', 'INFR', 'FENC', '30191500', '570-50', '238990', 'Crowd control barriers, fencing, stanchions, and bollards', 111, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-assets-infrastructure' AND depth = 1 AND organization_id IS NULL), 'Tents & Structures',    'tents-structures',    'site', 'INFR', 'TENT', '30181500', '570-72', '532490', 'Frame tents, pole tents, clear span, shade, containers',    112, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-assets-infrastructure' AND depth = 1 AND organization_id IS NULL), 'Flooring & Surfaces',   'flooring-surfaces',   'site', 'INFR', 'FLOR', '30161500', '570-30', '238330', 'Ground protection, dance floors, turf, carpet, mats',       113, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-assets-infrastructure' AND depth = 1 AND organization_id IS NULL), 'Portable Facilities',   'portable-facilities', 'site', 'INFR', 'PORT', '30181600', '570-74', '532490', 'Restrooms, trailers, hand wash, showers',                   114, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Site > Site Vehicles (3 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-vehicles' AND depth = 1 AND organization_id IS NULL), 'Utility Vehicles',    'utility-vehicles',    'site', 'VEHI', 'UTIL', '25101700', '070-85', '532120', 'Golf carts, UTVs, ATVs, and electric scooters',       121, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-vehicles' AND depth = 1 AND organization_id IS NULL), 'Trucks & Transport',  'trucks-transport',    'site', 'VEHI', 'TRUK', '25101500', '070-42', '484110', 'Box trucks, flatbeds, sprinters, pickups, tractors',   122, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-vehicles' AND depth = 1 AND organization_id IS NULL), 'Specialty Vehicles',  'specialty-vehicles',  'site', 'VEHI', 'SPEC', '25101900', '070-88', '532120', 'Water trucks, fuel trucks, and street sweepers',       123, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Site > Heavy Equipment (3 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'heavy-equipment' AND depth = 1 AND organization_id IS NULL), 'Aerial Lifts',         'aerial-lifts',         'site', 'HEQP', 'AERI', '22101500', '070-04', '532412', 'Scissor lifts, boom lifts, and push-around lifts',   131, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'heavy-equipment' AND depth = 1 AND organization_id IS NULL), 'Forklifts & Loaders',  'forklifts-loaders',    'site', 'HEQP', 'FORK', '22101600', '070-33', '532412', 'Forklifts, telehandlers, and skid steers',            132, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'heavy-equipment' AND depth = 1 AND organization_id IS NULL), 'Cranes',               'cranes',               'site', 'HEQP', 'CRAN', '22101700', '070-20', '532412', 'Mobile cranes and tower cranes',                      133, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Site > Site Services (5 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-services' AND depth = 1 AND organization_id IS NULL), 'Power & Electrical',       'power-electrical',       'site', 'SERV', 'POWR', '26111700', '285-55', '238210', 'Generators, distro, cabling, tie-ins, batteries',      141, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-services' AND depth = 1 AND organization_id IS NULL), 'Water & Plumbing',         'water-plumbing',         'site', 'SERV', 'WATR', '47131600', '670-90', '562991', 'Potable water tanks and gray water tanks',              142, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-services' AND depth = 1 AND organization_id IS NULL), 'Waste Management',         'waste-management',       'site', 'SERV', 'WAST', '76111500', '926-90', '562111', 'Dumpsters, trash receptacles, removal, compactors',     143, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-services' AND depth = 1 AND organization_id IS NULL), 'Climate Control',          'climate-control',        'site', 'SERV', 'CLIM', '40101500', '031-00', '238220', 'Portable AC, heaters, and industrial fans',             144, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-services' AND depth = 1 AND organization_id IS NULL), 'Internet & Connectivity',  'internet-connectivity',  'site', 'SERV', 'INET', '43222600', '208-58', '517311', 'Temporary WiFi, cell boosters, ethernet',               145, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Site > Site Equipment & Tools (3 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-equipment-tools' AND depth = 1 AND organization_id IS NULL), 'Safety Equipment',              'safety-equipment',              'site', 'TOOL', 'SAFE', '46191600', '345-30', '423490', 'Fire extinguishers, first aid, AEDs, crowd management', 151, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-equipment-tools' AND depth = 1 AND organization_id IS NULL), 'General Tools & Hardware',      'general-tools-hardware',        'site', 'TOOL', 'HDWR', '27111500', '445-00', '423710', 'Tool kits, ladders, hand trucks, pallet jacks',         152, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'site-equipment-tools' AND depth = 1 AND organization_id IS NULL), 'Expendables & Consumables',     'expendables-consumables',       'site', 'TOOL', 'EXPD', '31201500', '031-50', '423840', 'Gaffer tape, cable ties, sandbags, straps',              153, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Site > Signage & Wayfinding (3 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'signage-wayfinding' AND depth = 1 AND organization_id IS NULL), 'Directional Signage', 'directional-signage', 'site', 'SIGN', 'DIRE', '55121700', '765-00', '339950', 'Coroplast signs, A-frames, banners, truss-mounted',      161, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'signage-wayfinding' AND depth = 1 AND organization_id IS NULL), 'Digital Signage',     'digital-signage',     'site', 'SIGN', 'DGTL', '43211700', '208-23', '334310', 'LED message boards and digital kiosks',                   162, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'signage-wayfinding' AND depth = 1 AND organization_id IS NULL), 'Scenic & Decorative', 'scenic-decorative',   'site', 'SIGN', 'SCEN', '55101500', '765-20', '339950', 'Inflatables, neon signs, and balloon installations',      163, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Technical > Audio (5 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'audio' AND depth = 1 AND organization_id IS NULL), 'PA Systems',            'pa-systems',            'technical', 'AUDI', 'PASY', '52161500', '730-12', '532490', 'Line arrays, point source, delay towers, distributed',    211, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'audio' AND depth = 1 AND organization_id IS NULL), 'DJ Equipment',          'dj-equipment',          'technical', 'AUDI', 'DJEQ', '52161505', '730-14', '532490', 'DJ packages, turntables, and DJ booths',                  212, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'audio' AND depth = 1 AND organization_id IS NULL), 'Microphones & DI',      'microphones-di',        'technical', 'AUDI', 'MICR', '52161512', '730-16', '532490', 'Vocal, wireless, instrument mics, DIs, drum kits',        213, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'audio' AND depth = 1 AND organization_id IS NULL), 'Mixing Consoles',       'mixing-consoles',       'technical', 'AUDI', 'CONS', '52161510', '730-18', '532490', 'Small and large format mixing consoles',                  214, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'audio' AND depth = 1 AND organization_id IS NULL), 'Audio Infrastructure',  'audio-infrastructure',  'technical', 'AUDI', 'AINF', '52161520', '730-20', '532490', 'Snakes, stage wedges, in-ears, amp racks, recording',     215, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Technical > Lighting (4 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'lighting' AND depth = 1 AND organization_id IS NULL), 'Automated Fixtures',   'automated-fixtures',   'technical', 'LITE', 'AUTO', '39111600', '285-40', '532490', 'Moving heads — wash, spot, beam, profile, wash bars',    221, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'lighting' AND depth = 1 AND organization_id IS NULL), 'Static Fixtures',      'static-fixtures',      'technical', 'LITE', 'STAT', '39111500', '285-42', '532490', 'PARs, ellipsoidals, followspots, blinders, strobes, etc.', 222, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'lighting' AND depth = 1 AND organization_id IS NULL), 'Atmospheric Effects',  'atmospheric-effects',  'technical', 'LITE', 'ATMO', '60141100', '730-60', '532490', 'Haze, fog, cryo, confetti, flame, sparks, lasers',       223, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'lighting' AND depth = 1 AND organization_id IS NULL), 'Lighting Control',     'lighting-control',     'technical', 'LITE', 'CTRL', '39112100', '285-44', '532490', 'Consoles, DMX nodes, and dimmer racks',                  224, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Technical > Video (4 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'video' AND depth = 1 AND organization_id IS NULL), 'LED Walls & Displays',    'led-walls-displays',    'technical', 'VIDO', 'LEDW', '45111600', '208-42', '532490', 'Indoor/outdoor LED, tiles, mobile screens, flat panels', 231, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'video' AND depth = 1 AND organization_id IS NULL), 'Cameras & Capture',       'cameras-capture',       'technical', 'VIDO', 'CAMR', '45121500', '208-44', '532490', 'IMAG cameras, switchers, and livestream',                232, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'video' AND depth = 1 AND organization_id IS NULL), 'Projection',              'projection',            'technical', 'VIDO', 'PROJ', '45111612', '208-46', '532490', 'Standard/large projectors, screens, and mapping',        233, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'video' AND depth = 1 AND organization_id IS NULL), 'Playback & Processing',   'playback-processing',   'technical', 'VIDO', 'PLAY', '45111700', '208-48', '532490', 'Media servers and video processors',                     234, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Technical > Staging (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'staging' AND depth = 1 AND organization_id IS NULL), 'Stage Decks & Risers',  'stage-decks-risers',  'technical', 'STAG', 'DECK', '56101700', '570-65', '532490', 'Stage decks, risers, stairs, runways, acoustic shells',  241, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'staging' AND depth = 1 AND organization_id IS NULL), 'Stage Infrastructure',  'stage-infrastructure', 'technical', 'STAG', 'SINF', '56101800', '570-67', '532490', 'Pipe and drape, backdrops, skirting, and photo pit ramps', 242, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Technical > Rigging (3 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'rigging' AND depth = 1 AND organization_id IS NULL), 'Truss',                  'truss',                  'technical', 'RIGG', 'TRUS', '31162400', '570-69', '532490', '12in, 20.5in, 30in, and circle truss systems',           251, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'rigging' AND depth = 1 AND organization_id IS NULL), 'Motors & Chain Hoists',  'motors-chain-hoists',    'technical', 'RIGG', 'MOTR', '24102000', '445-18', '532490', 'Half-ton, one-ton motors, and ground support towers',     252, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'rigging' AND depth = 1 AND organization_id IS NULL), 'Rigging Hardware',       'rigging-hardware',       'technical', 'RIGG', 'RGHW', '31162200', '445-20', '532490', 'Shackles, clamps, slings, and rigging hardware bundles',   253, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Technical > Backline (4 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'backline' AND depth = 1 AND organization_id IS NULL), 'Amplifiers & Cabinets',     'amplifiers-cabinets',     'technical', 'BKLN', 'AMPL', '60131100', '730-30', '532490', 'Guitar and bass amplifiers',                              261, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'backline' AND depth = 1 AND organization_id IS NULL), 'Keyboards & Controllers',   'keyboards-controllers',   'technical', 'BKLN', 'KEYS', '60131200', '730-32', '532490', 'Stage keyboards and keyboard stands',                     262, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'backline' AND depth = 1 AND organization_id IS NULL), 'Drum Kits',                 'drum-kits',               'technical', 'BKLN', 'DRUM', '60131300', '730-34', '532490', 'Acoustic and electronic drum kits',                       263, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'backline' AND depth = 1 AND organization_id IS NULL), 'Miscellaneous Backline',    'miscellaneous-backline',  'technical', 'BKLN', 'MISC', '60131400', '730-36', '532490', 'Music stands, rental instruments, percussion kits',       264, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Hospitality > Catering (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'catering' AND depth = 1 AND organization_id IS NULL), 'Artist & Crew Catering', 'artist-crew-catering', 'hospitality', 'CATR', 'ARTC', '90101600', '961-36', '722320', 'Meal service, craft services, coffee, and water',       311, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'catering' AND depth = 1 AND organization_id IS NULL), 'Guest & VIP Catering',   'guest-vip-catering',   'hospitality', 'CATR', 'VIPC', '90101700', '961-38', '722320', 'VIP packages, beverage service, dessert, food trucks',  312, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Hospitality > Green Room & Hospitality (3 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'green-room-hospitality' AND depth = 1 AND organization_id IS NULL), 'Artist Hospitality',      'artist-hospitality',      'hospitality', 'GRHP', 'ARTH', '90101800', '961-40', '721110', 'Green rooms, per diems, dressing rooms, rider fulfillment',  321, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'green-room-hospitality' AND depth = 1 AND organization_id IS NULL), 'VIP & Lounge',            'vip-lounge',              'hospitality', 'GRHP', 'VIPL', '90101900', '961-42', '722410', 'VIP lounges, bottle service, and hookah lounges',            322, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'green-room-hospitality' AND depth = 1 AND organization_id IS NULL), 'Amenities & Services',    'amenities-services',      'hospitality', 'GRHP', 'AMEN', '90102000', '961-44', '721110', 'Charging stations, coat check, guest services, lost/found',  323, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Food & Beverage > Bar (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'bar' AND depth = 1 AND organization_id IS NULL), 'Bar Equipment',    'bar-equipment',    'food_beverage', 'BARR', 'BEQP', '48101500', '345-10', '532490', 'Portable bars, draft systems, tools, ice bins, displays',  411, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'bar' AND depth = 1 AND organization_id IS NULL), 'Bar Consumables',  'bar-consumables',  'food_beverage', 'BARR', 'BCON', '48101600', '345-12', '424810', 'Glassware, disposable drinkware, garnish and mixers',      412, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Food & Beverage > Restaurant (1 subcategory)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'restaurant' AND depth = 1 AND organization_id IS NULL), 'Service Equipment', 'service-equipment', 'food_beverage', 'REST', 'SEQP', '48101700', '345-14', '532490', 'Chafing dishes, linens, flatware, dispensers, trays', 421, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Food & Beverage > Kitchen (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'kitchen' AND depth = 1 AND organization_id IS NULL), 'Kitchen Equipment',       'kitchen-equipment',       'food_beverage', 'KTCH', 'KEQP', '48101800', '345-16', '532490', 'Mobile kitchens, grills, refrigerators, ice machines, etc.',   431, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'kitchen' AND depth = 1 AND organization_id IS NULL), 'Concessions & Carts',     'concessions-carts',       'food_beverage', 'KTCH', 'CART', '48101900', '345-18', '532490', 'Concession stands, specialty food carts, beverage carts',      432, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Retail > Merchandise (3 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'merchandise' AND depth = 1 AND organization_id IS NULL), 'Display & Fixtures',     'display-fixtures',     'retail', 'MRCH', 'DISP', '52141500', '345-20', '532490', 'Booths, racks, tables, shelving, mannequins, cases',         511, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'merchandise' AND depth = 1 AND organization_id IS NULL), 'POS & Technology',       'pos-technology',       'retail', 'MRCH', 'POST', '52161600', '208-50', '423430', 'Mobile POS, cash handling, and portable ATMs',               512, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'merchandise' AND depth = 1 AND organization_id IS NULL), 'Packaging & Supplies',   'packaging-supplies',   'retail', 'MRCH', 'PACK', '55121500', '615-00', '322211', 'Branded bags and retail packaging supplies',                  513, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Retail > Vendor Marketplace (1 subcategory)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'vendor-marketplace' AND depth = 1 AND organization_id IS NULL), 'Vendor Infrastructure', 'vendor-infrastructure', 'retail', 'VMKT', 'VINF', '80141600', '961-50', '711310', 'Booth space, food truck pads, and sponsor activations', 521, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Workplace > Access & Credentials (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'access-credentials-wp' AND depth = 1 AND organization_id IS NULL), 'Credentials',     'credentials',     'workplace', 'ACCS', 'CRED', '44103100', '590-10', '323111', 'Badges, wristbands, and parking passes',               611, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'access-credentials-wp' AND depth = 1 AND organization_id IS NULL), 'Access Control',  'access-control',  'workplace', 'ACCS', 'ACTC', '46171600', '590-12', '561621', 'Metal detectors, RFID scanners, and ticket stations',  612, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Workplace > Radio & Communications (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'radio-communications' AND depth = 1 AND organization_id IS NULL), 'Two-Way Radios', 'two-way-radios', 'workplace', 'COMM', 'RDIO', '43191500', '680-50', '423690', 'Standard, digital, repeaters, and chargers',          621, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'radio-communications' AND depth = 1 AND organization_id IS NULL), 'Intercoms',      'intercoms',      'workplace', 'COMM', 'INTC', '43191600', '680-52', '423690', 'Wired and wireless intercom systems',                 622, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Workplace > Uniforms (1 subcategory)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'uniforms' AND depth = 1 AND organization_id IS NULL), 'Staff Apparel', 'staff-apparel', 'workplace', 'UNIF', 'APRL', '53101500', '200-00', '315990', 'T-shirts, polos, vests, ponchos, and jackets', 631, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Workplace > Furnishings (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'furnishings' AND depth = 1 AND organization_id IS NULL), 'Office & Production', 'office-production', 'workplace', 'FURN', 'OFFC', '56101500', '425-00', '532420', 'Folding tables, chairs, cocktail tables, office packages',   641, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'furnishings' AND depth = 1 AND organization_id IS NULL), 'Lounge & VIP',       'lounge-vip',       'workplace', 'FURN', 'LNGE', '56101600', '425-10', '532420', 'Lounge furniture sets, ottomans, and bar stools',            642, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Workplace > Health & Safety (3 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'health-safety' AND depth = 1 AND organization_id IS NULL), 'Medical',           'medical',           'workplace', 'HLTH', 'MEDL', '85121800', '475-00', '621910', 'EMTs, medical stations, and ambulance standby',       651, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'health-safety' AND depth = 1 AND organization_id IS NULL), 'PPE',               'ppe',               'workplace', 'HLTH', 'PPEE', '46181500', '475-50', '423450', 'Hard hats, safety glasses, hearing, gloves',          652, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'health-safety' AND depth = 1 AND organization_id IS NULL), 'Security Systems',  'security-systems',  'workplace', 'HLTH', 'SECU', '46171500', '680-80', '561621', 'Temporary security cameras and security lighting',    653, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Travel & Accommodations > Airfare (1 subcategory)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'airfare' AND depth = 1 AND organization_id IS NULL), 'Flights', 'flights', 'travel', 'AIRF', 'FLIT', '78111500', '962-10', '481111', 'Domestic, international, economy, business, charter', 711, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Travel & Accommodations > Lodging (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'lodging' AND depth = 1 AND organization_id IS NULL), 'Hotels',              'hotels',              'travel', 'LODG', 'HOTL', '90111500', '962-20', '721110', 'Standard rooms, suites, and group blocks',              721, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'lodging' AND depth = 1 AND organization_id IS NULL), 'Alternative Lodging', 'alternative-lodging', 'travel', 'LODG', 'ALTL', '90111600', '962-22', '721199', 'Vacation rentals and RV/motorhomes',                    722, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Travel & Accommodations > Transportation (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'transportation' AND depth = 1 AND organization_id IS NULL), 'Ground Transport', 'ground-transport-sub', 'travel', 'TRNS', 'GRND', '78111800', '962-30', '485310', 'Sedans, shuttles, motor coaches, limos, pedicabs',    731, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'transportation' AND depth = 1 AND organization_id IS NULL), 'Water Transport',  'water-transport',      'travel', 'TRNS', 'WTRT', '78111900', '962-32', '483112', 'Charter boats and water vessels',                      732, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Travel & Accommodations > Rental Vehicles (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'rental-vehicles' AND depth = 1 AND organization_id IS NULL), 'Cars & Trucks',      'cars-trucks',      'travel', 'RENT', 'CARS', '78111600', '070-65', '532111', 'Economy, full-size, SUV, cargo van, passenger van',     741, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'rental-vehicles' AND depth = 1 AND organization_id IS NULL), 'Specialty Rentals',  'specialty-rentals', 'travel', 'RENT', 'SPCR', '78111700', '070-67', '532120', 'Enclosed trailers, fuel cards, parking passes',         742, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Labor > Leadership (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'leadership' AND depth = 1 AND organization_id IS NULL), 'Production Management', 'production-management', 'labor', 'LEAD', 'PMGT', '80111600', '918-56', '711510', 'Production managers, stage managers, show callers',     811, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'leadership' AND depth = 1 AND organization_id IS NULL), 'Department Heads',      'department-heads',      'labor', 'LEAD', 'DEPT', '80111700', '918-58', '711510', 'Audio, lighting, video, rigging, catering, security, GX heads', 812, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Labor > Heavy Equipment Operators (1 subcategory)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'heavy-equipment-operators' AND depth = 1 AND organization_id IS NULL), 'Certified Operators', 'certified-operators', 'labor', 'OPER', 'CERT', '80111800', '918-60', '238910', 'Forklift, aerial lift, crane, and CDL operators', 821, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Labor > Skilled Labor (2 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'skilled-labor' AND depth = 1 AND organization_id IS NULL), 'Technical Crew',        'technical-crew',        'labor', 'SKIL', 'TCRE', '80111900', '918-62', '711510', 'Audio, lighting, video techs, riggers, electricians, etc.', 831, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'skilled-labor' AND depth = 1 AND organization_id IS NULL), 'Creative & Specialty',  'creative-specialty',    'labor', 'SKIL', 'CREA', '80112000', '918-64', '711510', 'Photographers, videographers, drone pilots, designers, etc.', 832, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- Labor > General Labor (3 subcategories)
INSERT INTO catalog_categories (organization_id, parent_id, name, slug, category_type, category_code, subcategory_code, unspsc_code, nigp_code, naics_code, description, sort_order, depth)
VALUES
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'general-labor' AND depth = 1 AND organization_id IS NULL), 'Stagehands',       'stagehands',       'labor', 'GENL', 'HAND', '80111500', '918-50', '711510', 'IATSE and non-union stagehands',                                       841, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'general-labor' AND depth = 1 AND organization_id IS NULL), 'Event Staff',      'event-staff',      'labor', 'GENL', 'EVST', '80111501', '918-52', '561320', 'Security, ushers, ambassadors, janitorial, runners, parking, registration', 842, 2),
    (NULL, (SELECT id FROM catalog_categories WHERE slug = 'general-labor' AND depth = 1 AND organization_id IS NULL), 'Specialty Staff',  'specialty-staff',  'labor', 'GENL', 'SPST', '80111502', '918-54', '711510', 'Bartenders, servers, valets, flaggers, DJs, MCs, interpreters, etc.',      843, 2)
ON CONFLICT (organization_id, slug, parent_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: VALIDATION — assert expected counts
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    v_depth0 INTEGER;
    v_depth1 INTEGER;
    v_depth2 INTEGER;
BEGIN
    SELECT count(*) INTO v_depth0 FROM catalog_categories WHERE organization_id IS NULL AND depth = 0;
    SELECT count(*) INTO v_depth1 FROM catalog_categories WHERE organization_id IS NULL AND depth = 1;
    SELECT count(*) INTO v_depth2 FROM catalog_categories WHERE organization_id IS NULL AND depth = 2;

    IF v_depth0 < 8 THEN
        RAISE WARNING 'Expected >= 8 depth-0 collections, got %', v_depth0;
    END IF;
    IF v_depth1 < 32 THEN
        RAISE WARNING 'Expected >= 32 depth-1 categories, got %', v_depth1;
    END IF;
    IF v_depth2 < 82 THEN
        RAISE WARNING 'Expected >= 82 depth-2 subcategories, got %', v_depth2;
    END IF;

    RAISE NOTICE 'Catalog categories seeded: % collections, % categories, % subcategories', v_depth0, v_depth1, v_depth2;
END $$;
