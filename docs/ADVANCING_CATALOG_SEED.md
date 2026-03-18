# Universal Advance Seed Catalog v6.0

**GHXSTSHIP Industries LLC | ATLVS Platform | Supabase Migration-Ready**

- **Items:** 351
- **Columns:** 25
- **Collections:** 8
- **Categories:** 32
- **Subcategories:** 82
- **Markets:** 8 (USD, GBP, EUR, AED, AUD, CAD, MXN, BRL)
- **Tiers:** 3 (Basic, Standard, Premium)
- **Normalization:** 5-Layer (UNSPSC, Hierarchical SKU, Noun-First Display, Search Aliases, Typed Attributes)

---

## Table of Contents

- [Taxonomy](#taxonomy)
- [Schema Reference](#schema-reference)
- [Classification Codes](#classification-codes)
- [Catalog](#catalog)
  - [Site](#site)
    - [Site Assets & Infrastructure](#site-assets-and-infrastructure)
    - [Site Vehicles](#site-vehicles)
    - [Heavy Equipment](#heavy-equipment)
    - [Site Services](#site-services)
    - [Site Equipment & Tools](#site-equipment-and-tools)
    - [Signage & Wayfinding](#signage-and-wayfinding)
  - [Technical](#technical)
    - [Audio](#audio)
    - [Lighting](#lighting)
    - [Video](#video)
    - [Staging](#staging)
    - [Rigging](#rigging)
    - [Backline](#backline)
  - [Hospitality](#hospitality)
    - [Catering](#catering)
    - [Green Room & Hospitality](#green-room-and-hospitality)
  - [Food & Beverage](#food-and-beverage)
    - [Bar](#bar)
    - [Restaurant](#restaurant)
    - [Kitchen](#kitchen)
  - [Retail](#retail)
    - [Merchandise](#merchandise)
    - [Vendor Marketplace](#vendor-marketplace)
  - [Workplace](#workplace)
    - [Access & Credentials](#access-and-credentials)
    - [Radio & Communications](#radio-and-communications)
    - [Uniforms](#uniforms)
    - [Furnishings](#furnishings)
    - [Health & Safety](#health-and-safety)
  - [Travel & Accommodations](#travel-and-accommodations)
    - [Airfare](#airfare)
    - [Lodging](#lodging)
    - [Transportation](#transportation)
    - [Rental Vehicles](#rental-vehicles)
  - [Labor](#labor)
    - [Leadership](#leadership)
    - [Heavy Equipment Operators](#heavy-equipment-operators)
    - [Skilled Labor](#skilled-labor)
    - [General Labor](#general-labor)
- [Pricing](#pricing)

---

## Taxonomy

| Collection              | Category                     | Subcategory               | Items | Cat Code | Sub Code | UNSPSC   |
| ----------------------- | ---------------------------- | ------------------------- | ----: | -------- | -------- | -------- |
| Site                    | Site Assets & Infrastructure | Fencing & Barriers        |     9 | INFR     | FENC     | 30191500 |
| Site                    | Site Assets & Infrastructure | Tents & Structures        |     7 | INFR     | TENT     | 30181500 |
| Site                    | Site Assets & Infrastructure | Flooring & Surfaces       |     7 | INFR     | FLOR     | 30161500 |
| Site                    | Site Assets & Infrastructure | Portable Facilities       |     7 | INFR     | PORT     | 30181600 |
| Site                    | Site Vehicles                | Utility Vehicles          |     5 | VEHI     | UTIL     | 25101700 |
| Site                    | Site Vehicles                | Trucks & Transport        |     6 | VEHI     | TRUK     | 25101500 |
| Site                    | Site Vehicles                | Specialty Vehicles        |     3 | VEHI     | SPEC     | 25101900 |
| Site                    | Heavy Equipment              | Aerial Lifts              |     4 | HEQP     | AERI     | 22101500 |
| Site                    | Heavy Equipment              | Forklifts & Loaders       |     3 | HEQP     | FORK     | 22101600 |
| Site                    | Heavy Equipment              | Cranes                    |     2 | HEQP     | CRAN     | 22101700 |
| Site                    | Site Services                | Power & Electrical        |     6 | SERV     | POWR     | 26111700 |
| Site                    | Site Services                | Water & Plumbing          |     2 | SERV     | WATR     | 47131600 |
| Site                    | Site Services                | Waste Management          |     4 | SERV     | WAST     | 76111500 |
| Site                    | Site Services                | Climate Control           |     3 | SERV     | CLIM     | 40101500 |
| Site                    | Site Services                | Internet & Connectivity   |     3 | SERV     | INET     | 43222600 |
| Site                    | Site Equipment & Tools       | Safety Equipment          |     5 | TOOL     | SAFE     | 46191600 |
| Site                    | Site Equipment & Tools       | General Tools & Hardware  |     5 | TOOL     | HDWR     | 27111500 |
| Site                    | Site Equipment & Tools       | Expendables & Consumables |     4 | TOOL     | EXPD     | 31201500 |
| Site                    | Signage & Wayfinding         | Directional Signage       |     7 | SIGN     | DIRE     | 55121700 |
| Site                    | Signage & Wayfinding         | Digital Signage           |     2 | SIGN     | DGTL     | 43211700 |
| Site                    | Signage & Wayfinding         | Scenic & Decorative       |     3 | SIGN     | SCEN     | 55101500 |
| Technical               | Audio                        | PA Systems                |     6 | AUDI     | PASY     | 52161500 |
| Technical               | Audio                        | DJ Equipment              |     4 | AUDI     | DJEQ     | 52161505 |
| Technical               | Audio                        | Microphones & DI          |     5 | AUDI     | MICR     | 52161512 |
| Technical               | Audio                        | Mixing Consoles           |     2 | AUDI     | CONS     | 52161510 |
| Technical               | Audio                        | Audio Infrastructure      |     5 | AUDI     | AINF     | 52161520 |
| Technical               | Lighting                     | Automated Fixtures        |     5 | LITE     | AUTO     | 39111600 |
| Technical               | Lighting                     | Static Fixtures           |     8 | LITE     | STAT     | 39111500 |
| Technical               | Lighting                     | Atmospheric Effects       |     7 | LITE     | ATMO     | 60141100 |
| Technical               | Lighting                     | Lighting Control          |     3 | LITE     | CTRL     | 39112100 |
| Technical               | Video                        | LED Walls & Displays      |     6 | VIDO     | LEDW     | 45111600 |
| Technical               | Video                        | Cameras & Capture         |     3 | VIDO     | CAMR     | 45121500 |
| Technical               | Video                        | Projection                |     4 | VIDO     | PROJ     | 45111612 |
| Technical               | Video                        | Playback & Processing     |     2 | VIDO     | PLAY     | 45111700 |
| Technical               | Staging                      | Stage Decks & Risers      |     6 | STAG     | DECK     | 56101700 |
| Technical               | Staging                      | Stage Infrastructure      |     4 | STAG     | SINF     | 56101800 |
| Technical               | Rigging                      | Truss                     |     4 | RIGG     | TRUS     | 31162400 |
| Technical               | Rigging                      | Motors & Chain Hoists     |     3 | RIGG     | MOTR     | 24102000 |
| Technical               | Rigging                      | Rigging Hardware          |     1 | RIGG     | RGHW     | 31162200 |
| Technical               | Backline                     | Amplifiers & Cabinets     |     2 | BKLN     | AMPL     | 60131100 |
| Technical               | Backline                     | Keyboards & Controllers   |     2 | BKLN     | KEYS     | 60131200 |
| Technical               | Backline                     | Drum Kits                 |     2 | BKLN     | DRUM     | 60131300 |
| Technical               | Backline                     | Miscellaneous Backline    |     3 | BKLN     | MISC     | 60131400 |
| Hospitality             | Catering                     | Artist & Crew Catering    |     5 | CATR     | ARTC     | 90101600 |
| Hospitality             | Catering                     | Guest & VIP Catering      |     4 | CATR     | VIPC     | 90101700 |
| Hospitality             | Green Room & Hospitality     | Artist Hospitality        |     4 | GRHP     | ARTH     | 90101800 |
| Hospitality             | Green Room & Hospitality     | VIP & Lounge              |     3 | GRHP     | VIPL     | 90101900 |
| Hospitality             | Green Room & Hospitality     | Amenities & Services      |     4 | GRHP     | AMEN     | 90102000 |
| Food & Beverage         | Bar                          | Bar Equipment             |     5 | BARR     | BEQP     | 48101500 |
| Food & Beverage         | Bar                          | Bar Consumables           |     3 | BARR     | BCON     | 48101600 |
| Food & Beverage         | Restaurant                   | Service Equipment         |     5 | REST     | SEQP     | 48101700 |
| Food & Beverage         | Kitchen                      | Kitchen Equipment         |     6 | KTCH     | KEQP     | 48101800 |
| Food & Beverage         | Kitchen                      | Concessions & Carts       |     3 | KTCH     | CART     | 48101900 |
| Retail                  | Merchandise                  | Display & Fixtures        |     6 | MRCH     | DISP     | 52141500 |
| Retail                  | Merchandise                  | POS & Technology          |     3 | MRCH     | POST     | 52161600 |
| Retail                  | Merchandise                  | Packaging & Supplies      |     2 | MRCH     | PACK     | 55121500 |
| Retail                  | Vendor Marketplace           | Vendor Infrastructure     |     3 | VMKT     | VINF     | 80141600 |
| Workplace               | Access & Credentials         | Credentials               |     3 | ACCS     | CRED     | 44103100 |
| Workplace               | Access & Credentials         | Access Control            |     4 | ACCS     | ACTC     | 46171600 |
| Workplace               | Radio & Communications       | Two-Way Radios            |     4 | COMM     | RDIO     | 43191500 |
| Workplace               | Radio & Communications       | Intercoms                 |     2 | COMM     | INTC     | 43191600 |
| Workplace               | Uniforms                     | Staff Apparel             |     5 | UNIF     | APRL     | 53101500 |
| Workplace               | Furnishings                  | Office & Production       |     8 | FURN     | OFFC     | 56101500 |
| Workplace               | Furnishings                  | Lounge & VIP              |     3 | FURN     | LNGE     | 56101600 |
| Workplace               | Health & Safety              | Medical                   |     3 | HLTH     | MEDL     | 85121800 |
| Workplace               | Health & Safety              | PPE                       |     4 | HLTH     | PPEE     | 46181500 |
| Workplace               | Health & Safety              | Security Systems          |     2 | HLTH     | SECU     | 46171500 |
| Travel & Accommodations | Airfare                      | Flights                   |     6 | AIRF     | FLIT     | 78111500 |
| Travel & Accommodations | Lodging                      | Hotels                    |     3 | LODG     | HOTL     | 90111500 |
| Travel & Accommodations | Lodging                      | Alternative Lodging       |     2 | LODG     | ALTL     | 90111600 |
| Travel & Accommodations | Transportation               | Ground Transport          |     6 | TRNS     | GRND     | 78111800 |
| Travel & Accommodations | Transportation               | Water Transport           |     1 | TRNS     | WTRT     | 78111900 |
| Travel & Accommodations | Rental Vehicles              | Cars & Trucks             |     4 | RENT     | CARS     | 78111600 |
| Travel & Accommodations | Rental Vehicles              | Specialty Rentals         |     3 | RENT     | SPCR     | 78111700 |
| Labor                   | Leadership                   | Production Management     |     5 | LEAD     | PMGT     | 80111600 |
| Labor                   | Leadership                   | Department Heads          |     7 | LEAD     | DEPT     | 80111700 |
| Labor                   | Heavy Equipment Operators    | Certified Operators       |     4 | OPER     | CERT     | 80111800 |
| Labor                   | Skilled Labor                | Technical Crew            |     7 | SKIL     | TCRE     | 80111900 |
| Labor                   | Skilled Labor                | Creative & Specialty      |     6 | SKIL     | CREA     | 80112000 |
| Labor                   | General Labor                | Stagehands                |     2 | GENL     | HAND     | 80111500 |
| Labor                   | General Labor                | Event Staff               |     8 | GENL     | EVST     | 80111501 |
| Labor                   | General Labor                | Specialty Staff           |     9 | GENL     | SPST     | 80111502 |

[Back to top](#table-of-contents)

---

## Schema Reference

### Column Definitions

| Column                | Data Type      | Layer             | Description                                             |
| --------------------- | -------------- | ----------------- | ------------------------------------------------------- |
| `legacy_code`         | `VARCHAR(20)`  | L2 SKU            | Original flat item code (SITE-1001)                     |
| `hierarchical_sku`    | `VARCHAR(30)`  | L2 SKU            | Taxonomy-encoded SKU (SITE-INFR-FENC-001)               |
| `unspsc_code`         | `CHAR(8)`      | L1 Classification | UNSPSC 8-digit hierarchical code                        |
| `display_name`        | `VARCHAR(200)` | L3 Display        | Noun-first canonical name: Noun - Type - Differentiator |
| `common_name`         | `VARCHAR(200)` | L3 Display        | Most recognized industry name                           |
| `search_aliases`      | `TEXT`         | L4 Search         | Pipe-delimited alternative names for search index       |
| `collection`          | `VARCHAR(50)`  | Taxonomy          | Top-level grouping (8 collections)                      |
| `category`            | `VARCHAR(100)` | Taxonomy          | Mid-level grouping (32 categories)                      |
| `subcategory`         | `VARCHAR(100)` | Taxonomy          | Leaf-level grouping (82 subcategories)                  |
| `description`         | `TEXT`         | Product           | 2-3 sentence product description                        |
| `specifications`      | `TEXT`         | Product           | Technical specs: dimensions, weight, capacity           |
| `options`             | `TEXT`         | Product           | Available variants and configurations                   |
| `modifiers`           | `TEXT`         | Product           | Add-on configurations and customizations                |
| `prerequisites`       | `TEXT`         | Product           | Required dependencies for deployment                    |
| `pricing_unit`        | `VARCHAR(30)`  | Product           | Unit of measure for pricing                             |
| `lead_time_hours`     | `INTEGER`      | L5 Ops            | Minimum booking window in hours                         |
| `setup_time`          | `VARCHAR(100)` | L5 Ops            | Estimated install duration per unit                     |
| `strike_time`         | `VARCHAR(100)` | L5 Ops            | Estimated teardown duration per unit                    |
| `crew_required`       | `VARCHAR(200)` | L5 Ops            | Minimum personnel and certifications                    |
| `power_requirements`  | `VARCHAR(200)` | L5 Ops            | Electrical needs: amps, voltage, phase                  |
| `footprint`           | `VARCHAR(200)` | L5 Ops            | Physical dimensions per unit                            |
| `truck_space`         | `VARCHAR(200)` | L5 Ops            | Freight capacity consumed                               |
| `weather_rating`      | `ENUM`         | L5 Ops            | Environmental suitability rating                        |
| `compliance_tags`     | `TEXT`         | L5 Ops            | Regulatory and certification requirements               |
| `sustainability_tags` | `TEXT`         | L5 Ops            | Environmental profile tags                              |

### Hierarchical SKU Format

```
Pattern:  COLL-CATG-SUBC-SEQ
Example:  SITE-INFR-FENC-001
Segments: 4-4-4-3 (uppercase alpha, zero-padded sequence)
```

### Display Name Convention

```
Pattern:  Noun - Type - Differentiator
Example:  Golf Cart - 4 Seat
Example:  Line Array - Medium
Example:  Table - Folding - 6ft
Rules:    Noun first, dash separator, max 3 segments, most specific last
```

### Enum Values

**weather_rating:** `indoor_only` | `sheltered` | `outdoor_rated` | `all_weather` | `not_applicable`

**compliance_tags:** `OSHA` | `ADA` | `FIRE_MARSHAL` | `HEALTH_DEPT` | `FCC` | `FCC_PART90` | `FCC_PART74` | `FAA` | `FAA_PART107` | `NCCCO` | `IATSE` | `NEC` | `NFPA` | `DOT` | `EPA` | `FDA` | `ANSI` | `CDL` | `ETCP` | `TSA` | `USCG` | `PCI` | `HIPAA` | `SERVSAFE` | `TIPS` | `IFR_FLAME` | `RIGGING_CERT` | `STRUCT_ENG` | `PYRO_LICENSE` | `LIQUOR_LICENSE` | `BG_CHECK` | `DRUG_TEST` | `TENT_PERMIT`

**sustainability_tags:** `REUSABLE` | `COMPOSTABLE` | `RECYCLABLE` | `ZERO_EMISSION` | `ELECTRIC` | `LED_EFFICIENT` | `SOLAR` | `CLASS_D_EFFICIENT` | `LOW_POWER` | `BIODIESEL` | `SINGLE_USE` | `NATURAL_FIBER` | `RECYCLED_MATERIAL` | `ENERGY_EFFICIENT`

[Back to top](#table-of-contents)

---

## Classification Codes

| Subcategory Path                                              | UNSPSC     | UNSPSC Description                    | NIGP     | NAICS    |
| ------------------------------------------------------------- | ---------- | ------------------------------------- | -------- | -------- |
| Site > Site Assets & Infrastructure > Fencing & Barriers      | `30191500` | Fencing and barrier systems           | `570-50` | `238990` |
| Site > Site Assets & Infrastructure > Tents & Structures      | `30181500` | Prefabricated structures and shelters | `570-72` | `532490` |
| Site > Site Assets & Infrastructure > Flooring & Surfaces     | `30161500` | Flooring and floor treatments         | `570-30` | `238330` |
| Site > Site Assets & Infrastructure > Portable Facilities     | `30181600` | Portable and mobile buildings         | `570-74` | `532490` |
| Site > Site Vehicles > Utility Vehicles                       | `25101700` | Specialized and recreational vehicles | `070-85` | `532120` |
| Site > Site Vehicles > Trucks & Transport                     | `25101500` | Commercial motor vehicles             | `070-42` | `484110` |
| Site > Site Vehicles > Specialty Vehicles                     | `25101900` | Specialty service vehicles            | `070-88` | `532120` |
| Site > Heavy Equipment > Aerial Lifts                         | `22101500` | Aerial work platforms and lifts       | `070-04` | `532412` |
| Site > Heavy Equipment > Forklifts & Loaders                  | `22101600` | Material handling forklifts           | `070-33` | `532412` |
| Site > Heavy Equipment > Cranes                               | `22101700` | Cranes and hoisting equipment         | `070-20` | `532412` |
| Site > Site Services > Power & Electrical                     | `26111700` | Portable power generators             | `285-55` | `238210` |
| Site > Site Services > Water & Plumbing                       | `47131600` | Water supply and treatment            | `670-90` | `562991` |
| Site > Site Services > Waste Management                       | `76111500` | Refuse disposal and treatment         | `926-90` | `562111` |
| Site > Site Services > Climate Control                        | `40101500` | Heating ventilation air conditioning  | `031-00` | `238220` |
| Site > Site Services > Internet & Connectivity                | `43222600` | Network communication equipment       | `208-58` | `517311` |
| Site > Site Equipment & Tools > Safety Equipment              | `46191600` | Fire protection equipment             | `345-30` | `423490` |
| Site > Site Equipment & Tools > General Tools & Hardware      | `27111500` | Hand tools and accessories            | `445-00` | `423710` |
| Site > Site Equipment & Tools > Expendables & Consumables     | `31201500` | Adhesive tapes and fasteners          | `031-50` | `423840` |
| Site > Signage & Wayfinding > Directional Signage             | `55121700` | Signs and signage                     | `765-00` | `339950` |
| Site > Signage & Wayfinding > Digital Signage                 | `43211700` | Electronic displays and signage       | `208-23` | `334310` |
| Site > Signage & Wayfinding > Scenic & Decorative             | `55101500` | Decorative displays and materials     | `765-20` | `339950` |
| Technical > Audio > PA Systems                                | `52161500` | Professional audio equipment          | `730-12` | `532490` |
| Technical > Audio > DJ Equipment                              | `52161505` | Disc jockey and mixing equipment      | `730-14` | `532490` |
| Technical > Audio > Microphones & DI                          | `52161512` | Microphones and transducers           | `730-16` | `532490` |
| Technical > Audio > Mixing Consoles                           | `52161510` | Audio mixing and processing           | `730-18` | `532490` |
| Technical > Audio > Audio Infrastructure                      | `52161520` | Audio distribution and monitoring     | `730-20` | `532490` |
| Technical > Lighting > Automated Fixtures                     | `39111600` | Automated stage lighting              | `285-40` | `532490` |
| Technical > Lighting > Static Fixtures                        | `39111500` | Stage and event lighting              | `285-42` | `532490` |
| Technical > Lighting > Atmospheric Effects                    | `60141100` | Special effects equipment             | `730-60` | `532490` |
| Technical > Lighting > Lighting Control                       | `39112100` | Lighting control systems              | `285-44` | `532490` |
| Technical > Video > LED Walls & Displays                      | `45111600` | Professional video displays           | `208-42` | `532490` |
| Technical > Video > Cameras & Capture                         | `45121500` | Video cameras and capture             | `208-44` | `532490` |
| Technical > Video > Projection                                | `45111612` | Video projection systems              | `208-46` | `532490` |
| Technical > Video > Playback & Processing                     | `45111700` | Video processing and servers          | `208-48` | `532490` |
| Technical > Staging > Stage Decks & Risers                    | `56101700` | Staging platforms and risers          | `570-65` | `532490` |
| Technical > Staging > Stage Infrastructure                    | `56101800` | Stage drapery and infrastructure      | `570-67` | `532490` |
| Technical > Rigging > Truss                                   | `31162400` | Structural truss systems              | `570-69` | `532490` |
| Technical > Rigging > Motors & Chain Hoists                   | `24102000` | Chain hoists and rigging motors       | `445-18` | `532490` |
| Technical > Rigging > Rigging Hardware                        | `31162200` | Rigging hardware and fittings         | `445-20` | `532490` |
| Technical > Backline > Amplifiers & Cabinets                  | `60131100` | Musical instrument amplifiers         | `730-30` | `532490` |
| Technical > Backline > Keyboards & Controllers                | `60131200` | Keyboard instruments and controllers  | `730-32` | `532490` |
| Technical > Backline > Drum Kits                              | `60131300` | Percussion instruments and kits       | `730-34` | `532490` |
| Technical > Backline > Miscellaneous Backline                 | `60131400` | Miscellaneous musical equipment       | `730-36` | `532490` |
| Hospitality > Catering > Artist & Crew Catering               | `90101600` | Catering services                     | `961-36` | `722320` |
| Hospitality > Catering > Guest & VIP Catering                 | `90101700` | Premium catering and hospitality      | `961-38` | `722320` |
| Hospitality > Green Room & Hospitality > Artist Hospitality   | `90101800` | Artist and talent hospitality         | `961-40` | `721110` |
| Hospitality > Green Room & Hospitality > VIP & Lounge         | `90101900` | VIP lounge and bottle service         | `961-42` | `722410` |
| Hospitality > Green Room & Hospitality > Amenities & Services | `90102000` | Guest amenities and services          | `961-44` | `721110` |
| Food & Beverage > Bar > Bar Equipment                         | `48101500` | Bar and beverage equipment            | `345-10` | `532490` |
| Food & Beverage > Bar > Bar Consumables                       | `48101600` | Bar consumables and drinkware         | `345-12` | `424810` |
| Food & Beverage > Restaurant > Service Equipment              | `48101700` | Food service equipment                | `345-14` | `532490` |
| Food & Beverage > Kitchen > Kitchen Equipment                 | `48101800` | Commercial kitchen equipment          | `345-16` | `532490` |
| Food & Beverage > Kitchen > Concessions & Carts               | `48101900` | Concession and cart equipment         | `345-18` | `532490` |
| Retail > Merchandise > Display & Fixtures                     | `52141500` | Retail display fixtures               | `345-20` | `532490` |
| Retail > Merchandise > POS & Technology                       | `52161600` | Point of sale systems                 | `208-50` | `423430` |
| Retail > Merchandise > Packaging & Supplies                   | `55121500` | Packaging and retail supplies         | `615-00` | `322211` |
| Retail > Vendor Marketplace > Vendor Infrastructure           | `80141600` | Event vendor management               | `961-50` | `711310` |
| Workplace > Access & Credentials > Credentials                | `44103100` | Identification and credentials        | `590-10` | `323111` |
| Workplace > Access & Credentials > Access Control             | `46171600` | Access control and detection          | `590-12` | `561621` |
| Workplace > Radio & Communications > Two-Way Radios           | `43191500` | Two-way radio equipment               | `680-50` | `423690` |
| Workplace > Radio & Communications > Intercoms                | `43191600` | Intercom and wired communication      | `680-52` | `423690` |
| Workplace > Uniforms > Staff Apparel                          | `53101500` | Work and staff clothing               | `200-00` | `315990` |
| Workplace > Furnishings > Office & Production                 | `56101500` | Tables chairs and office furniture    | `425-00` | `532420` |
| Workplace > Furnishings > Lounge & VIP                        | `56101600` | Lounge and specialty furniture        | `425-10` | `532420` |
| Workplace > Health & Safety > Medical                         | `85121800` | Emergency medical services            | `475-00` | `621910` |
| Workplace > Health & Safety > PPE                             | `46181500` | Personal protective equipment         | `475-50` | `423450` |
| Workplace > Health & Safety > Security Systems                | `46171500` | Surveillance and security systems     | `680-80` | `561621` |
| Travel & Accommodations > Airfare > Flights                   | `78111500` | Passenger air transportation          | `962-10` | `481111` |
| Travel & Accommodations > Lodging > Hotels                    | `90111500` | Hotel and lodging services            | `962-20` | `721110` |
| Travel & Accommodations > Lodging > Alternative Lodging       | `90111600` | Alternative accommodation             | `962-22` | `721199` |
| Travel & Accommodations > Transportation > Ground Transport   | `78111800` | Ground passenger transportation       | `962-30` | `485310` |
| Travel & Accommodations > Transportation > Water Transport    | `78111900` | Water passenger transportation        | `962-32` | `483112` |
| Travel & Accommodations > Rental Vehicles > Cars & Trucks     | `78111600` | Vehicle rental services               | `070-65` | `532111` |
| Travel & Accommodations > Rental Vehicles > Specialty Rentals | `78111700` | Specialty vehicle and trailer rental  | `070-67` | `532120` |
| Labor > Leadership > Production Management                    | `80111600` | Temporary production management       | `918-56` | `711510` |
| Labor > Leadership > Department Heads                         | `80111700` | Technical department leadership       | `918-58` | `711510` |
| Labor > Heavy Equipment Operators > Certified Operators       | `80111800` | Certified equipment operators         | `918-60` | `238910` |
| Labor > Skilled Labor > Technical Crew                        | `80111900` | Skilled technical labor               | `918-62` | `711510` |
| Labor > Skilled Labor > Creative & Specialty                  | `80112000` | Creative and specialty services       | `918-64` | `711510` |
| Labor > General Labor > Stagehands                            | `80111500` | General event labor                   | `918-50` | `711510` |
| Labor > General Labor > Event Staff                           | `80111501` | Event staffing services               | `918-52` | `561320` |
| Labor > General Labor > Specialty Staff                       | `80111502` | Specialty event personnel             | `918-54` | `711510` |

[Back to top](#table-of-contents)

---

## Catalog

**351 items** organized by Collection > Category > Subcategory

### Site

_97 items_

#### Site Assets & Infrastructure

##### Fencing & Barriers

###### Barricade - Bike Rack - 8ft

|                    |                                                                              |
| ------------------ | ---------------------------------------------------------------------------- | ------------------- | -------------------- | -------------------------- |
| **Legacy Code**    | `SITE-1001`                                                                  |
| **SKU**            | `SITE-INFR-FENC-001`                                                         |
| **UNSPSC**         | `30191500`                                                                   |
| **Common Name**    | Bike Rack Barricade                                                          |
| **Search Aliases** | Crowd Control Barrier                                                        | French Barricade    | Pedestrian Barricade | Interlocking Steel Barrier |
| **Description**    | Steel interlocking crowd control barricade, 8ft sections, hot-dip galvanized |
| **Specifications** | 8ft x 43in                                                                   | Steel               | 38 lbs per section   | Interlocking feet          |
| **Options**        | Standard Silver                                                              | Black Powder Coat   | Custom Wrap          |
| **Modifiers**      | Quantity                                                                     | Delivery and Pickup |
| **Prerequisites**  | Flatbed or box truck for transport                                           |
| **Pricing Unit**   | per section/day                                                              |
| **Lead Time**      | 48 hours                                                                     |
| **Setup Time**     | 5 min per section                                                            |
| **Strike Time**    | 5 min per section                                                            |
| **Crew Required**  | 2 stagehands                                                                 |
| **Power**          | None                                                                         |
| **Footprint**      | 8ft x 3.5ft per section                                                      |
| **Truck Space**    | Stacks flat, 50 sections per 16ft truck                                      |
| **Weather**        | `all_weather`                                                                |
| **Sustainability** | `REUSABLE`                                                                   |

###### Barrier - Jersey - Water-Filled

|                    |                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------- | ------------------------------ | ----------------- | --------------- |
| **Legacy Code**    | `SITE-1002`                                                                            |
| **SKU**            | `SITE-INFR-FENC-002`                                                                   |
| **UNSPSC**         | `30191500`                                                                             |
| **Common Name**    | Water-Filled Jersey Barrier                                                            |
| **Search Aliases** | Plastic Jersey Barrier                                                                 | Water Barrier                  | Poly Barrier      | Traffic Barrier |
| **Description**    | Polyethylene water-filled traffic barrier for vehicle mitigation and perimeter control |
| **Specifications** | 72in L x 24in W x 42in H                                                               | 150 lbs empty, 1500 lbs filled | UV-resistant poly |
| **Options**        | White                                                                                  | Orange                         | Custom Color      |
| **Modifiers**      | Quantity                                                                               | Fill and Drain Service         |
| **Prerequisites**  | Water source on-site or fill truck                                                     |
| **Pricing Unit**   | per unit/day                                                                           |
| **Lead Time**      | 48 hours                                                                               |
| **Setup Time**     | 5 min per unit (empty), 20 min fill                                                    |
| **Strike Time**    | 20 min drain, 5 min stack                                                              |
| **Crew Required**  | 2 stagehands, water truck for fill                                                     |
| **Power**          | None                                                                                   |
| **Footprint**      | 6ft x 2ft per unit                                                                     |
| **Truck Space**    | Nests, 20 units per flatbed                                                            |
| **Weather**        | `all_weather`                                                                          |
| **Compliance**     | `DOT`                                                                                  |
| **Sustainability** | `REUSABLE`                                                                             |

###### Fence Panel - Chain Link - 6ft Temp

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | --------------------------- | ---------------------- |
| **Legacy Code**    | `SITE-1003`                                                 |
| **SKU**            | `SITE-INFR-FENC-003`                                        |
| **UNSPSC**         | `30191500`                                                  |
| **Common Name**    | Temporary Chain Link Fence Panel                            |
| **Search Aliases** | Temp Fence                                                  | Construction Fence          | Security Fence Panel   |
| **Description**    | Temporary 6ft chain link fence panel with stands and clamps |
| **Specifications** | 6ft H x 10ft W                                              | 11.5 gauge galvanized steel | Wind screen compatible |
| **Options**        | Standard                                                    | With Privacy Screen         | With Branded Screen    |
| **Modifiers**      | Quantity                                                    | Installation Labor          |
| **Prerequisites**  | Forklift for bulk delivery                                  |
| **Pricing Unit**   | per panel/day                                               |
| **Lead Time**      | 48 hours                                                    |
| **Setup Time**     | 10 min per panel                                            |
| **Strike Time**    | 10 min per panel                                            |
| **Crew Required**  | 2 stagehands                                                |
| **Power**          | None                                                        |
| **Footprint**      | 10ft x 6ft per panel                                        |
| **Truck Space**    | Stacks, 25 panels per flatbed                               |
| **Weather**        | `all_weather`                                               |
| **Sustainability** | `REUSABLE`                                                  |

###### Barrier - Jersey - Concrete

|                    |                                                                       |
| ------------------ | --------------------------------------------------------------------- | ---------------- | ------------------- | ---------------- |
| **Legacy Code**    | `SITE-1004`                                                           |
| **SKU**            | `SITE-INFR-FENC-004`                                                  |
| **UNSPSC**         | `30191500`                                                            |
| **Common Name**    | Concrete Jersey Barrier                                               |
| **Search Aliases** | K-Rail                                                                | Concrete Barrier | Highway Barrier     | Anti-Ram Barrier |
| **Description**    | Precast concrete traffic barrier for high-security vehicle mitigation |
| **Specifications** | 10ft L x 24in W x 32in H                                              | 4,000 lbs        | Reinforced concrete |
| **Options**        | Standard Gray                                                         | Painted          | Wrapped             |
| **Modifiers**      | Quantity                                                              | Crane Placement  |
| **Prerequisites**  | Crane or heavy equipment for placement                                |
| **Pricing Unit**   | per unit/day                                                          |
| **Lead Time**      | 168 hours                                                             |
| **Setup Time**     | 15 min per unit (with crane)                                          |
| **Strike Time**    | 15 min per unit                                                       |
| **Crew Required**  | Crane operator, 1 rigger, 1 spotter                                   |
| **Power**          | None                                                                  |
| **Footprint**      | 10ft x 2ft per unit                                                   |
| **Truck Space**    | 1 unit per flatbed position, 4,000 lbs each                           |
| **Weather**        | `all_weather`                                                         |
| **Compliance**     | `DOT`                                                                 |
| **Sustainability** | `REUSABLE`                                                            |

###### Stanchion - Retractable Belt

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | -------------------- | --------------------- | --------------------- |
| **Legacy Code**    | `SITE-1005`                                                     |
| **SKU**            | `SITE-INFR-FENC-005`                                            |
| **UNSPSC**         | `30191500`                                                      |
| **Common Name**    | Retractable Belt Stanchion                                      |
| **Search Aliases** | Queue Stanchion                                                 | Crowd Control Post   | Rope Stanchion        | Queue Barrier         |
| **Description**    | Chrome or black retractable belt stanchion for queue management |
| **Specifications** | 40in H                                                          | 8ft retractable belt | Weighted base         |
| **Options**        | Chrome with Black Belt                                          | Chrome with Red Belt | Black with Black Belt | Brass with Red Velvet |
| **Modifiers**      | Quantity                                                        | Belt Color           |
| **Pricing Unit**   | per unit/day                                                    |
| **Lead Time**      | 24 hours                                                        |
| **Setup Time**     | 1 min per unit                                                  |
| **Strike Time**    | 1 min per unit                                                  |
| **Crew Required**  | 1 person                                                        |
| **Power**          | None                                                            |
| **Footprint**      | 14in base diameter                                              |
| **Truck Space**    | 50 units per pallet                                             |
| **Weather**        | `sheltered`                                                     |
| **Sustainability** | `REUSABLE`                                                      |

###### Barrier - Median - Concrete DOT

|                    |                                                                            |
| ------------------ | -------------------------------------------------------------------------- | --------------------- | --------------- | ------------ | -------- |
| **Legacy Code**    | `SITE-1006`                                                                |
| **SKU**            | `SITE-INFR-FENC-006`                                                       |
| **UNSPSC**         | `30191500`                                                                 |
| **Common Name**    | Concrete Median Barrier                                                    |
| **Search Aliases** | K-Rail                                                                     | F-Rail                | DOT Barrier     | Road Barrier | Anti-Ram |
| **Description**    | DOT-rated concrete median barrier for road closures and perimeter security |
| **Specifications** | 12ft section                                                               | 6,000 lbs             | MASH TL-3 rated |
| **Options**        | K-Rail (single slope)                                                      | F-Rail (double slope) |
| **Modifiers**      | Quantity                                                                   | Crane Placement       | Reflective Tape |
| **Prerequisites**  | Crane and CDL flatbed for transport and placement                          |
| **Pricing Unit**   | per unit/day                                                               |
| **Lead Time**      | 48 hours                                                                   |
| **Setup Time**     | 5 to 15 min per unit                                                       |
| **Strike Time**    | 5 to 15 min per unit                                                       |
| **Crew Required**  | 2 stagehands                                                               |
| **Power**          | None                                                                       |
| **Footprint**      | Varies by unit type                                                        |
| **Truck Space**    | Stacks or nests on flatbed                                                 |
| **Weather**        | `all_weather`                                                              |
| **Compliance**     | `DOT`                                                                      |
| **Sustainability** | `REUSABLE`                                                                 |

###### Bollard - Removable

|                    |                                                     |
| ------------------ | --------------------------------------------------- | ----------------- | ---------------------- | ------------------- |
| **Legacy Code**    | `SITE-1007`                                         |
| **SKU**            | `SITE-INFR-FENC-007`                                |
| **UNSPSC**         | `30191500`                                          |
| **Common Name**    | Removable Bollard                                   |
| **Search Aliases** | Security Bollard                                    | Anti-Ram Post     | Pedestrian Bollard     | Traffic Post        |
| **Description**    | Anti-vehicle bollard for pedestrian zone protection |
| **Specifications** | 36in H                                              | Steel pipe filled | Removable or permanent | Crash-rated options |
| **Options**        | Removable Sleeve                                    | Fixed             | Retractable            | Decorative          |
| **Modifiers**      | Quantity                                            | Install Type      | Crash Rating (K-rated) |
| **Prerequisites**  | Core drilling for permanent, sleeve for removable   |
| **Pricing Unit**   | per unit                                            |
| **Lead Time**      | 48 hours                                            |
| **Setup Time**     | 5 to 15 min per unit                                |
| **Strike Time**    | 5 to 15 min per unit                                |
| **Crew Required**  | 2 stagehands                                        |
| **Power**          | None                                                |
| **Footprint**      | Varies by unit type                                 |
| **Truck Space**    | Stacks or nests on flatbed                          |
| **Weather**        | `all_weather`                                       |
| **Compliance**     | `DOT`                                               |
| **Sustainability** | `REUSABLE`                                          |

###### Barrier - Front of Stage

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | --------------- | ------------------ | ------------------- | ----------------- |
| **Legacy Code**    | `SITE-1008`                                                      |
| **SKU**            | `SITE-INFR-FENC-008`                                             |
| **UNSPSC**         | `30191500`                                                       |
| **Common Name**    | Front-of-Stage Barrier                                           |
| **Search Aliases** | Mojo Barrier                                                     | Pit Barrier     | Crash Barrier      | Crowd Crush Barrier | Concert Barricade |
| **Description**    | Front-of-stage crowd safety barrier with integrated cable trough |
| **Specifications** | Mojo Barrier style                                               | Stabilizer legs | Expandable corners |
| **Options**        | Standard Straight                                                | Corner In       | Corner Out         | Gate Section        | ADA Gate          |
| **Modifiers**      | Quantity                                                         | Configuration   | Cable Troughs      |
| **Prerequisites**  | Level ground, forklift for delivery                              |
| **Pricing Unit**   | per section/day                                                  |
| **Lead Time**      | 48 hours                                                         |
| **Setup Time**     | 5 to 15 min per unit                                             |
| **Strike Time**    | 5 to 15 min per unit                                             |
| **Crew Required**  | 2 stagehands                                                     |
| **Power**          | None                                                             |
| **Footprint**      | Varies by unit type                                              |
| **Truck Space**    | Stacks or nests on flatbed                                       |
| **Weather**        | `all_weather`                                                    |
| **Compliance**     | `DOT`                                                            |
| **Sustainability** | `REUSABLE`                                                       |

###### Cone - Traffic

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | ----------------- | ------------- | ------------------ | ------------- |
| **Legacy Code**    | `SITE-1009`                                            |
| **SKU**            | `SITE-INFR-FENC-009`                                   |
| **UNSPSC**         | `30191500`                                             |
| **Common Name**    | Traffic Cone                                           |
| **Search Aliases** | Safety Cone                                            | Pylon             | Channelizer   | Delineator         | Road Cone     |
| **Description**    | Standard traffic cone for channelizing and delineation |
| **Specifications** | 18in                                                   | 28in              | 36in          | Reflective collar  | Weighted base |
| **Options**        | 18in                                                   | 28in Standard     | 36in Tall     | Tubular Delineator | Grabber Cone  |
| **Modifiers**      | Quantity                                               | Reflective Collar | Weight Option |
| **Pricing Unit**   | per unit/day                                           |
| **Lead Time**      | 48 hours                                               |
| **Setup Time**     | 5 to 15 min per unit                                   |
| **Strike Time**    | 5 to 15 min per unit                                   |
| **Crew Required**  | 2 stagehands                                           |
| **Power**          | None                                                   |
| **Footprint**      | Varies by unit type                                    |
| **Truck Space**    | Stacks or nests on flatbed                             |
| **Weather**        | `all_weather`                                          |
| **Compliance**     | `DOT`                                                  |
| **Sustainability** | `REUSABLE`                                             |

[Back to top](#table-of-contents)

##### Tents & Structures

###### Tent - Frame

|                    |                                                                      |
| ------------------ | -------------------------------------------------------------------- | ------------------ | ------------ | ------------ | ---------- |
| **Legacy Code**    | `SITE-1010`                                                          |
| **SKU**            | `SITE-INFR-TENT-001`                                                 |
| **UNSPSC**         | `30181500`                                                           |
| **Common Name**    | Frame Tent                                                           |
| **Search Aliases** | Clear Span Tent                                                      | Commercial Tent    | Event Tent   | No-Pole Tent |
| **Description**    | Commercial aluminum frame tent, no center poles, clear span interior |
| **Specifications** | 20x20 through 40x80                                                  | Aluminum frame     | Modular      |
| **Options**        | White                                                                | Clear Top          | Solid Walls  | Window Walls | Open Sides |
| **Modifiers**      | Size                                                                 | Wall Configuration | Lighting     | Flooring     | HVAC       |
| **Prerequisites**  | Level ground, staking or water barrel anchoring                      |
| **Pricing Unit**   | per tent/day                                                         |
| **Lead Time**      | 336 hours                                                            |
| **Setup Time**     | 4 to 8 hours                                                         |
| **Strike Time**    | 3 to 6 hours                                                         |
| **Crew Required**  | 3 to 6 tent crew                                                     |
| **Power**          | Per lighting and HVAC package                                        |
| **Footprint**      | Varies (20x20 to 60x120)                                             |
| **Truck Space**    | 1 to 2 box trucks per tent                                           |
| **Weather**        | `outdoor_rated`                                                      |
| **Compliance**     | `ADA                                                                 | FIRE_MARSHAL       | TENT_PERMIT` |
| **Sustainability** | `REUSABLE`                                                           |

###### Tent - Pole - High Peak

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | -------------- | ------------------ | ---------------- |
| **Legacy Code**    | `SITE-1011`                                                |
| **SKU**            | `SITE-INFR-TENT-002`                                       |
| **UNSPSC**         | `30181500`                                                 |
| **Common Name**    | Pole Tent                                                  |
| **Search Aliases** | High Peak Tent                                             | Sailcloth Tent | Tidewater Tent     | Traditional Tent |
| **Description**    | Traditional high-peak pole tent with center and side poles |
| **Specifications** | 20x20 through 60x120                                       | Center poles   | Sailcloth or vinyl |
| **Options**        | White                                                      | Sailcloth      | Tidewater (clear)  |
| **Modifiers**      | Size                                                       | Liner          | Lighting           | Flooring         |
| **Prerequisites**  | Open field with staking capability, no asphalt             |
| **Pricing Unit**   | per tent/day                                               |
| **Lead Time**      | 336 hours                                                  |
| **Setup Time**     | 4 to 8 hours                                               |
| **Strike Time**    | 3 to 6 hours                                               |
| **Crew Required**  | 3 to 6 tent crew                                           |
| **Power**          | Per lighting and HVAC package                              |
| **Footprint**      | Varies (20x20 to 60x120)                                   |
| **Truck Space**    | 1 to 2 box trucks per tent                                 |
| **Weather**        | `outdoor_rated`                                            |
| **Compliance**     | `ADA                                                       | FIRE_MARSHAL   | TENT_PERMIT`       |
| **Sustainability** | `REUSABLE`                                                 |

###### Canopy - Pop-Up - 10x10

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ------------------ | ------------------ | ---------- | ------------ |
| **Legacy Code**    | `SITE-1012`                                              |
| **SKU**            | `SITE-INFR-TENT-003`                                     |
| **UNSPSC**         | `30181500`                                               |
| **Common Name**    | Pop-Up Canopy                                            |
| **Search Aliases** | Instant Canopy                                           | EZ-Up              | Popup Tent         | 10x10 Tent | Event Canopy |
| **Description**    | Portable instant canopy with aluminum frame, event grade |
| **Specifications** | 10ft x 10ft                                              | 40 lbs             | 150 sq ft coverage |
| **Options**        | White                                                    | Black              | Custom Print       | Half Walls | Full Walls   |
| **Modifiers**      | Quantity                                                 | Wall Configuration | Weight Kit         |
| **Prerequisites**  | Weights or stakes for wind rating                        |
| **Pricing Unit**   | per unit/day                                             |
| **Lead Time**      | 24 hours                                                 |
| **Setup Time**     | 15 min per unit                                          |
| **Strike Time**    | 10 min per unit                                          |
| **Crew Required**  | 2 people                                                 |
| **Power**          | None                                                     |
| **Footprint**      | 10ft x 10ft                                              |
| **Truck Space**    | 1 bag per unit, fits in van                              |
| **Weather**        | `outdoor_rated`                                          |
| **Compliance**     | `FIRE_MARSHAL`                                           |
| **Sustainability** | `REUSABLE`                                               |

###### Structure - Clear Span

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | --------------- | ------------------- | --------------- | ------------------ | ---------------- |
| **Legacy Code**    | `SITE-1013`                                                      |
| **SKU**            | `SITE-INFR-TENT-004`                                             |
| **UNSPSC**         | `30181500`                                                       |
| **Common Name**    | Clear Span Structure                                             |
| **Search Aliases** | Temporary Structure                                              | Engineered Tent | Hard-Wall Structure | Atria Structure |
| **Description**    | Engineered clear span temporary structure for large-scale events |
| **Specifications** | 40ft to 150ft wide, unlimited length in 15ft bays                | Aluminum frame  |
| **Options**        | White PVC                                                        | Clear PVC       | Hard Wall           | Glass Wall      | Climate Controlled |
| **Modifiers**      | Width                                                            | Length (bays)   | Wall Type           | Flooring        | HVAC               | Fire Suppression |
| **Prerequisites**  | Engineered site plan, permits, level ground                      |
| **Pricing Unit**   | per sq ft/day                                                    |
| **Lead Time**      | 672 hours                                                        |
| **Setup Time**     | 2 to 5 days depending on size                                    |
| **Strike Time**    | 1 to 3 days                                                      |
| **Crew Required**  | 4 to 10 tent crew, forklift                                      |
| **Power**          | Per HVAC and lighting package                                    |
| **Footprint**      | 40ft to 150ft wide, unlimited length                             |
| **Truck Space**    | Multiple 53ft trailers                                           |
| **Weather**        | `all_weather`                                                    |
| **Compliance**     | `ADA                                                             | FIRE_MARSHAL`   |
| **Sustainability** | `REUSABLE`                                                       |

###### Shade Sail - Tension

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | ------------ | -------------------------------------- | --------------- | ------------------- |
| **Legacy Code**    | `SITE-1014`                                                 |
| **SKU**            | `SITE-INFR-TENT-005`                                        |
| **UNSPSC**         | `30181500`                                                  |
| **Common Name**    | Shade Sail                                                  |
| **Search Aliases** | Tension Shade                                               | Sun Shade    | Fabric Canopy                          | Shade Structure |
| **Description**    | Fabric tension shade structure, custom shapes, UV-resistant |
| **Specifications** | Triangle                                                    | Square       | Rectangle                              | Custom shapes   | UV-resistant fabric |
| **Options**        | White                                                       | Ivory        | Custom Color                           | Printed         |
| **Modifiers**      | Size                                                        | Shape        | Mounting (poles or existing structure) |
| **Prerequisites**  | Mounting points or pole system                              |
| **Pricing Unit**   | per unit/day                                                |
| **Lead Time**      | 336 hours                                                   |
| **Setup Time**     | 4 to 8 hours                                                |
| **Strike Time**    | 3 to 6 hours                                                |
| **Crew Required**  | 3 to 6 tent crew                                            |
| **Power**          | Per lighting and HVAC package                               |
| **Footprint**      | Varies (20x20 to 60x120)                                    |
| **Truck Space**    | 1 to 2 box trucks per tent                                  |
| **Weather**        | `outdoor_rated`                                             |
| **Compliance**     | `ADA                                                        | FIRE_MARSHAL | TENT_PERMIT`                           |
| **Sustainability** | `REUSABLE`                                                  |

###### Shipping Container - Office

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- | --------------------- | ---------------------- | ------------------- | --------- |
| **Legacy Code**    | `SITE-1015`                                                       |
| **SKU**            | `SITE-INFR-TENT-006`                                              |
| **UNSPSC**         | `30181500`                                                        |
| **Common Name**    | Modified Shipping Container                                       |
| **Search Aliases** | Pop-Up Container                                                  | Container Bar         | Converted Container    | Container Build-Out |
| **Description**    | Modified ISO container for bar, retail, greenroom, or storage use |
| **Specifications** | 20ft or 40ft                                                      | Single or double door | With HVAC and electric |
| **Options**        | Standard Storage                                                  | Pop-Out Bar           | Retail Shop            | Office              | Greenroom |
| **Modifiers**      | Size                                                              | Build-Out Level       | HVAC                   | Electric            | Plumbing  |
| **Prerequisites**  | Crane or tilt-bed for placement, level pad, power                 |
| **Pricing Unit**   | per unit/day                                                      |
| **Lead Time**      | 336 hours                                                         |
| **Setup Time**     | 30 min (crane placement)                                          |
| **Strike Time**    | 30 min (crane removal)                                            |
| **Crew Required**  | Crane operator, 2 spotters                                        |
| **Power**          | 30A to 50A per unit (if modified)                                 |
| **Footprint**      | 20ft x 8ft or 40ft x 8ft                                          |
| **Truck Space**    | 1 per tilt-bed truck                                              |
| **Weather**        | `all_weather`                                                     |
| **Compliance**     | `FIRE_MARSHAL`                                                    |
| **Sustainability** | `REUSABLE`                                                        |

###### Shipping Container - Storage

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | ------------------- | ------------------ | ------------------ | ---- |
| **Legacy Code**    | `SITE-1016`                                                  |
| **SKU**            | `SITE-INFR-TENT-007`                                         |
| **UNSPSC**         | `30181500`                                                   |
| **Common Name**    | Storage Container                                            |
| **Search Aliases** | Conex Box                                                    | Sea Can             | ISO Container      | Shipping Container | PODS |
| **Description**    | Unmodified ISO shipping container for secure on-site storage |
| **Specifications** | 20ft or 40ft                                                 | Lock box            | Ventilated options |
| **Options**        | 20ft                                                         | 40ft                | High-Cube          |
| **Modifiers**      | Duration                                                     | Delivery and Pickup | Lock Set           |
| **Prerequisites**  | Level pad, crane or tilt-bed for delivery                    |
| **Pricing Unit**   | per unit/day                                                 |
| **Lead Time**      | 336 hours                                                    |
| **Setup Time**     | 30 min (crane placement)                                     |
| **Strike Time**    | 30 min (crane removal)                                       |
| **Crew Required**  | Crane operator, 2 spotters                                   |
| **Power**          | 30A to 50A per unit (if modified)                            |
| **Footprint**      | 20ft x 8ft or 40ft x 8ft                                     |
| **Truck Space**    | 1 per tilt-bed truck                                         |
| **Weather**        | `all_weather`                                                |
| **Compliance**     | `FIRE_MARSHAL`                                               |
| **Sustainability** | `REUSABLE`                                                   |

[Back to top](#table-of-contents)

##### Flooring & Surfaces

###### Mat - Ground Protection

|                    |                                                                         |
| ------------------ | ----------------------------------------------------------------------- | ---------------------- | -------------------- | -------------- | ---------- |
| **Legacy Code**    | `SITE-1020`                                                             |
| **SKU**            | `SITE-INFR-FLOR-001`                                                    |
| **UNSPSC**         | `30161500`                                                              |
| **Common Name**    | Ground Protection Mat                                                   |
| **Search Aliases** | Roadway Panel                                                           | Trak Mat               | Ground Mat           | Composite Mat  | Access Mat |
| **Description**    | Heavy-duty composite ground protection mat for vehicles and pedestrians |
| **Specifications** | 4ft x 8ft                                                               | 90 lbs                 | 80-ton load capacity | HDPE composite |
| **Options**        | Black                                                                   | Clear (grass-friendly) |
| **Modifiers**      | Quantity                                                                | Connector Clips        | Installation Labor   |
| **Pricing Unit**   | per panel/day                                                           |
| **Lead Time**      | 168 hours                                                               |
| **Setup Time**     | 30 to 60 min per 100 sq ft                                              |
| **Strike Time**    | 20 to 40 min per 100 sq ft                                              |
| **Crew Required**  | 2 to 4 stagehands                                                       |
| **Power**          | None                                                                    |
| **Footprint**      | Per sq ft ordered                                                       |
| **Truck Space**    | Panels stack on pallets, ~200 sq ft per pallet                          |
| **Weather**        | `outdoor_rated`                                                         |
| **Compliance**     | `ADA                                                                    | ANSI`                  |
| **Sustainability** | `REUSABLE`                                                              |

###### Dance Floor - Portable

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- | --------------------------- | ----------------- | ----------- | --------- |
| **Legacy Code**    | `SITE-1021`                                                       |
| **SKU**            | `SITE-INFR-FLOR-002`                                              |
| **UNSPSC**         | `30161500`                                                        |
| **Common Name**    | Portable Dance Floor                                              |
| **Search Aliases** | Modular Dance Floor                                               | Snap-Lock Floor             | Event Floor       | Party Floor |
| **Description**    | Modular interlocking dance floor panels, indoor and outdoor rated |
| **Specifications** | 3ft x 3ft panels                                                  | Multiple finishes available |
| **Options**        | Oak Parquet                                                       | Black Gloss                 | White Gloss       | LED Starlit | Checkered |
| **Modifiers**      | Size (total sq ft)                                                | Edge Trim                   | Subfloor Leveling |
| **Prerequisites**  | Level surface, subfloor for outdoor on uneven ground              |
| **Pricing Unit**   | per sq ft/day                                                     |
| **Lead Time**      | 168 hours                                                         |
| **Setup Time**     | 30 to 60 min per 100 sq ft                                        |
| **Strike Time**    | 20 to 40 min per 100 sq ft                                        |
| **Crew Required**  | 2 to 4 stagehands                                                 |
| **Power**          | None                                                              |
| **Footprint**      | Per sq ft ordered                                                 |
| **Truck Space**    | Panels stack on pallets, ~200 sq ft per pallet                    |
| **Weather**        | `outdoor_rated`                                                   |
| **Compliance**     | `ADA                                                              | ANSI`                       |
| **Sustainability** | `REUSABLE`                                                        |

###### Dance Floor - Marley

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ----------------- | ------------ | -------------------------- |
| **Legacy Code**    | `SITE-1022`                                             |
| **SKU**            | `SITE-INFR-FLOR-003`                                    |
| **UNSPSC**         | `30161500`                                              |
| **Common Name**    | Marley Dance Floor                                      |
| **Search Aliases** | Vinyl Dance Surface                                     | Performance Floor | Stage Floor  | Harlequin Floor            |
| **Description**    | Professional vinyl dance surface for performance stages |
| **Specifications** | 5.25ft wide rolls                                       | 1.5mm thickness   | Matte finish |
| **Options**        | Black                                                   | Gray              | White        | Reversible Black and White |
| **Modifiers**      | Size (total sq ft)                                      | Tape              | Subfloor     |
| **Prerequisites**  | Smooth level subfloor, gaffer tape for seams            |
| **Pricing Unit**   | per sq ft/day                                           |
| **Lead Time**      | 168 hours                                               |
| **Setup Time**     | 30 to 60 min per 100 sq ft                              |
| **Strike Time**    | 20 to 40 min per 100 sq ft                              |
| **Crew Required**  | 2 to 4 stagehands                                       |
| **Power**          | None                                                    |
| **Footprint**      | Per sq ft ordered                                       |
| **Truck Space**    | Panels stack on pallets, ~200 sq ft per pallet          |
| **Weather**        | `outdoor_rated`                                         |
| **Compliance**     | `ADA                                                    | ANSI`             |
| **Sustainability** | `REUSABLE`                                              |

###### Turf - Synthetic

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | ----------------- | ------------- | --------- |
| **Legacy Code**    | `SITE-1023`                                               |
| **SKU**            | `SITE-INFR-FLOR-004`                                      |
| **UNSPSC**         | `30161500`                                                |
| **Common Name**    | Synthetic Turf                                            |
| **Search Aliases** | Astroturf                                                 | Artificial Grass  | Fake Grass    | Faux Turf |
| **Description**    | Artificial turf for temporary ground cover and aesthetics |
| **Specifications** | 12ft or 15ft wide rolls                                   | 1.5in pile height | UV stabilized |
| **Options**        | Standard Green                                            | Premium Green     | Brown Tan     |
| **Modifiers**      | Size (sq ft)                                              | Seaming           | Infill        |
| **Prerequisites**  | Smooth base surface                                       |
| **Pricing Unit**   | per sq ft/day                                             |
| **Lead Time**      | 168 hours                                                 |
| **Setup Time**     | 30 to 60 min per 100 sq ft                                |
| **Strike Time**    | 20 to 40 min per 100 sq ft                                |
| **Crew Required**  | 2 to 4 stagehands                                         |
| **Power**          | None                                                      |
| **Footprint**      | Per sq ft ordered                                         |
| **Truck Space**    | Panels stack on pallets, ~200 sq ft per pallet            |
| **Weather**        | `outdoor_rated`                                           |
| **Compliance**     | `ADA                                                      | ANSI`             |
| **Sustainability** | `REUSABLE`                                                |

###### Carpet - Event

|                    |                                                   |
| ------------------ | ------------------------------------------------- | -------------------- | ---------------- | ----------------- | ------------ |
| **Legacy Code**    | `SITE-1024`                                       |
| **SKU**            | `SITE-INFR-FLOR-005`                              |
| **UNSPSC**         | `30161500`                                        |
| **Common Name**    | Event Carpet                                      |
| **Search Aliases** | Carpet Runner                                     | Red Carpet           | Aisle Runner     | Exhibition Carpet |
| **Description**    | Event carpet for aisles, entrances, and VIP areas |
| **Specifications** | 6ft wide rolls                                    | Various pile heights |
| **Options**        | Red                                               | Black                | Gray             | White             | Custom Color |
| **Modifiers**      | Size (linear ft)                                  | Width                | Pad Underlayment |
| **Pricing Unit**   | per linear ft/day                                 |
| **Lead Time**      | 168 hours                                         |
| **Setup Time**     | 30 to 60 min per 100 sq ft                        |
| **Strike Time**    | 20 to 40 min per 100 sq ft                        |
| **Crew Required**  | 2 to 4 stagehands                                 |
| **Power**          | None                                              |
| **Footprint**      | Per sq ft ordered                                 |
| **Truck Space**    | Panels stack on pallets, ~200 sq ft per pallet    |
| **Weather**        | `outdoor_rated`                                   |
| **Compliance**     | `ADA                                              | ANSI`                |
| **Sustainability** | `REUSABLE`                                        |

###### Mat - Rubber - Anti-Fatigue

|                    |                                                                     |
| ------------------ | ------------------------------------------------------------------- | ----------- | --------------------- | ----------- |
| **Legacy Code**    | `SITE-1025`                                                         |
| **SKU**            | `SITE-INFR-FLOR-006`                                                |
| **UNSPSC**         | `30161500`                                                          |
| **Common Name**    | Interlocking Rubber Mat                                             |
| **Search Aliases** | Anti-Fatigue Mat                                                    | Rubber Tile | Safety Flooring       | Utility Mat |
| **Description**    | Heavy-duty interlocking rubber floor tile for BOH and utility areas |
| **Specifications** | 3ft x 3ft                                                           | 3/4in thick | Anti-fatigue          | Non-slip    |
| **Options**        | Black                                                               | Gray        | Diamond Plate Pattern |
| **Modifiers**      | Quantity                                                            | Edge Ramps  |
| **Pricing Unit**   | per tile/day                                                        |
| **Lead Time**      | 168 hours                                                           |
| **Setup Time**     | 30 to 60 min per 100 sq ft                                          |
| **Strike Time**    | 20 to 40 min per 100 sq ft                                          |
| **Crew Required**  | 2 to 4 stagehands                                                   |
| **Power**          | None                                                                |
| **Footprint**      | Per sq ft ordered                                                   |
| **Truck Space**    | Panels stack on pallets, ~200 sq ft per pallet                      |
| **Weather**        | `outdoor_rated`                                                     |
| **Compliance**     | `ADA                                                                | ANSI`       |
| **Sustainability** | `REUSABLE`                                                          |

###### Floor - Raised Access

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | -------------------- | ------------------ | ----------- |
| **Legacy Code**    | `SITE-1026`                                                  |
| **SKU**            | `SITE-INFR-FLOR-007`                                         |
| **UNSPSC**         | `30161500`                                                   |
| **Common Name**    | Raised Access Floor                                          |
| **Search Aliases** | Raised Platform                                              | Pedestal Floor       | Computer Floor     | Cable Floor |
| **Description**    | Modular raised floor system for leveling or cable management |
| **Specifications** | 2ft x 2ft panels                                             | Adjustable pedestals | 4in to 24in height |
| **Options**        | Carpet Top                                                   | Bare Steel           | Wood Finish        |
| **Modifiers**      | Size (sq ft)                                                 | Height Range         | Load Rating        |
| **Prerequisites**  | Level substrate, engineering for heavy loads                 |
| **Pricing Unit**   | per sq ft/day                                                |
| **Lead Time**      | 168 hours                                                    |
| **Setup Time**     | 30 to 60 min per 100 sq ft                                   |
| **Strike Time**    | 20 to 40 min per 100 sq ft                                   |
| **Crew Required**  | 2 to 4 stagehands                                            |
| **Power**          | None                                                         |
| **Footprint**      | Per sq ft ordered                                            |
| **Truck Space**    | Panels stack on pallets, ~200 sq ft per pallet               |
| **Weather**        | `outdoor_rated`                                              |
| **Compliance**     | `ADA                                                         | ANSI`                |
| **Sustainability** | `REUSABLE`                                                   |

[Back to top](#table-of-contents)

##### Portable Facilities

###### Restroom - Portable - Standard

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | ------------------- | ------------------------ | --------------- | ------------------- |
| **Legacy Code**    | `SITE-1030`                                               |
| **SKU**            | `SITE-INFR-PORT-001`                                      |
| **UNSPSC**         | `30181600`                                                |
| **Common Name**    | Standard Portable Restroom                                |
| **Search Aliases** | Port-a-Potty                                              | Porta John          | Chemical Toilet          | Portable Toilet | Construction Toilet |
| **Description**    | Single-unit portable toilet with hand sanitizer dispenser |
| **Specifications** | 44in x 48in x 90in                                        | 175 lbs             | 60 gal holding tank      |
| **Options**        | Standard                                                  | Handicap Accessible | High-Rise (construction) |
| **Modifiers**      | Quantity                                                  | Service Frequency   | Hand Wash Add-On         |
| **Prerequisites**  | Level ground, service truck access                        |
| **Pricing Unit**   | per unit/day                                              |
| **Lead Time**      | 48 hours                                                  |
| **Setup Time**     | 15 min per unit (drop and level)                          |
| **Strike Time**    | 10 min per unit                                           |
| **Crew Required**  | Delivery truck driver                                     |
| **Power**          | None                                                      |
| **Footprint**      | 4ft x 4ft to 5ft x 5ft per unit                           |
| **Truck Space**    | 8 to 12 units per delivery truck                          |
| **Weather**        | `all_weather`                                             |
| **Compliance**     | `HEALTH_DEPT`                                             |
| **Sustainability** | `REUSABLE`                                                |

###### Restroom Trailer - Luxury

|                    |                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------- | ----------------------- | --------------- |
| **Legacy Code**    | `SITE-1031`                                                                             |
| **SKU**            | `SITE-INFR-PORT-002`                                                                    |
| **UNSPSC**         | `30181600`                                                                              |
| **Common Name**    | Luxury Restroom Trailer                                                                 |
| **Search Aliases** | VIP Restroom                                                                            | Restroom Trailer    | Fancy Portable Bathroom | Mobile Restroom |
| **Description**    | Multi-stall climate-controlled restroom trailer with running water and flushing toilets |
| **Specifications** | 2-stall through 10-stall                                                                | Climate controlled  | Running water           |
| **Options**        | Standard White                                                                          | Premium Interior    | ADA Compliant Unit      |
| **Modifiers**      | Stall Count                                                                             | Fresh Water vs Tank | Power Source            |
| **Prerequisites**  | Level pad, water supply, power (20A minimum), pump-out access                           |
| **Pricing Unit**   | per trailer/day                                                                         |
| **Lead Time**      | 336 hours                                                                               |
| **Setup Time**     | 1 to 2 hours (placement and hookup)                                                     |
| **Strike Time**    | 1 hour (disconnect and haul)                                                            |
| **Crew Required**  | CDL driver, 1 helper for hookup                                                         |
| **Power**          | 20A to 50A per trailer                                                                  |
| **Footprint**      | 8ft x 20ft to 8ft x 40ft                                                                |
| **Truck Space**    | Self-contained trailer, towed to site                                                   |
| **Weather**        | `all_weather`                                                                           |
| **Compliance**     | `ADA                                                                                    | HEALTH_DEPT`        |
| **Sustainability** | `REUSABLE`                                                                              |

###### Hand Wash Station - Portable

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | -------------------------- | --------------- |
| **Legacy Code**    | `SITE-1032`                                               |
| **SKU**            | `SITE-INFR-PORT-003`                                      |
| **UNSPSC**         | `30181600`                                                |
| **Common Name**    | Portable Hand Wash Station                                |
| **Search Aliases** | Hand Washing Station                                      | Sink Station               | Hygiene Station |
| **Description**    | Freestanding portable hand washing station with foot pump |
| **Specifications** | 2-basin or 4-basin                                        | With soap and paper towels |
| **Options**        | Standard                                                  | Deluxe (warm water)        |
| **Modifiers**      | Quantity                                                  | Soap and Towel Restocking  |
| **Prerequisites**  | Proximate to restrooms per health code                    |
| **Pricing Unit**   | per unit/day                                              |
| **Lead Time**      | 48 hours                                                  |
| **Setup Time**     | 15 min per unit (drop and level)                          |
| **Strike Time**    | 10 min per unit                                           |
| **Crew Required**  | Delivery truck driver                                     |
| **Power**          | None                                                      |
| **Footprint**      | 4ft x 4ft to 5ft x 5ft per unit                           |
| **Truck Space**    | 8 to 12 units per delivery truck                          |
| **Weather**        | `all_weather`                                             |
| **Compliance**     | `HEALTH_DEPT`                                             |
| **Sustainability** | `REUSABLE`                                                |

###### Shower Trailer - Portable

|                    |                                                                |
| ------------------ | -------------------------------------------------------------- | --------------------------------- | -------------- | ----------- |
| **Legacy Code**    | `SITE-1033`                                                    |
| **SKU**            | `SITE-INFR-PORT-004`                                           |
| **UNSPSC**         | `30181600`                                                     |
| **Common Name**    | Portable Shower Trailer                                        |
| **Search Aliases** | Shower Trailer                                                 | Mobile Shower                     | Camping Shower | Crew Shower |
| **Description**    | Multi-stall shower trailer for crew, talent, or camping events |
| **Specifications** | 2-stall through 8-stall                                        | With changing area                |
| **Options**        | Standard                                                       | Premium (tile, mirrors, products) |
| **Modifiers**      | Stall Count                                                    | Hot Water                         | Towel Service  |
| **Prerequisites**  | Water supply, gray water drain, power, propane                 |
| **Pricing Unit**   | per trailer/day                                                |
| **Lead Time**      | 336 hours                                                      |
| **Setup Time**     | 1 to 2 hours (placement and hookup)                            |
| **Strike Time**    | 1 hour (disconnect and haul)                                   |
| **Crew Required**  | CDL driver, 1 helper for hookup                                |
| **Power**          | 20A to 50A per trailer                                         |
| **Footprint**      | 8ft x 20ft to 8ft x 40ft                                       |
| **Truck Space**    | Self-contained trailer, towed to site                          |
| **Weather**        | `all_weather`                                                  |
| **Compliance**     | `ADA                                                           | HEALTH_DEPT`                      |
| **Sustainability** | `REUSABLE`                                                     |

###### Trailer - Office

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | --------------------- | -------------- | --------------- | -------- |
| **Legacy Code**    | `SITE-1034`                                                |
| **SKU**            | `SITE-INFR-PORT-005`                                       |
| **UNSPSC**         | `30181600`                                                 |
| **Common Name**    | Office Trailer                                             |
| **Search Aliases** | Mobile Office                                              | Construction Trailer  | Jobsite Office | Portable Office |
| **Description**    | Temporary office trailer for production and administration |
| **Specifications** | 8x20 through 12x60                                         | Double-wide available |
| **Options**        | Single-Wide                                                | Double-Wide           | With Restroom  | Furnished       |
| **Modifiers**      | Size                                                       | Furnishing Level      | HVAC           | Internet        | Duration |
| **Prerequisites**  | Level pad, power (50A minimum), steps, skirting            |
| **Pricing Unit**   | per trailer/day                                            |
| **Lead Time**      | 336 hours                                                  |
| **Setup Time**     | 1 to 2 hours (placement and hookup)                        |
| **Strike Time**    | 1 hour (disconnect and haul)                               |
| **Crew Required**  | CDL driver, 1 helper for hookup                            |
| **Power**          | 20A to 50A per trailer                                     |
| **Footprint**      | 8ft x 20ft to 8ft x 40ft                                   |
| **Truck Space**    | Self-contained trailer, towed to site                      |
| **Weather**        | `all_weather`                                              |
| **Compliance**     | `ADA                                                       | HEALTH_DEPT`          |
| **Sustainability** | `REUSABLE`                                                 |

###### Booth - Guard

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ---------------------------------- | ------------------ | --------------- |
| **Legacy Code**    | `SITE-1035`                                                |
| **SKU**            | `SITE-INFR-PORT-006`                                       |
| **UNSPSC**         | `30181600`                                                 |
| **Common Name**    | Guard Booth                                                |
| **Search Aliases** | Ticket Booth                                               | Security Booth                     | Checkpoint Booth   | Attendant Booth |
| **Description**    | Small portable booth for security checkpoints or ticketing |
| **Specifications** | 4x4 through 4x8                                            | With window, counter, and lighting |
| **Options**        | Standard                                                   | Climate Controlled                 | With Ticket Window | Branded Wrap    |
| **Modifiers**      | Size                                                       | Climate Control                    | Branding           |
| **Prerequisites**  | Power (20A), level ground                                  |
| **Pricing Unit**   | per unit/day                                               |
| **Lead Time**      | 48 hours                                                   |
| **Setup Time**     | 15 min per unit (drop and level)                           |
| **Strike Time**    | 10 min per unit                                            |
| **Crew Required**  | Delivery truck driver                                      |
| **Power**          | None                                                       |
| **Footprint**      | 4ft x 4ft to 5ft x 5ft per unit                            |
| **Truck Space**    | 8 to 12 units per delivery truck                           |
| **Weather**        | `all_weather`                                              |
| **Compliance**     | `HEALTH_DEPT`                                              |
| **Sustainability** | `REUSABLE`                                                 |

###### Restroom - Portable - ADA

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | ------------------------ | -------------------- | ---- |
| **Legacy Code**    | `SITE-1036`                                                   |
| **SKU**            | `SITE-INFR-PORT-007`                                          |
| **UNSPSC**         | `30181600`                                                    |
| **Common Name**    | ADA Portable Restroom                                         |
| **Search Aliases** | Wheelchair Accessible Restroom                                | Handicap Portable Toilet | Accessible Unit      |
| **Description**    | Wheelchair-accessible single-unit portable restroom with ramp |
| **Specifications** | 60in x 60in x 88in                                            | Wide door                | Grab bars            | Ramp |
| **Options**        | Standard ADA                                                  | ADA with Hand Wash       | ADA with Baby Change |
| **Modifiers**      | Quantity                                                      | Service Frequency        |
| **Prerequisites**  | Level ground, ramp clearance                                  |
| **Pricing Unit**   | per unit/day                                                  |
| **Lead Time**      | 48 hours                                                      |
| **Setup Time**     | 15 min per unit (drop and level)                              |
| **Strike Time**    | 10 min per unit                                               |
| **Crew Required**  | Delivery truck driver                                         |
| **Power**          | None                                                          |
| **Footprint**      | 4ft x 4ft to 5ft x 5ft per unit                               |
| **Truck Space**    | 8 to 12 units per delivery truck                              |
| **Weather**        | `all_weather`                                                 |
| **Compliance**     | `HEALTH_DEPT`                                                 |
| **Sustainability** | `REUSABLE`                                                    |

[Back to top](#table-of-contents)

#### Site Vehicles

##### Utility Vehicles

###### Golf Cart - 4 Seat

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | ---------------- | ------------------- | ----------- | --- |
| **Legacy Code**    | `SITE-1100`                                            |
| **SKU**            | `SITE-VEHI-UTIL-001`                                   |
| **UNSPSC**         | `25101700`                                             |
| **Common Name**    | 4-Seat Golf Cart                                       |
| **Search Aliases** | Electric Cart                                          | Club Car         | EZ-GO               | Cushman     | NEV |
| **Description**    | Electric 4-passenger golf cart for site transportation |
| **Specifications** | 48V electric                                           | 15 to 25 mph     | 30 to 40 mile range |
| **Options**        | Standard                                               | Lifted           | With Cargo Bed      | With Canopy |
| **Modifiers**      | Quantity                                               | Charger Included | GPS Tracking        |
| **Prerequisites**  | Charging station or outlet access                      |
| **Pricing Unit**   | per unit/day                                           |
| **Lead Time**      | 48 hours                                               |
| **Setup Time**     | 5 min (unload and charge)                              |
| **Strike Time**    | 5 min                                                  |
| **Crew Required**  | 1 person (no license needed)                           |
| **Power**          | 110V outlet for charging (overnight)                   |
| **Footprint**      | 4ft x 8ft per cart                                     |
| **Truck Space**    | 4 to 6 per enclosed trailer                            |
| **Weather**        | `outdoor_rated`                                        |
| **Sustainability** | `ZERO_EMISSION                                         | ELECTRIC`        |

###### Golf Cart - 6 Seat

|                    |                                                 |
| ------------------ | ----------------------------------------------- | ------------ | ------------------- |
| **Legacy Code**    | `SITE-1101`                                     |
| **SKU**            | `SITE-VEHI-UTIL-002`                            |
| **UNSPSC**         | `25101700`                                      |
| **Common Name**    | 6-Seat Golf Cart                                |
| **Search Aliases** | Shuttle Cart                                    | People Mover | 6-Passenger Cart    |
| **Description**    | Electric 6-passenger golf cart for crew shuttle |
| **Specifications** | 48V electric                                    | 15 to 20 mph | 25 to 35 mile range |
| **Options**        | Standard                                        | With Canopy  | Enclosed            |
| **Modifiers**      | Quantity                                        | Charger      |
| **Prerequisites**  | Charging station                                |
| **Pricing Unit**   | per unit/day                                    |
| **Lead Time**      | 48 hours                                        |
| **Setup Time**     | 5 min (unload and charge)                       |
| **Strike Time**    | 5 min                                           |
| **Crew Required**  | 1 person (no license needed)                    |
| **Power**          | 110V outlet for charging (overnight)            |
| **Footprint**      | 4ft x 8ft per cart                              |
| **Truck Space**    | 4 to 6 per enclosed trailer                     |
| **Weather**        | `outdoor_rated`                                 |
| **Sustainability** | `ZERO_EMISSION                                  | ELECTRIC`    |

###### UTV - Utility Vehicle

|                    |                                                    |
| ------------------ | -------------------------------------------------- | --------- | ----------------------- | --------- | ------ | --------------- |
| **Legacy Code**    | `SITE-1102`                                        |
| **SKU**            | `SITE-VEHI-UTIL-003`                               |
| **UNSPSC**         | `25101700`                                         |
| **Common Name**    | Utility Task Vehicle                               |
| **Search Aliases** | Gator                                              | UTV       | Side-by-Side            | Mule      | Ranger | Utility Vehicle |
| **Description**    | John Deere Gator or equivalent with cargo dump bed |
| **Specifications** | Gas or electric                                    | 4x4       | 1,000 lb cargo capacity | Dump bed  |
| **Options**        | 2-Seat                                             | 4-Seat    | With Cab                | With Plow |
| **Modifiers**      | Quantity                                           | Fuel Type | Attachments             |
| **Prerequisites**  | Fueling access for gas units                       |
| **Pricing Unit**   | per unit/day                                       |
| **Lead Time**      | 48 hours                                           |
| **Setup Time**     | 10 min (unload from trailer)                       |
| **Strike Time**    | 10 min                                             |
| **Crew Required**  | 1 licensed operator                                |
| **Power**          | Gasoline or electric                               |
| **Footprint**      | 5ft x 10ft                                         |
| **Truck Space**    | 2 per enclosed trailer                             |
| **Weather**        | `all_weather`                                      |
| **Sustainability** | `ELECTRIC`                                         |

###### ATV - All Terrain

|                    |                                              |
| ------------------ | -------------------------------------------- | ----------- | ------------- | ------------ | --- |
| **Legacy Code**    | `SITE-1103`                                  |
| **SKU**            | `SITE-VEHI-UTIL-004`                         |
| **UNSPSC**         | `25101700`                                   |
| **Common Name**    | All-Terrain Vehicle                          |
| **Search Aliases** | ATV                                          | Quad        | Four-Wheeler  | Side-by-Side | SxS |
| **Description**    | All-terrain vehicle for off-road site access |
| **Specifications** | Gas                                          | 4x4         | 500 to 1000cc | Roll cage    |
| **Options**        | 2-Seat                                       | 4-Seat      | With Winch    | With Plow    |
| **Modifiers**      | Quantity                                     | Accessories |
| **Prerequisites**  | Trailer for transport to site                |
| **Pricing Unit**   | per unit/day                                 |
| **Lead Time**      | 168 hours                                    |
| **Setup Time**     | Delivery only                                |
| **Strike Time**    | Pickup only                                  |
| **Crew Required**  | 1 licensed driver (CDL if applicable)        |
| **Power**          | Fuel (gasoline or diesel)                    |
| **Footprint**      | Varies by vehicle type                       |
| **Truck Space**    | Is the vehicle                               |
| **Weather**        | `all_weather`                                |
| **Compliance**     | `DOT                                         | CDL`        |

###### Scooter - Electric

|                    |                                                    |
| ------------------ | -------------------------------------------------- | --------------- | ------------------- | ------------------ |
| **Legacy Code**    | `SITE-1104`                                        |
| **SKU**            | `SITE-VEHI-UTIL-005`                               |
| **UNSPSC**         | `25101700`                                         |
| **Common Name**    | Electric Scooter                                   |
| **Search Aliases** | E-Scooter                                          | Electric Moped  | Kick Scooter        | Personal Transport |
| **Description**    | Electric scooter for quick personal site transport |
| **Specifications** | Electric                                           | 15 to 20 mph    | 25 to 40 mile range |
| **Options**        | Standing Scooter                                   | Sit-Down Moped  | 3-Wheel             |
| **Modifiers**      | Quantity                                           | Helmet Included |
| **Prerequisites**  | Charging access                                    |
| **Pricing Unit**   | per unit/day                                       |
| **Lead Time**      | 168 hours                                          |
| **Setup Time**     | Delivery only                                      |
| **Strike Time**    | Pickup only                                        |
| **Crew Required**  | 1 licensed driver (CDL if applicable)              |
| **Power**          | Fuel (gasoline or diesel)                          |
| **Footprint**      | Varies by vehicle type                             |
| **Truck Space**    | Is the vehicle                                     |
| **Weather**        | `all_weather`                                      |
| **Compliance**     | `DOT                                               | CDL`            |

[Back to top](#table-of-contents)

##### Trucks & Transport

###### Box Truck - 16ft

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ---------------- | ------------------ | ------------ |
| **Legacy Code**    | `SITE-1110`                                              |
| **SKU**            | `SITE-VEHI-TRUK-001`                                     |
| **UNSPSC**         | `25101500`                                               |
| **Common Name**    | 16-Foot Box Truck                                        |
| **Search Aliases** | Medium Box Truck                                         | Straight Truck   | Cube Truck         | Moving Truck |
| **Description**    | Medium-duty box truck for equipment and supply transport |
| **Specifications** | 16ft box                                                 | 6,000 lb payload | Liftgate available |
| **Options**        | Standard                                                 | With Liftgate    | Refrigerated       |
| **Modifiers**      | Duration                                                 | Liftgate         | Driver (add-on)    |
| **Prerequisites**  | CDL not required (under 26,001 GVWR)                     |
| **Pricing Unit**   | per truck/day                                            |
| **Lead Time**      | 168 hours                                                |
| **Setup Time**     | Delivery only                                            |
| **Strike Time**    | Pickup only                                              |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                    |
| **Power**          | Fuel (gasoline or diesel)                                |
| **Footprint**      | Varies by vehicle type                                   |
| **Truck Space**    | Is the vehicle                                           |
| **Weather**        | `all_weather`                                            |
| **Compliance**     | `DOT                                                     | CDL`             |

###### Box Truck - 26ft

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ----------------- | -------------- |
| **Legacy Code**    | `SITE-1111`                                              |
| **SKU**            | `SITE-VEHI-TRUK-002`                                     |
| **UNSPSC**         | `25101500`                                               |
| **Common Name**    | 26-Foot Box Truck                                        |
| **Search Aliases** | Large Box Truck                                          | Moving Truck      | Straight Truck |
| **Description**    | Large box truck for major load-in and load-out transport |
| **Specifications** | 26ft box                                                 | 10,000 lb payload | Liftgate       |
| **Options**        | Standard                                                 | With Liftgate     | Refrigerated   |
| **Modifiers**      | Duration                                                 | Liftgate          | Driver         |
| **Prerequisites**  | CDL may be required depending on GVWR                    |
| **Pricing Unit**   | per truck/day                                            |
| **Lead Time**      | 168 hours                                                |
| **Setup Time**     | Delivery only                                            |
| **Strike Time**    | Pickup only                                              |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                    |
| **Power**          | Fuel (gasoline or diesel)                                |
| **Footprint**      | Varies by vehicle type                                   |
| **Truck Space**    | Is the vehicle                                           |
| **Weather**        | `all_weather`                                            |
| **Compliance**     | `DOT                                                     | CDL`              |

###### Truck - Flatbed

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | --------------------------- | --------------- | --------- |
| **Legacy Code**    | `SITE-1112`                                                      |
| **SKU**            | `SITE-VEHI-TRUK-003`                                             |
| **UNSPSC**         | `25101500`                                                       |
| **Common Name**    | Flatbed Truck                                                    |
| **Search Aliases** | Flatbed                                                          | Platform Truck              | Stake Truck     | Tilt Bed  |
| **Description**    | Flatbed truck for oversized loads, staging, and scenic transport |
| **Specifications** | 24 to 48ft bed                                                   | 20,000 to 48,000 lb payload |
| **Options**        | Standard                                                         | With Ramps                  | With Crane Boom |
| **Modifiers**      | Size                                                             | Duration                    | Driver          | Tie-Downs |
| **Prerequisites**  | CDL required for over 26,001 GVWR                                |
| **Pricing Unit**   | per truck/day                                                    |
| **Lead Time**      | 168 hours                                                        |
| **Setup Time**     | Delivery only                                                    |
| **Strike Time**    | Pickup only                                                      |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                            |
| **Power**          | Fuel (gasoline or diesel)                                        |
| **Footprint**      | Varies by vehicle type                                           |
| **Truck Space**    | Is the vehicle                                                   |
| **Weather**        | `all_weather`                                                    |
| **Compliance**     | `DOT                                                             | CDL`                        |

###### Van - Sprinter

|                    |                                                                |
| ------------------ | -------------------------------------------------------------- | ------------------------ | ---------------- | ------------- |
| **Legacy Code**    | `SITE-1113`                                                    |
| **SKU**            | `SITE-VEHI-TRUK-004`                                           |
| **UNSPSC**         | `25101500`                                                     |
| **Common Name**    | Sprinter Van                                                   |
| **Search Aliases** | Cargo Van                                                      | Passenger Van            | Transit Van      | High-Roof Van |
| **Description**    | Cargo or passenger sprinter van for crew and equipment shuttle |
| **Specifications** | High roof                                                      | 144in or 170in wheelbase | 3,000 lb payload |
| **Options**        | Cargo                                                          | 12-Passenger             | 15-Passenger     |
| **Modifiers**      | Type                                                           | Duration                 | Driver           |
| **Pricing Unit**   | per van/day                                                    |
| **Lead Time**      | 168 hours                                                      |
| **Setup Time**     | Delivery only                                                  |
| **Strike Time**    | Pickup only                                                    |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                          |
| **Power**          | Fuel (gasoline or diesel)                                      |
| **Footprint**      | Varies by vehicle type                                         |
| **Truck Space**    | Is the vehicle                                                 |
| **Weather**        | `all_weather`                                                  |
| **Compliance**     | `DOT                                                           | CDL`                     |

###### Truck - Pickup

|                    |                                            |
| ------------------ | ------------------------------------------ | ------------- | ------------- | ------------------ | ----------------- |
| **Legacy Code**    | `SITE-1114`                                |
| **SKU**            | `SITE-VEHI-TRUK-005`                       |
| **UNSPSC**         | `25101500`                                 |
| **Common Name**    | Pickup Truck                               |
| **Search Aliases** | Work Truck                                 | Crew Cab      | Service Truck | Half-Ton           | Three-Quarter Ton |
| **Description**    | Full-size pickup truck for site operations |
| **Specifications** | Half-ton through 1-ton                     | 4x4 available |
| **Options**        | Standard Bed                               | Long Bed      | With Toolbox  | With Trailer Hitch |
| **Modifiers**      | Size                                       | Duration      | 4WD           |
| **Pricing Unit**   | per truck/day                              |
| **Lead Time**      | 168 hours                                  |
| **Setup Time**     | Delivery only                              |
| **Strike Time**    | Pickup only                                |
| **Crew Required**  | 1 licensed driver (CDL if applicable)      |
| **Power**          | Fuel (gasoline or diesel)                  |
| **Footprint**      | Varies by vehicle type                     |
| **Truck Space**    | Is the vehicle                             |
| **Weather**        | `all_weather`                              |
| **Compliance**     | `DOT                                       | CDL`          |

###### Tractor-Trailer - 53ft

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | ----------------- | --------------------- | ------------ | ------------- |
| **Legacy Code**    | `SITE-1115`                                                     |
| **SKU**            | `SITE-VEHI-TRUK-006`                                            |
| **UNSPSC**         | `25101500`                                                      |
| **Common Name**    | Semi Tractor-Trailer                                            |
| **Search Aliases** | 53-Foot Trailer                                                 | 18-Wheeler        | Semi Truck            | Big Rig      | Over-the-Road |
| **Description**    | Full semi truck and trailer for large-scale equipment transport |
| **Specifications** | 53ft dry van or flatbed                                         | 45,000 lb payload | Air ride              |
| **Options**        | Dry Van                                                         | Flatbed           | Refrigerated (Reefer) | Curtain-Side |
| **Modifiers**      | Type                                                            | Duration          | Driver                | Fuel         | Liftgate      |
| **Prerequisites**  | CDL Class A driver, loading dock or forklift                    |
| **Pricing Unit**   | per truck/day                                                   |
| **Lead Time**      | 168 hours                                                       |
| **Setup Time**     | N/A (transport vehicle)                                         |
| **Strike Time**    | N/A                                                             |
| **Crew Required**  | CDL Class A driver                                              |
| **Power**          | Diesel fuel                                                     |
| **Footprint**      | 53ft x 8.5ft (trailer)                                          |
| **Truck Space**    | Is the truck                                                    |
| **Weather**        | `all_weather`                                                   |
| **Compliance**     | `DOT                                                            | CDL               | DRUG_TEST`            |
| **Sustainability** | `BIODIESEL`                                                     |

[Back to top](#table-of-contents)

##### Specialty Vehicles

###### Truck - Water

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | ---------------------- | ----------- | ------------- |
| **Legacy Code**    | `SITE-1120`                                                  |
| **SKU**            | `SITE-VEHI-SPEC-001`                                         |
| **UNSPSC**         | `25101900`                                                   |
| **Common Name**    | Water Truck                                                  |
| **Search Aliases** | Water Tanker                                                 | Dust Control Truck     | Spray Truck |
| **Description**    | Tanker truck for dust suppression, site watering, or filling |
| **Specifications** | 2,000 through 6,000 gallon                                   | With spray bar         |
| **Options**        | 2,000 gal                                                    | 4,000 gal              | 6,000 gal   | Potable Rated |
| **Modifiers**      | Capacity                                                     | Potable vs Non-Potable | Spray Bar   | Operator      |
| **Prerequisites**  | Water source for fill, CDL operator                          |
| **Pricing Unit**   | per truck/day                                                |
| **Lead Time**      | 168 hours                                                    |
| **Setup Time**     | Delivery only                                                |
| **Strike Time**    | Pickup only                                                  |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                        |
| **Power**          | Fuel (gasoline or diesel)                                    |
| **Footprint**      | Varies by vehicle type                                       |
| **Truck Space**    | Is the vehicle                                               |
| **Weather**        | `all_weather`                                                |
| **Compliance**     | `DOT                                                         | CDL`                   |

###### Truck - Fuel Service

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | -------------------- | ------------- | ------------ |
| **Legacy Code**    | `SITE-1121`                                            |
| **SKU**            | `SITE-VEHI-SPEC-002`                                   |
| **UNSPSC**         | `25101900`                                             |
| **Common Name**    | Fuel Service Truck                                     |
| **Search Aliases** | Fuel Delivery                                          | Mobile Fueling       | Diesel Tanker | Fuel Trailer |
| **Description**    | Mobile fuel delivery truck for generators and vehicles |
| **Specifications** | 500 through 2,500 gallon                               | Diesel or multi-fuel |
| **Options**        | Diesel Only                                            | Multi-Fuel           | With DEF      |
| **Modifiers**      | Fuel Type                                              | Delivery Schedule    | Operator      |
| **Prerequisites**  | Spill containment, fire extinguisher                   |
| **Pricing Unit**   | per service                                            |
| **Lead Time**      | 168 hours                                              |
| **Setup Time**     | Delivery only                                          |
| **Strike Time**    | Pickup only                                            |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                  |
| **Power**          | Fuel (gasoline or diesel)                              |
| **Footprint**      | Varies by vehicle type                                 |
| **Truck Space**    | Is the vehicle                                         |
| **Weather**        | `all_weather`                                          |
| **Compliance**     | `DOT                                                   | CDL`                 |

###### Sweeper - Street

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | -------------------------- | ------------------- | ---------------- |
| **Legacy Code**    | `SITE-1122`                                                |
| **SKU**            | `SITE-VEHI-SPEC-003`                                       |
| **UNSPSC**         | `25101900`                                                 |
| **Common Name**    | Street Sweeper                                             |
| **Search Aliases** | Lot Scrubber                                               | Parking Lot Sweeper        | Road Sweeper        | Mechanical Broom |
| **Description**    | Mechanical street sweeper for paved areas and parking lots |
| **Specifications** | Compact through full-size                                  | Ride-on scrubber available |
| **Options**        | Compact Walk-Behind                                        | Ride-On Sweeper            | Full Street Sweeper |
| **Modifiers**      | Size                                                       | Duration                   | Operator            |
| **Prerequisites**  | Paved surface, water for dust suppression                  |
| **Pricing Unit**   | per unit/day                                               |
| **Lead Time**      | 168 hours                                                  |
| **Setup Time**     | Delivery only                                              |
| **Strike Time**    | Pickup only                                                |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                      |
| **Power**          | Fuel (gasoline or diesel)                                  |
| **Footprint**      | Varies by vehicle type                                     |
| **Truck Space**    | Is the vehicle                                             |
| **Weather**        | `all_weather`                                              |
| **Compliance**     | `DOT                                                       | CDL`                       |

[Back to top](#table-of-contents)

#### Heavy Equipment

##### Aerial Lifts

###### Scissor Lift - Electric

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ------------------------ | -------- | ---------------------- |
| **Legacy Code**    | `SITE-1200`                                                |
| **SKU**            | `SITE-HEQP-AERI-001`                                       |
| **UNSPSC**         | `22101500`                                                 |
| **Common Name**    | Electric Scissor Lift                                      |
| **Search Aliases** | Scissor Lift                                               | Aerial Work Platform     | AWP      | Self-Propelled Scissor |
| **Description**    | Electric scissor lift for indoor and outdoor elevated work |
| **Specifications** | 26ft through 46ft platform height                          | 500 to 1,000 lb capacity |
| **Options**        | 26ft                                                       | 32ft                     | 40ft     | 46ft                   |
| **Modifiers**      | Platform Height                                            | Indoor or Outdoor Rated  | Operator |
| **Prerequisites**  | Flat level surface, operator certification (OSHA)          |
| **Pricing Unit**   | per unit/day                                               |
| **Lead Time**      | 48 hours                                                   |
| **Setup Time**     | 15 to 30 min (unload, safety check)                        |
| **Strike Time**    | 15 to 30 min                                               |
| **Crew Required**  | 1 OSHA-certified operator                                  |
| **Power**          | Battery (electric) or diesel                               |
| **Footprint**      | 6ft x 10ft to 10ft x 30ft depending on height              |
| **Truck Space**    | 1 per flatbed or lowboy                                    |
| **Weather**        | `outdoor_rated`                                            |
| **Compliance**     | `OSHA`                                                     |
| **Sustainability** | `ELECTRIC`                                                 |

###### Boom Lift - Articulating

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | ---------------- | ------------- | ------ | ----- |
| **Legacy Code**    | `SITE-1201`                                               |
| **SKU**            | `SITE-HEQP-AERI-002`                                      |
| **UNSPSC**         | `22101500`                                                |
| **Common Name**    | Articulating Boom Lift                                    |
| **Search Aliases** | Knuckle Boom                                              | Articulated Boom | Cherry Picker | Z-Boom |
| **Description**    | Articulating boom lift for reaching over obstacles        |
| **Specifications** | 40ft through 135ft platform height                        |
| **Options**        | 40ft                                                      | 60ft             | 80ft          | 120ft  | 135ft |
| **Modifiers**      | Height                                                    | Gas or Electric  | Operator      |
| **Prerequisites**  | Level ground, outrigger clearance, operator certification |
| **Pricing Unit**   | per unit/day                                              |
| **Lead Time**      | 48 hours                                                  |
| **Setup Time**     | 15 to 30 min (unload, safety check)                       |
| **Strike Time**    | 15 to 30 min                                              |
| **Crew Required**  | 1 OSHA-certified operator                                 |
| **Power**          | Battery (electric) or diesel                              |
| **Footprint**      | 6ft x 10ft to 10ft x 30ft depending on height             |
| **Truck Space**    | 1 per flatbed or lowboy                                   |
| **Weather**        | `outdoor_rated`                                           |
| **Compliance**     | `OSHA`                                                    |
| **Sustainability** | `ELECTRIC`                                                |

###### Boom Lift - Telescopic

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | ---------- | ------------------------- | --------------- | ----- | ----- |
| **Legacy Code**    | `SITE-1202`                                                     |
| **SKU**            | `SITE-HEQP-AERI-003`                                            |
| **UNSPSC**         | `22101500`                                                      |
| **Common Name**    | Telescopic Boom Lift                                            |
| **Search Aliases** | Straight Boom                                                   | Stick Boom | Telescoping Boom          | High-Reach Boom |
| **Description**    | Straight telescopic boom lift for maximum height and reach      |
| **Specifications** | 60ft through 185ft platform height                              |
| **Options**        | 60ft                                                            | 80ft       | 100ft                     | 120ft           | 135ft | 185ft |
| **Modifiers**      | Height                                                          | Operator   | Terrain (rough or smooth) |
| **Prerequisites**  | Level or graded ground, operator certification, exclusion zones |
| **Pricing Unit**   | per unit/day                                                    |
| **Lead Time**      | 48 hours                                                        |
| **Setup Time**     | 15 to 30 min (unload, safety check)                             |
| **Strike Time**    | 15 to 30 min                                                    |
| **Crew Required**  | 1 OSHA-certified operator                                       |
| **Power**          | Battery (electric) or diesel                                    |
| **Footprint**      | 6ft x 10ft to 10ft x 30ft depending on height                   |
| **Truck Space**    | 1 per flatbed or lowboy                                         |
| **Weather**        | `outdoor_rated`                                                 |
| **Compliance**     | `OSHA`                                                          |
| **Sustainability** | `ELECTRIC`                                                      |

###### Lift - Vertical - Push-Around

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | ---------------------- | ------------ | -------- | -------------- |
| **Legacy Code**    | `SITE-1203`                                                      |
| **SKU**            | `SITE-HEQP-AERI-004`                                             |
| **UNSPSC**         | `22101500`                                                       |
| **Common Name**    | Push-Around Vertical Lift                                        |
| **Search Aliases** | Personnel Lift                                                   | Man Lift               | One-Man Lift | Pecolift | Genie Runabout |
| **Description**    | Manually positioned vertical personnel lift for light-duty tasks |
| **Specifications** | 12ft through 25ft platform height                                | 300 to 500 lb capacity |
| **Options**        | 12ft                                                             | 16ft                   | 20ft         | 25ft     |
| **Modifiers**      | Height                                                           | Indoor or Outdoor      |
| **Prerequisites**  | Flat surface, non-windy conditions for taller units              |
| **Pricing Unit**   | per unit/day                                                     |
| **Lead Time**      | 48 hours                                                         |
| **Setup Time**     | 15 to 30 min (unload, safety check)                              |
| **Strike Time**    | 15 to 30 min                                                     |
| **Crew Required**  | 1 OSHA-certified operator                                        |
| **Power**          | Battery (electric) or diesel                                     |
| **Footprint**      | 6ft x 10ft to 10ft x 30ft depending on height                    |
| **Truck Space**    | 1 per flatbed or lowboy                                          |
| **Weather**        | `outdoor_rated`                                                  |
| **Compliance**     | `OSHA`                                                           |
| **Sustainability** | `ELECTRIC`                                                       |

[Back to top](#table-of-contents)

##### Forklifts & Loaders

###### Forklift - Standard

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ------------ | ------------------ | ---------------- | ------------- | ----------- |
| **Legacy Code**    | `SITE-1210`                                           |
| **SKU**            | `SITE-HEQP-FORK-001`                                  |
| **UNSPSC**         | `22101600`                                            |
| **Common Name**    | Forklift                                              |
| **Search Aliases** | Fork Truck                                            | Lift Truck   | Warehouse Forklift | Industrial Truck |
| **Description**    | Warehouse or event forklift for loading and placement |
| **Specifications** | 5,000 through 15,000 lb capacity                      |
| **Options**        | 5K                                                    | 8K           | 10K                | 15K lb           | Rough Terrain | Telehandler |
| **Modifiers**      | Capacity                                              | Terrain Type | Operator           |
| **Prerequisites**  | Operator certification (OSHA), clear aisles           |
| **Pricing Unit**   | per unit/day                                          |
| **Lead Time**      | 48 hours                                              |
| **Setup Time**     | 15 to 30 min (unload, safety check)                   |
| **Strike Time**    | 15 to 30 min                                          |
| **Crew Required**  | 1 OSHA-certified operator                             |
| **Power**          | Battery (electric) or diesel                          |
| **Footprint**      | 6ft x 10ft to 10ft x 30ft depending on height         |
| **Truck Space**    | 1 per flatbed or lowboy                               |
| **Weather**        | `outdoor_rated`                                       |
| **Compliance**     | `OSHA`                                                |
| **Sustainability** | `ELECTRIC`                                            |

###### Telehandler

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ---------------- | ----------- | -------------------------------------- | --------- |
| **Legacy Code**    | `SITE-1211`                                          |
| **SKU**            | `SITE-HEQP-FORK-002`                                 |
| **UNSPSC**         | `22101600`                                           |
| **Common Name**    | Telehandler                                          |
| **Search Aliases** | Telescopic Handler                                   | Reach Forklift   | Lull        | Skytrak                                | Zoom Boom |
| **Description**    | Telescopic handler for high-reach material placement |
| **Specifications** | 6,000 to 12,000 lb capacity                          | 42 to 55ft reach |
| **Options**        | 6K at 42ft                                           | 8K at 42ft       | 10K at 55ft | 12K at 55ft                            |
| **Modifiers**      | Capacity                                             | Reach            | Operator    | Attachments (forks, bucket, truss jib) |
| **Prerequisites**  | Level ground, outrigger space, certified operator    |
| **Pricing Unit**   | per unit/day                                         |
| **Lead Time**      | 48 hours                                             |
| **Setup Time**     | 15 to 30 min (unload, safety check)                  |
| **Strike Time**    | 15 to 30 min                                         |
| **Crew Required**  | 1 OSHA-certified operator                            |
| **Power**          | Battery (electric) or diesel                         |
| **Footprint**      | 6ft x 10ft to 10ft x 30ft depending on height        |
| **Truck Space**    | 1 per flatbed or lowboy                              |
| **Weather**        | `outdoor_rated`                                      |
| **Compliance**     | `OSHA`                                               |
| **Sustainability** | `ELECTRIC`                                           |

###### Loader - Skid Steer

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | -------------------- | ---------- | -------------- |
| **Legacy Code**    | `SITE-1212`                                                |
| **SKU**            | `SITE-HEQP-FORK-003`                                       |
| **UNSPSC**         | `22101600`                                                 |
| **Common Name**    | Skid Steer Loader                                          |
| **Search Aliases** | Bobcat                                                     | Compact Track Loader | Skid-Steer | Compact Loader |
| **Description**    | Compact loader for grading, moving material, and site prep |
| **Specifications** | 1,500 to 3,000 lb rated capacity                           | Various attachments  |
| **Options**        | Standard Bucket                                            | With Tracks          | With Cab   |
| **Modifiers**      | Attachments (bucket, auger, grapple, broom)                | Operator             |
| **Prerequisites**  | Trailer for transport, certified operator                  |
| **Pricing Unit**   | per unit/day                                               |
| **Lead Time**      | 48 hours                                                   |
| **Setup Time**     | 15 to 30 min (unload, safety check)                        |
| **Strike Time**    | 15 to 30 min                                               |
| **Crew Required**  | 1 OSHA-certified operator                                  |
| **Power**          | Battery (electric) or diesel                               |
| **Footprint**      | 6ft x 10ft to 10ft x 30ft depending on height              |
| **Truck Space**    | 1 per flatbed or lowboy                                    |
| **Weather**        | `outdoor_rated`                                            |
| **Compliance**     | `OSHA`                                                     |
| **Sustainability** | `ELECTRIC`                                                 |

[Back to top](#table-of-contents)

##### Cranes

###### Crane - Mobile

|                    |                                                                            |
| ------------------ | -------------------------------------------------------------------------- | ----------- | ----------------- | ------------ | ------- | ----- |
| **Legacy Code**    | `SITE-1220`                                                                |
| **SKU**            | `SITE-HEQP-CRAN-001`                                                       |
| **UNSPSC**         | `22101700`                                                                 |
| **Common Name**    | Mobile Crane                                                               |
| **Search Aliases** | Hydraulic Crane                                                            | Truck Crane | All-Terrain Crane | RT Crane     |
| **Description**    | Hydraulic truck-mounted crane for heavy lifts                              |
| **Specifications** | 25-ton through 300-ton and above                                           |
| **Options**        | 25T                                                                        | 40T         | 60T               | 100T         | 200T    | 300T+ |
| **Modifiers**      | Tonnage                                                                    | Reach       | Duration          | Rigging Crew | Permits |
| **Prerequisites**  | Engineered lift plan, permits, ground bearing capacity, certified operator |
| **Pricing Unit**   | per unit/day                                                               |
| **Lead Time**      | 672 hours                                                                  |
| **Setup Time**     | 2 to 8 hours (mobilize, rig, test)                                         |
| **Strike Time**    | 2 to 6 hours                                                               |
| **Crew Required**  | NCCCO operator, oiler, signal person, riggers                              |
| **Power**          | Diesel                                                                     |
| **Footprint**      | Outrigger spread varies (20ft x 20ft to 60ft x 60ft)                       |
| **Truck Space**    | Self-propelled, escort vehicles for oversize                               |
| **Weather**        | `all_weather`                                                              |
| **Compliance**     | `FAA                                                                       | NCCCO`      |
| **Sustainability** | `ELECTRIC`                                                                 |

###### Crane - Tower

|                    |                                                                     |
| ------------------ | ------------------------------------------------------------------- | -------------------- | ---------------- | ------------- | ----------------------------- |
| **Legacy Code**    | `SITE-1221`                                                         |
| **SKU**            | `SITE-HEQP-CRAN-002`                                                |
| **UNSPSC**         | `22101700`                                                          |
| **Common Name**    | Tower Crane                                                         |
| **Search Aliases** | Fixed Crane                                                         | Construction Crane   | Hammerhead Crane | Luffing Crane |
| **Description**    | Fixed tower crane for multi-day heavy construction and installation |
| **Specifications** | 100 to 300ft height                                                 | 1 to 20 ton tip load |
| **Options**        | Top-Slewing                                                         | Self-Erecting        | Luffing Jib      |
| **Modifiers**      | Height                                                              | Reach                | Duration         | Operator      | Erection and Dismantling Crew |
| **Prerequisites**  | Foundation engineering, permits, FAA notification if near airport   |
| **Pricing Unit**   | per unit/week                                                       |
| **Lead Time**      | 672 hours                                                           |
| **Setup Time**     | 2 to 8 hours (mobilize, rig, test)                                  |
| **Strike Time**    | 2 to 6 hours                                                        |
| **Crew Required**  | NCCCO operator, oiler, signal person, riggers                       |
| **Power**          | Diesel                                                              |
| **Footprint**      | Outrigger spread varies (20ft x 20ft to 60ft x 60ft)                |
| **Truck Space**    | Self-propelled, escort vehicles for oversize                        |
| **Weather**        | `all_weather`                                                       |
| **Compliance**     | `FAA                                                                | NCCCO`               |
| **Sustainability** | `ELECTRIC`                                                          |

[Back to top](#table-of-contents)

#### Site Services

##### Power & Electrical

###### Generator - Towable

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ---------------- | ----------------- | ------------ | ----- | ----- | --- | --- |
| **Legacy Code**    | `SITE-1300`                                                |
| **SKU**            | `SITE-SERV-POWR-001`                                       |
| **UNSPSC**         | `26111700`                                                 |
| **Common Name**    | Towable Generator                                          |
| **Search Aliases** | Portable Generator                                         | Diesel Generator | Event Generator   | Temp Power   |
| **Description**    | Towable diesel generator for temporary event power         |
| **Specifications** | 20kW through 2MW                                           |
| **Options**        | 20kW                                                       | 45kW             | 100kW             | 200kW        | 500kW | 800kW | 1MW | 2MW |
| **Modifiers**      | kW Rating                                                  | Fuel Service     | Sound Attenuation | Distribution |
| **Prerequisites**  | Fuel supply, distribution cabling, ground fault protection |
| **Pricing Unit**   | per unit/day                                               |
| **Lead Time**      | 168 hours                                                  |
| **Setup Time**     | 1 to 2 hours (position, fuel, connect)                     |
| **Strike Time**    | 1 hour (disconnect, drain, haul)                           |
| **Crew Required**  | Licensed electrician for hookup, driver for delivery       |
| **Power**          | Produces power (diesel fuel required)                      |
| **Footprint**      | 4ft x 8ft (20kW) to 8ft x 20ft (1MW+)                      |
| **Truck Space**    | Towable on own trailer                                     |
| **Weather**        | `all_weather`                                              |
| **Compliance**     | `NFPA                                                      | EPA`             |
| **Sustainability** | `BIODIESEL`                                                |

###### Distribution Box - Power

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ------------------------------ | ---------- | ------------ | -------------- |
| **Legacy Code**    | `SITE-1301`                                             |
| **SKU**            | `SITE-SERV-POWR-002`                                    |
| **UNSPSC**         | `26111700`                                              |
| **Common Name**    | Power Distribution Box                                  |
| **Search Aliases** | Spider Box                                              | Distro Box                     | Temp Panel | Power Distro | Cam-Lock Panel |
| **Description**    | Temporary power distribution unit with circuit breakers |
| **Specifications** | 100A through 800A                                       | Cam-lock or pin and sleeve     |
| **Options**        | 100A                                                    | 200A                           | 400A       | 800A         |
| **Modifiers**      | Amperage                                                | Input and Output Configuration | Cable Runs |
| **Prerequisites**  | Generator or utility tie-in, qualified electrician      |
| **Pricing Unit**   | per unit/day                                            |
| **Lead Time**      | 48 hours                                                |
| **Setup Time**     | 30 to 60 min per box                                    |
| **Strike Time**    | 30 min per box                                          |
| **Crew Required**  | Licensed electrician                                    |
| **Power**          | Fed from generator or utility                           |
| **Footprint**      | 2ft x 2ft per box                                       |
| **Truck Space**    | 4 to 6 per pallet                                       |
| **Weather**        | `outdoor_rated`                                         |
| **Compliance**     | `NEC                                                    | NFPA`                          |
| **Sustainability** | `REUSABLE`                                              |

###### Cable Run - Feeder

|                    |                                                                       |
| ------------------ | --------------------------------------------------------------------- | --------------------- | ------------------------------------- | ---------------- |
| **Legacy Code**    | `SITE-1302`                                                           |
| **SKU**            | `SITE-SERV-POWR-003`                                                  |
| **UNSPSC**         | `26111700`                                                            |
| **Common Name**    | Feeder Cable Run                                                      |
| **Search Aliases** | Power Cable                                                           | Cam-Lock Cable        | Feeder Wire                           | Temp Power Cable |
| **Description**    | Temporary power cable from generator or utility to distribution point |
| **Specifications** | 2/0 or 4/0 AWG                                                        | Single or 5-wire sets | Various lengths                       |
| **Options**        | Per 100ft Run                                                         | Custom Length         |
| **Modifiers**      | Wire Gauge                                                            | Length                | Connectors (cam-lock, pin and sleeve) |
| **Prerequisites**  | Licensed electrician for termination                                  |
| **Pricing Unit**   | per run/day                                                           |
| **Lead Time**      | 48 hours                                                              |
| **Setup Time**     | 15 to 30 min per 100ft run                                            |
| **Strike Time**    | 15 to 30 min per run                                                  |
| **Crew Required**  | 1 to 2 electricians                                                   |
| **Power**          | N/A (carries power)                                                   |
| **Footprint**      | Cable run on ground or overhead                                       |
| **Truck Space**    | Cable reels, 2 to 4 per pallet                                        |
| **Weather**        | `outdoor_rated`                                                       |
| **Compliance**     | `NEC`                                                                 |
| **Sustainability** | `REUSABLE`                                                            |

###### Tie-In - Electrical

|                    |                                                                      |
| ------------------ | -------------------------------------------------------------------- | ------------ | ----------------------- | ------------ |
| **Legacy Code**    | `SITE-1303`                                                          |
| **SKU**            | `SITE-SERV-POWR-004`                                                 |
| **UNSPSC**         | `26111700`                                                           |
| **Common Name**    | Electrical Tie-In Service                                            |
| **Search Aliases** | Utility Tap                                                          | Power Hookup | Temp Service Connection | Panel Tie-In |
| **Description**    | Licensed electrician to connect temporary power to permanent utility |
| **Specifications** | 100A through 800A and above service                                  |
| **Options**        | Single Phase                                                         | Three Phase  |
| **Modifiers**      | Amperage                                                             | Phase        | Permit Coordination     |
| **Prerequisites**  | Permit, utility coordination, licensed electrician                   |
| **Pricing Unit**   | per service                                                          |
| **Lead Time**      | 168 hours                                                            |
| **Setup Time**     | 30 to 60 min                                                         |
| **Strike Time**    | 30 min                                                               |
| **Crew Required**  | Licensed electrician                                                 |
| **Power**          | Varies                                                               |
| **Footprint**      | Varies                                                               |
| **Truck Space**    | Varies                                                               |
| **Weather**        | `outdoor_rated`                                                      |
| **Compliance**     | `NEC                                                                 | NFPA`        |
| **Sustainability** | `REUSABLE`                                                           |

###### Battery Pack - Portable

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | --------------------------------- | ----------------------- | -------------- |
| **Legacy Code**    | `SITE-1304`                                           |
| **SKU**            | `SITE-SERV-POWR-005`                                  |
| **UNSPSC**         | `26111700`                                            |
| **Common Name**    | Portable Battery Pack                                 |
| **Search Aliases** | Solar Battery                                         | Power Station                     | Battery Generator       | Off-Grid Power |
| **Description**    | Battery backup or solar power pack for off-grid areas |
| **Specifications** | 1kWh through 10kWh                                    | Solar and battery combo available |
| **Options**        | Battery Only                                          | Solar Panel with Battery          | Hybrid (solar and grid) |
| **Modifiers**      | Capacity                                              | Solar Panel Count                 | Inverter Output         |
| **Prerequisites**  | Sun exposure for solar, weather protection            |
| **Pricing Unit**   | per unit/day                                          |
| **Lead Time**      | 168 hours                                             |
| **Setup Time**     | 30 to 60 min                                          |
| **Strike Time**    | 30 min                                                |
| **Crew Required**  | Licensed electrician                                  |
| **Power**          | Varies                                                |
| **Footprint**      | Varies                                                |
| **Truck Space**    | Varies                                                |
| **Weather**        | `outdoor_rated`                                       |
| **Compliance**     | `NEC                                                  | NFPA`                             |
| **Sustainability** | `REUSABLE`                                            |

###### Light Tower - Portable

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ------------------- | --------------- | ------------------- | ---------- |
| **Legacy Code**    | `SITE-1305`                                          |
| **SKU**            | `SITE-SERV-POWR-006`                                 |
| **UNSPSC**         | `26111700`                                           |
| **Common Name**    | Portable Light Tower                                 |
| **Search Aliases** | Light Tower                                          | Night Tower         | Site Light      | Construction Light  | Moon Tower |
| **Description**    | Towable light tower for site illumination and safety |
| **Specifications** | 4-head or 6-head                                     | LED or metal halide | 20 to 30ft mast |
| **Options**        | 4-Head LED                                           | 6-Head LED          | Solar LED       | Diesel Metal Halide |
| **Modifiers**      | Type                                                 | Quantity            | Fuel or Power   | Runtime             |
| **Prerequisites**  | Fuel (diesel units), level ground, tie-down in wind  |
| **Pricing Unit**   | per unit/day                                         |
| **Lead Time**      | 168 hours                                            |
| **Setup Time**     | 30 to 60 min                                         |
| **Strike Time**    | 30 min                                               |
| **Crew Required**  | Licensed electrician                                 |
| **Power**          | Varies                                               |
| **Footprint**      | Varies                                               |
| **Truck Space**    | Varies                                               |
| **Weather**        | `outdoor_rated`                                      |
| **Compliance**     | `NEC                                                 | NFPA`               |
| **Sustainability** | `REUSABLE`                                           |

[Back to top](#table-of-contents)

##### Water & Plumbing

###### Water Tank - Potable

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | ------------- | ---------------- | -------------- | --------- |
| **Legacy Code**    | `SITE-1310`                                                      |
| **SKU**            | `SITE-SERV-WATR-001`                                             |
| **UNSPSC**         | `47131600`                                                       |
| **Common Name**    | Potable Water Tank                                               |
| **Search Aliases** | Water Trailer                                                    | Water Buffalo | Fresh Water Tank | Portable Water |
| **Description**    | Mobile potable water storage for events without municipal access |
| **Specifications** | 250 through 5,000 gallon                                         |
| **Options**        | 250 gal                                                          | 500 gal       | 1,000 gal        | 2,500 gal      | 5,000 gal |
| **Modifiers**      | Capacity                                                         | Fill Service  | Pump and Hose    |
| **Prerequisites**  | Fill source, health department approval if for consumption       |
| **Pricing Unit**   | per unit/day                                                     |
| **Lead Time**      | 168 hours                                                        |
| **Setup Time**     | 30 to 60 min (position and connect)                              |
| **Strike Time**    | 30 min                                                           |
| **Crew Required**  | Driver, 1 helper for hookup                                      |
| **Power**          | Pump may need 20A                                                |
| **Footprint**      | 4ft x 8ft to 6ft x 12ft                                          |
| **Truck Space**    | Towable trailer                                                  |
| **Weather**        | `all_weather`                                                    |
| **Compliance**     | `HEALTH_DEPT`                                                    |
| **Sustainability** | `REUSABLE`                                                       |

###### Tank - Gray Water

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ------------------ | -------------------- |
| **Legacy Code**    | `SITE-1311`                                             |
| **SKU**            | `SITE-SERV-WATR-002`                                    |
| **UNSPSC**         | `47131600`                                              |
| **Common Name**    | Gray Water Collection Tank                              |
| **Search Aliases** | Waste Water Tank                                        | Gray Water Trailer | Holding Tank         |
| **Description**    | Gray water collection tank for sink and shower drainage |
| **Specifications** | 250 through 1,000 gallon                                | Pump-out service   |
| **Options**        | 250 gal                                                 | 500 gal            | 1,000 gal            |
| **Modifiers**      | Capacity                                                | Pump-Out Frequency | Plumbing Connections |
| **Prerequisites**  | Pump-out truck access, plumbing connections             |
| **Pricing Unit**   | per unit/day                                            |
| **Lead Time**      | 168 hours                                               |
| **Setup Time**     | 30 to 60 min (position and connect)                     |
| **Strike Time**    | 30 min                                                  |
| **Crew Required**  | Driver, 1 helper for hookup                             |
| **Power**          | Pump may need 20A                                       |
| **Footprint**      | 4ft x 8ft to 6ft x 12ft                                 |
| **Truck Space**    | Towable trailer                                         |
| **Weather**        | `all_weather`                                           |
| **Compliance**     | `HEALTH_DEPT`                                           |
| **Sustainability** | `REUSABLE`                                              |

[Back to top](#table-of-contents)

##### Waste Management

###### Dumpster - Roll-Off

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | -------------- | ----------------------------------------- | --------- |
| **Legacy Code**    | `SITE-1320`                                                 |
| **SKU**            | `SITE-SERV-WAST-001`                                        |
| **UNSPSC**         | `76111500`                                                  |
| **Common Name**    | Roll-Off Dumpster                                           |
| **Search Aliases** | Dumpster                                                    | Roll-Off       | Open Top Container                        | Waste Box |
| **Description**    | Open-top roll-off dumpster for construction and event waste |
| **Specifications** | 10 through 40 cubic yard                                    |
| **Options**        | 10 yd                                                       | 20 yd          | 30 yd                                     | 40 yd     |
| **Modifiers**      | Size                                                        | Haul Frequency | Waste Type (general, recyclable, C and D) |
| **Prerequisites**  | Truck access for delivery and haul                          |
| **Pricing Unit**   | per unit/haul                                               |
| **Lead Time**      | 48 hours                                                    |
| **Setup Time**     | 15 to 30 min (drop)                                         |
| **Strike Time**    | 15 min (haul)                                               |
| **Crew Required**  | CDL driver (roll-off truck)                                 |
| **Power**          | None (30A if compactor)                                     |
| **Footprint**      | 8ft x 12ft (10yd) to 8ft x 22ft (40yd)                      |
| **Truck Space**    | Delivered on roll-off truck                                 |
| **Weather**        | `all_weather`                                               |
| **Sustainability** | `COMPOSTABLE                                                | RECYCLABLE`    |

###### Receptacle - Trash and Recycling

|                    |                                                     |
| ------------------ | --------------------------------------------------- | ------------- | ----------------- | ------------- | ------------- |
| **Legacy Code**    | `SITE-1321`                                         |
| **SKU**            | `SITE-SERV-WAST-002`                                |
| **UNSPSC**         | `76111500`                                          |
| **Common Name**    | Trash and Recycling Receptacle                      |
| **Search Aliases** | Waste Bin                                           | Garbage Can   | Recycling Station | Litter Bin    | Waste Station |
| **Description**    | Event-grade waste receptacle with liner and signage |
| **Specifications** | 32 gal or 44 gal                                    | Slim Jim      | Custom branded    |
| **Options**        | Trash                                               | Recycling     | Compost           | Combo Station |
| **Modifiers**      | Quantity                                            | Liner Service | Custom Branding   |
| **Pricing Unit**   | per unit/day                                        |
| **Lead Time**      | 48 hours                                            |
| **Setup Time**     | 15 to 30 min (drop)                                 |
| **Strike Time**    | 15 min (haul)                                       |
| **Crew Required**  | CDL driver (roll-off truck)                         |
| **Power**          | None (30A if compactor)                             |
| **Footprint**      | 8ft x 12ft (10yd) to 8ft x 22ft (40yd)              |
| **Truck Space**    | Delivered on roll-off truck                         |
| **Weather**        | `all_weather`                                       |
| **Sustainability** | `COMPOSTABLE                                        | RECYCLABLE`   |

###### Service - Waste Removal

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | --------------- | ------------- | ---------------- |
| **Legacy Code**    | `SITE-1322`                                                     |
| **SKU**            | `SITE-SERV-WAST-003`                                            |
| **UNSPSC**         | `76111500`                                                      |
| **Common Name**    | Waste Removal Service                                           |
| **Search Aliases** | Trash Pickup                                                    | Garbage Service | Waste Hauling | Disposal Service |
| **Description**    | Scheduled waste collection and disposal during multi-day events |
| **Specifications** | Daily, twice daily, or on-call                                  |
| **Options**        | General Waste                                                   | Recycling       | Compost       | Hazmat           |
| **Modifiers**      | Frequency                                                       | Waste Streams   | Crew Size     |
| **Prerequisites**  | Staging area for waste, truck access                            |
| **Pricing Unit**   | per day                                                         |
| **Lead Time**      | 48 hours                                                        |
| **Setup Time**     | 15 to 30 min (drop)                                             |
| **Strike Time**    | 15 min (haul)                                                   |
| **Crew Required**  | CDL driver (roll-off truck)                                     |
| **Power**          | None (30A if compactor)                                         |
| **Footprint**      | 8ft x 12ft (10yd) to 8ft x 22ft (40yd)                          |
| **Truck Space**    | Delivered on roll-off truck                                     |
| **Weather**        | `all_weather`                                                   |
| **Sustainability** | `COMPOSTABLE                                                    | RECYCLABLE`     |

###### Compactor - Portable

|                    |                                                  |
| ------------------ | ------------------------------------------------ | ------------------------------- | ------------------------ |
| **Legacy Code**    | `SITE-1323`                                      |
| **SKU**            | `SITE-SERV-WAST-004`                             |
| **UNSPSC**         | `76111500`                                       |
| **Common Name**    | Portable Compactor                               |
| **Search Aliases** | Trash Compactor                                  | Waste Compactor                 | Self-Contained Compactor |
| **Description**    | On-site waste compactor to reduce haul frequency |
| **Specifications** | 2 through 6 cubic yard compactor                 |
| **Options**        | Standard                                         | Self-Contained (with container) |
| **Modifiers**      | Size                                             | Service Frequency               |
| **Prerequisites**  | Power (30A minimum), truck access                |
| **Pricing Unit**   | per unit/day                                     |
| **Lead Time**      | 48 hours                                         |
| **Setup Time**     | 15 to 30 min (drop)                              |
| **Strike Time**    | 15 min (haul)                                    |
| **Crew Required**  | CDL driver (roll-off truck)                      |
| **Power**          | None (30A if compactor)                          |
| **Footprint**      | 8ft x 12ft (10yd) to 8ft x 22ft (40yd)           |
| **Truck Space**    | Delivered on roll-off truck                      |
| **Weather**        | `all_weather`                                    |
| **Sustainability** | `COMPOSTABLE                                     | RECYCLABLE`                     |

[Back to top](#table-of-contents)

##### Climate Control

###### Air Conditioner - Portable

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ------- | ------------------ | ------------- | ------------ | --- |
| **Legacy Code**    | `SITE-1330`                                              |
| **SKU**            | `SITE-SERV-CLIM-001`                                     |
| **UNSPSC**         | `40101500`                                               |
| **Common Name**    | Portable Air Conditioner                                 |
| **Search Aliases** | Spot Cooler                                              | Temp AC | Event AC           | Portable HVAC | Tent Cooling |
| **Description**    | Spot cooler or portable AC unit for tents and structures |
| **Specifications** | 1 through 50 ton                                         |
| **Options**        | 1T                                                       | 2T      | 5T                 | 10T           | 25T          | 50T |
| **Modifiers**      | Tonnage                                                  | Ducting | Power Requirements |
| **Prerequisites**  | Adequate power supply, duct routing                      |
| **Pricing Unit**   | per unit/day                                             |
| **Lead Time**      | 168 hours                                                |
| **Setup Time**     | 30 to 60 min (position, duct, power)                     |
| **Strike Time**    | 30 min                                                   |
| **Crew Required**  | 1 to 2 HVAC techs                                        |
| **Power**          | 20A (small) to 200A (50T AC)                             |
| **Footprint**      | 2ft x 3ft (spot cooler) to 6ft x 12ft (25T+)             |
| **Truck Space**    | Small units on pallet, large on flatbed                  |
| **Weather**        | `outdoor_rated`                                          |
| **Compliance**     | `EPA`                                                    |
| **Sustainability** | `ELECTRIC`                                               |

###### Heater - Portable

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ---------------- | ----------------------- | ------------ | ----------- |
| **Legacy Code**    | `SITE-1331`                                          |
| **SKU**            | `SITE-SERV-CLIM-002`                                 |
| **UNSPSC**         | `40101500`                                           |
| **Common Name**    | Portable Heater                                      |
| **Search Aliases** | Forced Air Heater                                    | Radiant Heater   | Torpedo Heater          | Space Heater | Tent Heater |
| **Description**    | Forced air or radiant heater for cold-weather events |
| **Specifications** | 40K through 400K BTU                                 |
| **Options**        | Propane Forced Air                                   | Electric Radiant | Indirect Fired          |
| **Modifiers**      | BTU Rating                                           | Fuel Type        | Indoor or Outdoor Rated |
| **Prerequisites**  | Ventilation for propane units, fuel supply           |
| **Pricing Unit**   | per unit/day                                         |
| **Lead Time**      | 168 hours                                            |
| **Setup Time**     | 30 to 60 min (position, duct, power)                 |
| **Strike Time**    | 30 min                                               |
| **Crew Required**  | 1 to 2 HVAC techs                                    |
| **Power**          | 20A (small) to 200A (50T AC)                         |
| **Footprint**      | 2ft x 3ft (spot cooler) to 6ft x 12ft (25T+)         |
| **Truck Space**    | Small units on pallet, large on flatbed              |
| **Weather**        | `outdoor_rated`                                      |
| **Compliance**     | `EPA`                                                |
| **Sustainability** | `ELECTRIC`                                           |

###### Fan - Industrial

|                    |                                                   |
| ------------------ | ------------------------------------------------- | ------------------ | --------------- | ----------- | ----------- | ------ |
| **Legacy Code**    | `SITE-1332`                                       |
| **SKU**            | `SITE-SERV-CLIM-003`                              |
| **UNSPSC**         | `40101500`                                        |
| **Common Name**    | Industrial Fan                                    |
| **Search Aliases** | Drum Fan                                          | Barrel Fan         | High-Volume Fan | Misting Fan | Exhaust Fan | Blower |
| **Description**    | High-volume air mover for ventilation and cooling |
| **Specifications** | 18in through 48in diameter                        |
| **Options**        | Drum Fan                                          | Barrel Fan         | Misting Fan     | Exhaust Fan |
| **Modifiers**      | Size                                              | Misting Attachment | Quantity        |
| **Prerequisites**  | Power supply                                      |
| **Pricing Unit**   | per unit/day                                      |
| **Lead Time**      | 168 hours                                         |
| **Setup Time**     | 30 to 60 min (position, duct, power)              |
| **Strike Time**    | 30 min                                            |
| **Crew Required**  | 1 to 2 HVAC techs                                 |
| **Power**          | 20A (small) to 200A (50T AC)                      |
| **Footprint**      | 2ft x 3ft (spot cooler) to 6ft x 12ft (25T+)      |
| **Truck Space**    | Small units on pallet, large on flatbed           |
| **Weather**        | `outdoor_rated`                                   |
| **Compliance**     | `EPA`                                             |
| **Sustainability** | `ELECTRIC`                                        |

[Back to top](#table-of-contents)

##### Internet & Connectivity

###### WiFi Network - Temporary

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ---------------- | ------------------- | --------------- | ---------- |
| **Legacy Code**    | `SITE-1340`                                                |
| **SKU**            | `SITE-SERV-INET-001`                                       |
| **UNSPSC**         | `43222600`                                                 |
| **Common Name**    | Temporary WiFi Network                                     |
| **Search Aliases** | Event WiFi                                                 | Managed WiFi     | Portable Internet   | Bonded Cellular | Guest WiFi |
| **Description**    | Managed WiFi network for event operations and guest access |
| **Specifications** | 50 through 1,000 or more users                             |
| **Options**        | Operations Only                                            | Guest and Ops    | High-Density Public |
| **Modifiers**      | User Count                                                 | Bandwidth (Mbps) | Coverage Area       | Managed Service |
| **Prerequisites**  | Internet backhaul (fiber, bonded cellular, or satellite)   |
| **Pricing Unit**   | per event/day                                              |
| **Lead Time**      | 672 hours                                                  |
| **Setup Time**     | 4 to 8 hours (survey, install, test)                       |
| **Strike Time**    | 2 to 4 hours                                               |
| **Crew Required**  | 1 to 2 network engineers                                   |
| **Power**          | 20A per access point or switch                             |
| **Footprint**      | Access points mounted overhead or on stands                |
| **Truck Space**    | 1 to 2 road cases                                          |
| **Weather**        | `outdoor_rated`                                            |
| **Compliance**     | `FCC`                                                      |
| **Sustainability** | `REUSABLE                                                  | LOW_POWER`       |

###### Signal Booster - Cellular

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | -------------------- | ----------- | -------------- | -------------------------- |
| **Legacy Code**    | `SITE-1341`                                              |
| **SKU**            | `SITE-SERV-INET-002`                                     |
| **UNSPSC**         | `43222600`                                               |
| **Common Name**    | Cellular Signal Booster                                  |
| **Search Aliases** | DAS                                                      | Cell Booster         | COW         | Cell on Wheels | Distributed Antenna System |
| **Description**    | Temporary distributed antenna system or cellular booster |
| **Specifications** | Single carrier through full DAS                          |
| **Options**        | Booster (small area)                                     | COW (Cell on Wheels) | Full DAS    |
| **Modifiers**      | Coverage Area                                            | Carrier Support      | Engineering |
| **Prerequisites**  | Carrier coordination, FCC compliance                     |
| **Pricing Unit**   | per unit/day                                             |
| **Lead Time**      | 672 hours                                                |
| **Setup Time**     | 4 to 8 hours (survey, install, test)                     |
| **Strike Time**    | 2 to 4 hours                                             |
| **Crew Required**  | 1 to 2 network engineers                                 |
| **Power**          | 20A per access point or switch                           |
| **Footprint**      | Access points mounted overhead or on stands              |
| **Truck Space**    | 1 to 2 road cases                                        |
| **Weather**        | `outdoor_rated`                                          |
| **Compliance**     | `FCC`                                                    |
| **Sustainability** | `REUSABLE                                                | LOW_POWER`           |

###### Network - Ethernet - Temp

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ---------------- | -------------- | ------------------ |
| **Legacy Code**    | `SITE-1342`                                              |
| **SKU**            | `SITE-SERV-INET-003`                                     |
| **UNSPSC**         | `43222600`                                               |
| **Common Name**    | Temporary Ethernet Network                               |
| **Search Aliases** | Hardwired Network                                        | Event LAN        | Wired Internet | Production Network |
| **Description**    | Temporary ethernet infrastructure for production and POS |
| **Specifications** | Cat6 or Cat6a or Fiber                                   | Managed switch   | Patch panel    |
| **Options**        | Cat6 (copper)                                            | Fiber (long run) | Managed Switch |
| **Modifiers**      | Run Count                                                | Length           | Switch Ports   | Network Engineer   |
| **Prerequisites**  | Switch, patch panel, cable management                    |
| **Pricing Unit**   | per run/day                                              |
| **Lead Time**      | 672 hours                                                |
| **Setup Time**     | 4 to 8 hours (survey, install, test)                     |
| **Strike Time**    | 2 to 4 hours                                             |
| **Crew Required**  | 1 to 2 network engineers                                 |
| **Power**          | 20A per access point or switch                           |
| **Footprint**      | Access points mounted overhead or on stands              |
| **Truck Space**    | 1 to 2 road cases                                        |
| **Weather**        | `outdoor_rated`                                          |
| **Compliance**     | `FCC`                                                    |
| **Sustainability** | `REUSABLE                                                | LOW_POWER`       |

[Back to top](#table-of-contents)

#### Site Equipment & Tools

##### Safety Equipment

###### Fire Extinguisher - ABC

|                    |                                                 |
| ------------------ | ----------------------------------------------- | ---------------------------- | ------------------------ | --------- |
| **Legacy Code**    | `SITE-1400`                                     |
| **SKU**            | `SITE-TOOL-SAFE-001`                            |
| **UNSPSC**         | `46191600`                                      |
| **Common Name**    | Fire Extinguisher                               |
| **Search Aliases** | ABC Extinguisher                                | CO2 Extinguisher             | Dry Chemical             | Fire Can  |
| **Description**    | ABC dry chemical fire extinguisher, event-rated |
| **Specifications** | 5 lb through 20 lb                              | CO2 available for electrical |
| **Options**        | 5 lb ABC                                        | 10 lb ABC                    | 20 lb ABC                | 15 lb CO2 |
| **Modifiers**      | Quantity                                        | Type                         | Inspection Certification |
| **Pricing Unit**   | per unit/event                                  |
| **Lead Time**      | 24 hours                                        |
| **Setup Time**     | 5 min per unit                                  |
| **Strike Time**    | 5 min per unit                                  |
| **Crew Required**  | 1 person                                        |
| **Power**          | None                                            |
| **Footprint**      | Minimal (wall-mount or floor stand)             |
| **Truck Space**    | Box or bin, minimal space                       |
| **Weather**        | `outdoor_rated`                                 |
| **Compliance**     | `OSHA                                           | NFPA`                        |
| **Sustainability** | `REUSABLE`                                      |

###### First Aid Kit - Event

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | -------------------- | -------- | ----------------------- |
| **Legacy Code**    | `SITE-1401`                                              |
| **SKU**            | `SITE-TOOL-SAFE-002`                                     |
| **UNSPSC**         | `46191600`                                               |
| **Common Name**    | Event First Aid Kit                                      |
| **Search Aliases** | First Aid Kit                                            | Med Kit              | OSHA Kit | Trauma Kit              |
| **Description**    | Comprehensive first aid kit per OSHA and event standards |
| **Specifications** | 25-person through 100-person                             | Trauma kit available |
| **Options**        | Basic                                                    | Enhanced             | Trauma   | AED and First Aid Combo |
| **Modifiers**      | Size                                                     | Restock Service      |
| **Pricing Unit**   | per kit/event                                            |
| **Lead Time**      | 24 hours                                                 |
| **Setup Time**     | 5 min per unit                                           |
| **Strike Time**    | 5 min per unit                                           |
| **Crew Required**  | 1 person                                                 |
| **Power**          | None                                                     |
| **Footprint**      | Minimal (wall-mount or floor stand)                      |
| **Truck Space**    | Box or bin, minimal space                                |
| **Weather**        | `outdoor_rated`                                          |
| **Compliance**     | `OSHA                                                    | NFPA`                |
| **Sustainability** | `REUSABLE`                                               |

###### Defibrillator - AED

|                    |                                                  |
| ------------------ | ------------------------------------------------ | -------------------- | ------------------------- |
| **Legacy Code**    | `SITE-1402`                                      |
| **SKU**            | `SITE-TOOL-SAFE-003`                             |
| **UNSPSC**         | `46191600`                                       |
| **Common Name**    | Automated External Defibrillator                 |
| **Search Aliases** | AED                                              | Heart Defibrillator  | Emergency Defibrillator   |
| **Description**    | Portable AED unit with carrying case and signage |
| **Specifications** | Standard with cabinet and signage                |
| **Options**        | Standard                                         | With Alarmed Cabinet | With CPR Kit              |
| **Modifiers**      | Quantity                                         | Cabinet Mount        | Trained Operator (add-on) |
| **Prerequisites**  | Trained personnel on-site                        |
| **Pricing Unit**   | per unit/event                                   |
| **Lead Time**      | 24 hours                                         |
| **Setup Time**     | 5 min per unit                                   |
| **Strike Time**    | 5 min per unit                                   |
| **Crew Required**  | 1 person                                         |
| **Power**          | None                                             |
| **Footprint**      | Minimal (wall-mount or floor stand)              |
| **Truck Space**    | Box or bin, minimal space                        |
| **Weather**        | `outdoor_rated`                                  |
| **Compliance**     | `OSHA                                            | NFPA`                |
| **Sustainability** | `REUSABLE`                                       |

###### Kit - Crowd Management

|                    |                                                                     |
| ------------------ | ------------------------------------------------------------------- | --------------------------- | ------------- | ----------------- |
| **Legacy Code**    | `SITE-1403`                                                         |
| **SKU**            | `SITE-TOOL-SAFE-004`                                                |
| **UNSPSC**         | `46191600`                                                          |
| **Common Name**    | Crowd Management Kit                                                |
| **Search Aliases** | Safety Kit                                                          | Traffic Kit                 | Bull Horn Kit | Event Safety Pack |
| **Description**    | Bull horns, traffic wands, flashlights, and reflective vests bundle |
| **Specifications** | 2 bull horns, 6 wands, 12 flashlights, 24 vests                     |
| **Options**        | Standard                                                            | Expanded (add cones, signs) |
| **Modifiers**      | Kit Size                                                            |
| **Pricing Unit**   | per kit/event                                                       |
| **Lead Time**      | 24 hours                                                            |
| **Setup Time**     | 5 min per unit                                                      |
| **Strike Time**    | 5 min per unit                                                      |
| **Crew Required**  | 1 person                                                            |
| **Power**          | None                                                                |
| **Footprint**      | Minimal (wall-mount or floor stand)                                 |
| **Truck Space**    | Box or bin, minimal space                                           |
| **Weather**        | `outdoor_rated`                                                     |
| **Compliance**     | `OSHA                                                               | NFPA`                       |
| **Sustainability** | `REUSABLE`                                                          |

###### Kit - Spill Containment

|                    |                                                                     |
| ------------------ | ------------------------------------------------------------------- | ----------------- | ----------- | ----------------- |
| **Legacy Code**    | `SITE-1404`                                                         |
| **SKU**            | `SITE-TOOL-SAFE-005`                                                |
| **UNSPSC**         | `46191600`                                                          |
| **Common Name**    | Spill Containment Kit                                               |
| **Search Aliases** | Hazmat Kit                                                          | Spill Kit         | Cleanup Kit | Environmental Kit |
| **Description**    | Containment and cleanup kit for fuel, chemical, or biohazard spills |
| **Specifications** | 5 gal through 55 gal capacity                                       | Biohazard options |
| **Options**        | Universal (all liquids)                                             | Oil-Only          | Biohazard   |
| **Modifiers**      | Size                                                                | Type              | Quantity    |
| **Prerequisites**  | MSDS sheets for chemicals on-site                                   |
| **Pricing Unit**   | per kit/event                                                       |
| **Lead Time**      | 24 hours                                                            |
| **Setup Time**     | 5 min per unit                                                      |
| **Strike Time**    | 5 min per unit                                                      |
| **Crew Required**  | 1 person                                                            |
| **Power**          | None                                                                |
| **Footprint**      | Minimal (wall-mount or floor stand)                                 |
| **Truck Space**    | Box or bin, minimal space                                           |
| **Weather**        | `outdoor_rated`                                                     |
| **Compliance**     | `OSHA                                                               | NFPA`             |
| **Sustainability** | `REUSABLE`                                                          |

[Back to top](#table-of-contents)

##### General Tools & Hardware

###### Tool Kit - Production

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | -------- | ------------------------------ | -------------- |
| **Legacy Code**    | `SITE-1410`                                               |
| **SKU**            | `SITE-TOOL-HDWR-001`                                      |
| **UNSPSC**         | `27111500`                                                |
| **Common Name**    | Production Tool Kit                                       |
| **Search Aliases** | Tool Kit                                                  | Crew Kit | Stage Tool Kit                 | Multi-Tool Set |
| **Description**    | Comprehensive tool kit for on-site production work        |
| **Specifications** | Drills, wrenches, pliers, tape measures, levels, hardware |
| **Options**        | Basic                                                     | Standard | Premium (includes power tools) |
| **Modifiers**      | Kit Tier                                                  |
| **Pricing Unit**   | per kit/day                                               |
| **Lead Time**      | 24 hours                                                  |
| **Setup Time**     | Immediate (unpack)                                        |
| **Strike Time**    | 5 min (repack)                                            |
| **Crew Required**  | 1 person                                                  |
| **Power**          | 20A for power tools                                       |
| **Footprint**      | Minimal (tool box or case)                                |
| **Truck Space**    | 1 to 2 road cases                                         |
| **Weather**        | `outdoor_rated`                                           |
| **Compliance**     | `OSHA`                                                    |
| **Sustainability** | `REUSABLE`                                                |

###### Ladder - A-Frame

|                    |                                                    |
| ------------------ | -------------------------------------------------- | -------------- | --------------- | ---- | ---- |
| **Legacy Code**    | `SITE-1411`                                        |
| **SKU**            | `SITE-TOOL-HDWR-002`                               |
| **UNSPSC**         | `27111500`                                         |
| **Common Name**    | A-Frame Ladder                                     |
| **Search Aliases** | Step Ladder                                        | Folding Ladder | Platform Ladder |
| **Description**    | Aluminum A-frame step ladder for general site work |
| **Specifications** | 6ft through 16ft                                   |
| **Options**        | 6ft                                                | 8ft            | 10ft            | 12ft | 16ft |
| **Modifiers**      | Height                                             | Quantity       |
| **Pricing Unit**   | per unit/day                                       |
| **Lead Time**      | 24 hours                                           |
| **Setup Time**     | Immediate (unpack)                                 |
| **Strike Time**    | 5 min (repack)                                     |
| **Crew Required**  | 1 person                                           |
| **Power**          | 20A for power tools                                |
| **Footprint**      | Minimal (tool box or case)                         |
| **Truck Space**    | 1 to 2 road cases                                  |
| **Weather**        | `outdoor_rated`                                    |
| **Compliance**     | `OSHA`                                             |
| **Sustainability** | `REUSABLE`                                         |

###### Ladder - Extension

|                    |                                               |
| ------------------ | --------------------------------------------- | ---------------- | ------------ | ---- | ---- |
| **Legacy Code**    | `SITE-1412`                                   |
| **SKU**            | `SITE-TOOL-HDWR-003`                          |
| **UNSPSC**         | `27111500`                                    |
| **Common Name**    | Extension Ladder                              |
| **Search Aliases** | Straight Ladder                               | Extending Ladder | Reach Ladder |
| **Description**    | Aluminum extension ladder for elevated access |
| **Specifications** | 20ft through 40ft                             |
| **Options**        | 20ft                                          | 24ft             | 28ft         | 32ft | 40ft |
| **Modifiers**      | Height                                        |
| **Pricing Unit**   | per unit/day                                  |
| **Lead Time**      | 24 hours                                      |
| **Setup Time**     | Immediate (unpack)                            |
| **Strike Time**    | 5 min (repack)                                |
| **Crew Required**  | 1 person                                      |
| **Power**          | 20A for power tools                           |
| **Footprint**      | Minimal (tool box or case)                    |
| **Truck Space**    | 1 to 2 road cases                             |
| **Weather**        | `outdoor_rated`                               |
| **Compliance**     | `OSHA`                                        |
| **Sustainability** | `REUSABLE`                                    |

###### Hand Truck

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | ------------------------- | --------------- | ------------- | --------------- |
| **Legacy Code**    | `SITE-1413`                                                 |
| **SKU**            | `SITE-TOOL-HDWR-004`                                        |
| **UNSPSC**         | `27111500`                                                  |
| **Common Name**    | Hand Truck                                                  |
| **Search Aliases** | Dolly                                                       | Two-Wheeler               | Furniture Dolly | Platform Cart | Appliance Dolly |
| **Description**    | Two-wheel hand truck or platform dolly for moving equipment |
| **Specifications** | Standard 2-wheel through appliance dolly                    |
| **Options**        | 2-Wheel (600 lb)                                            | Platform Dolly (1,000 lb) | Appliance Dolly | Panel Cart    |
| **Modifiers**      | Type                                                        | Quantity                  |
| **Pricing Unit**   | per unit/day                                                |
| **Lead Time**      | 24 hours                                                    |
| **Setup Time**     | Immediate (unpack)                                          |
| **Strike Time**    | 5 min (repack)                                              |
| **Crew Required**  | 1 person                                                    |
| **Power**          | 20A for power tools                                         |
| **Footprint**      | Minimal (tool box or case)                                  |
| **Truck Space**    | 1 to 2 road cases                                           |
| **Weather**        | `outdoor_rated`                                             |
| **Compliance**     | `OSHA`                                                      |
| **Sustainability** | `REUSABLE`                                                  |

###### Pallet Jack - Manual

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | --------------- | ----------------- | ------ |
| **Legacy Code**    | `SITE-1414`                                            |
| **SKU**            | `SITE-TOOL-HDWR-005`                                   |
| **UNSPSC**         | `27111500`                                             |
| **Common Name**    | Manual Pallet Jack                                     |
| **Search Aliases** | Pallet Jack                                            | Pump Truck      | Hand Pallet Truck | Jigger |
| **Description**    | Manual hydraulic pallet jack for moving loaded pallets |
| **Specifications** | 5,500 lb capacity                                      | 48in forks      |
| **Options**        | Standard (27in wide)                                   | Narrow (20.5in) | Long Fork (60in)  |
| **Modifiers**      | Type                                                   | Quantity        |
| **Prerequisites**  | Paved or smooth surface                                |
| **Pricing Unit**   | per unit/day                                           |
| **Lead Time**      | 24 hours                                               |
| **Setup Time**     | Immediate (unpack)                                     |
| **Strike Time**    | 5 min (repack)                                         |
| **Crew Required**  | 1 person                                               |
| **Power**          | 20A for power tools                                    |
| **Footprint**      | Minimal (tool box or case)                             |
| **Truck Space**    | 1 to 2 road cases                                      |
| **Weather**        | `outdoor_rated`                                        |
| **Compliance**     | `OSHA`                                                 |
| **Sustainability** | `REUSABLE`                                             |

[Back to top](#table-of-contents)

##### Expendables & Consumables

###### Tape - Gaffer

|                    |                                                     |
| ------------------ | --------------------------------------------------- | ---------------- | --------------- | ------------------ |
| **Legacy Code**    | `SITE-1420`                                         |
| **SKU**            | `SITE-TOOL-EXPD-001`                                |
| **UNSPSC**         | `31201500`                                          |
| **Common Name**    | Gaffer Tape                                         |
| **Search Aliases** | Gaff Tape                                           | Cloth Tape       | Production Tape | Spike Tape         |
| **Description**    | Professional-grade cloth gaffer tape for production |
| **Specifications** | 2in x 60yd                                          | Matte finish     | Residue-free    |
| **Options**        | Black                                               | White            | Gray            | Fluorescent Colors |
| **Modifiers**      | Color                                               | Quantity (rolls) |
| **Pricing Unit**   | per roll                                            |
| **Lead Time**      | 24 hours                                            |
| **Setup Time**     | N/A (consumable)                                    |
| **Strike Time**    | N/A                                                 |
| **Crew Required**  | None                                                |
| **Power**          | None                                                |
| **Footprint**      | Minimal (storage box)                               |
| **Truck Space**    | Case or box, minimal                                |
| **Weather**        | `sheltered`                                         |
| **Sustainability** | `REUSABLE                                           | SINGLE_USE`      |

###### Cable Ties - Assorted

|                    |                                    |
| ------------------ | ---------------------------------- | ---------------------------- | ------------------ | --------------- | ----------- |
| **Legacy Code**    | `SITE-1421`                        |
| **SKU**            | `SITE-TOOL-EXPD-002`               |
| **UNSPSC**         | `31201500`                         |
| **Common Name**    | Cable Ties                         |
| **Search Aliases** | Zip Ties                           | Wire Ties                    | Nylon Ties         | Velcro Wraps    | Cable Wraps |
| **Description**    | Nylon cable ties in assorted sizes |
| **Specifications** | 4in through 24in                   | Velcro alternative available |
| **Options**        | Small (4 to 8in)                   | Medium (12in)                | Large (18 to 24in) | Velcro Reusable |
| **Modifiers**      | Size                               | Quantity (bag of 100)        |
| **Pricing Unit**   | per bag                            |
| **Lead Time**      | 24 hours                           |
| **Setup Time**     | N/A (consumable)                   |
| **Strike Time**    | N/A                                |
| **Crew Required**  | None                               |
| **Power**          | None                               |
| **Footprint**      | Minimal (storage box)              |
| **Truck Space**    | Case or box, minimal               |
| **Weather**        | `sheltered`                        |
| **Sustainability** | `REUSABLE                          | SINGLE_USE`                  |

###### Sandbag - Ballast

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | --------------------- | -------------------- | ---------- | ---------- |
| **Legacy Code**    | `SITE-1422`                                          |
| **SKU**            | `SITE-TOOL-EXPD-003`                                 |
| **UNSPSC**         | `31201500`                                           |
| **Common Name**    | Ballast Sandbag                                      |
| **Search Aliases** | Sandbag                                              | Shot Bag              | Stage Weight         | Saddle Bag | Anchor Bag |
| **Description**    | Filled or unfilled sandbag for ballast and anchoring |
| **Specifications** | 25 lb through 50 lb                                  | Saddle-style for pipe |
| **Options**        | Pre-Filled (sand)                                    | Pre-Filled (shot)     | Empty (fill on-site) | Saddle     |
| **Modifiers**      | Weight                                               | Quantity              | Pre-Filled vs Empty  |
| **Prerequisites**  | Sand source if filling on-site                       |
| **Pricing Unit**   | per unit                                             |
| **Lead Time**      | 24 hours                                             |
| **Setup Time**     | N/A (consumable)                                     |
| **Strike Time**    | N/A                                                  |
| **Crew Required**  | None                                                 |
| **Power**          | None                                                 |
| **Footprint**      | Minimal (storage box)                                |
| **Truck Space**    | Case or box, minimal                                 |
| **Weather**        | `sheltered`                                          |
| **Sustainability** | `REUSABLE                                            | SINGLE_USE`           |

###### Strap - Ratchet

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | -------------------------- | ---------------------- | ---------- |
| **Legacy Code**    | `SITE-1423`                                             |
| **SKU**            | `SITE-TOOL-EXPD-004`                                    |
| **UNSPSC**         | `31201500`                                              |
| **Common Name**    | Ratchet Strap                                           |
| **Search Aliases** | Tie-Down Strap                                          | Cargo Strap                | Cam Buckle Strap       | Load Strap |
| **Description**    | Ratchet or cam buckle tie-down strap for securing loads |
| **Specifications** | 1in through 4in widths                                  | 15 to 27ft lengths         |
| **Options**        | 1in Cam Buckle                                          | 2in Ratchet (3,300 lb WLL) | 4in Ratchet (5,000 lb) |
| **Modifiers**      | Width                                                   | Length                     | Quantity               |
| **Pricing Unit**   | per unit                                                |
| **Lead Time**      | 24 hours                                                |
| **Setup Time**     | N/A (consumable)                                        |
| **Strike Time**    | N/A                                                     |
| **Crew Required**  | None                                                    |
| **Power**          | None                                                    |
| **Footprint**      | Minimal (storage box)                                   |
| **Truck Space**    | Case or box, minimal                                    |
| **Weather**        | `sheltered`                                             |
| **Sustainability** | `REUSABLE                                               | SINGLE_USE`                |

[Back to top](#table-of-contents)

#### Signage & Wayfinding

##### Directional Signage

###### Sign - Coroplast

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | ------------- | --------------------------------------- | ----------- |
| **Legacy Code**    | `SITE-1500`                                               |
| **SKU**            | `SITE-SIGN-DIRE-001`                                      |
| **UNSPSC**         | `55121700`                                                |
| **Common Name**    | Coroplast Sign                                            |
| **Search Aliases** | Corrugated Plastic Sign                                   | Yard Sign     | Correx Sign                             | Flute Board |
| **Description**    | 4mm corrugated plastic sign, single or double-sided print |
| **Specifications** | 18x24 through custom size                                 |
| **Options**        | Single-Sided                                              | Double-Sided  | Die-Cut                                 |
| **Modifiers**      | Size                                                      | Quantity      | Hardware (H-stakes, zip ties, grommets) |
| **Prerequisites**  | Design file (print-ready PDF)                             |
| **Pricing Unit**   | per sign                                                  |
| **Lead Time**      | 336 hours                                                 |
| **Setup Time**     | 5 to 15 min per sign                                      |
| **Strike Time**    | 5 min per sign                                            |
| **Crew Required**  | 1 to 2 people                                             |
| **Power**          | None (unless backlit)                                     |
| **Footprint**      | Varies by sign size                                       |
| **Truck Space**    | Flat-packed, minimal                                      |
| **Weather**        | `indoor_only`                                             |
| **Compliance**     | `ADA                                                      | FIRE_MARSHAL` |
| **Sustainability** | `REUSABLE                                                 | RECYCLABLE`   |

###### Sign - A-Frame

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | -------------------------------- | -------------- | ---------- |
| **Legacy Code**    | `SITE-1501`                                           |
| **SKU**            | `SITE-SIGN-DIRE-002`                                  |
| **UNSPSC**         | `55121700`                                            |
| **Common Name**    | A-Frame Sign                                          |
| **Search Aliases** | Sandwich Board                                        | Sidewalk Sign                    | Folding Sign   | Menu Board |
| **Description**    | Double-sided A-frame sign for ground-level wayfinding |
| **Specifications** | 24x36 or 28x44                                        | Chalkboard and dry-erase options |
| **Options**        | Standard Print                                        | Chalkboard                       | Dry-Erase      | Backlit    |
| **Modifiers**      | Size                                                  | Quantity                         | Insert Changes |
| **Pricing Unit**   | per unit/day                                          |
| **Lead Time**      | 336 hours                                             |
| **Setup Time**     | 5 to 15 min per sign                                  |
| **Strike Time**    | 5 min per sign                                        |
| **Crew Required**  | 1 to 2 people                                         |
| **Power**          | None (unless backlit)                                 |
| **Footprint**      | Varies by sign size                                   |
| **Truck Space**    | Flat-packed, minimal                                  |
| **Weather**        | `indoor_only`                                         |
| **Compliance**     | `ADA                                                  | FIRE_MARSHAL`                    |
| **Sustainability** | `REUSABLE                                             | RECYCLABLE`                      |

###### Banner - Vinyl

|                    |                                         |
| ------------------ | --------------------------------------- | --------------------- | ----------------- | ------------ |
| **Legacy Code**    | `SITE-1502`                             |
| **SKU**            | `SITE-SIGN-DIRE-003`                    |
| **UNSPSC**         | `55121700`                              |
| **Common Name**    | Vinyl Banner                            |
| **Search Aliases** | Large Format Banner                     | Outdoor Banner        | Mesh Banner       | Fence Banner |
| **Description**    | Large format vinyl banner with grommets |
| **Specifications** | 3x6 through custom size                 |
| **Options**        | 13oz Vinyl                              | Mesh (wind-resistant) | Fabric            |
| **Modifiers**      | Size                                    | Quantity              | Mounting Hardware |
| **Prerequisites**  | Mounting structure or tie-points        |
| **Pricing Unit**   | per banner                              |
| **Lead Time**      | 336 hours                               |
| **Setup Time**     | 5 to 15 min per sign                    |
| **Strike Time**    | 5 min per sign                          |
| **Crew Required**  | 1 to 2 people                           |
| **Power**          | None (unless backlit)                   |
| **Footprint**      | Varies by sign size                     |
| **Truck Space**    | Flat-packed, minimal                    |
| **Weather**        | `indoor_only`                           |
| **Compliance**     | `ADA                                    | FIRE_MARSHAL`         |
| **Sustainability** | `REUSABLE                               | RECYCLABLE`           |

###### Sign - Truss-Mounted

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ------------------------ | --------------------- | ------------- |
| **Legacy Code**    | `SITE-1503`                                          |
| **SKU**            | `SITE-SIGN-DIRE-004`                                 |
| **UNSPSC**         | `55121700`                                           |
| **Common Name**    | Truss-Mounted Sign                                   |
| **Search Aliases** | Overhead Sign                                        | Truss Sign               | Archway Sign          | Entrance Sign |
| **Description**    | Large signage mounted to truss archway or tower      |
| **Specifications** | 4x8 through custom size                              | Printed or LED options   |
| **Options**        | Printed Panel                                        | Backlit                  | LED Screen Integrated |
| **Modifiers**      | Size                                                 | Truss Structure (add-on) | Installation Labor    |
| **Prerequisites**  | Truss structure, rigging hardware, installation crew |
| **Pricing Unit**   | per sign                                             |
| **Lead Time**      | 336 hours                                            |
| **Setup Time**     | 5 to 15 min per sign                                 |
| **Strike Time**    | 5 min per sign                                       |
| **Crew Required**  | 1 to 2 people                                        |
| **Power**          | None (unless backlit)                                |
| **Footprint**      | Varies by sign size                                  |
| **Truck Space**    | Flat-packed, minimal                                 |
| **Weather**        | `indoor_only`                                        |
| **Compliance**     | `ADA                                                 | FIRE_MARSHAL`            |
| **Sustainability** | `REUSABLE                                            | RECYCLABLE`              |

###### Sign - Foam Board

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ------------------------- | ------------ | ------------- |
| **Legacy Code**    | `SITE-1504`                                           |
| **SKU**            | `SITE-SIGN-DIRE-005`                                  |
| **UNSPSC**         | `55121700`                                            |
| **Common Name**    | Foam Board Sign                                       |
| **Search Aliases** | Gatorboard Sign                                       | Foam Core Sign            | Rigid Sign   | Mounted Print |
| **Description**    | Rigid foam board sign for indoor or sheltered display |
| **Specifications** | 18x24 through custom                                  | 3/16in or 1/2in thickness |
| **Options**        | White Foam Core                                       | Black Gatorboard          | Direct Print | Mounted Print |
| **Modifiers**      | Size                                                  | Thickness                 | Quantity     | Easel         |
| **Prerequisites**  | Easel or mount for display, indoor or sheltered use   |
| **Pricing Unit**   | per sign                                              |
| **Lead Time**      | 336 hours                                             |
| **Setup Time**     | 5 to 15 min per sign                                  |
| **Strike Time**    | 5 min per sign                                        |
| **Crew Required**  | 1 to 2 people                                         |
| **Power**          | None (unless backlit)                                 |
| **Footprint**      | Varies by sign size                                   |
| **Truck Space**    | Flat-packed, minimal                                  |
| **Weather**        | `indoor_only`                                         |
| **Compliance**     | `ADA                                                  | FIRE_MARSHAL`             |
| **Sustainability** | `REUSABLE                                             | RECYCLABLE`               |

###### Banner Stand - Retractable

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | ---------------------- | ----------------------- | --------------- |
| **Legacy Code**    | `SITE-1505`                                                 |
| **SKU**            | `SITE-SIGN-DIRE-006`                                        |
| **UNSPSC**         | `55121700`                                                  |
| **Common Name**    | Retractable Banner Stand                                    |
| **Search Aliases** | Pull-Up Banner                                              | Roll-Up Banner         | Pop-Up Banner           | Standing Banner |
| **Description**    | Portable pull-up banner for registration, info, or branding |
| **Specifications** | 33x80 through 47x80                                         | Double-sided available |
| **Options**        | Standard (single-sided)                                     | Premium (double-sided) | Outdoor (weighted base) |
| **Modifiers**      | Size                                                        | Quantity               | Carrying Case           |
| **Pricing Unit**   | per unit                                                    |
| **Lead Time**      | 336 hours                                                   |
| **Setup Time**     | 5 to 15 min per sign                                        |
| **Strike Time**    | 5 min per sign                                              |
| **Crew Required**  | 1 to 2 people                                               |
| **Power**          | None (unless backlit)                                       |
| **Footprint**      | Varies by sign size                                         |
| **Truck Space**    | Flat-packed, minimal                                        |
| **Weather**        | `indoor_only`                                               |
| **Compliance**     | `ADA                                                        | FIRE_MARSHAL`          |
| **Sustainability** | `REUSABLE                                                   | RECYCLABLE`            |

###### Flag - Feather

|                    |                                          |
| ------------------ | ---------------------------------------- | ---------------------- | ------------------------------------------ | ------------ | --------------- |
| **Legacy Code**    | `SITE-1506`                              |
| **SKU**            | `SITE-SIGN-DIRE-007`                     |
| **UNSPSC**         | `55121700`                               |
| **Common Name**    | Feather Flag                             |
| **Search Aliases** | Flutter Flag                             | Swooper Flag           | Blade Flag                                 | Tall Flag    | Teardrop Banner |
| **Description**    | Tall fabric flag banner on flexible pole |
| **Specifications** | 8ft through 18ft                         | Single or double-sided |
| **Options**        | Teardrop                                 | Feather                | Rectangle                                  | Custom Shape |
| **Modifiers**      | Size                                     | Quantity               | Base (ground spike, cross base, water bag) |
| **Prerequisites**  | Base appropriate for surface             |
| **Pricing Unit**   | per unit                                 |
| **Lead Time**      | 336 hours                                |
| **Setup Time**     | 5 to 15 min per sign                     |
| **Strike Time**    | 5 min per sign                           |
| **Crew Required**  | 1 to 2 people                            |
| **Power**          | None (unless backlit)                    |
| **Footprint**      | Varies by sign size                      |
| **Truck Space**    | Flat-packed, minimal                     |
| **Weather**        | `indoor_only`                            |
| **Compliance**     | `ADA                                     | FIRE_MARSHAL`          |
| **Sustainability** | `REUSABLE                                | RECYCLABLE`            |

[Back to top](#table-of-contents)

##### Digital Signage

###### Message Board - LED

|                    |                                                    |
| ------------------ | -------------------------------------------------- | ---------------------- | ------------------ | ----------------------- |
| **Legacy Code**    | `SITE-1510`                                        |
| **SKU**            | `SITE-SIGN-DGTL-001`                               |
| **UNSPSC**         | `43211700`                                         |
| **Common Name**    | LED Message Board                                  |
| **Search Aliases** | Electronic Sign                                    | Portable Message Board | VMB                | Changeable Message Sign |
| **Description**    | Programmable LED message display for announcements |
| **Specifications** | Single-line through full color                     | Solar available        |
| **Options**        | Portable Single-Line                               | Trailer Full-Color     | Indoor HD          |
| **Modifiers**      | Type                                               | Quantity               | Content Management |
| **Prerequisites**  | Power source, content scheduling                   |
| **Pricing Unit**   | per unit/day                                       |
| **Lead Time**      | 336 hours                                          |
| **Setup Time**     | 30 to 60 min per unit                              |
| **Strike Time**    | 15 to 30 min per unit                              |
| **Crew Required**  | 1 to 2 techs                                       |
| **Power**          | 20A per unit                                       |
| **Footprint**      | 2ft x 2ft to 3ft x 5ft per unit                    |
| **Truck Space**    | 1 road case per unit                               |
| **Weather**        | `outdoor_rated`                                    |
| **Compliance**     | `ADA`                                              |
| **Sustainability** | `REUSABLE                                          | LED_EFFICIENT`         |

###### Kiosk - Digital

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------- | ----------------- | --------------------- |
| **Legacy Code**    | `SITE-1511`                                                      |
| **SKU**            | `SITE-SIGN-DGTL-002`                                             |
| **UNSPSC**         | `43211700`                                                       |
| **Common Name**    | Digital Kiosk                                                    |
| **Search Aliases** | Interactive Kiosk                                                | Wayfinding Kiosk                          | Info Totem        | Digital Display Stand |
| **Description**    | Freestanding digital display kiosk for wayfinding or information |
| **Specifications** | 43in or 55in                                                     | Touch-enabled and outdoor-rated available |
| **Options**        | Indoor                                                           | Outdoor                                   | Interactive Touch | Non-Touch             |
| **Modifiers**      | Size                                                             | Touch                                     | Content CMS       | Quantity              |
| **Prerequisites**  | Power, network connection, content CMS                           |
| **Pricing Unit**   | per unit/day                                                     |
| **Lead Time**      | 336 hours                                                        |
| **Setup Time**     | 30 to 60 min per unit                                            |
| **Strike Time**    | 15 to 30 min per unit                                            |
| **Crew Required**  | 1 to 2 techs                                                     |
| **Power**          | 20A per unit                                                     |
| **Footprint**      | 2ft x 2ft to 3ft x 5ft per unit                                  |
| **Truck Space**    | 1 road case per unit                                             |
| **Weather**        | `outdoor_rated`                                                  |
| **Compliance**     | `ADA`                                                            |
| **Sustainability** | `REUSABLE                                                        | LED_EFFICIENT`                            |

[Back to top](#table-of-contents)

##### Scenic & Decorative

###### Archway - Inflatable

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ----------------- | ------------------ | -------------------------- |
| **Legacy Code**    | `SITE-1515`                                          |
| **SKU**            | `SITE-SIGN-SCEN-001`                                 |
| **UNSPSC**         | `55101500`                                           |
| **Common Name**    | Inflatable Archway                                   |
| **Search Aliases** | Inflatable Entrance                                  | Blow-Up Arch      | Branded Inflatable | Air Arch                   |
| **Description**    | Custom inflatable entrance arch or branded structure |
| **Specifications** | 10ft through 25ft wide                               | LED-lit available |
| **Options**        | Arch                                                 | Tunnel            | Custom Shape       | With LED Internal Lighting |
| **Modifiers**      | Size                                                 | Custom Shape      | Branding           | Blower                     |
| **Prerequisites**  | Power for blower (dedicated 20A), anchor weights     |
| **Pricing Unit**   | per unit/day                                         |
| **Lead Time**      | 336 hours                                            |
| **Setup Time**     | 30 to 120 min per installation                       |
| **Strike Time**    | 30 to 60 min                                         |
| **Crew Required**  | 2 to 4 installers                                    |
| **Power**          | 20A (if lit or inflated)                             |
| **Footprint**      | Varies by installation                               |
| **Truck Space**    | 1 to 4 road cases or boxes                           |
| **Weather**        | `sheltered`                                          |
| **Compliance**     | `FIRE_MARSHAL`                                       |
| **Sustainability** | `REUSABLE`                                           |

###### Neon Sign - LED Custom

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ------------- | ------------------- | --------- | ----------- |
| **Legacy Code**    | `SITE-1516`                                             |
| **SKU**            | `SITE-SIGN-SCEN-002`                                    |
| **UNSPSC**         | `55101500`                                              |
| **Common Name**    | LED Neon Sign                                           |
| **Search Aliases** | Neon Sign                                               | Flex Neon     | Light-Up Sign       | Glow Sign | Custom Neon |
| **Description**    | Custom neon or LED flex neon sign for branding or decor |
| **Specifications** | Custom text or logo                                     | 12 to 72in    | RGB or single color |
| **Options**        | Glass Neon                                              | LED Flex Neon | Backlit Acrylic     |
| **Modifiers**      | Size                                                    | Color         | Mounting            | Dimmer    |
| **Prerequisites**  | Power (standard outlet), mounting surface               |
| **Pricing Unit**   | per unit/event                                          |
| **Lead Time**      | 336 hours                                               |
| **Setup Time**     | 30 to 120 min per installation                          |
| **Strike Time**    | 30 to 60 min                                            |
| **Crew Required**  | 2 to 4 installers                                       |
| **Power**          | 20A (if lit or inflated)                                |
| **Footprint**      | Varies by installation                                  |
| **Truck Space**    | 1 to 4 road cases or boxes                              |
| **Weather**        | `sheltered`                                             |
| **Compliance**     | `FIRE_MARSHAL`                                          |
| **Sustainability** | `REUSABLE`                                              |

###### Balloon Installation

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | --------------- | --------------- | ---------------------------------- |
| **Legacy Code**    | `SITE-1517`                                                |
| **SKU**            | `SITE-SIGN-SCEN-003`                                       |
| **UNSPSC**         | `55101500`                                                 |
| **Common Name**    | Balloon Installation                                       |
| **Search Aliases** | Balloon Arch                                               | Balloon Column  | Balloon Garland | Balloon Decor                      |
| **Description**    | Decorative balloon installation for entrances or photo ops |
| **Specifications** | 8ft through 12ft arch                                      | 6 to 8ft column | Custom          |
| **Options**        | Standard Air-Filled                                        | Helium          | Organic Style   | Branded                            |
| **Modifiers**      | Size                                                       | Style           | Colors          | Duration (air vs helium longevity) |
| **Prerequisites**  | Indoor or low-wind outdoor, power for inflator             |
| **Pricing Unit**   | per installation                                           |
| **Lead Time**      | 336 hours                                                  |
| **Setup Time**     | 30 to 120 min per installation                             |
| **Strike Time**    | 30 to 60 min                                               |
| **Crew Required**  | 2 to 4 installers                                          |
| **Power**          | 20A (if lit or inflated)                                   |
| **Footprint**      | Varies by installation                                     |
| **Truck Space**    | 1 to 4 road cases or boxes                                 |
| **Weather**        | `sheltered`                                                |
| **Compliance**     | `FIRE_MARSHAL`                                             |
| **Sustainability** | `REUSABLE`                                                 |

[Back to top](#table-of-contents)

---

### Technical

_87 items_

#### Audio

##### PA Systems

###### Line Array - Small

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | ----------------- | ---------------------- | -------------------- |
| **Legacy Code**    | `TECH-1001`                                                      |
| **SKU**            | `TECH-AUDI-PASY-001`                                             |
| **UNSPSC**         | `52161500`                                                       |
| **Common Name**    | Small Line Array System                                          |
| **Search Aliases** | Compact Line Array                                               | Event PA          | Small Concert Sound    | Point-Source Array   |
| **Description**    | Compact line array system for venues up to 2,000 capacity        |
| **Specifications** | 8 to 12 boxes per side                                           | 4 to 8 subwoofers | Processing and cabling |
| **Options**        | d&b E-Series                                                     | JBL VTX A8        | L-Acoustics A10        | Meyer ULTRA-X        |
| **Modifiers**      | Box Count                                                        | Sub Count         | Processing             | FOH Console (add-on) |
| **Prerequisites**  | Rigging points (rated), power (60A per leg minimum), system tech |
| **Pricing Unit**   | per system/day                                                   |
| **Lead Time**      | 168 hours                                                        |
| **Setup Time**     | 2 to 4 hours                                                     |
| **Strike Time**    | 1 to 2 hours                                                     |
| **Crew Required**  | 1 to 2 audio techs                                               |
| **Power**          | 2x 20A (per side)                                                |
| **Footprint**      | 2ft x 4ft per stack (ground) or flown                            |
| **Truck Space**    | 1 to 2 road cases per side                                       |
| **Weather**        | `outdoor_rated`                                                  |
| **Compliance**     | `OSHA`                                                           |
| **Sustainability** | `REUSABLE                                                        | CLASS_D_EFFICIENT | ENERGY_EFFICIENT`      |

###### Line Array - Medium

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | ----------------- | --------------------- | ------------- |
| **Legacy Code**    | `TECH-1002`                                                 |
| **SKU**            | `TECH-AUDI-PASY-002`                                        |
| **UNSPSC**         | `52161500`                                                  |
| **Common Name**    | Medium Line Array System                                    |
| **Search Aliases** | Concert PA                                                  | Touring PA        | Festival Sound System |
| **Description**    | Professional line array for 2,000 to 10,000 capacity        |
| **Specifications** | 12 to 16 boxes per side                                     | 8 to 16 subs      | Delay fills           |
| **Options**        | d&b J-Series                                                | JBL VTX V25       | L-Acoustics K2        | Meyer PANTHER |
| **Modifiers**      | Box Count                                                   | Sub Configuration | Delays                | Console       |
| **Prerequisites**  | Rigging (engineered), 200A or more 3-phase, full audio crew |
| **Pricing Unit**   | per system/day                                              |
| **Lead Time**      | 336 hours                                                   |
| **Setup Time**     | 6 to 10 hours                                               |
| **Strike Time**    | 4 to 6 hours                                                |
| **Crew Required**  | 3 to 5 audio crew, 1 rigger                                 |
| **Power**          | 200A 3-phase (total system)                                 |
| **Footprint**      | 4ft x 8ft per hang (flown) or ground stack                  |
| **Truck Space**    | 1 to 2 53ft trailers (full system)                          |
| **Weather**        | `outdoor_rated`                                             |
| **Compliance**     | `OSHA                                                       | STRUCT_ENG`       |
| **Sustainability** | `REUSABLE                                                   | CLASS_D_EFFICIENT | ENERGY_EFFICIENT`     |

###### Line Array - Large

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- | ------------------ | --------------------- | ------------------- |
| **Legacy Code**    | `TECH-1003`                                                       |
| **SKU**            | `TECH-AUDI-PASY-003`                                              |
| **UNSPSC**         | `52161500`                                                        |
| **Common Name**    | Large Line Array System                                           |
| **Search Aliases** | Festival PA                                                       | Stadium Sound      | Arena PA              | Large Format Audio  |
| **Description**    | Concert and festival-grade line array for 10,000 or more capacity |
| **Specifications** | 16 to 24 boxes per side                                           | 16 to 32 subs      | Multiple delay rings  |
| **Options**        | d&b GSL                                                           | JBL VTX A12        | L-Acoustics K1 and K2 | Meyer PANTHER Large |
| **Modifiers**      | Full System Design                                                | Delay Rings        | Sub Arrays            | Console Package     |
| **Prerequisites**  | Structural engineering, rigging plan, 400A or more 3-phase        |
| **Pricing Unit**   | per system/day                                                    |
| **Lead Time**      | 672 hours                                                         |
| **Setup Time**     | 1 to 2 days                                                       |
| **Strike Time**    | 8 to 12 hours                                                     |
| **Crew Required**  | 6 to 12 audio crew, 2 to 4 riggers                                |
| **Power**          | 400A+ 3-phase (total system)                                      |
| **Footprint**      | 6ft x 12ft per hang, multiple hangs                               |
| **Truck Space**    | 2 to 4 53ft trailers                                              |
| **Weather**        | `outdoor_rated`                                                   |
| **Compliance**     | `OSHA                                                             | RIGGING_CERT       | STRUCT_ENG`           |
| **Sustainability** | `REUSABLE                                                         | CLASS_D_EFFICIENT` |

###### Speaker System - Point Source

|                    |                                                                         |
| ------------------ | ----------------------------------------------------------------------- | ----------------- | --------------------- | ---------- |
| **Legacy Code**    | `TECH-1004`                                                             |
| **SKU**            | `TECH-AUDI-PASY-004`                                                    |
| **UNSPSC**         | `52161500`                                                              |
| **Common Name**    | Point Source Speaker System                                             |
| **Search Aliases** | Powered Speakers                                                        | Active Speakers   | Club System           | Lounge PA  |
| **Description**    | Self-powered or passive point-source speakers for small to medium rooms |
| **Specifications** | 2 to 4 tops                                                             | 1 to 2 subs       | Processor             | Cabling    |
| **Options**        | QSC KLA                                                                 | JBL SRX           | EV ELX200             | Yamaha DZR |
| **Modifiers**      | Speaker Count                                                           | Sub Count         | With or Without Mixer |
| **Prerequisites**  | Power (20A circuits), speaker stands or mount points                    |
| **Pricing Unit**   | per system/day                                                          |
| **Lead Time**      | 168 hours                                                               |
| **Setup Time**     | 2 to 4 hours                                                            |
| **Strike Time**    | 1 to 2 hours                                                            |
| **Crew Required**  | 1 to 2 audio techs                                                      |
| **Power**          | 2x 20A (per side)                                                       |
| **Footprint**      | 2ft x 4ft per stack (ground) or flown                                   |
| **Truck Space**    | 1 to 2 road cases per side                                              |
| **Weather**        | `outdoor_rated`                                                         |
| **Compliance**     | `OSHA`                                                                  |
| **Sustainability** | `REUSABLE                                                               | CLASS_D_EFFICIENT | ENERGY_EFFICIENT`     |

###### Delay System - Tower

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ----------- | ------------------ | ----------------------- |
| **Legacy Code**    | `TECH-1005`                                                |
| **SKU**            | `TECH-AUDI-PASY-005`                                       |
| **UNSPSC**         | `52161500`                                                 |
| **Common Name**    | Delay Tower System                                         |
| **Search Aliases** | Delay Stack                                                | Fill System | Auxiliary PA       | Coverage Extension      |
| **Description**    | Auxiliary delay or fill speaker system for large venues    |
| **Specifications** | 2 to 4 boxes per tower                                     | Processing  | Cabling            |
| **Options**        | Delay Stack                                                | Front Fill  | Under-Balcony Fill | Side Fill               |
| **Modifiers**      | System Type                                                | Quantity    | Processing         | Rigging vs Ground Stack |
| **Prerequisites**  | Audio infrastructure from main system, rigging or stacking |
| **Pricing Unit**   | per tower/day                                              |
| **Lead Time**      | 336 hours                                                  |
| **Setup Time**     | 2 to 4 hours per tower                                     |
| **Strike Time**    | 1 to 2 hours per tower                                     |
| **Crew Required**  | 2 audio techs per tower                                    |
| **Power**          | 1x 20A per tower                                           |
| **Footprint**      | 4ft x 4ft base per tower                                   |
| **Truck Space**    | 2 to 4 road cases per tower                                |
| **Weather**        | `outdoor_rated`                                            |
| **Sustainability** | `REUSABLE`                                                 |

###### Audio System - Distributed

|                    |                                                                |
| ------------------ | -------------------------------------------------------------- | ----------------- | -------------- | ------------- | ------------- |
| **Legacy Code**    | `TECH-1006`                                                    |
| **SKU**            | `TECH-AUDI-PASY-006`                                           |
| **UNSPSC**         | `52161500`                                                     |
| **Common Name**    | Distributed Audio System                                       |
| **Search Aliases** | Background Music System                                        | BGM               | Paging         | Zone Speakers | Ambient Sound |
| **Description**    | Zone-based speaker system for ambient audio across large sites |
| **Specifications** | Ceiling, pendant, or surface mount                             | Weather-rated     | Multi-zone     |
| **Options**        | JBL Control                                                    | QSC AD-S          | Bose FreeSpace | Community     |
| **Modifiers**      | Zone Count                                                     | Speaker Count     | Amplification  | DSP           |
| **Prerequisites**  | Low-voltage wiring, DSP, amplifiers, mounting                  |
| **Pricing Unit**   | per zone/day                                                   |
| **Lead Time**      | 672 hours                                                      |
| **Setup Time**     | 4 to 8 hours (wiring and mounting)                             |
| **Strike Time**    | 2 to 4 hours                                                   |
| **Crew Required**  | 2 to 4 audio techs                                             |
| **Power**          | 20A per zone amp                                               |
| **Footprint**      | Ceiling or pole mounted, minimal footprint                     |
| **Truck Space**    | 2 to 4 road cases                                              |
| **Weather**        | `outdoor_rated`                                                |
| **Sustainability** | `REUSABLE                                                      | CLASS_D_EFFICIENT | LOW_POWER`     |

[Back to top](#table-of-contents)

##### DJ Equipment

###### DJ Package - Standard

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | --------------------- | ----------------------- | ----------------- |
| **Legacy Code**    | `TECH-1010`                                                |
| **SKU**            | `TECH-AUDI-DJEQ-001`                                       |
| **UNSPSC**         | `52161505`                                                 |
| **Common Name**    | Standard DJ Package                                        |
| **Search Aliases** | DJ Setup                                                   | DJ Booth              | CDJ Setup               | Club DJ Rig       |
| **Description**    | Complete DJ setup with 2 CDJs, mixer, monitor, and cabling |
| **Specifications** | 2x Pioneer CDJ-3000                                        | Pioneer DJM-900NXS2   | 1x Monitor              |
| **Options**        | CDJ-3000 with DJM-900                                      | CDJ-3000 with DJM-V10 | Denon SC6000 with X1850 |
| **Modifiers**      | Mixer Model                                                | CDJ Count (2 or 4)    | Monitor Type            | DJ Riser or Booth |
| **Prerequisites**  | Power (2x 20A), DJ table or booth, monitor line from FOH   |
| **Pricing Unit**   | per package/day                                            |
| **Lead Time**      | 48 hours                                                   |
| **Setup Time**     | 30 to 60 min                                               |
| **Strike Time**    | 20 to 30 min                                               |
| **Crew Required**  | 1 audio tech                                               |
| **Power**          | 2x 20A (dedicated clean power)                             |
| **Footprint**      | 4ft x 2ft (standard) to 8ft x 3ft (premium booth)          |
| **Truck Space**    | 2 to 4 road cases                                          |
| **Weather**        | `sheltered`                                                |
| **Sustainability** | `REUSABLE                                                  | LOW_POWER`            |

###### DJ Package - Premium

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- | --------------------- | ----------------------- | ------------- | -------- |
| **Legacy Code**    | `TECH-1011`                                                       |
| **SKU**            | `TECH-AUDI-DJEQ-002`                                              |
| **UNSPSC**         | `52161505`                                                        |
| **Common Name**    | Premium DJ Package                                                |
| **Search Aliases** | Festival DJ Setup                                                 | Headliner Booth       | 4-Deck Setup            | Custom DJ Rig |
| **Description**    | Premium DJ setup with 4 CDJs, flagship mixer, monitors, and booth |
| **Specifications** | 4x Pioneer CDJ-3000                                               | Pioneer DJM-V10-LF    | 2x Monitors             | Custom booth  |
| **Options**        | CDJ-3000 with V10-LF                                              | CDJ-3000 with XONE:96 | PLAYdifferently MODEL 1 |
| **Modifiers**      | Mixer                                                             | CDJ Count             | Monitor Pair            | Booth Build   | Lighting |
| **Prerequisites**  | Power (4x 20A), engineered booth, monitor feed                    |
| **Pricing Unit**   | per package/day                                                   |
| **Lead Time**      | 48 hours                                                          |
| **Setup Time**     | 30 to 60 min                                                      |
| **Strike Time**    | 20 to 30 min                                                      |
| **Crew Required**  | 1 audio tech                                                      |
| **Power**          | 2x 20A (dedicated clean power)                                    |
| **Footprint**      | 4ft x 2ft (standard) to 8ft x 3ft (premium booth)                 |
| **Truck Space**    | 2 to 4 road cases                                                 |
| **Weather**        | `sheltered`                                                       |
| **Sustainability** | `REUSABLE                                                         | LOW_POWER`            |

###### Turntable Package - Vinyl

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | --------------------------------- | ------------------- | ------------ |
| **Legacy Code**    | `TECH-1012`                                          |
| **SKU**            | `TECH-AUDI-DJEQ-003`                                 |
| **UNSPSC**         | `52161505`                                           |
| **Common Name**    | Vinyl Turntable Package                              |
| **Search Aliases** | Turntable Setup                                      | Technics Package                  | Record Player Setup | Vinyl DJ Rig |
| **Description**    | Vinyl turntable DJ package with mixer and cartridges |
| **Specifications** | 2x Technics SL-1200MK7                               | Mixer                             | Cartridges          | Slipmats     |
| **Options**        | Technics with DJM-S11                                | Technics with Rane SEVENTY-TWO    |
| **Modifiers**      | Mixer                                                | Cartridge Type (Ortofon Concorde) | Needles             |
| **Prerequisites**  | Solid vibration-free surface, isolated power         |
| **Pricing Unit**   | per package/day                                      |
| **Lead Time**      | 48 hours                                             |
| **Setup Time**     | 30 to 60 min                                         |
| **Strike Time**    | 20 to 30 min                                         |
| **Crew Required**  | 1 audio tech                                         |
| **Power**          | 2x 20A (dedicated clean power)                       |
| **Footprint**      | 4ft x 2ft (standard) to 8ft x 3ft (premium booth)    |
| **Truck Space**    | 2 to 4 road cases                                    |
| **Weather**        | `sheltered`                                          |
| **Sustainability** | `REUSABLE                                            | LOW_POWER`                        |

###### DJ Booth - Freestanding

|                    |                                                                          |
| ------------------ | ------------------------------------------------------------------------ | ---------------------------- | ------------------- | ----------- | ---------------- |
| **Legacy Code**    | `TECH-1013`                                                              |
| **SKU**            | `TECH-AUDI-DJEQ-004`                                                     |
| **UNSPSC**         | `52161505`                                                               |
| **Common Name**    | DJ Booth Furniture                                                       |
| **Search Aliases** | DJ Table                                                                 | DJ Facade                    | Booth Shell         | DJ Stand    | Performance Desk |
| **Description**    | Freestanding DJ booth furniture with shelf, facade, and cable management |
| **Specifications** | 4ft through 8ft width                                                    | With facade                  | Lit or unlit        |
| **Options**        | Folding Table with Facade                                                | Custom Booth Shell           | LED-Lit Booth       | Truss Booth |
| **Modifiers**      | Width                                                                    | Facade (scrim, LED, branded) | Shelf Configuration |
| **Pricing Unit**   | per unit/day                                                             |
| **Lead Time**      | 48 hours                                                                 |
| **Setup Time**     | 30 to 60 min                                                             |
| **Strike Time**    | 20 to 30 min                                                             |
| **Crew Required**  | 1 audio tech                                                             |
| **Power**          | 2x 20A (dedicated clean power)                                           |
| **Footprint**      | 4ft x 2ft (standard) to 8ft x 3ft (premium booth)                        |
| **Truck Space**    | 2 to 4 road cases                                                        |
| **Weather**        | `sheltered`                                                              |
| **Sustainability** | `REUSABLE                                                                | LOW_POWER`                   |

[Back to top](#table-of-contents)

##### Microphones & DI

###### Microphone - Vocal - Wired

|                    |                                                    |
| ------------------ | -------------------------------------------------- | --------------- | -------------------- | ------------ |
| **Legacy Code**    | `TECH-1020`                                        |
| **SKU**            | `TECH-AUDI-MICR-001`                               |
| **UNSPSC**         | `52161512`                                         |
| **Common Name**    | Wired Vocal Microphone                             |
| **Search Aliases** | Vocal Mic                                          | Dynamic Mic     | Stage Mic            | Handheld Mic |
| **Description**    | Professional dynamic or condenser vocal microphone |
| **Specifications** | Shure SM58                                         | Sennheiser e935 | Neumann KMS 105      |
| **Options**        | SM58 (dynamic)                                     | e935 (dynamic)  | KMS 105 (condenser)  |
| **Modifiers**      | Model                                              | Quantity        | With Stand and Cable |
| **Pricing Unit**   | per unit/day                                       |
| **Lead Time**      | 48 hours                                           |
| **Setup Time**     | 5 to 10 min per unit                               |
| **Strike Time**    | 5 min per unit                                     |
| **Crew Required**  | 1 audio tech                                       |
| **Power**          | Phantom power (48V from console) for condensers    |
| **Footprint**      | Mic stand footprint (18in diameter base)           |
| **Truck Space**    | 1 road case per 8 to 12 mics                       |
| **Weather**        | `sheltered`                                        |
| **Compliance**     | `FCC                                               | FCC_PART74`     |
| **Sustainability** | `REUSABLE`                                         |

###### Microphone - Wireless System

|                    |                                                                          |
| ------------------ | ------------------------------------------------------------------------ | ---------------------- | ------------------ | --------------- |
| **Legacy Code**    | `TECH-1021`                                                              |
| **SKU**            | `TECH-AUDI-MICR-002`                                                     |
| **UNSPSC**         | `52161512`                                                               |
| **Common Name**    | Wireless Microphone System                                               |
| **Search Aliases** | Wireless Mic                                                             | Radio Mic              | Cordless Mic       | Bodypack System |
| **Description**    | Professional wireless handheld or bodypack system                        |
| **Specifications** | Shure ULXD                                                               | Sennheiser EW-DX       | Shure Axient       |
| **Options**        | Handheld                                                                 | Lavalier (bodypack)    | Headset (bodypack) |
| **Modifiers**      | Type                                                                     | Frequency Coordination | Quantity           |
| **Prerequisites**  | Frequency coordination scan, antenna distribution for 4 or more channels |
| **Pricing Unit**   | per channel/day                                                          |
| **Lead Time**      | 48 hours                                                                 |
| **Setup Time**     | 5 to 10 min per unit                                                     |
| **Strike Time**    | 5 min per unit                                                           |
| **Crew Required**  | 1 audio tech                                                             |
| **Power**          | Phantom power (48V from console) for condensers                          |
| **Footprint**      | Mic stand footprint (18in diameter base)                                 |
| **Truck Space**    | 1 road case per 8 to 12 mics                                             |
| **Weather**        | `sheltered`                                                              |
| **Compliance**     | `FCC                                                                     | FCC_PART74`            |
| **Sustainability** | `REUSABLE`                                                               |

###### Direct Box - DI

|                    |                                                                     |
| ------------------ | ------------------------------------------------------------------- | ---------------- | ------------------ | ---------- |
| **Legacy Code**    | `TECH-1022`                                                         |
| **SKU**            | `TECH-AUDI-MICR-003`                                                |
| **UNSPSC**         | `52161512`                                                          |
| **Common Name**    | Direct Box                                                          |
| **Search Aliases** | DI Box                                                              | Direct Injection | Active DI          | Passive DI |
| **Description**    | Active or passive direct injection box for instruments and playback |
| **Specifications** | Radial JDI                                                          | Radial J48       | Countryman Type 85 | BSS AR-133 |
| **Options**        | Passive (JDI)                                                       | Active (J48)     | Stereo (JPC)       |
| **Modifiers**      | Type                                                                | Quantity         |
| **Pricing Unit**   | per unit/day                                                        |
| **Lead Time**      | 48 hours                                                            |
| **Setup Time**     | 5 to 10 min per unit                                                |
| **Strike Time**    | 5 min per unit                                                      |
| **Crew Required**  | 1 audio tech                                                        |
| **Power**          | Phantom power (48V from console) for condensers                     |
| **Footprint**      | Mic stand footprint (18in diameter base)                            |
| **Truck Space**    | 1 road case per 8 to 12 mics                                        |
| **Weather**        | `sheltered`                                                         |
| **Compliance**     | `FCC                                                                | FCC_PART74`      |
| **Sustainability** | `REUSABLE`                                                          |

###### Microphone Kit - Drum

|                    |                                                 |
| ------------------ | ----------------------------------------------- | -------------------------- | ------------------------- |
| **Legacy Code**    | `TECH-1023`                                     |
| **SKU**            | `TECH-AUDI-MICR-004`                            |
| **UNSPSC**         | `52161512`                                      |
| **Common Name**    | Drum Microphone Kit                             |
| **Search Aliases** | Drum Mic Pack                                   | Drum Mic Set               | Percussion Mic Kit        |
| **Description**    | Complete drum mic package for live performance  |
| **Specifications** | Shure DMK57-52                                  | Audix DP7                  | Sennheiser e600           |
| **Options**        | Basic (4 mics)                                  | Standard (7 mics)          | Premium (10 or more mics) |
| **Modifiers**      | Kit Size                                        | Stands and Cables Included |
| **Pricing Unit**   | per kit/day                                     |
| **Lead Time**      | 48 hours                                        |
| **Setup Time**     | 5 to 10 min per unit                            |
| **Strike Time**    | 5 min per unit                                  |
| **Crew Required**  | 1 audio tech                                    |
| **Power**          | Phantom power (48V from console) for condensers |
| **Footprint**      | Mic stand footprint (18in diameter base)        |
| **Truck Space**    | 1 road case per 8 to 12 mics                    |
| **Weather**        | `sheltered`                                     |
| **Compliance**     | `FCC                                            | FCC_PART74`                |
| **Sustainability** | `REUSABLE`                                      |

###### Microphone - Instrument

|                    |                                                                      |
| ------------------ | -------------------------------------------------------------------- | ----------------- | -------------------- | ---------------- |
| **Legacy Code**    | `TECH-1024`                                                          |
| **SKU**            | `TECH-AUDI-MICR-005`                                                 |
| **UNSPSC**         | `52161512`                                                           |
| **Common Name**    | Instrument Microphone                                                |
| **Search Aliases** | Amp Mic                                                              | Overhead Mic      | Acoustic Mic         | Condenser Mic    |
| **Description**    | Specialized microphone for amps, acoustic instruments, and overheads |
| **Specifications** | Shure SM57                                                           | Sennheiser e906   | AKG C414             | Neumann KM184    |
| **Options**        | SM57 (amp and snare)                                                 | e906 (guitar cab) | C414 (overhead)      | KM184 (acoustic) |
| **Modifiers**      | Model                                                                | Quantity          | With Stand and Cable |
| **Pricing Unit**   | per unit/day                                                         |
| **Lead Time**      | 48 hours                                                             |
| **Setup Time**     | 5 to 10 min per unit                                                 |
| **Strike Time**    | 5 min per unit                                                       |
| **Crew Required**  | 1 audio tech                                                         |
| **Power**          | Phantom power (48V from console) for condensers                      |
| **Footprint**      | Mic stand footprint (18in diameter base)                             |
| **Truck Space**    | 1 road case per 8 to 12 mics                                         |
| **Weather**        | `sheltered`                                                          |
| **Compliance**     | `FCC                                                                 | FCC_PART74`       |
| **Sustainability** | `REUSABLE`                                                           |

[Back to top](#table-of-contents)

##### Mixing Consoles

###### Mixing Console - Small

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | --------------------------- | ------------------- |
| **Legacy Code**    | `TECH-1030`                                          |
| **SKU**            | `TECH-AUDI-CONS-001`                                 |
| **UNSPSC**         | `52161510`                                           |
| **Common Name**    | Small Digital Mixing Console                         |
| **Search Aliases** | Compact Mixer                                        | Digital Board               | Small FOH Console   |
| **Description**    | Compact digital mixer for corporate and small events |
| **Specifications** | 16 to 32 input channels                              | Built-in effects            | Dante optional      |
| **Options**        | Yamaha TF3                                           | Allen and Heath dLive C1500 | Midas M32           |
| **Modifiers**      | Model                                                | Stage Box (add-on)          | Recording Interface |
| **Prerequisites**  | Power (1x 20A), FOH position                         |
| **Pricing Unit**   | per console/day                                      |
| **Lead Time**      | 336 hours                                            |
| **Setup Time**     | 1 to 2 hours (with stage box)                        |
| **Strike Time**    | 1 hour                                               |
| **Crew Required**  | 1 to 2 audio techs (A1 and A2)                       |
| **Power**          | 1x 20A (dedicated, clean, UPS recommended)           |
| **Footprint**      | 4ft x 3ft (compact) to 6ft x 4ft (large)             |
| **Truck Space**    | 1 to 2 road cases                                    |
| **Weather**        | `sheltered`                                          |
| **Sustainability** | `REUSABLE                                            | LOW_POWER`                  |

###### Mixing Console - Large

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | ------------------ | --------------- | ------------- |
| **Legacy Code**    | `TECH-1031`                                               |
| **SKU**            | `TECH-AUDI-CONS-002`                                      |
| **UNSPSC**         | `52161510`                                                |
| **Common Name**    | Large Digital Mixing Console                              |
| **Search Aliases** | Concert Console                                           | Festival Mixer     | Touring Console | FOH Desk      |
| **Description**    | Full-scale digital mixer for concerts and festivals       |
| **Specifications** | 48 to 96 or more input channels                           | Multiple mix buses | Redundancy      |
| **Options**        | DiGiCo SD12                                               | Avid S6L           | Yamaha CL5      | SSL Live L550 |
| **Modifiers**      | Model                                                     | Stage Box(es)      | Plugin Package  | Recording     |
| **Prerequisites**  | Power, FOH position with sightlines, audio snake or fiber |
| **Pricing Unit**   | per console/day                                           |
| **Lead Time**      | 336 hours                                                 |
| **Setup Time**     | 1 to 2 hours (with stage box)                             |
| **Strike Time**    | 1 hour                                                    |
| **Crew Required**  | 1 to 2 audio techs (A1 and A2)                            |
| **Power**          | 1x 20A (dedicated, clean, UPS recommended)                |
| **Footprint**      | 4ft x 3ft (compact) to 6ft x 4ft (large)                  |
| **Truck Space**    | 1 to 2 road cases                                         |
| **Weather**        | `sheltered`                                               |
| **Sustainability** | `REUSABLE                                                 | LOW_POWER`         |

[Back to top](#table-of-contents)

##### Audio Infrastructure

###### Snake - Audio

|                    |                                             |
| ------------------ | ------------------------------------------- | ----------------------- | --------------- | ------------ | ------------- |
| **Legacy Code**    | `TECH-1040`                                 |
| **SKU**            | `TECH-AUDI-AINF-001`                        |
| **UNSPSC**         | `52161520`                                  |
| **Common Name**    | Audio Snake                                 |
| **Search Aliases** | Stagebox                                    | Multi-Core              | Audio Multi-Pin | Analog Snake | Digital Snake |
| **Description**    | Multi-channel analog or digital audio snake |
| **Specifications** | 16 through 64 channels                      | Analog or Dante or MADI |
| **Options**        | Analog Copper                               | Dante (Cat6)            | MADI (fiber)    |
| **Modifiers**      | Channel Count                               | Length                  | Protocol        |
| **Prerequisites**  | Compatible console and stage box            |
| **Pricing Unit**   | per unit/day                                |
| **Lead Time**      | 336 hours                                   |
| **Setup Time**     | 4 to 8 hours                                |
| **Strike Time**    | 3 to 6 hours                                |
| **Crew Required**  | 3 to 6 tent crew                            |
| **Power**          | Per lighting and HVAC package               |
| **Footprint**      | Varies (20x20 to 60x120)                    |
| **Truck Space**    | 1 to 2 box trucks per tent                  |
| **Weather**        | `outdoor_rated`                             |
| **Compliance**     | `ADA                                        | FIRE_MARSHAL            | TENT_PERMIT`    |
| **Sustainability** | `REUSABLE`                                  |

###### Monitor - Stage Wedge

|                    |                                                    |
| ------------------ | -------------------------------------------------- | ------------ | --------------------- | ------------------------ |
| **Legacy Code**    | `TECH-1041`                                        |
| **SKU**            | `TECH-AUDI-AINF-002`                               |
| **UNSPSC**         | `52161520`                                         |
| **Common Name**    | Stage Monitor Wedge                                |
| **Search Aliases** | Floor Monitor                                      | Wedge        | Stage Wedge           | Foldback                 |
| **Description**    | Floor monitor wedge for performer monitoring       |
| **Specifications** | 12in or 15in                                       | Bi-amp       | Active or passive     |
| **Options**        | EAW SM129                                          | d&b M4       | L-Acoustics X12       | Meyer MJF-210            |
| **Modifiers**      | Model                                              | Quantity     | Amp Rack (if passive) | Monitor Console (add-on) |
| **Prerequisites**  | Monitor mix (from FOH or dedicated console), power |
| **Pricing Unit**   | per unit/day                                       |
| **Lead Time**      | 336 hours                                          |
| **Setup Time**     | 4 to 8 hours                                       |
| **Strike Time**    | 3 to 6 hours                                       |
| **Crew Required**  | 3 to 6 tent crew                                   |
| **Power**          | Per lighting and HVAC package                      |
| **Footprint**      | Varies (20x20 to 60x120)                           |
| **Truck Space**    | 1 to 2 box trucks per tent                         |
| **Weather**        | `outdoor_rated`                                    |
| **Compliance**     | `ADA                                               | FIRE_MARSHAL | TENT_PERMIT`          |
| **Sustainability** | `REUSABLE`                                         |

###### Monitor - In-Ear

|                    |                                                  |
| ------------------ | ------------------------------------------------ | -------------------- | ---------------- | ------------------ |
| **Legacy Code**    | `TECH-1042`                                      |
| **SKU**            | `TECH-AUDI-AINF-003`                             |
| **UNSPSC**         | `52161520`                                       |
| **Common Name**    | In-Ear Monitor System                            |
| **Search Aliases** | IEM                                              | In-Ears              | Personal Monitor | Wireless Monitor   |
| **Description**    | Personal in-ear monitoring system for performers |
| **Specifications** | Shure PSM1000                                    | Sennheiser EW IEM G4 | Shure PSM900     |
| **Options**        | Stereo Bodypack with Buds                        | With Custom Molds    | With Ambient Mic |
| **Modifiers**      | System                                           | Quantity             | Earpiece Type    | Monitor Mix Source |
| **Prerequisites**  | Dedicated monitor mix, frequency coordination    |
| **Pricing Unit**   | per channel/day                                  |
| **Lead Time**      | 336 hours                                        |
| **Setup Time**     | 4 to 8 hours                                     |
| **Strike Time**    | 3 to 6 hours                                     |
| **Crew Required**  | 3 to 6 tent crew                                 |
| **Power**          | Per lighting and HVAC package                    |
| **Footprint**      | Varies (20x20 to 60x120)                         |
| **Truck Space**    | 1 to 2 box trucks per tent                       |
| **Weather**        | `outdoor_rated`                                  |
| **Compliance**     | `ADA                                             | FIRE_MARSHAL         | TENT_PERMIT`     |
| **Sustainability** | `REUSABLE`                                       |

###### Amplifier Rack - Audio

|                    |                                                  |
| ------------------ | ------------------------------------------------ | ------------------------- | ----------------- | ------------------ |
| **Legacy Code**    | `TECH-1043`                                      |
| **SKU**            | `TECH-AUDI-AINF-004`                             |
| **UNSPSC**         | `52161520`                                       |
| **Common Name**    | Audio Amplifier Rack                             |
| **Search Aliases** | Amp Rack                                         | Power Amp                 | Speaker Amplifier | Drive Rack         |
| **Description**    | Power amplifier rack for passive speaker systems |
| **Specifications** | 2-channel through rack configurations            | DSP-integrated options    |
| **Options**        | Lab Gruppen PLM                                  | Crown I-Tech              | QSC PLD           | Powersoft X-Series |
| **Modifiers**      | Channel Count                                    | Power (watts per channel) | DSP               | Rack Size          |
| **Prerequisites**  | Appropriate power supply, speaker cabling        |
| **Pricing Unit**   | per rack/day                                     |
| **Lead Time**      | 336 hours                                        |
| **Setup Time**     | 4 to 8 hours                                     |
| **Strike Time**    | 3 to 6 hours                                     |
| **Crew Required**  | 3 to 6 tent crew                                 |
| **Power**          | Per lighting and HVAC package                    |
| **Footprint**      | Varies (20x20 to 60x120)                         |
| **Truck Space**    | 1 to 2 box trucks per tent                       |
| **Weather**        | `outdoor_rated`                                  |
| **Compliance**     | `ADA                                             | FIRE_MARSHAL              | TENT_PERMIT`      |
| **Sustainability** | `REUSABLE`                                       |

###### Recording System - Live

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | ----------------- | --------------------- | ------------- |
| **Legacy Code**    | `TECH-1044`                                                  |
| **SKU**            | `TECH-AUDI-AINF-005`                                         |
| **UNSPSC**         | `52161520`                                                   |
| **Common Name**    | Live Recording System                                        |
| **Search Aliases** | Multi-Track Recorder                                         | Virtual Soundcard | Live Capture          | Recording Rig |
| **Description**    | Multi-track recording or playback rig for live audio capture |
| **Specifications** | Multi-track recorder or laptop with interface                | Redundant backup  |
| **Options**        | Dante Virtual Soundcard                                      | Pro Tools HDX     | Waves LV1             | Ableton       |
| **Modifiers**      | Platform                                                     | Track Count       | Backup and Redundancy |
| **Prerequisites**  | Audio feed from console, power, storage                      |
| **Pricing Unit**   | per system/day                                               |
| **Lead Time**      | 336 hours                                                    |
| **Setup Time**     | 4 to 8 hours                                                 |
| **Strike Time**    | 3 to 6 hours                                                 |
| **Crew Required**  | 3 to 6 tent crew                                             |
| **Power**          | Per lighting and HVAC package                                |
| **Footprint**      | Varies (20x20 to 60x120)                                     |
| **Truck Space**    | 1 to 2 box trucks per tent                                   |
| **Weather**        | `outdoor_rated`                                              |
| **Compliance**     | `ADA                                                         | FIRE_MARSHAL      | TENT_PERMIT`          |
| **Sustainability** | `REUSABLE`                                                   |

[Back to top](#table-of-contents)

#### Lighting

##### Automated Fixtures

###### Moving Head - Wash

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | -------------------- | ------------------------- | ---------------- |
| **Legacy Code**    | `TECH-1100`                                             |
| **SKU**            | `TECH-LITE-AUTO-001`                                    |
| **UNSPSC**         | `39111600`                                              |
| **Common Name**    | Moving Head Wash                                        |
| **Search Aliases** | LED Wash                                                | Wash Light           | Automated Wash            | Intelligent Wash |
| **Description**    | Automated LED wash fixture for stage and event lighting |
| **Specifications** | 19 to 37 RGBW LEDs                                      | 15 to 60 degree zoom | DMX and RDM               |
| **Options**        | Robe LEDWash 800                                        | Martin MAC Aura XB   | Chauvet Maverick MK3 Wash |
| **Modifiers**      | Model                                                   | Quantity             | Rigging Clamp             | Safety Cable     |
| **Prerequisites**  | Truss or rigging, DMX control, power (20A circuits)     |
| **Pricing Unit**   | per unit/day                                            |
| **Lead Time**      | 168 hours                                               |
| **Setup Time**     | 15 to 30 min per fixture (hang, address, focus)         |
| **Strike Time**    | 10 to 15 min per fixture                                |
| **Crew Required**  | 1 lighting tech per 8 to 10 fixtures                    |
| **Power**          | 5A to 15A per fixture (varies by wattage)               |
| **Footprint**      | Truss-mounted (12in x 18in per fixture)                 |
| **Truck Space**    | 2 per road case (dual case)                             |
| **Weather**        | `sheltered`                                             |
| **Compliance**     | `RIGGING_CERT`                                          |
| **Sustainability** | `REUSABLE                                               | LED_EFFICIENT        | ENERGY_EFFICIENT`         |

###### Moving Head - Spot

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | ---------------- | --------------------- | ----------- | ----- |
| **Legacy Code**    | `TECH-1101`                                                   |
| **SKU**            | `TECH-LITE-AUTO-002`                                          |
| **UNSPSC**         | `39111600`                                                    |
| **Common Name**    | Moving Head Spot                                              |
| **Search Aliases** | Spot Light                                                    | Automated Spot   | Profile Spot          | Gobo Spot   |
| **Description**    | Automated spot fixture with gobo, prism, and CMY color mixing |
| **Specifications** | 300 to 1400W                                                  | CMY or RGBW      | Gobos                 | Prism       | Frost |
| **Options**        | Robe BMFL Spot                                                | Martin MAC Ultra | Clay Paky Sharpy Plus |
| **Modifiers**      | Model                                                         | Quantity         | Rigging               | Custom Gobo |
| **Prerequisites**  | Truss or rigging, DMX, power                                  |
| **Pricing Unit**   | per unit/day                                                  |
| **Lead Time**      | 168 hours                                                     |
| **Setup Time**     | 15 to 30 min per fixture (hang, address, focus)               |
| **Strike Time**    | 10 to 15 min per fixture                                      |
| **Crew Required**  | 1 lighting tech per 8 to 10 fixtures                          |
| **Power**          | 5A to 15A per fixture (varies by wattage)                     |
| **Footprint**      | Truss-mounted (12in x 18in per fixture)                       |
| **Truck Space**    | 2 per road case (dual case)                                   |
| **Weather**        | `sheltered`                                                   |
| **Compliance**     | `RIGGING_CERT`                                                |
| **Sustainability** | `REUSABLE                                                     | LED_EFFICIENT    | ENERGY_EFFICIENT`     |

###### Moving Head - Beam

|                    |                                                    |
| ------------------ | -------------------------------------------------- | ----------------- | -------------------- | -------- |
| **Legacy Code**    | `TECH-1102`                                        |
| **SKU**            | `TECH-LITE-AUTO-003`                               |
| **UNSPSC**         | `39111600`                                         |
| **Common Name**    | Moving Head Beam                                   |
| **Search Aliases** | Beam Light                                         | Aerial Beam       | Narrow Beam          | Sky Beam |
| **Description**    | Tight-beam automated fixture for aerial effects    |
| **Specifications** | 230 to 440W                                        | Narrow beam angle | Prism effects        |
| **Options**        | Claypaky Sharpy                                    | Robe Pointe       | Elation Proteus Beam |
| **Modifiers**      | Model                                              | Quantity          | Rigging              |
| **Prerequisites**  | Haze or fog for beam visibility, truss, DMX, power |
| **Pricing Unit**   | per unit/day                                       |
| **Lead Time**      | 168 hours                                          |
| **Setup Time**     | 15 to 30 min per fixture (hang, address, focus)    |
| **Strike Time**    | 10 to 15 min per fixture                           |
| **Crew Required**  | 1 lighting tech per 8 to 10 fixtures               |
| **Power**          | 5A to 15A per fixture (varies by wattage)          |
| **Footprint**      | Truss-mounted (12in x 18in per fixture)            |
| **Truck Space**    | 2 per road case (dual case)                        |
| **Weather**        | `sheltered`                                        |
| **Compliance**     | `RIGGING_CERT`                                     |
| **Sustainability** | `REUSABLE                                          | LED_EFFICIENT     | ENERGY_EFFICIENT`    |

###### Moving Head - Profile

|                    |                                                 |
| ------------------ | ----------------------------------------------- | ---------------- | ----------------- | ----------- |
| **Legacy Code**    | `TECH-1103`                                     |
| **SKU**            | `TECH-LITE-AUTO-004`                            |
| **UNSPSC**         | `39111600`                                      |
| **Common Name**    | Moving Head Profile                             |
| **Search Aliases** | Automated Profile                               | Framing Spot     | Shutter Spot      |
| **Description**    | Automated profile fixture with framing shutters |
| **Specifications** | 600 to 1200W                                    | Framing shutters | Gobos             | CMY and CTO |
| **Options**        | ETC Source Four LED Series 3                    | Robe T2 Profile  | Martin ERA 800    |
| **Modifiers**      | Model                                           | Quantity         | Rigging           |
| **Prerequisites**  | Truss or rigging, DMX, power                    |
| **Pricing Unit**   | per unit/day                                    |
| **Lead Time**      | 168 hours                                       |
| **Setup Time**     | 15 to 30 min per fixture (hang, address, focus) |
| **Strike Time**    | 10 to 15 min per fixture                        |
| **Crew Required**  | 1 lighting tech per 8 to 10 fixtures            |
| **Power**          | 5A to 15A per fixture (varies by wattage)       |
| **Footprint**      | Truss-mounted (12in x 18in per fixture)         |
| **Truck Space**    | 2 per road case (dual case)                     |
| **Weather**        | `sheltered`                                     |
| **Compliance**     | `RIGGING_CERT`                                  |
| **Sustainability** | `REUSABLE                                       | LED_EFFICIENT    | ENERGY_EFFICIENT` |

###### Wash Bar - LED

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | ---------------------- | --------------------- | -------------------- | --------- |
| **Legacy Code**    | `TECH-1104`                                                 |
| **SKU**            | `TECH-LITE-AUTO-005`                                        |
| **UNSPSC**         | `39111600`                                                  |
| **Common Name**    | LED Wash Bar                                                |
| **Search Aliases** | LED Batten                                                  | Linear Wash            | Cyc Light             | Wall Washer          | Color Bar |
| **Description**    | Linear LED wash fixture for wall wash or cyclorama lighting |
| **Specifications** | 1 to 4ft lengths                                            | RGBW or RGBAW+UV       | DMX                   |
| **Options**        | Chroma-Q Color Force II                                     | ETC ColorSource Linear | GLP Impression X4 Bar |
| **Modifiers**      | Length                                                      | Color Mixing           | Quantity              | Floor or Truss Mount |
| **Prerequisites**  | DMX, power, rigging or floor stands                         |
| **Pricing Unit**   | per unit/day                                                |
| **Lead Time**      | 168 hours                                                   |
| **Setup Time**     | 15 to 30 min per fixture (hang, address, focus)             |
| **Strike Time**    | 10 to 15 min per fixture                                    |
| **Crew Required**  | 1 lighting tech per 8 to 10 fixtures                        |
| **Power**          | 5A to 15A per fixture (varies by wattage)                   |
| **Footprint**      | Truss-mounted (12in x 18in per fixture)                     |
| **Truck Space**    | 2 per road case (dual case)                                 |
| **Weather**        | `sheltered`                                                 |
| **Compliance**     | `RIGGING_CERT`                                              |
| **Sustainability** | `REUSABLE                                                   | LED_EFFICIENT          | ENERGY_EFFICIENT`     |

[Back to top](#table-of-contents)

##### Static Fixtures

###### PAR Can - LED

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | -------------------------------- | ----------------- | -------------------- | ------- |
| **Legacy Code**    | `TECH-1110`                                              |
| **SKU**            | `TECH-LITE-STAT-001`                                     |
| **UNSPSC**         | `39111500`                                               |
| **Common Name**    | LED PAR Can                                              |
| **Search Aliases** | LED Par                                                  | Uplighter                        | Wash Light        | Color Wash           | LED Can |
| **Description**    | Static LED PAR wash for uplighting, stage wash, or decor |
| **Specifications** | RGBW or RGBAW+UV                                         | Battery-powered option available |
| **Options**        | Wired                                                    | Battery Wireless                 | IP65 Outdoor      |
| **Modifiers**      | Model                                                    | Quantity                         | Wireless DMX      | Floor Stand or Clamp |
| **Pricing Unit**   | per unit/day                                             |
| **Lead Time**      | 168 hours                                                |
| **Setup Time**     | 5 to 15 min per fixture                                  |
| **Strike Time**    | 5 to 10 min per fixture                                  |
| **Crew Required**  | 1 lighting tech per 10 to 15 fixtures                    |
| **Power**          | 1A to 10A per fixture                                    |
| **Footprint**      | Truss or floor mounted, minimal                          |
| **Truck Space**    | 4 to 8 per road case                                     |
| **Weather**        | `sheltered`                                              |
| **Compliance**     | `RIGGING_CERT`                                           |
| **Sustainability** | `REUSABLE                                                | LED_EFFICIENT                    | ENERGY_EFFICIENT` |

###### Ellipsoidal - Source Four

|                    |                                                                       |
| ------------------ | --------------------------------------------------------------------- | ----------------------------- | ----------------- | ------------ | ---------- |
| **Legacy Code**    | `TECH-1111`                                                           |
| **SKU**            | `TECH-LITE-STAT-002`                                                  |
| **UNSPSC**         | `39111500`                                                            |
| **Common Name**    | Ellipsoidal Spotlight                                                 |
| **Search Aliases** | Source Four                                                           | Leko                          | ERS               | Profile Spot | Gobo Light |
| **Description**    | Conventional or LED ellipsoidal spotlight for key and gobo projection |
| **Specifications** | ETC Source Four                                                       | 19, 26, 36, or 50 degree lens |
| **Options**        | 575W Halogen                                                          | LED Daylight                  | LED RGBL          | With Gobo    |
| **Modifiers**      | Lens Degree                                                           | Lamp Type                     | Gobo              | Quantity     | Gel Frame  |
| **Prerequisites**  | Dimmer or direct power, rigging position                              |
| **Pricing Unit**   | per unit/day                                                          |
| **Lead Time**      | 168 hours                                                             |
| **Setup Time**     | 5 to 15 min per fixture                                               |
| **Strike Time**    | 5 to 10 min per fixture                                               |
| **Crew Required**  | 1 lighting tech per 10 to 15 fixtures                                 |
| **Power**          | 1A to 10A per fixture                                                 |
| **Footprint**      | Truss or floor mounted, minimal                                       |
| **Truck Space**    | 4 to 8 per road case                                                  |
| **Weather**        | `sheltered`                                                           |
| **Compliance**     | `RIGGING_CERT`                                                        |
| **Sustainability** | `REUSABLE                                                             | LED_EFFICIENT                 | ENERGY_EFFICIENT` |

###### Followspot

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------ | -------------------- | ------ | ------------- |
| **Legacy Code**    | `TECH-1112`                                                      |
| **SKU**            | `TECH-LITE-STAT-003`                                             |
| **UNSPSC**         | `39111500`                                                       |
| **Common Name**    | Followspot                                                       |
| **Search Aliases** | Spotlight                                                        | Tracking Spot                        | Super Trouper        | Lycian | Robert Juliat |
| **Description**    | Manually operated followspot for performer tracking              |
| **Specifications** | 800W through 2400W                                               | Long-throw and short-throw available |
| **Options**        | Robert Juliat Aramis                                             | Lycian 1293                          | Strong Super Trouper |
| **Modifiers**      | Model                                                            | Operator (add-on)                    | Stand or Truss Mount | Gel    |
| **Prerequisites**  | Followspot position with clear sightlines, operator, comm system |
| **Pricing Unit**   | per unit/day                                                     |
| **Lead Time**      | 168 hours                                                        |
| **Setup Time**     | 30 to 60 min (position, focus, gel)                              |
| **Strike Time**    | 20 min                                                           |
| **Crew Required**  | 1 operator per followspot (dedicated)                            |
| **Power**          | 10A to 25A per unit                                              |
| **Footprint**      | 3ft x 6ft per position (with operator space)                     |
| **Truck Space**    | 1 road case per followspot                                       |
| **Weather**        | `sheltered`                                                      |
| **Sustainability** | `REUSABLE                                                        | LED_EFFICIENT`                       |

###### Blinder - Audience

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | ------------- | ----------------- | ------ | ----------- |
| **Legacy Code**    | `TECH-1113`                                               |
| **SKU**            | `TECH-LITE-STAT-004`                                      |
| **UNSPSC**         | `39111500`                                                |
| **Common Name**    | Blinder                                                   |
| **Search Aliases** | Audience Blinder                                          | Mole          | 2-Lite            | 4-Lite | DWE Blinder |
| **Description**    | High-intensity audience blinder for dramatic wash effects |
| **Specifications** | 2-lite or 4-lite                                          | DWE lamps     |
| **Options**        | Mole 2-Lite                                               | Mole 4-Lite   | LED Blinder       |
| **Modifiers**      | Model                                                     | Quantity      | Rigging           |
| **Prerequisites**  | Dimmer or direct power, rigging                           |
| **Pricing Unit**   | per unit/day                                              |
| **Lead Time**      | 168 hours                                                 |
| **Setup Time**     | 5 to 15 min per fixture                                   |
| **Strike Time**    | 5 to 10 min per fixture                                   |
| **Crew Required**  | 1 lighting tech per 10 to 15 fixtures                     |
| **Power**          | 1A to 10A per fixture                                     |
| **Footprint**      | Truss or floor mounted, minimal                           |
| **Truck Space**    | 4 to 8 per road case                                      |
| **Weather**        | `sheltered`                                               |
| **Compliance**     | `RIGGING_CERT`                                            |
| **Sustainability** | `REUSABLE                                                 | LED_EFFICIENT | ENERGY_EFFICIENT` |

###### Strobe - DMX

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | -------------------- | ----------------- | ---------- |
| **Legacy Code**    | `TECH-1114`                                              |
| **SKU**            | `TECH-LITE-STAT-005`                                     |
| **UNSPSC**         | `39111500`                                               |
| **Common Name**    | Strobe Light                                             |
| **Search Aliases** | Strobe                                                   | Atomic               | Flash             | DMX Strobe |
| **Description**    | High-intensity strobe fixture for dramatic flash effects |
| **Specifications** | LED or xenon                                             | DMX controlled       |
| **Options**        | Atomic 3000                                              | Martin Atomic Colors | LED Strobe Panel  |
| **Modifiers**      | Model                                                    | Quantity             | Rigging           |
| **Prerequisites**  | DMX, power, rigging                                      |
| **Pricing Unit**   | per unit/day                                             |
| **Lead Time**      | 168 hours                                                |
| **Setup Time**     | 5 to 15 min per fixture                                  |
| **Strike Time**    | 5 to 10 min per fixture                                  |
| **Crew Required**  | 1 lighting tech per 10 to 15 fixtures                    |
| **Power**          | 1A to 10A per fixture                                    |
| **Footprint**      | Truss or floor mounted, minimal                          |
| **Truck Space**    | 4 to 8 per road case                                     |
| **Weather**        | `sheltered`                                              |
| **Compliance**     | `RIGGING_CERT`                                           |
| **Sustainability** | `REUSABLE                                                | LED_EFFICIENT        | ENERGY_EFFICIENT` |

###### String Lights - Bistro

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ------------------ | ---------------------------------- | ------------- | ------------ |
| **Legacy Code**    | `TECH-1115`                                             |
| **SKU**            | `TECH-LITE-STAT-006`                                    |
| **UNSPSC**         | `39111500`                                              |
| **Common Name**    | Bistro String Lights                                    |
| **Search Aliases** | Cafe Lights                                             | Edison Lights      | Festoon Lights                     | Market Lights | Patio Lights |
| **Description**    | Decorative string lights for ambiance and outdoor areas |
| **Specifications** | 48ft or 100ft                                           | LED Edison bulbs   |
| **Options**        | Warm White LED                                          | Color-Changing LED | Incandescent Edison                |
| **Modifiers**      | Length (ft)                                             | Quantity           | Mounting (catenary wire, zip-tied) |
| **Prerequisites**  | Catenary wire, mounting points, power                   |
| **Pricing Unit**   | per 100ft/day                                           |
| **Lead Time**      | 48 hours                                                |
| **Setup Time**     | 30 to 60 min per 100ft run                              |
| **Strike Time**    | 20 to 30 min per run                                    |
| **Crew Required**  | 2 people (hanging and connecting)                       |
| **Power**          | 1A to 3A per 100ft (LED)                                |
| **Footprint**      | Overhead (catenary wire or structure-mounted)           |
| **Truck Space**    | 1 box per 200 to 500ft                                  |
| **Weather**        | `outdoor_rated`                                         |
| **Sustainability** | `REUSABLE                                               | LED_EFFICIENT`     |

###### Blacklight - UV

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | ----------------- | ----------------- | ------ | -------- |
| **Legacy Code**    | `TECH-1116`                                                      |
| **SKU**            | `TECH-LITE-STAT-007`                                             |
| **UNSPSC**         | `39111500`                                                       |
| **Common Name**    | Blacklight Fixture                                               |
| **Search Aliases** | UV Light                                                         | Ultraviolet       | Glow Light        | UV Bar | UV Flood |
| **Description**    | UV and blacklight fixture for glow effects and UV-reactive decor |
| **Specifications** | LED bar or LED flood                                             | 2ft or 4ft length |
| **Options**        | LED Bar (2ft or 4ft)                                             | LED Flood         | High-Output Panel |
| **Modifiers**      | Type                                                             | Quantity          | Coverage Area     |
| **Prerequisites**  | UV-reactive materials or paint for effect                        |
| **Pricing Unit**   | per unit/day                                                     |
| **Lead Time**      | 168 hours                                                        |
| **Setup Time**     | 5 to 15 min per fixture                                          |
| **Strike Time**    | 5 to 10 min per fixture                                          |
| **Crew Required**  | 1 lighting tech per 10 to 15 fixtures                            |
| **Power**          | 1A to 10A per fixture                                            |
| **Footprint**      | Truss or floor mounted, minimal                                  |
| **Truck Space**    | 4 to 8 per road case                                             |
| **Weather**        | `sheltered`                                                      |
| **Compliance**     | `RIGGING_CERT`                                                   |
| **Sustainability** | `REUSABLE                                                        | LED_EFFICIENT     | ENERGY_EFFICIENT` |

###### Pixel Tape - LED

|                    |                                                                     |
| ------------------ | ------------------------------------------------------------------- | ------------------------------- | ----------------- | ---------------- | --------- |
| **Legacy Code**    | `TECH-1117`                                                         |
| **SKU**            | `TECH-LITE-STAT-008`                                                |
| **UNSPSC**         | `39111500`                                                          |
| **Common Name**    | LED Pixel Tape                                                      |
| **Search Aliases** | LED Strip                                                           | Addressable LED                 | RGB Tape          | Pixel Strip      | Neon Flex |
| **Description**    | Individually addressable LED tape for scenic and decorative effects |
| **Specifications** | 5m (16.4ft) per roll                                                | 30, 60, or 144 pixels per meter | RGB or RGBW       |
| **Options**        | 30 px/m (sparse)                                                    | 60 px/m (standard)              | 144 px/m (HD)     |
| **Modifiers**      | Length                                                              | Pixel Density                   | Controller        | Mounting Channel |
| **Prerequisites**  | LED controller or driver, power supply, mounting channel            |
| **Pricing Unit**   | per meter/event                                                     |
| **Lead Time**      | 168 hours                                                           |
| **Setup Time**     | 5 to 15 min per fixture                                             |
| **Strike Time**    | 5 to 10 min per fixture                                             |
| **Crew Required**  | 1 lighting tech per 10 to 15 fixtures                               |
| **Power**          | 1A to 10A per fixture                                               |
| **Footprint**      | Truss or floor mounted, minimal                                     |
| **Truck Space**    | 4 to 8 per road case                                                |
| **Weather**        | `sheltered`                                                         |
| **Compliance**     | `RIGGING_CERT`                                                      |
| **Sustainability** | `REUSABLE                                                           | LED_EFFICIENT                   | ENERGY_EFFICIENT` |

[Back to top](#table-of-contents)

##### Atmospheric Effects

###### Hazer - DMX

|                    |                                                                |
| ------------------ | -------------------------------------------------------------- | ----------------- | ------------------------- | -------------------- |
| **Legacy Code**    | `TECH-1120`                                                    |
| **SKU**            | `TECH-LITE-ATMO-001`                                           |
| **UNSPSC**         | `60141100`                                                     |
| **Common Name**    | Haze Machine                                                   |
| **Search Aliases** | Hazer                                                          | MDG               | Theatrical Haze           | Atmosphere Generator |
| **Description**    | Professional hazer for beam visibility and atmospheric effects |
| **Specifications** | Oil-based or water-based                                       | DMX controlled    |
| **Options**        | MDG theONE                                                     | Ultratec Radiance | Look Solutions Unique 2.1 |
| **Modifiers**      | Model                                                          | Fluid Type        | Quantity                  | Fluid Supply         |
| **Prerequisites**  | Venue approval for haze, ventilation considerations            |
| **Pricing Unit**   | per unit/day                                                   |
| **Lead Time**      | 168 hours                                                      |
| **Setup Time**     | 15 to 30 min per unit                                          |
| **Strike Time**    | 10 to 15 min per unit                                          |
| **Crew Required**  | 1 to 2 SFX techs                                               |
| **Power**          | 15A to 20A per unit                                            |
| **Footprint**      | 2ft x 2ft per unit                                             |
| **Truck Space**    | 1 road case per 2 to 4 units                                   |
| **Weather**        | `outdoor_rated`                                                |
| **Sustainability** | `REUSABLE`                                                     |

###### Fog Machine

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ---------------------------- | ----------------- | --------------------- | ----- |
| **Legacy Code**    | `TECH-1121`                                          |
| **SKU**            | `TECH-LITE-ATMO-002`                                 |
| **UNSPSC**         | `60141100`                                           |
| **Common Name**    | Fog Machine                                          |
| **Search Aliases** | Fogger                                               | Smoke Machine                | Low Fog           | Ground Fog            | Fazer |
| **Description**    | Ground fog or standard fog machine for stage effects |
| **Specifications** | Standard glycol, low-lying CO2, or fazer             |
| **Options**        | Standard (glycol)                                    | Low Fog (CO2 or cracked oil) | Fazer (fine haze) |
| **Modifiers**      | Type                                                 | Fluid                        | Quantity          | CO2 Tank (if low fog) |
| **Prerequisites**  | Fire alarm coordination, ventilation, fluid supply   |
| **Pricing Unit**   | per unit/day                                         |
| **Lead Time**      | 168 hours                                            |
| **Setup Time**     | 15 to 30 min per unit                                |
| **Strike Time**    | 10 to 15 min per unit                                |
| **Crew Required**  | 1 to 2 SFX techs                                     |
| **Power**          | 15A to 20A per unit                                  |
| **Footprint**      | 2ft x 2ft per unit                                   |
| **Truck Space**    | 1 road case per 2 to 4 units                         |
| **Weather**        | `outdoor_rated`                                      |
| **Sustainability** | `REUSABLE`                                           |

###### Cryo Jet - CO2

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | ----------- | ------------- | ----------------------- | ---------- |
| **Legacy Code**    | `TECH-1122`                                                     |
| **SKU**            | `TECH-LITE-ATMO-003`                                            |
| **UNSPSC**         | `60141100`                                                      |
| **Common Name**    | CO2 Cryo Jet                                                    |
| **Search Aliases** | Cryo Cannon                                                     | CO2 Blast   | Cryo Gun      | CO2 Effect              | Cold Blast |
| **Description**    | High-pressure CO2 effect for stage bursts and crowd interaction |
| **Specifications** | Single jet or dual cannon                                       | With LED    | DMX triggered |
| **Options**        | Single Jet                                                      | Dual Cannon | LED Cryo      | Handheld Cryo Gun       |
| **Modifiers**      | Quantity                                                        | Tank Size   | Hose Length   | Trigger (DMX or manual) |
| **Prerequisites**  | CO2 tanks (50 lb), safety perimeter, trained operator           |
| **Pricing Unit**   | per unit/day                                                    |
| **Lead Time**      | 168 hours                                                       |
| **Setup Time**     | 15 to 30 min per unit                                           |
| **Strike Time**    | 10 to 15 min per unit                                           |
| **Crew Required**  | 1 to 2 SFX techs                                                |
| **Power**          | 15A to 20A per unit                                             |
| **Footprint**      | 2ft x 2ft per unit                                              |
| **Truck Space**    | 1 road case per 2 to 4 units                                    |
| **Weather**        | `outdoor_rated`                                                 |
| **Sustainability** | `REUSABLE`                                                      |

###### Confetti Cannon

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ----------------- | --------------- | -------- |
| **Legacy Code**    | `TECH-1123`                                                |
| **SKU**            | `TECH-LITE-ATMO-004`                                       |
| **UNSPSC**         | `60141100`                                                 |
| **Common Name**    | Confetti Cannon                                            |
| **Search Aliases** | Streamer Cannon                                            | Confetti Launcher | Confetti Blower | Gerb     |
| **Description**    | Confetti or streamer launcher for celebrations and effects |
| **Specifications** | Handheld, electric continuous, DMX, or CO2-powered         |
| **Options**        | Handheld (single-shot)                                     | Electric Blower   | DMX Cannon      | CO2 Gerb |
| **Modifiers**      | Type                                                       | Quantity          | Refills         | Color    |
| **Prerequisites**  | Cleanup crew, venue approval for confetti                  |
| **Pricing Unit**   | per unit/show                                              |
| **Lead Time**      | 168 hours                                                  |
| **Setup Time**     | 15 to 30 min per unit                                      |
| **Strike Time**    | 10 to 15 min per unit                                      |
| **Crew Required**  | 1 to 2 SFX techs                                           |
| **Power**          | 15A to 20A per unit                                        |
| **Footprint**      | 2ft x 2ft per unit                                         |
| **Truck Space**    | 1 road case per 2 to 4 units                               |
| **Weather**        | `outdoor_rated`                                            |
| **Sustainability** | `REUSABLE`                                                 |

###### Flame Effect - Propane

|                    |                                                                |
| ------------------ | -------------------------------------------------------------- | ------------------- | ----------------------- | ---------------- | ----------- |
| **Legacy Code**    | `TECH-1124`                                                    |
| **SKU**            | `TECH-LITE-ATMO-005`                                           |
| **UNSPSC**         | `60141100`                                                     |
| **Common Name**    | Flame Effect Machine                                           |
| **Search Aliases** | Fire Machine                                                   | Flame Bar           | Propane Effect          | Pyro Flame       | Fire Column |
| **Description**    | Propane or electric flame effect for stage pyrotechnics        |
| **Specifications** | Propane or electric                                            | DMX-controlled      | 2 to 10ft column height |
| **Options**        | Propane Column (2 to 10ft)                                     | Electric Silk Flame | Fan Flame               | Lyric            |
| **Modifiers**      | Type                                                           | Quantity            | Fuel                    | Safety Perimeter |
| **Prerequisites**  | Fire marshal permit, fire watch, extinguishers, propane supply |
| **Pricing Unit**   | per unit/show                                                  |
| **Lead Time**      | 672 hours                                                      |
| **Setup Time**     | 1 to 2 hours (plumbing, safety check, test fire)               |
| **Strike Time**    | 1 hour                                                         |
| **Crew Required**  | Licensed pyro technician, fire watch                           |
| **Power**          | 20A (DMX control), propane fuel system                         |
| **Footprint**      | 2ft x 2ft per unit, 10ft safety perimeter                      |
| **Truck Space**    | 1 to 2 road cases plus propane tanks                           |
| **Weather**        | `outdoor_rated`                                                |
| **Compliance**     | `FIRE_MARSHAL                                                  | NFPA                | PYRO_LICENSE`           |
| **Sustainability** | `SINGLE_USE`                                                   |

###### Spark Machine - Cold

|                    |                                                                       |
| ------------------ | --------------------------------------------------------------------- | ---------------- | --------------- | -------- | --------------- |
| **Legacy Code**    | `TECH-1125`                                                           |
| **SKU**            | `TECH-LITE-ATMO-006`                                                  |
| **UNSPSC**         | `60141100`                                                            |
| **Common Name**    | Cold Spark Machine                                                    |
| **Search Aliases** | Spark Effect                                                          | Titanium Spark   | Sparkular       | Ti-Spark | Fountain Effect |
| **Description**    | Non-flammable titanium spark effect machine for indoor or outdoor use |
| **Specifications** | 1 to 5 meter height                                                   | DMX triggered    | Cold to touch   |
| **Options**        | Standard (3m)                                                         | High-Output (5m) | Mini (1.5m)     |
| **Modifiers**      | Height                                                                | Quantity         | Granule Refills |
| **Prerequisites**  | Titanium granules, power, DMX, overhead clearance                     |
| **Pricing Unit**   | per unit/show                                                         |
| **Lead Time**      | 168 hours                                                             |
| **Setup Time**     | 15 to 30 min per unit                                                 |
| **Strike Time**    | 10 to 15 min per unit                                                 |
| **Crew Required**  | 1 to 2 SFX techs                                                      |
| **Power**          | 15A to 20A per unit                                                   |
| **Footprint**      | 2ft x 2ft per unit                                                    |
| **Truck Space**    | 1 road case per 2 to 4 units                                          |
| **Weather**        | `outdoor_rated`                                                       |
| **Sustainability** | `REUSABLE`                                                            |

###### Laser - Show

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | --------------------- | --------------- | ---------------------- | ---------- |
| **Legacy Code**    | `TECH-1126`                                                  |
| **SKU**            | `TECH-LITE-ATMO-007`                                         |
| **UNSPSC**         | `60141100`                                                   |
| **Common Name**    | Show Laser                                                   |
| **Search Aliases** | Laser Projector                                              | ILDA Laser            | RGB Laser       | Aerial Laser           | Beam Laser |
| **Description**    | Professional show laser for aerial effects and ILDA graphics |
| **Specifications** | Single color through full-color RGB                          | ILDA graphics capable |
| **Options**        | Green (1 to 5W)                                              | RGB (3 to 10W)        | RGB (10 to 30W) | Graphic ILDA           |
| **Modifiers**      | Color                                                        | Power (watts)         | ILDA Graphics   | Operator or Programmer |
| **Prerequisites**  | FDA variance, audience scanning compliance, laser operator   |
| **Pricing Unit**   | per unit/show                                                |
| **Lead Time**      | 672 hours                                                    |
| **Setup Time**     | 2 to 4 hours (alignment, programming, safety check)          |
| **Strike Time**    | 1 hour                                                       |
| **Crew Required**  | Licensed laser operator (FDA variance holder)                |
| **Power**          | 20A per laser                                                |
| **Footprint**      | 2ft x 2ft per unit, exclusion zones                          |
| **Truck Space**    | 1 road case per laser                                        |
| **Weather**        | `sheltered`                                                  |
| **Compliance**     | `FDA`                                                        |
| **Sustainability** | `REUSABLE                                                    | ENERGY_EFFICIENT`     |

[Back to top](#table-of-contents)

##### Lighting Control

###### Console - Lighting

|                    |                                             |
| ------------------ | ------------------------------------------- | ------------------- | --------------- | ------------------- | -------------- |
| **Legacy Code**    | `TECH-1130`                                 |
| **SKU**            | `TECH-LITE-CTRL-001`                        |
| **UNSPSC**         | `39112100`                                  |
| **Common Name**    | Lighting Console                            |
| **Search Aliases** | Lighting Desk                               | Light Board         | Control Console | Programming Console |
| **Description**    | Professional lighting control console       |
| **Specifications** | MA Lighting, ChamSys, ETC Eos, or Avolites  |
| **Options**        | grandMA3 compact                            | grandMA3 full       | ChamSys MQ500M  | ETC Gio @5          | Avolites Arena |
| **Modifiers**      | Model                                       | Programmer (add-on) | Backup Console  | Visualizer          |
| **Prerequisites**  | FOH position, power, network infrastructure |
| **Pricing Unit**   | per console/day                             |
| **Lead Time**      | 336 hours                                   |
| **Setup Time**     | 1 to 2 hours (console), 15 min per node     |
| **Strike Time**    | 30 to 60 min                                |
| **Crew Required**  | 1 lighting programmer or LD                 |
| **Power**          | 1x 20A (UPS recommended for console)        |
| **Footprint**      | 4ft x 3ft (console position)                |
| **Truck Space**    | 1 to 2 road cases                           |
| **Weather**        | `sheltered`                                 |
| **Sustainability** | `REUSABLE                                   | LOW_POWER`          |

###### Node - DMX

|                    |                                                   |
| ------------------ | ------------------------------------------------- | --------------- | ------------ | ------------- | ----------- |
| **Legacy Code**    | `TECH-1131`                                       |
| **SKU**            | `TECH-LITE-CTRL-002`                              |
| **UNSPSC**         | `39112100`                                        |
| **Common Name**    | DMX Distribution Node                             |
| **Search Aliases** | DMX Splitter                                      | sACN Node       | Art-Net Node | Opto-Splitter | DMX Booster |
| **Description**    | DMX or network-based lighting signal distribution |
| **Specifications** | 2-port through 8-port                             | sACN or Art-Net |
| **Options**        | 2-Port                                            | 4-Port          | 8-Port       | Rack-Mount    |
| **Modifiers**      | Port Count                                        | Protocol        | Quantity     |
| **Prerequisites**  | Network infrastructure (for sACN or Art-Net)      |
| **Pricing Unit**   | per unit/day                                      |
| **Lead Time**      | 336 hours                                         |
| **Setup Time**     | 1 to 2 hours (console), 15 min per node           |
| **Strike Time**    | 30 to 60 min                                      |
| **Crew Required**  | 1 lighting programmer or LD                       |
| **Power**          | 1x 20A (UPS recommended for console)              |
| **Footprint**      | 4ft x 3ft (console position)                      |
| **Truck Space**    | 1 to 2 road cases                                 |
| **Weather**        | `sheltered`                                       |
| **Sustainability** | `REUSABLE                                         | LOW_POWER`      |

###### Dimmer Rack

|                    |                                                                |
| ------------------ | -------------------------------------------------------------- | ------------------------ | -------------- | ------------ |
| **Legacy Code**    | `TECH-1132`                                                    |
| **SKU**            | `TECH-LITE-CTRL-003`                                           |
| **UNSPSC**         | `39112100`                                                     |
| **Common Name**    | Dimmer Rack                                                    |
| **Search Aliases** | Dimmer Pack                                                    | Conventional Dimmer      | Touring Dimmer | Socapex Rack |
| **Description**    | Traditional dimmer rack for conventional incandescent fixtures |
| **Specifications** | 6 through 48 channels                                          | 2.4kW or 6kW per channel |
| **Options**        | 6x2.4kW                                                        | 12x2.4kW                 | 24x2.4kW       | 12x6kW       |
| **Modifiers**      | Channel Count                                                  | Rating Per Channel       | DMX Input      |
| **Prerequisites**  | Conventional fixtures, DMX signal, adequate power              |
| **Pricing Unit**   | per rack/day                                                   |
| **Lead Time**      | 336 hours                                                      |
| **Setup Time**     | 1 to 2 hours (console), 15 min per node                        |
| **Strike Time**    | 30 to 60 min                                                   |
| **Crew Required**  | 1 lighting programmer or LD                                    |
| **Power**          | 1x 20A (UPS recommended for console)                           |
| **Footprint**      | 4ft x 3ft (console position)                                   |
| **Truck Space**    | 1 to 2 road cases                                              |
| **Weather**        | `sheltered`                                                    |
| **Sustainability** | `REUSABLE                                                      | LOW_POWER`               |

[Back to top](#table-of-contents)

#### Video

##### LED Walls & Displays

###### LED Wall - Indoor

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ------------------- | --------------------- | ---------- | --------- |
| **Legacy Code**    | `TECH-1200`                                             |
| **SKU**            | `TECH-VIDO-LEDW-001`                                    |
| **UNSPSC**         | `45111600`                                              |
| **Common Name**    | Indoor LED Video Wall                                   |
| **Search Aliases** | LED Wall                                                | LED Screen          | Video Wall            | Pixel Wall | LED Panel |
| **Description**    | Modular LED video panel wall for stage backdrop or IMAG |
| **Specifications** | 2.6mm, 2.9mm, or 3.9mm pixel pitch                      | 500x500mm panels    |
| **Options**        | 2.6mm (HD close-up)                                     | 2.9mm (standard)    | 3.9mm (large format)  |
| **Modifiers**      | Pixel Pitch                                             | Total Size (panels) | Ground Stack vs Flown | Processing |
| **Prerequisites**  | Rigging or ground support, video processing, power      |
| **Pricing Unit**   | per panel/day                                           |
| **Lead Time**      | 336 hours                                               |
| **Setup Time**     | 4 to 8 hours (build, align, process)                    |
| **Strike Time**    | 2 to 4 hours                                            |
| **Crew Required**  | 3 to 6 video techs                                      |
| **Power**          | 20A per 10 to 16 panels                                 |
| **Footprint**      | Per panel (500mm x 500mm), ground support or flown      |
| **Truck Space**    | Panels in road cases, 8 to 12 per case                  |
| **Weather**        | `outdoor_rated`                                         |
| **Compliance**     | `RIGGING_CERT                                           | STRUCT_ENG`         |
| **Sustainability** | `REUSABLE                                               | LED_EFFICIENT       | ENERGY_EFFICIENT`     |

###### LED Wall - Outdoor

|                    |                                                    |
| ------------------ | -------------------------------------------------- | ---------------- | --------------------- | ------------- |
| **Legacy Code**    | `TECH-1201`                                        |
| **SKU**            | `TECH-VIDO-LEDW-002`                               |
| **UNSPSC**         | `45111600`                                         |
| **Common Name**    | Outdoor LED Video Wall                             |
| **Search Aliases** | Outdoor LED                                        | Weatherproof LED | IP65 LED              | Touring LED   |
| **Description**    | Weather-rated LED panels for outdoor events        |
| **Specifications** | 3.9mm through 10mm pixel pitch                     | IP65 rated       |
| **Options**        | 3.9mm                                              | 4.8mm            | 5.9mm                 | 10mm (budget) |
| **Modifiers**      | Pixel Pitch                                        | Size             | Ground Stack vs Flown | Processing    |
| **Prerequisites**  | Rigging or ground support, weatherproofing, power  |
| **Pricing Unit**   | per panel/day                                      |
| **Lead Time**      | 336 hours                                          |
| **Setup Time**     | 4 to 8 hours (build, align, process)               |
| **Strike Time**    | 2 to 4 hours                                       |
| **Crew Required**  | 3 to 6 video techs                                 |
| **Power**          | 20A per 10 to 16 panels                            |
| **Footprint**      | Per panel (500mm x 500mm), ground support or flown |
| **Truck Space**    | Panels in road cases, 8 to 12 per case             |
| **Weather**        | `outdoor_rated`                                    |
| **Compliance**     | `RIGGING_CERT                                      | STRUCT_ENG`      |
| **Sustainability** | `REUSABLE                                          | LED_EFFICIENT    | ENERGY_EFFICIENT`     |

###### LED Tile - Floor or Ceiling

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | ------------------------------------ | ---------------- | ---------------------- | ------------- |
| **Legacy Code**    | `TECH-1202`                                                   |
| **SKU**            | `TECH-VIDO-LEDW-003`                                          |
| **UNSPSC**         | `45111600`                                                    |
| **Common Name**    | LED Floor and Ceiling Tile                                    |
| **Search Aliases** | LED Floor                                                     | Dance Floor LED                      | Walkable LED     | Overhead LED           | Immersive LED |
| **Description**    | Walkable or overhead LED panel for immersive installations    |
| **Specifications** | 2.9mm or 3.9mm                                                | Load-rated (floor) or overhead-rated |
| **Options**        | Floor Tile (load-rated)                                       | Ceiling Tile                         | Wall Integration |
| **Modifiers**      | Application                                                   | Size                                 | Processing       | Structural Engineering |
| **Prerequisites**  | Structural load calculations, processing, power, install crew |
| **Pricing Unit**   | per panel/day                                                 |
| **Lead Time**      | 672 hours                                                     |
| **Setup Time**     | 4 to 8 hours (with structural engineering)                    |
| **Strike Time**    | 2 to 4 hours                                                  |
| **Crew Required**  | 4 to 8 video techs, structural engineer signoff               |
| **Power**          | 20A per 10 to 16 panels                                       |
| **Footprint**      | Per panel (500mm x 500mm)                                     |
| **Truck Space**    | Panels on pallets, 20 to 40 per case                          |
| **Weather**        | `indoor_only`                                                 |
| **Compliance**     | `ADA                                                          | RIGGING_CERT`                        |
| **Sustainability** | `REUSABLE                                                     | LED_EFFICIENT`                       |

###### LED Screen - Mobile

|                    |                                                   |
| ------------------ | ------------------------------------------------- | -------------------------------- | ----------------- | ---------------------- | -------------- |
| **Legacy Code**    | `TECH-1203`                                       |
| **SKU**            | `TECH-VIDO-LEDW-004`                              |
| **UNSPSC**         | `45111600`                                        |
| **Common Name**    | Mobile LED Screen                                 |
| **Search Aliases** | LED Trailer                                       | Jumbotron                        | Mobile Scoreboard | Outdoor Screen Trailer |
| **Description**    | Self-contained mobile LED screen on trailer       |
| **Specifications** | 9x16ft through 16x28ft                            | With audio and generator options |
| **Options**        | 9x16                                              | 12x22                            | 16x28             | With PA System         | With Generator |
| **Modifiers**      | Size                                              | Audio Add-On                     | Generator         | Operator               |
| **Prerequisites**  | Level ground, power or generator, line of sight   |
| **Pricing Unit**   | per unit/day                                      |
| **Lead Time**      | 336 hours                                         |
| **Setup Time**     | 30 to 60 min (park, unfold, power)                |
| **Strike Time**    | 30 min                                            |
| **Crew Required**  | 1 CDL driver, 1 video tech                        |
| **Power**          | 60A to 100A per screen (or onboard generator)     |
| **Footprint**      | Self-contained trailer (8ft x 20ft to 8ft x 35ft) |
| **Truck Space**    | Self-contained trailer                            |
| **Weather**        | `all_weather`                                     |
| **Compliance**     | `CDL`                                             |
| **Sustainability** | `REUSABLE                                         | LED_EFFICIENT                    | ENERGY_EFFICIENT` |

###### Display - Flat Panel

|                    |                                                    |
| ------------------ | -------------------------------------------------- | ----------------------- | ----------------- | --------------- | ------------------ | ---- | ------------- |
| **Legacy Code**    | `TECH-1204`                                        |
| **SKU**            | `TECH-VIDO-LEDW-005`                               |
| **UNSPSC**         | `45111600`                                         |
| **Common Name**    | Flat Panel Display                                 |
| **Search Aliases** | TV                                                 | Monitor                 | LCD               | Flat Screen     | Commercial Display |
| **Description**    | Professional flat panel display on stand or mount  |
| **Specifications** | 42in through 98in                                  | Outdoor-rated available |
| **Options**        | 42in                                               | 55in                    | 65in              | 75in            | 85in               | 98in | Outdoor-Rated |
| **Modifiers**      | Size                                               | Stand or Mount Type     | Quantity          | Playback Device |
| **Prerequisites**  | Power, HDMI or SDI source, mount or stand          |
| **Pricing Unit**   | per unit/day                                       |
| **Lead Time**      | 336 hours                                          |
| **Setup Time**     | 4 to 8 hours (build, align, process)               |
| **Strike Time**    | 2 to 4 hours                                       |
| **Crew Required**  | 3 to 6 video techs                                 |
| **Power**          | 20A per 10 to 16 panels                            |
| **Footprint**      | Per panel (500mm x 500mm), ground support or flown |
| **Truck Space**    | Panels in road cases, 8 to 12 per case             |
| **Weather**        | `outdoor_rated`                                    |
| **Compliance**     | `RIGGING_CERT                                      | STRUCT_ENG`             |
| **Sustainability** | `REUSABLE                                          | LED_EFFICIENT           | ENERGY_EFFICIENT` |

###### Monitor - Confidence

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ---------------------------- | -------------------------- | --------------- | ----------------- |
| **Legacy Code**    | `TECH-1205`                                              |
| **SKU**            | `TECH-VIDO-LEDW-006`                                     |
| **UNSPSC**         | `45111600`                                               |
| **Common Name**    | Confidence Monitor                                       |
| **Search Aliases** | Presenter Monitor                                        | Stage Monitor                | Teleprompter               | Comfort Monitor | Downstage Monitor |
| **Description**    | On-stage confidence monitor for presenters or performers |
| **Specifications** | 15in through 24in                                        | Teleprompter-style available |
| **Options**        | Standard LCD                                             | Touch                        | Teleprompter (half-mirror) |
| **Modifiers**      | Size                                                     | Teleprompter                 | Stand                      | Quantity        |
| **Prerequisites**  | Video feed from switcher or playback, power              |
| **Pricing Unit**   | per unit/day                                             |
| **Lead Time**      | 336 hours                                                |
| **Setup Time**     | 4 to 8 hours (build, align, process)                     |
| **Strike Time**    | 2 to 4 hours                                             |
| **Crew Required**  | 3 to 6 video techs                                       |
| **Power**          | 20A per 10 to 16 panels                                  |
| **Footprint**      | Per panel (500mm x 500mm), ground support or flown       |
| **Truck Space**    | Panels in road cases, 8 to 12 per case                   |
| **Weather**        | `outdoor_rated`                                          |
| **Compliance**     | `RIGGING_CERT                                            | STRUCT_ENG`                  |
| **Sustainability** | `REUSABLE                                                | LED_EFFICIENT                | ENERGY_EFFICIENT`          |

[Back to top](#table-of-contents)

##### Cameras & Capture

###### Camera - IMAG

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ----------- | --------------- | ---------------- | ------- |
| **Legacy Code**    | `TECH-1210`                                           |
| **SKU**            | `TECH-VIDO-CAMR-001`                                  |
| **UNSPSC**         | `45121500`                                            |
| **Common Name**    | IMAG Camera                                           |
| **Search Aliases** | Broadcast Camera                                      | Live Camera | PTZ Camera      | Manned Camera    |
| **Description**    | Broadcast-quality camera for live image magnification |
| **Specifications** | PTZ, manned tripod, jib, or Steadicam                 |
| **Options**        | PTZ (remote)                                          | Manned ENG  | Manned Box Lens | Steadicam        | Robotic |
| **Modifiers**      | Camera Type                                           | Operator    | Lens            | Fiber or SDI Run |
| **Prerequisites**  | Video village, switcher, fiber or SDI infrastructure  |
| **Pricing Unit**   | per camera/day                                        |
| **Lead Time**      | 336 hours                                             |
| **Setup Time**     | 1 to 2 hours per camera position                      |
| **Strike Time**    | 30 to 60 min per position                             |
| **Crew Required**  | 1 operator per camera, 1 video director               |
| **Power**          | 20A per camera position                               |
| **Footprint**      | 4ft x 4ft per camera position                         |
| **Truck Space**    | 1 road case per camera plus accessories               |
| **Weather**        | `sheltered`                                           |
| **Sustainability** | `REUSABLE                                             | LOW_POWER`  |

###### Switcher - Video

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | -------------- | -------------------- | ---------------- |
| **Legacy Code**    | `TECH-1211`                                             |
| **SKU**            | `TECH-VIDO-CAMR-002`                                    |
| **UNSPSC**         | `45121500`                                              |
| **Common Name**    | Video Switcher                                          |
| **Search Aliases** | Production Switcher                                     | Vision Mixer   | Video Hub            | Live Switcher    |
| **Description**    | Live video switching system for multi-camera production |
| **Specifications** | 4-input through 16-input and above                      | With streaming |
| **Options**        | Blackmagic ATEM Mini Pro                                | Ross Carbonite | Grass Valley Kayenne |
| **Modifiers**      | Input Count                                             | Recording      | Streaming            | Graphics Overlay |
| **Prerequisites**  | Video village, power, monitoring, comms                 |
| **Pricing Unit**   | per system/day                                          |
| **Lead Time**      | 336 hours                                               |
| **Setup Time**     | 1 to 2 hours per camera position                        |
| **Strike Time**    | 30 to 60 min per position                               |
| **Crew Required**  | 1 operator per camera, 1 video director                 |
| **Power**          | 20A per camera position                                 |
| **Footprint**      | 4ft x 4ft per camera position                           |
| **Truck Space**    | 1 road case per camera plus accessories                 |
| **Weather**        | `sheltered`                                             |
| **Sustainability** | `REUSABLE                                               | LOW_POWER`     |

###### Livestream Package

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- | --------------------------------- | ------------------- | ------------------------ |
| **Legacy Code**    | `TECH-1212`                                                       |
| **SKU**            | `TECH-VIDO-CAMR-003`                                              |
| **UNSPSC**         | `45121500`                                                        |
| **Common Name**    | Livestream Package                                                |
| **Search Aliases** | Webcast                                                           | Live Broadcast                    | Streaming Rig       | Virtual Event Production |
| **Description**    | Complete livestream setup with encoding and CDN delivery          |
| **Specifications** | Single camera through multi-cam with graphics and remote guests   |
| **Options**        | Basic (single cam and encode)                                     | Standard (multi-cam and graphics) | Premium (broadcast) |
| **Modifiers**      | Camera Count                                                      | Platform (YouTube, Vimeo, custom) | Graphics            | Recording                |
| **Prerequisites**  | Reliable internet (25 Mbps or more upload), video production crew |
| **Pricing Unit**   | per event                                                         |
| **Lead Time**      | 336 hours                                                         |
| **Setup Time**     | 1 to 2 hours per camera position                                  |
| **Strike Time**    | 30 to 60 min per position                                         |
| **Crew Required**  | 1 operator per camera, 1 video director                           |
| **Power**          | 20A per camera position                                           |
| **Footprint**      | 4ft x 4ft per camera position                                     |
| **Truck Space**    | 1 road case per camera plus accessories                           |
| **Weather**        | `sheltered`                                                       |
| **Sustainability** | `REUSABLE                                                         | LOW_POWER`                        |

[Back to top](#table-of-contents)

##### Projection

###### Projector - Standard

|                    |                                                                |
| ------------------ | -------------------------------------------------------------- | -------------- | --------------- | ---------------------- | ------------------ |
| **Legacy Code**    | `TECH-1220`                                                    |
| **SKU**            | `TECH-VIDO-PROJ-001`                                           |
| **UNSPSC**         | `45111612`                                                     |
| **Common Name**    | Standard Projector                                             |
| **Search Aliases** | LCD Projector                                                  | DLP Projector  | Event Projector | Presentation Projector |
| **Description**    | LCD or DLP projector for presentations and basic projection    |
| **Specifications** | 5,000 through 15,000 lumens                                    |
| **Options**        | 5K                                                             | 8K             | 12K             | 15K lumens             | Short-Throw Option |
| **Modifiers**      | Lumens                                                         | Lens           | Screen (add-on) | Rigging or Mount       |
| **Prerequisites**  | Power (20A), dark or controlled environment, screen or surface |
| **Pricing Unit**   | per unit/day                                                   |
| **Lead Time**      | 168 hours                                                      |
| **Setup Time**     | 1 to 2 hours per projector                                     |
| **Strike Time**    | 30 to 60 min                                                   |
| **Crew Required**  | 1 video tech                                                   |
| **Power**          | 20A (standard) to 60A (large venue per projector)              |
| **Footprint**      | Projector (2ft x 2ft) plus screen                              |
| **Truck Space**    | 1 road case per projector                                      |
| **Weather**        | `sheltered`                                                    |
| **Sustainability** | `REUSABLE                                                      | LED_EFFICIENT` |

###### Projector - Large Venue

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | ------------------------- | ------------------------------ | -------------------- | --------- |
| **Legacy Code**    | `TECH-1221`                                                      |
| **SKU**            | `TECH-VIDO-PROJ-002`                                             |
| **UNSPSC**         | `45111612`                                                       |
| **Common Name**    | Large Venue Projector                                            |
| **Search Aliases** | Laser Projector                                                  | High-Brightness Projector | Cinema Projector               | Barco                |
| **Description**    | High-brightness laser projector for large venues and outdoor use |
| **Specifications** | 20,000 through 60,000 or more lumens                             |
| **Options**        | 20K                                                              | 30K                       | 40K                            | 60K+ lumens          | 4K Option |
| **Modifiers**      | Lumens                                                           | Lens                      | Stacking (brightness doubling) | Warping and Blending |
| **Prerequisites**  | Power (30 to 60A per unit), rigging or stacking, projectionist   |
| **Pricing Unit**   | per unit/day                                                     |
| **Lead Time**      | 168 hours                                                        |
| **Setup Time**     | 1 to 2 hours per projector                                       |
| **Strike Time**    | 30 to 60 min                                                     |
| **Crew Required**  | 1 video tech                                                     |
| **Power**          | 20A (standard) to 60A (large venue per projector)                |
| **Footprint**      | Projector (2ft x 2ft) plus screen                                |
| **Truck Space**    | 1 road case per projector                                        |
| **Weather**        | `sheltered`                                                      |
| **Sustainability** | `REUSABLE                                                        | LED_EFFICIENT`            |

###### Screen - Projection

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | ---------------------- | ------------ | ----------------- |
| **Legacy Code**    | `TECH-1222`                                               |
| **SKU**            | `TECH-VIDO-PROJ-003`                                      |
| **UNSPSC**         | `45111612`                                                |
| **Common Name**    | Projection Screen                                         |
| **Search Aliases** | Fast-Fold Screen                                          | Rear Projection Screen | Truss Screen | Inflatable Screen |
| **Description**    | Front or rear projection screen for presentations or IMAG |
| **Specifications** | 8ft through 20ft and above diagonal                       | Fast-fold or truss     |
| **Options**        | Fast-Fold (front)                                         | Fast-Fold (rear)       | Truss-Mount  | Inflatable        |
| **Modifiers**      | Size                                                      | Front or Rear          | Frame Type   |
| **Prerequisites**  | Rigging or floor space, projector alignment               |
| **Pricing Unit**   | per screen/day                                            |
| **Lead Time**      | 168 hours                                                 |
| **Setup Time**     | 1 to 2 hours per projector                                |
| **Strike Time**    | 30 to 60 min                                              |
| **Crew Required**  | 1 video tech                                              |
| **Power**          | 20A (standard) to 60A (large venue per projector)         |
| **Footprint**      | Projector (2ft x 2ft) plus screen                         |
| **Truck Space**    | 1 road case per projector                                 |
| **Weather**        | `sheltered`                                               |
| **Sustainability** | `REUSABLE                                                 | LED_EFFICIENT`         |

###### Projection Mapping

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- | ------------------------ | ------------------------- | -------------------- |
| **Legacy Code**    | `TECH-1223`                                                       |
| **SKU**            | `TECH-VIDO-PROJ-004`                                              |
| **UNSPSC**         | `45111612`                                                        |
| **Common Name**    | Projection Mapping                                                |
| **Search Aliases** | 3D Mapping                                                        | Architectural Projection | Spatial Mapping           | Immersive Projection |
| **Description**    | Custom projection mapping on architectural surfaces or objects    |
| **Specifications** | Single through multi-projector                                    | Interactive available    |
| **Options**        | Flat Surface                                                      | Architectural            | Sculptural                | Interactive          |
| **Modifiers**      | Surface Complexity                                                | Projector Count          | Content Creation (add-on) | Programmer           |
| **Prerequisites**  | Content design, site survey, projectors, media server, programmer |
| **Pricing Unit**   | per project                                                       |
| **Lead Time**      | 672 hours                                                         |
| **Setup Time**     | 1 to 3 days (survey, install, align, program)                     |
| **Strike Time**    | 4 to 8 hours                                                      |
| **Crew Required**  | 1 to 3 projectionist or media server ops, content designer        |
| **Power**          | 30A to 60A per projector                                          |
| **Footprint**      | Projector position (4ft x 4ft each), throw distance               |
| **Truck Space**    | 1 to 3 road cases per projector plus server                       |
| **Weather**        | `outdoor_rated`                                                   |
| **Sustainability** | `REUSABLE`                                                        |

[Back to top](#table-of-contents)

##### Playback & Processing

###### Media Server

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | -------------- | ---------------- | ---------------------- | -------- |
| **Legacy Code**    | `TECH-1230`                                                   |
| **SKU**            | `TECH-VIDO-PLAY-001`                                          |
| **UNSPSC**         | `45111700`                                                    |
| **Common Name**    | Media Server                                                  |
| **Search Aliases** | Video Server                                                  | Content Server | Playback Server  | Disguise               | Resolume |
| **Description**    | Professional media server for content playback and processing |
| **Specifications** | Disguise, Resolume, Watchout, Notch, or Green Hippo           |
| **Options**        | Disguise d3                                                   | Resolume Arena | Dataton Watchout | Green Hippo Hippotizer |
| **Modifiers**      | Platform                                                      | Output Count   | Content Pre-Load | Operator               |
| **Prerequisites**  | Content files (specs per platform), power, video outputs      |
| **Pricing Unit**   | per server/day                                                |
| **Lead Time**      | 336 hours                                                     |
| **Setup Time**     | 1 to 2 hours                                                  |
| **Strike Time**    | 30 to 60 min                                                  |
| **Crew Required**  | 1 media server operator                                       |
| **Power**          | 20A (UPS recommended)                                         |
| **Footprint**      | Rack-mount (2ft x 2ft)                                        |
| **Truck Space**    | 1 to 2 road cases                                             |
| **Weather**        | `sheltered`                                                   |
| **Sustainability** | `REUSABLE                                                     | LOW_POWER`     |

###### Processor - Video

|                    |                                                                       |
| ------------------ | --------------------------------------------------------------------- | -------------- | ------------------ | ------------------------- |
| **Legacy Code**    | `TECH-1231`                                                           |
| **SKU**            | `TECH-VIDO-PLAY-002`                                                  |
| **UNSPSC**         | `45111700`                                                            |
| **Common Name**    | Video Processor                                                       |
| **Search Aliases** | LED Processor                                                         | Scaler         | Video Router       | Presentation Switcher     |
| **Description**    | Video processing, scaling, and switching for LED walls and projection |
| **Specifications** | Novastar, Brompton, Barco E2, or Analog Way                           |
| **Options**        | Novastar (LED)                                                        | Brompton (LED) | Barco E2 (routing) | Analog Way (presentation) |
| **Modifiers**      | Inputs and Outputs                                                    | Resolution     | Layer Count        |
| **Prerequisites**  | Compatible with display system, video infrastructure                  |
| **Pricing Unit**   | per unit/day                                                          |
| **Lead Time**      | 336 hours                                                             |
| **Setup Time**     | 1 to 2 hours                                                          |
| **Strike Time**    | 30 to 60 min                                                          |
| **Crew Required**  | 1 media server operator                                               |
| **Power**          | 20A (UPS recommended)                                                 |
| **Footprint**      | Rack-mount (2ft x 2ft)                                                |
| **Truck Space**    | 1 to 2 road cases                                                     |
| **Weather**        | `sheltered`                                                           |
| **Sustainability** | `REUSABLE                                                             | LOW_POWER`     |

[Back to top](#table-of-contents)

#### Staging

##### Stage Decks & Risers

###### Stage Deck - 4x8

|                    |                                       |
| ------------------ | ------------------------------------- | ------------------------------------- | -------------------- | ----------------------- |
| **Legacy Code**    | `TECH-1300`                           |
| **SKU**            | `TECH-STAG-DECK-001`                  |
| **UNSPSC**         | `56101700`                            |
| **Common Name**    | 4x8 Stage Deck                        |
| **Search Aliases** | Stage Panel                           | Stage Platform                        | Modular Deck         | Stage Section           |
| **Description**    | Standard 4ft x 8ft modular stage deck |
| **Specifications** | 4x8ft                                 | 16in, 24in, 32in, or 48in leg heights |
| **Options**        | Carpet Top                            | Painted Black or Gray                 | Plywood (unfinished) |
| **Modifiers**      | Height                                | Quantity                              | Skirting (add-on)    | Steps or Ramps (add-on) |
| **Prerequisites**  | Level ground or leveling legs         |
| **Pricing Unit**   | per deck/day                          |
| **Lead Time**      | 168 hours                             |
| **Setup Time**     | 10 to 15 min per deck (with legs)     |
| **Strike Time**    | 5 to 10 min per deck                  |
| **Crew Required**  | 2 to 4 stagehands                     |
| **Power**          | None                                  |
| **Footprint**      | 4ft x 8ft or 4ft x 4ft per deck       |
| **Truck Space**    | Decks stack, 20 to 30 per 16ft truck  |
| **Weather**        | `outdoor_rated`                       |
| **Compliance**     | `ADA`                                 |
| **Sustainability** | `REUSABLE`                            |

###### Stage Deck - 4x4

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ------------------- | ----------------- | ------------------------- |
| **Legacy Code**    | `TECH-1301`                                           |
| **SKU**            | `TECH-STAG-DECK-002`                                  |
| **UNSPSC**         | `56101700`                                            |
| **Common Name**    | 4x4 Stage Deck                                        |
| **Search Aliases** | Fill Deck                                             | Square Deck         | Modular Riser     | Stage Filler              |
| **Description**    | 4ft x 4ft modular stage deck for fills and odd shapes |
| **Specifications** | 4x4ft                                                 | Same heights as 4x8 | Carpet or painted |
| **Options**        | Carpet                                                | Painted             | Plywood           |
| **Modifiers**      | Height                                                | Quantity            | Skirting          | Guard Rail (if over 30in) |
| **Pricing Unit**   | per deck/day                                          |
| **Lead Time**      | 168 hours                                             |
| **Setup Time**     | 10 to 15 min per deck (with legs)                     |
| **Strike Time**    | 5 to 10 min per deck                                  |
| **Crew Required**  | 2 to 4 stagehands                                     |
| **Power**          | None                                                  |
| **Footprint**      | 4ft x 8ft or 4ft x 4ft per deck                       |
| **Truck Space**    | Decks stack, 20 to 30 per 16ft truck                  |
| **Weather**        | `outdoor_rated`                                       |
| **Compliance**     | `ADA`                                                 |
| **Sustainability** | `REUSABLE`                                            |

###### Riser - Drum

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ---------------- | --------------------- | --------------- |
| **Legacy Code**    | `TECH-1302`                                              |
| **SKU**            | `TECH-STAG-DECK-003`                                     |
| **UNSPSC**         | `56101700`                                               |
| **Common Name**    | Rolling Drum Riser                                       |
| **Search Aliases** | Drum Riser                                               | Rolling Riser    | Platform Riser        | Band Riser      |
| **Description**    | Rolling riser platform for backline, drums, or equipment |
| **Specifications** | 6x6 or 8x8                                               | 8 to 24in height | Carpet top            | Locking casters |
| **Options**        | 6x6                                                      | 8x8              | With Wheels (rolling) | Custom Size     |
| **Modifiers**      | Size                                                     | Height           | Carpet Color          | Locking Casters |
| **Pricing Unit**   | per riser/day                                            |
| **Lead Time**      | 168 hours                                                |
| **Setup Time**     | 10 to 15 min per deck (with legs)                        |
| **Strike Time**    | 5 to 10 min per deck                                     |
| **Crew Required**  | 2 to 4 stagehands                                        |
| **Power**          | None                                                     |
| **Footprint**      | 4ft x 8ft or 4ft x 4ft per deck                          |
| **Truck Space**    | Decks stack, 20 to 30 per 16ft truck                     |
| **Weather**        | `outdoor_rated`                                          |
| **Compliance**     | `ADA`                                                    |
| **Sustainability** | `REUSABLE`                                               |

###### Stairs - Stage

|                    |                                     |
| ------------------ | ----------------------------------- | -------------------------------- | --------------------- | ---------------- |
| **Legacy Code**    | `TECH-1303`                         |
| **SKU**            | `TECH-STAG-DECK-004`                |
| **UNSPSC**         | `56101700`                          |
| **Common Name**    | Portable Stage Stairs               |
| **Search Aliases** | Stage Steps                         | Stair Unit                       | Access Steps          | Stage Staircase  |
| **Description**    | Portable staircase for stage access |
| **Specifications** | 2-step through 4-step               | Handrails and ADA ramp available |
| **Options**        | Standard Steps                      | With Handrails                   | ADA Ramp (1:12 slope) |
| **Modifiers**      | Width                               | Step Count                       | Handrails             | Non-Slip Surface |
| **Prerequisites**  | Match stage height                  |
| **Pricing Unit**   | per unit/day                        |
| **Lead Time**      | 168 hours                           |
| **Setup Time**     | 15 to 60 min depending on type      |
| **Strike Time**    | 10 to 30 min                        |
| **Crew Required**  | 2 to 4 stagehands                   |
| **Power**          | None (unless lit)                   |
| **Footprint**      | Varies                              |
| **Truck Space**    | Stacks or bundles, efficient        |
| **Weather**        | `outdoor_rated`                     |
| **Compliance**     | `ADA`                               |
| **Sustainability** | `REUSABLE`                          |

###### Runway - Stage

|                    |                                                                           |
| ------------------ | ------------------------------------------------------------------------- | --------------- | ------------- | --------------- | -------- |
| **Legacy Code**    | `TECH-1304`                                                               |
| **SKU**            | `TECH-STAG-DECK-005`                                                      |
| **UNSPSC**         | `56101700`                                                                |
| **Common Name**    | Stage Runway                                                              |
| **Search Aliases** | Catwalk                                                                   | Fashion Runway  | T-Stage       | Stage Extension |
| **Description**    | Extended stage platform for fashion, performance, or audience interaction |
| **Specifications** | 4ft wide                                                                  | 8ft sections    | With skirting | Lit or unlit    |
| **Options**        | Standard (skirted)                                                        | Lit (LED strip) | Clear Acrylic |
| **Modifiers**      | Length (sections)                                                         | Width           | Height        | Lighting        | Skirting |
| **Prerequisites**  | Support structure matching main stage height                              |
| **Pricing Unit**   | per section/day                                                           |
| **Lead Time**      | 168 hours                                                                 |
| **Setup Time**     | 30 to 60 min per 8ft section                                              |
| **Strike Time**    | 20 to 30 min per section                                                  |
| **Crew Required**  | 2 to 4 stagehands                                                         |
| **Power**          | 20A if lit                                                                |
| **Footprint**      | 4ft x 8ft per section                                                     |
| **Truck Space**    | Sections stack, 10 to 15 per truck                                        |
| **Weather**        | `outdoor_rated`                                                           |
| **Compliance**     | `ADA`                                                                     |
| **Sustainability** | `REUSABLE`                                                                |

###### Shell - Acoustic

|                    |                                                                        |
| ------------------ | ---------------------------------------------------------------------- | ------------------------ | ------------ | ----------------- |
| **Legacy Code**    | `TECH-1305`                                                            |
| **SKU**            | `TECH-STAG-DECK-006`                                                   |
| **UNSPSC**         | `56101700`                                                             |
| **Common Name**    | Acoustic Shell                                                         |
| **Search Aliases** | Orchestra Shell                                                        | Band Shell               | Sound Shell  | Performance Shell |
| **Description**    | Portable acoustic shell panels for orchestral and acoustic performance |
| **Specifications** | Wenger, StageRight, or custom                                          | Ceiling and side panels  |
| **Options**        | Wenger Diva                                                            | StageRight Acousti-Shell | Custom Build |
| **Modifiers**      | Panel Count                                                            | Ceiling Panels           | Width        | Depth             |
| **Prerequisites**  | Stage deck, assembly crew, storage truck                               |
| **Pricing Unit**   | per shell/day                                                          |
| **Lead Time**      | 168 hours                                                              |
| **Setup Time**     | 15 to 60 min depending on type                                         |
| **Strike Time**    | 10 to 30 min                                                           |
| **Crew Required**  | 2 to 4 stagehands                                                      |
| **Power**          | None (unless lit)                                                      |
| **Footprint**      | Varies                                                                 |
| **Truck Space**    | Stacks or bundles, efficient                                           |
| **Weather**        | `outdoor_rated`                                                        |
| **Compliance**     | `ADA`                                                                  |
| **Sustainability** | `REUSABLE`                                                             |

[Back to top](#table-of-contents)

##### Stage Infrastructure

###### Pipe and Drape

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | -------------------------------- | --------------- | ------------- | ----- |
| **Legacy Code**    | `TECH-1310`                                               |
| **SKU**            | `TECH-STAG-SINF-001`                                      |
| **UNSPSC**         | `56101800`                                                |
| **Common Name**    | Pipe and Drape                                            |
| **Search Aliases** | Pipe and Drape                                            | Drape Wall                       | Fabric Backdrop | Masking Drape |
| **Description**    | Adjustable pipe and drape system for masking and backdrop |
| **Specifications** | 8 to 20ft uprights                                        | Various drape colors and fabrics |
| **Options**        | Black                                                     | White                            | Silver Gray     | Custom Color  | Sheer |
| **Modifiers**      | Height                                                    | Width (per run)                  | Drape Color     | Drape Fabric  |
| **Prerequisites**  | Level floor, weighted bases or tie-off points             |
| **Pricing Unit**   | per linear ft/day                                         |
| **Lead Time**      | 336 hours                                                 |
| **Setup Time**     | 4 to 8 hours                                              |
| **Strike Time**    | 3 to 6 hours                                              |
| **Crew Required**  | 3 to 6 tent crew                                          |
| **Power**          | Per lighting and HVAC package                             |
| **Footprint**      | Varies (20x20 to 60x120)                                  |
| **Truck Space**    | 1 to 2 box trucks per tent                                |
| **Weather**        | `outdoor_rated`                                           |
| **Compliance**     | `ADA                                                      | FIRE_MARSHAL                     | TENT_PERMIT`    |
| **Sustainability** | `REUSABLE`                                                |

###### Backdrop - Custom Print

|                    |                                               |
| ------------------ | --------------------------------------------- | ----------------- | --------------------- | ----------- |
| **Legacy Code**    | `TECH-1311`                                   |
| **SKU**            | `TECH-STAG-SINF-002`                          |
| **UNSPSC**         | `56101800`                                    |
| **Common Name**    | Custom Printed Backdrop                       |
| **Search Aliases** | Stage Backdrop                                | Photo Backdrop    | Step and Repeat       | Scenic Drop |
| **Description**    | Custom printed fabric or vinyl stage backdrop |
| **Specifications** | 10x20 through custom size                     | Various materials |
| **Options**        | Fabric (wrinkle-free)                         | Vinyl             | Mesh                  | Seamless    |
| **Modifiers**      | Size                                          | Material          | Print (one-time cost) | Rigging     |
| **Prerequisites**  | Rigging pipe or truss, design file            |
| **Pricing Unit**   | per backdrop/day                              |
| **Lead Time**      | 336 hours                                     |
| **Setup Time**     | 4 to 8 hours                                  |
| **Strike Time**    | 3 to 6 hours                                  |
| **Crew Required**  | 3 to 6 tent crew                              |
| **Power**          | Per lighting and HVAC package                 |
| **Footprint**      | Varies (20x20 to 60x120)                      |
| **Truck Space**    | 1 to 2 box trucks per tent                    |
| **Weather**        | `outdoor_rated`                               |
| **Compliance**     | `ADA                                          | FIRE_MARSHAL      | TENT_PERMIT`          |
| **Sustainability** | `REUSABLE`                                    |

###### Skirting - Stage

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ------------ | -------------- | ---------------------- |
| **Legacy Code**    | `TECH-1312`                                              |
| **SKU**            | `TECH-STAG-SINF-003`                                     |
| **UNSPSC**         | `56101800`                                               |
| **Common Name**    | Stage Skirting                                           |
| **Search Aliases** | Stage Skirt                                              | Deck Skirt   | Platform Skirt | Valance                |
| **Description**    | Fabric skirting to conceal stage legs and understructure |
| **Specifications** | Poly-knit, velour, box pleat, or shirred                 |
| **Options**        | Black                                                    | White        | Custom Color   | With Velcro Attachment |
| **Modifiers**      | Length (linear ft)                                       | Height       | Style          | Attachment Method      |
| **Prerequisites**  | Matching stage deck height                               |
| **Pricing Unit**   | per linear ft/day                                        |
| **Lead Time**      | 336 hours                                                |
| **Setup Time**     | 4 to 8 hours                                             |
| **Strike Time**    | 3 to 6 hours                                             |
| **Crew Required**  | 3 to 6 tent crew                                         |
| **Power**          | Per lighting and HVAC package                            |
| **Footprint**      | Varies (20x20 to 60x120)                                 |
| **Truck Space**    | 1 to 2 box trucks per tent                               |
| **Weather**        | `outdoor_rated`                                          |
| **Compliance**     | `ADA                                                     | FIRE_MARSHAL | TENT_PERMIT`   |
| **Sustainability** | `REUSABLE`                                               |

###### Ramp - Photo Pit

|                    |                                                                    |
| ------------------ | ------------------------------------------------------------------ | ------------------- | ---------------- | --------- |
| **Legacy Code**    | `TECH-1313`                                                        |
| **SKU**            | `TECH-STAG-SINF-004`                                               |
| **UNSPSC**         | `56101800`                                                         |
| **Common Name**    | Photo Pit Ramp                                                     |
| **Search Aliases** | Barricade Ramp                                                     | Photographer Access | Pit Access Ramp  |
| **Description**    | ADA-compliant ramp from stage to crowd barricade for photographers |
| **Specifications** | 4ft wide                                                           | 1:12 slope          | Non-slip surface | Handrails |
| **Options**        | Standard                                                           | With Handrails      | Covered          |
| **Modifiers**      | Width                                                              | Length              | Handrails        |
| **Prerequisites**  | Stage and barricade at compatible heights                          |
| **Pricing Unit**   | per unit/day                                                       |
| **Lead Time**      | 336 hours                                                          |
| **Setup Time**     | 4 to 8 hours                                                       |
| **Strike Time**    | 3 to 6 hours                                                       |
| **Crew Required**  | 3 to 6 tent crew                                                   |
| **Power**          | Per lighting and HVAC package                                      |
| **Footprint**      | Varies (20x20 to 60x120)                                           |
| **Truck Space**    | 1 to 2 box trucks per tent                                         |
| **Weather**        | `outdoor_rated`                                                    |
| **Compliance**     | `ADA                                                               | FIRE_MARSHAL        | TENT_PERMIT`     |
| **Sustainability** | `REUSABLE`                                                         |

[Back to top](#table-of-contents)

#### Rigging

##### Truss

###### Truss - 12in Box

|                    |                                                 |
| ------------------ | ----------------------------------------------- | ---------------- | --------------------- | -------------- | ----- | ------- | ------- |
| **Legacy Code**    | `TECH-1400`                                     |
| **SKU**            | `TECH-RIGG-TRUS-001`                            |
| **UNSPSC**         | `31162400`                                      |
| **Common Name**    | 12-Inch Box Truss                               |
| **Search Aliases** | Light Truss                                     | Mini Truss       | 12in Truss            | Exhibit Truss  |
| **Description**    | 12-inch aluminum box truss for light-duty spans |
| **Specifications** | 10ft, 8ft, 5ft, 4ft, or 2.5ft sections          | 6061-T6 aluminum |
| **Options**        | 10ft                                            | 8ft              | 5ft                   | 4ft            | 2.5ft | Corners | Circles |
| **Modifiers**      | Length                                          | Quantity         | Corners and Junctions | Spigot or Bolt |
| **Prerequisites**  | Rigging hardware, load calculations             |
| **Pricing Unit**   | per section/day                                 |
| **Lead Time**      | 168 hours                                       |
| **Setup Time**     | 15 to 30 min per section (assembly)             |
| **Strike Time**    | 10 to 20 min per section                        |
| **Crew Required**  | 2 to 4 riggers (certified for overhead)         |
| **Power**          | None (truss only)                               |
| **Footprint**      | Per section (2ft x 10ft typical)                |
| **Truck Space**    | Sections stack or nest, 10 to 20 per truck      |
| **Weather**        | `all_weather`                                   |
| **Compliance**     | `RIGGING_CERT                                   | STRUCT_ENG`      |
| **Sustainability** | `REUSABLE                                       | RECYCLABLE`      |

###### Truss - 20.5in Box

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | -------------- | -------------- | -------------------- | ------- | ------ |
| **Legacy Code**    | `TECH-1401`                                                     |
| **SKU**            | `TECH-RIGG-TRUS-002`                                            |
| **UNSPSC**         | `31162400`                                                      |
| **Common Name**    | 20.5-Inch Box Truss                                             |
| **Search Aliases** | Medium Truss                                                    | Standard Truss | Stage Truss    | Lighting Truss       |
| **Description**    | 20.5-inch aluminum box truss for medium-duty stage and lighting |
| **Specifications** | 10ft, 8ft, or 5ft sections                                      | Spigoted       | Various brands |
| **Options**        | 10ft                                                            | 8ft            | 5ft            | Corners              | Circles | Custom |
| **Modifiers**      | Length                                                          | Quantity       | Connectors     | Cross-Brand Adapters |
| **Prerequisites**  | Rigging hardware, structural calculations for loads             |
| **Pricing Unit**   | per section/day                                                 |
| **Lead Time**      | 168 hours                                                       |
| **Setup Time**     | 15 to 30 min per section (assembly)                             |
| **Strike Time**    | 10 to 20 min per section                                        |
| **Crew Required**  | 2 to 4 riggers (certified for overhead)                         |
| **Power**          | None (truss only)                                               |
| **Footprint**      | Per section (2ft x 10ft typical)                                |
| **Truck Space**    | Sections stack or nest, 10 to 20 per truck                      |
| **Weather**        | `all_weather`                                                   |
| **Compliance**     | `RIGGING_CERT                                                   | STRUCT_ENG`    |
| **Sustainability** | `REUSABLE                                                       | RECYCLABLE`    |

###### Truss - 30in GP

|                    |                                                                       |
| ------------------ | --------------------------------------------------------------------- | --------------------------- | --------------------------------------------------- | -------------- | ----------- |
| **Legacy Code**    | `TECH-1402`                                                           |
| **SKU**            | `TECH-RIGG-TRUS-003`                                                  |
| **UNSPSC**         | `31162400`                                                            |
| **Common Name**    | 30-Inch General Purpose Truss                                         |
| **Search Aliases** | GP Truss                                                              | Heavy Truss                 | Ground Support Truss                                | Roof Truss     |
| **Description**    | 30-inch general purpose truss for heavy-duty spans and ground support |
| **Specifications** | 10ft, 8ft, or 5ft sections                                            | GP towers and sleeve blocks |
| **Options**        | 10ft                                                                  | 8ft                         | 5ft                                                 | Tower Sections | Base Plates |
| **Modifiers**      | Length                                                                | Quantity                    | Ground Support (towers, sleeve blocks, base plates) |
| **Prerequisites**  | Structural engineering for large spans, forklift for assembly         |
| **Pricing Unit**   | per section/day                                                       |
| **Lead Time**      | 168 hours                                                             |
| **Setup Time**     | 15 to 30 min per section (assembly)                                   |
| **Strike Time**    | 10 to 20 min per section                                              |
| **Crew Required**  | 2 to 4 riggers (certified for overhead)                               |
| **Power**          | None (truss only)                                                     |
| **Footprint**      | Per section (2ft x 10ft typical)                                      |
| **Truck Space**    | Sections stack or nest, 10 to 20 per truck                            |
| **Weather**        | `all_weather`                                                         |
| **Compliance**     | `RIGGING_CERT                                                         | STRUCT_ENG`                 |
| **Sustainability** | `REUSABLE                                                             | RECYCLABLE`                 |

###### Truss - Circle

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | --------------------------------- | ------------- | ------------ |
| **Legacy Code**    | `TECH-1403`                                             |
| **SKU**            | `TECH-RIGG-TRUS-004`                                    |
| **UNSPSC**         | `31162400`                                              |
| **Common Name**    | Circle Truss                                            |
| **Search Aliases** | Curved Truss                                            | Arc Truss                         | Ring Truss    | Radius Truss |
| **Description**    | Pre-curved truss sections for circular or custom shapes |
| **Specifications** | Various radii                                           | 12in, 20.5in, or 30in chord sizes |
| **Options**        | Quarter Circle                                          | Half Circle                       | Full Circle   | Custom Arc   |
| **Modifiers**      | Diameter                                                | Chord Size                        | Section Count |
| **Prerequisites**  | Rigging or ground support for full assembly             |
| **Pricing Unit**   | per section/day                                         |
| **Lead Time**      | 168 hours                                               |
| **Setup Time**     | 15 to 30 min per section (assembly)                     |
| **Strike Time**    | 10 to 20 min per section                                |
| **Crew Required**  | 2 to 4 riggers (certified for overhead)                 |
| **Power**          | None (truss only)                                       |
| **Footprint**      | Per section (2ft x 10ft typical)                        |
| **Truck Space**    | Sections stack or nest, 10 to 20 per truck              |
| **Weather**        | `all_weather`                                           |
| **Compliance**     | `RIGGING_CERT                                           | STRUCT_ENG`                       |
| **Sustainability** | `REUSABLE                                               | RECYCLABLE`                       |

[Back to top](#table-of-contents)

##### Motors & Chain Hoists

###### Chain Motor - Half Ton

|                    |                                                                          |
| ------------------ | ------------------------------------------------------------------------ | ------------- | ------------------- | ---------------- |
| **Legacy Code**    | `TECH-1410`                                                              |
| **SKU**            | `TECH-RIGG-MOTR-001`                                                     |
| **UNSPSC**         | `24102000`                                                               |
| **Common Name**    | Half-Ton Chain Motor                                                     |
| **Search Aliases** | 1/2 Ton Motor                                                            | 1000 lb Hoist | CM Lodestar         | Chain Hoist      |
| **Description**    | Half-ton (1,000 lb) electric chain hoist for lighting and scenic rigging |
| **Specifications** | 1/2 ton capacity                                                         | 60ft chain    | Variable speed      |
| **Options**        | CM Lodestar                                                              | Chainmaster   | Movecat             | With Controller  |
| **Modifiers**      | Quantity                                                                 | Chain Length  | Controller (add-on) | Rigging Hardware |
| **Prerequisites**  | Rated rigging points, qualified rigger, power                            |
| **Pricing Unit**   | per unit/day                                                             |
| **Lead Time**      | 168 hours                                                                |
| **Setup Time**     | 30 to 60 min per motor (rig, chain, connect)                             |
| **Strike Time**    | 20 to 30 min per motor                                                   |
| **Crew Required**  | 1 rigger per motor, head rigger for oversight                            |
| **Power**          | 15A per motor (motor controller distributes)                             |
| **Footprint**      | 12in x 18in per motor body                                               |
| **Truck Space**    | 2 to 4 per road case                                                     |
| **Weather**        | `sheltered`                                                              |
| **Compliance**     | `ANSI`                                                                   |
| **Sustainability** | `REUSABLE`                                                               |

###### Chain Motor - One Ton

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- | -------------- | ---------------- | ------------------ |
| **Legacy Code**    | `TECH-1411`                                                       |
| **SKU**            | `TECH-RIGG-MOTR-002`                                              |
| **UNSPSC**         | `24102000`                                                        |
| **Common Name**    | One-Ton Chain Motor                                               |
| **Search Aliases** | 1 Ton Motor                                                       | 2000 lb Hoist  | Heavy Duty Motor |
| **Description**    | One ton (2,000 lb) electric chain hoist for heavy loads           |
| **Specifications** | 1 ton capacity                                                    | 60ft chain     | Variable speed   |
| **Options**        | CM Lodestar 1T                                                    | Chainmaster 1T | With Controller  |
| **Modifiers**      | Quantity                                                          | Chain Length   | Controller       | Motor Distribution |
| **Prerequisites**  | Rated rigging points, structural engineer signoff for heavy loads |
| **Pricing Unit**   | per unit/day                                                      |
| **Lead Time**      | 168 hours                                                         |
| **Setup Time**     | 30 to 60 min per motor (rig, chain, connect)                      |
| **Strike Time**    | 20 to 30 min per motor                                            |
| **Crew Required**  | 1 rigger per motor, head rigger for oversight                     |
| **Power**          | 15A per motor (motor controller distributes)                      |
| **Footprint**      | 12in x 18in per motor body                                        |
| **Truck Space**    | 2 to 4 per road case                                              |
| **Weather**        | `sheltered`                                                       |
| **Compliance**     | `ANSI`                                                            |
| **Sustainability** | `REUSABLE`                                                        |

###### Tower - Ground Support

|                    |                                                                           |
| ------------------ | ------------------------------------------------------------------------- | -------------- | ------------------ | ---------------- |
| **Legacy Code**    | `TECH-1412`                                                               |
| **SKU**            | `TECH-RIGG-MOTR-003`                                                      |
| **UNSPSC**         | `24102000`                                                                |
| **Common Name**    | Ground Support Tower                                                      |
| **Search Aliases** | Truss Tower                                                               | Crank-Up Tower | Freestanding Tower | GP Tower System  |
| **Description**    | Freestanding truss tower system requiring no ceiling rigging              |
| **Specifications** | Base plates, towers, sleeves, top truss, outriggers                       |
| **Options**        | 20ft                                                                      | 24ft           | 30ft               | 35ft Trim Height |
| **Modifiers**      | Trim Height                                                               | Top Truss Span | Load Capacity      | Ballast          |
| **Prerequisites**  | Level ground, ballast (water barrels or concrete), structural engineering |
| **Pricing Unit**   | per tower set/day                                                         |
| **Lead Time**      | 168 hours                                                                 |
| **Setup Time**     | 30 to 60 min per motor (rig, chain, connect)                              |
| **Strike Time**    | 20 to 30 min per motor                                                    |
| **Crew Required**  | 1 rigger per motor, head rigger for oversight                             |
| **Power**          | 15A per motor (motor controller distributes)                              |
| **Footprint**      | 12in x 18in per motor body                                                |
| **Truck Space**    | 2 to 4 per road case                                                      |
| **Weather**        | `sheltered`                                                               |
| **Compliance**     | `ANSI`                                                                    |
| **Sustainability** | `REUSABLE`                                                                |

[Back to top](#table-of-contents)

##### Rigging Hardware

###### Hardware Bundle - Rigging

|                    |                                                                                 |
| ------------------ | ------------------------------------------------------------------------------- | ----------------- | ---------- | ------------ | ------------ | ----------- |
| **Legacy Code**    | `TECH-1415`                                                                     |
| **SKU**            | `TECH-RIGG-RGHW-001`                                                            |
| **UNSPSC**         | `31162200`                                                                      |
| **Common Name**    | Rigging Hardware Bundle                                                         |
| **Search Aliases** | Shackles                                                                        | Spansets          | Steels     | Turnbuckles  | Round Slings | Rigging Kit |
| **Description**    | Assorted rigging hardware including shackles, spansets, steels, and turnbuckles |
| **Specifications** | Rated WLL per component                                                         | Steel or aluminum |
| **Options**        | Shackle Set                                                                     | Spanset Bundle    | Steel Set  | Mixed Bundle |
| **Modifiers**      | Bundle Type                                                                     | Quantity          | WLL Rating |
| **Prerequisites**  | Qualified rigger for all overhead loads                                         |
| **Pricing Unit**   | per bundle/day                                                                  |
| **Lead Time**      | 24 hours                                                                        |
| **Setup Time**     | Immediate (unpack)                                                              |
| **Strike Time**    | 5 min (repack)                                                                  |
| **Crew Required**  | 1 person                                                                        |
| **Power**          | 20A for power tools                                                             |
| **Footprint**      | Minimal (tool box or case)                                                      |
| **Truck Space**    | 1 to 2 road cases                                                               |
| **Weather**        | `outdoor_rated`                                                                 |
| **Compliance**     | `OSHA`                                                                          |
| **Sustainability** | `REUSABLE`                                                                      |

[Back to top](#table-of-contents)

#### Backline

##### Amplifiers & Cabinets

###### Amplifier - Guitar

|                    |                                                                     |
| ------------------ | ------------------------------------------------------------------- | ------------------------- | ----------- | ------------------- | --------- |
| **Legacy Code**    | `TECH-1500`                                                         |
| **SKU**            | `TECH-BKLN-AMPL-001`                                                |
| **UNSPSC**         | `60131100`                                                          |
| **Common Name**    | Guitar Amplifier                                                    |
| **Search Aliases** | Guitar Amp                                                          | Guitar Head               | Guitar Cab  | Amp and Cabinet     | Combo Amp |
| **Description**    | Professional guitar amplifier head and cabinet for live performance |
| **Specifications** | Various models and configurations                                   |
| **Options**        | Fender Twin Reverb                                                  | Marshall JCM800 with 4x12 | Vox AC30    | Mesa Dual Rectifier |
| **Modifiers**      | Head and Cab vs Combo                                               | Model                     | Spare Tubes |
| **Prerequisites**  | Power (20A), stage position                                         |
| **Pricing Unit**   | per unit/day                                                        |
| **Lead Time**      | 168 hours                                                           |
| **Setup Time**     | 15 to 30 min per unit                                               |
| **Strike Time**    | 10 to 20 min per unit                                               |
| **Crew Required**  | 1 backline tech                                                     |
| **Power**          | 20A per amp or keyboard position                                    |
| **Footprint**      | 2ft x 2ft (amp) to 6ft x 6ft (drum kit)                             |
| **Truck Space**    | 1 road case per unit or kit                                         |
| **Weather**        | `sheltered`                                                         |
| **Sustainability** | `REUSABLE`                                                          |

###### Amplifier - Bass

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- | ------------------ | -------- | ------------- | ---------- |
| **Legacy Code**    | `TECH-1501`                                                       |
| **SKU**            | `TECH-BKLN-AMPL-002`                                              |
| **UNSPSC**         | `60131100`                                                        |
| **Common Name**    | Bass Amplifier                                                    |
| **Search Aliases** | Bass Amp                                                          | Bass Head          | Bass Rig | Bass Cabinet  | Bass Stack |
| **Description**    | Professional bass amplifier head and cabinet for live performance |
| **Specifications** | Various models and configurations                                 |
| **Options**        | Ampeg SVT-CL with 8x10                                            | Fender Bassman 800 | Markbass | Aguilar DB751 |
| **Modifiers**      | Head and Cab                                                      | Model              |
| **Prerequisites**  | Power (20A), stage position                                       |
| **Pricing Unit**   | per unit/day                                                      |
| **Lead Time**      | 168 hours                                                         |
| **Setup Time**     | 15 to 30 min per unit                                             |
| **Strike Time**    | 10 to 20 min per unit                                             |
| **Crew Required**  | 1 backline tech                                                   |
| **Power**          | 20A per amp or keyboard position                                  |
| **Footprint**      | 2ft x 2ft (amp) to 6ft x 6ft (drum kit)                           |
| **Truck Space**    | 1 road case per unit or kit                                       |
| **Weather**        | `sheltered`                                                       |
| **Sustainability** | `REUSABLE`                                                        |

[Back to top](#table-of-contents)

##### Keyboards & Controllers

###### Keyboard - Stage

|                    |                                            |
| ------------------ | ------------------------------------------ | ------------------------ | ---------------- | ------------ | ---- |
| **Legacy Code**    | `TECH-1510`                                |
| **SKU**            | `TECH-BKLN-KEYS-001`                       |
| **UNSPSC**         | `60131200`                                 |
| **Common Name**    | Stage Keyboard                             |
| **Search Aliases** | Synthesizer                                | Digital Piano            | Stage Piano      | Workstation  | Keys |
| **Description**    | Professional stage keyboard or synthesizer |
| **Specifications** | Various models from leading manufacturers  |
| **Options**        | Nord Stage 4 88                            | Yamaha Montage M8x       | Roland Fantom 08 | Moog One     |
| **Modifiers**      | Model                                      | Stand (X, Z, or A-frame) | Sustain Pedal    | Volume Pedal |
| **Pricing Unit**   | per unit/day                               |
| **Lead Time**      | 168 hours                                  |
| **Setup Time**     | 15 to 30 min per unit                      |
| **Strike Time**    | 10 to 20 min per unit                      |
| **Crew Required**  | 1 backline tech                            |
| **Power**          | 20A per amp or keyboard position           |
| **Footprint**      | 2ft x 2ft (amp) to 6ft x 6ft (drum kit)    |
| **Truck Space**    | 1 road case per unit or kit                |
| **Weather**        | `sheltered`                                |
| **Sustainability** | `REUSABLE`                                 |

###### Stand - Keyboard

|                    |                                                    |
| ------------------ | -------------------------------------------------- | ---------- | -------- | ------------ | ----------------- |
| **Legacy Code**    | `TECH-1511`                                        |
| **SKU**            | `TECH-BKLN-KEYS-002`                               |
| **UNSPSC**         | `60131200`                                         |
| **Common Name**    | Keyboard Stand                                     |
| **Search Aliases** | Key Stand                                          | X-Stand    | Z-Stand  | Column Stand | Double-Tier Stand |
| **Description**    | Professional keyboard stand for stage use          |
| **Specifications** | X-stand, Z-stand (column), A-frame, or double-tier |
| **Options**        | X-Stand                                            | Z-Stand    | A-Frame  | Double-Tier  | Triple-Tier       |
| **Modifiers**      | Type                                               | Tier Count | Quantity |
| **Pricing Unit**   | per unit/day                                       |
| **Lead Time**      | 168 hours                                          |
| **Setup Time**     | 15 to 30 min per unit                              |
| **Strike Time**    | 10 to 20 min per unit                              |
| **Crew Required**  | 1 backline tech                                    |
| **Power**          | 20A per amp or keyboard position                   |
| **Footprint**      | 2ft x 2ft (amp) to 6ft x 6ft (drum kit)            |
| **Truck Space**    | 1 road case per unit or kit                        |
| **Weather**        | `sheltered`                                        |
| **Sustainability** | `REUSABLE`                                         |

[Back to top](#table-of-contents)

##### Drum Kits

###### Drum Kit - Acoustic

|                    |                                                     |
| ------------------ | --------------------------------------------------- | ------------------------- | --------------- | ------------- |
| **Legacy Code**    | `TECH-1520`                                         |
| **SKU**            | `TECH-BKLN-DRUM-001`                                |
| **UNSPSC**         | `60131300`                                          |
| **Common Name**    | Acoustic Drum Kit                                   |
| **Search Aliases** | Drum Set                                            | Drum Kit                  | Acoustic Drums  | Live Drum Kit |
| **Description**    | Professional acoustic drum kit for live performance |
| **Specifications** | Various brands and sizes                            |
| **Options**        | Standard 5-Piece (kick, snare, 3 toms)              | 4-Piece                   | 6-Piece or More | With Hardware |
| **Modifiers**      | Brand and Size                                      | Hardware (stands, pedals) | Heads (new)     | Throne        |
| **Pricing Unit**   | per kit/day                                         |
| **Lead Time**      | 168 hours                                           |
| **Setup Time**     | 15 to 30 min per unit                               |
| **Strike Time**    | 10 to 20 min per unit                               |
| **Crew Required**  | 1 backline tech                                     |
| **Power**          | 20A per amp or keyboard position                    |
| **Footprint**      | 2ft x 2ft (amp) to 6ft x 6ft (drum kit)             |
| **Truck Space**    | 1 road case per unit or kit                         |
| **Weather**        | `sheltered`                                         |
| **Sustainability** | `REUSABLE`                                          |

###### Drum Kit - Electronic

|                    |                                                     |
| ------------------ | --------------------------------------------------- | -------------- | ---------------------- | ---------------- |
| **Legacy Code**    | `TECH-1521`                                         |
| **SKU**            | `TECH-BKLN-DRUM-002`                                |
| **UNSPSC**         | `60131300`                                          |
| **Common Name**    | Electronic Drum Kit                                 |
| **Search Aliases** | E-Kit                                               | Electric Drums | Digital Drums          | Mesh Head Kit    |
| **Description**    | Electronic drum kit with sound module and mesh pads |
| **Specifications** | Various models                                      |
| **Options**        | Roland TD-50X                                       | Roland TD-27KV | Yamaha DTX10K-M        |
| **Modifiers**      | Model                                               | Module         | Extra Pads and Cymbals | Monitor (add-on) |
| **Prerequisites**  | DI or direct output to FOH                          |
| **Pricing Unit**   | per kit/day                                         |
| **Lead Time**      | 168 hours                                           |
| **Setup Time**     | 15 to 30 min per unit                               |
| **Strike Time**    | 10 to 20 min per unit                               |
| **Crew Required**  | 1 backline tech                                     |
| **Power**          | 20A per amp or keyboard position                    |
| **Footprint**      | 2ft x 2ft (amp) to 6ft x 6ft (drum kit)             |
| **Truck Space**    | 1 road case per unit or kit                         |
| **Weather**        | `sheltered`                                         |
| **Sustainability** | `REUSABLE`                                          |

[Back to top](#table-of-contents)

##### Miscellaneous Backline

###### Stand - Music

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ------------- | ---------------- | --------------- |
| **Legacy Code**    | `TECH-1530`                                          |
| **SKU**            | `TECH-BKLN-MISC-001`                                 |
| **UNSPSC**         | `60131400`                                           |
| **Common Name**    | Music Stand                                          |
| **Search Aliases** | Sheet Music Stand                                    | Folding Stand | Conductor Stand  | Orchestra Stand |
| **Description**    | Professional folding music stand with optional light |
| **Specifications** | Standard, heavy-duty (orchestral), or conductor      |
| **Options**        | Standard Folding                                     | Heavy-Duty    | Conductor        | With LED Light  |
| **Modifiers**      | Type                                                 | Quantity      | Light Attachment |
| **Pricing Unit**   | per unit/day                                         |
| **Lead Time**      | 168 hours                                            |
| **Setup Time**     | 15 to 30 min per unit                                |
| **Strike Time**    | 10 to 20 min per unit                                |
| **Crew Required**  | 1 backline tech                                      |
| **Power**          | 20A per amp or keyboard position                     |
| **Footprint**      | 2ft x 2ft (amp) to 6ft x 6ft (drum kit)              |
| **Truck Space**    | 1 road case per unit or kit                          |
| **Weather**        | `sheltered`                                          |
| **Sustainability** | `REUSABLE`                                           |

###### Guitar or Bass - Rental

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | --------------- | --------------- | ----------------------------- |
| **Legacy Code**    | `TECH-1531`                                            |
| **SKU**            | `TECH-BKLN-MISC-002`                                   |
| **UNSPSC**         | `60131400`                                             |
| **Common Name**    | Rental Guitar or Bass                                  |
| **Search Aliases** | Backline Guitar                                        | Spare Guitar    | House Guitar    | Emergency Backline            |
| **Description**    | Rental guitar or bass for backline or emergency backup |
| **Specifications** | Electric guitar, acoustic guitar, or bass guitar       |
| **Options**        | Fender Stratocaster or Telecaster                      | Gibson Les Paul | Taylor Acoustic | Fender Precision or Jazz Bass |
| **Modifiers**      | Type                                                   | Model           | Case and Stand  | Fresh Strings                 |
| **Pricing Unit**   | per unit/day                                           |
| **Lead Time**      | 168 hours                                              |
| **Setup Time**     | 15 to 30 min per unit                                  |
| **Strike Time**    | 10 to 20 min per unit                                  |
| **Crew Required**  | 1 backline tech                                        |
| **Power**          | 20A per amp or keyboard position                       |
| **Footprint**      | 2ft x 2ft (amp) to 6ft x 6ft (drum kit)                |
| **Truck Space**    | 1 road case per unit or kit                            |
| **Weather**        | `sheltered`                                            |
| **Sustainability** | `REUSABLE`                                             |

###### Percussion Kit

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ------ | -------- | -------- | -------------------- |
| **Legacy Code**    | `TECH-1532`                                           |
| **SKU**            | `TECH-BKLN-MISC-003`                                  |
| **UNSPSC**         | `60131400`                                            |
| **Common Name**    | Auxiliary Percussion Kit                              |
| **Search Aliases** | Percussion Set                                        | Congas | Bongos   | Timbales | Cajon                |
| **Description**    | Auxiliary percussion instruments for live performance |
| **Specifications** | Congas, bongos, timbales, cajon, shakers, and bells   |
| **Options**        | Congas (pair)                                         | Bongos | Timbales | Cajon    | Mixed Percussion Kit |
| **Modifiers**      | Instruments                                           | Stands | Hardware |
| **Pricing Unit**   | per kit/day                                           |
| **Lead Time**      | 168 hours                                             |
| **Setup Time**     | 15 to 30 min per unit                                 |
| **Strike Time**    | 10 to 20 min per unit                                 |
| **Crew Required**  | 1 backline tech                                       |
| **Power**          | 20A per amp or keyboard position                      |
| **Footprint**      | 2ft x 2ft (amp) to 6ft x 6ft (drum kit)               |
| **Truck Space**    | 1 road case per unit or kit                           |
| **Weather**        | `sheltered`                                           |
| **Sustainability** | `REUSABLE`                                            |

[Back to top](#table-of-contents)

---

### Hospitality

_20 items_

#### Catering

##### Artist & Crew Catering

###### Meal Service - Artist

|                    |                                                                           |
| ------------------ | ------------------------------------------------------------------------- | ---------------------- | -------------------------------- | --------------------- |
| **Legacy Code**    | `HOSP-1001`                                                               |
| **SKU**            | `HOSP-CATR-ARTC-001`                                                      |
| **UNSPSC**         | `90101600`                                                                |
| **Common Name**    | Artist Meal Service                                                       |
| **Search Aliases** | Artist Catering                                                           | Talent Meal            | Rider Catering                   | Band Meal             |
| **Description**    | Hot meal service for artists and talent per rider specifications          |
| **Specifications** | Entree plus 2 sides, salad, dessert, and beverages                        | Dietary accommodations |
| **Options**        | Standard                                                                  | Premium                | Luxury                           | Custom Rider-Specific |
| **Modifiers**      | Meal Count                                                                | Dietary Restrictions   | Service Style (buffet or plated) | Timing                |
| **Prerequisites**  | Kitchen or catering prep area, serving equipment, dietary info in advance |
| **Pricing Unit**   | per person/meal                                                           |
| **Lead Time**      | 336 hours                                                                 |
| **Setup Time**     | 1 to 2 hours (setup service area)                                         |
| **Strike Time**    | 1 hour (cleanup and pack)                                                 |
| **Crew Required**  | 1 to 4 catering staff (varies by headcount)                               |
| **Power**          | 20A (for hot items, coffee)                                               |
| **Footprint**      | 8ft x 4ft (buffet line) to full kitchen                                   |
| **Truck Space**    | Catering van or box truck                                                 |
| **Weather**        | `sheltered`                                                               |
| **Compliance**     | `HEALTH_DEPT                                                              | SERVSAFE`              |
| **Sustainability** | `COMPOSTABLE`                                                             |

###### Meal Service - Crew

|                    |                                                     |
| ------------------ | --------------------------------------------------- | --------------- | ------------------------ | ------------ |
| **Legacy Code**    | `HOSP-1002`                                         |
| **SKU**            | `HOSP-CATR-ARTC-002`                                |
| **UNSPSC**         | `90101600`                                          |
| **Common Name**    | Crew Meal Service                                   |
| **Search Aliases** | Crew Catering                                       | Staff Meal      | Production Meal          | Crew Feed    |
| **Description**    | Hot meal service for production crew and staff      |
| **Specifications** | Entree plus 2 sides, salad, and beverage            | Buffet style    |
| **Options**        | Standard                                            | Premium         | Boxed Meal (grab and go) |
| **Modifiers**      | Meal Count                                          | Dietary Options | Service Times            | Buffet Setup |
| **Prerequisites**  | Kitchen or catering area, serving line, bus station |
| **Pricing Unit**   | per person/meal                                     |
| **Lead Time**      | 336 hours                                           |
| **Setup Time**     | 1 to 2 hours (setup service area)                   |
| **Strike Time**    | 1 hour (cleanup and pack)                           |
| **Crew Required**  | 1 to 4 catering staff (varies by headcount)         |
| **Power**          | 20A (for hot items, coffee)                         |
| **Footprint**      | 8ft x 4ft (buffet line) to full kitchen             |
| **Truck Space**    | Catering van or box truck                           |
| **Weather**        | `sheltered`                                         |
| **Compliance**     | `HEALTH_DEPT                                        | SERVSAFE`       |
| **Sustainability** | `COMPOSTABLE`                                       |

###### Craft Services

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | --------- | ------------------------------------- | ------------- | ----------- |
| **Legacy Code**    | `HOSP-1003`                                                |
| **SKU**            | `HOSP-CATR-ARTC-003`                                       |
| **UNSPSC**         | `90101600`                                                 |
| **Common Name**    | Craft Services Table                                       |
| **Search Aliases** | Craft Services                                             | Crafty    | Crew Snacks                           | Snack Station | Crew Pantry |
| **Description**    | All-day snack and beverage station for crew and production |
| **Specifications** | Snacks, fruit, coffee, water, sodas, energy drinks, candy  |
| **Options**        | Basic                                                      | Standard  | Premium (hot items, specialty coffee) |
| **Modifiers**      | Duration (days)                                            | Headcount | Premium Add-Ons                       |
| **Prerequisites**  | Table, power (for coffee and hot items), coolers           |
| **Pricing Unit**   | per day                                                    |
| **Lead Time**      | 336 hours                                                  |
| **Setup Time**     | 1 to 2 hours (setup service area)                          |
| **Strike Time**    | 1 hour (cleanup and pack)                                  |
| **Crew Required**  | 1 to 4 catering staff (varies by headcount)                |
| **Power**          | 20A (for hot items, coffee)                                |
| **Footprint**      | 8ft x 4ft (buffet line) to full kitchen                    |
| **Truck Space**    | Catering van or box truck                                  |
| **Weather**        | `sheltered`                                                |
| **Compliance**     | `HEALTH_DEPT                                               | SERVSAFE` |
| **Sustainability** | `COMPOSTABLE`                                              |

###### Coffee Service

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | -------------------- | ------------------ | ---------------- |
| **Legacy Code**    | `HOSP-1004`                                            |
| **SKU**            | `HOSP-CATR-ARTC-004`                                   |
| **UNSPSC**         | `90101600`                                             |
| **Common Name**    | Coffee and Espresso Service                            |
| **Search Aliases** | Coffee Bar                                             | Espresso Cart        | Barista Service    | Coffee Station   |
| **Description**    | Dedicated coffee and espresso bar for crew or VIP      |
| **Specifications** | Drip coffee, espresso machine, cold brew, or pour-over |
| **Options**        | Self-Serve Drip                                        | Staffed Espresso Bar | Mobile Coffee Cart |
| **Modifiers**      | Service Level                                          | Headcount            | Duration           | Specialty Drinks |
| **Prerequisites**  | Power (20A for espresso machine), water, cups          |
| **Pricing Unit**   | per day                                                |
| **Lead Time**      | 336 hours                                              |
| **Setup Time**     | 1 to 2 hours (setup service area)                      |
| **Strike Time**    | 1 hour (cleanup and pack)                              |
| **Crew Required**  | 1 to 4 catering staff (varies by headcount)            |
| **Power**          | 20A (for hot items, coffee)                            |
| **Footprint**      | 8ft x 4ft (buffet line) to full kitchen                |
| **Truck Space**    | Catering van or box truck                              |
| **Weather**        | `sheltered`                                            |
| **Compliance**     | `HEALTH_DEPT                                           | SERVSAFE`            |
| **Sustainability** | `COMPOSTABLE`                                          |

###### Water and Ice Service

|                    |                                                  |
| ------------------ | ------------------------------------------------ | ------------------ | ------------------- | -------------- |
| **Legacy Code**    | `HOSP-1005`                                      |
| **SKU**            | `HOSP-CATR-ARTC-005`                             |
| **UNSPSC**         | `90101600`                                       |
| **Common Name**    | Bulk Water and Ice Service                       |
| **Search Aliases** | Water Station                                    | Hydration Station  | Ice Delivery        | Cooler Service |
| **Description**    | Bulk water and ice delivery for crew hydration   |
| **Specifications** | 5-gallon jugs, coolers, bulk ice, and dispensers |
| **Options**        | Bottled (individual)                             | 5-Gallon Dispenser | Coolers with Cups   |
| **Modifiers**      | Quantity                                         | Delivery Schedule  | Cups and Dispensers |
| **Prerequisites**  | Coolers or dispensers, cups                      |
| **Pricing Unit**   | per day                                          |
| **Lead Time**      | 336 hours                                        |
| **Setup Time**     | 1 to 2 hours (setup service area)                |
| **Strike Time**    | 1 hour (cleanup and pack)                        |
| **Crew Required**  | 1 to 4 catering staff (varies by headcount)      |
| **Power**          | 20A (for hot items, coffee)                      |
| **Footprint**      | 8ft x 4ft (buffet line) to full kitchen          |
| **Truck Space**    | Catering van or box truck                        |
| **Weather**        | `sheltered`                                      |
| **Compliance**     | `HEALTH_DEPT                                     | SERVSAFE`          |
| **Sustainability** | `COMPOSTABLE`                                    |

[Back to top](#table-of-contents)

##### Guest & VIP Catering

###### Catering Package - VIP

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | ---------------- | ------------------ | ------------------ |
| **Legacy Code**    | `HOSP-1010`                                                 |
| **SKU**            | `HOSP-CATR-VIPC-001`                                        |
| **UNSPSC**         | `90101700`                                                  |
| **Common Name**    | VIP Catering Package                                        |
| **Search Aliases** | VIP Dining                                                  | Premium Catering | Guest Catering     | Executive Catering |
| **Description**    | Elevated food and beverage service for VIP guests           |
| **Specifications** | Passed hors d'oeuvres, stations, premium beverages, dessert |
| **Options**        | Cocktail Reception                                          | Seated Dinner    | Stations           | Mixed Format       |
| **Modifiers**      | Guest Count                                                 | Service Style    | Menu Customization | Staffing           |
| **Prerequisites**  | Prep kitchen, serving equipment, staffing, rentals          |
| **Pricing Unit**   | per person                                                  |
| **Lead Time**      | 336 hours                                                   |
| **Setup Time**     | 1 to 2 hours (setup service area)                           |
| **Strike Time**    | 1 hour (cleanup and pack)                                   |
| **Crew Required**  | 1 to 4 catering staff (varies by headcount)                 |
| **Power**          | 20A (for hot items, coffee)                                 |
| **Footprint**      | 8ft x 4ft (buffet line) to full kitchen                     |
| **Truck Space**    | Catering van or box truck                                   |
| **Weather**        | `sheltered`                                                 |
| **Compliance**     | `HEALTH_DEPT                                                | SERVSAFE`        |
| **Sustainability** | `COMPOSTABLE`                                               |

###### Beverage Service

|                    |                                                   |
| ------------------ | ------------------------------------------------- | -------------------------------- | ------------------------ | -------------- |
| **Legacy Code**    | `HOSP-1011`                                       |
| **SKU**            | `HOSP-CATR-VIPC-002`                              |
| **UNSPSC**         | `90101700`                                        |
| **Common Name**    | Beverage Service Package                          |
| **Search Aliases** | Drink Package                                     | Non-Alcoholic Service            | Refreshment Station      |
| **Description**    | Non-alcoholic beverage service for guests or crew |
| **Specifications** | Water, soft drinks, juice, coffee, and tea        | Coolers and ice                  |
| **Options**        | Basic (water and soda)                            | Standard (plus coffee and juice) | Premium (plus specialty) |
| **Modifiers**      | Headcount                                         | Duration                         | Service Points           | Ice and Cooler |
| **Prerequisites**  | Serving stations, coolers, ice supply             |
| **Pricing Unit**   | per person/day                                    |
| **Lead Time**      | 336 hours                                         |
| **Setup Time**     | 1 to 2 hours (setup service area)                 |
| **Strike Time**    | 1 hour (cleanup and pack)                         |
| **Crew Required**  | 1 to 4 catering staff (varies by headcount)       |
| **Power**          | 20A (for hot items, coffee)                       |
| **Footprint**      | 8ft x 4ft (buffet line) to full kitchen           |
| **Truck Space**    | Catering van or box truck                         |
| **Weather**        | `sheltered`                                       |
| **Compliance**     | `HEALTH_DEPT                                      | SERVSAFE`                        |
| **Sustainability** | `COMPOSTABLE`                                     |

###### Station - Dessert

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | -------------- | ------------------------------ | --------------- |
| **Legacy Code**    | `HOSP-1012`                                               |
| **SKU**            | `HOSP-CATR-VIPC-003`                                      |
| **UNSPSC**         | `90101700`                                                |
| **Common Name**    | Dessert Station                                           |
| **Search Aliases** | Sweet Table                                               | Dessert Bar    | Ice Cream Cart                 | Dessert Display |
| **Description**    | Dedicated dessert display or live dessert service station |
| **Specifications** | Plated desserts, dessert bar, ice cream cart, or custom   |
| **Options**        | Plated                                                    | Buffet Display | Live Station (crepes, churros) | Ice Cream Cart  |
| **Modifiers**      | Type                                                      | Guest Count    | Duration                       | Staffing        |
| **Prerequisites**  | Refrigeration for perishables, serving equipment          |
| **Pricing Unit**   | per station/day                                           |
| **Lead Time**      | 336 hours                                                 |
| **Setup Time**     | 1 to 2 hours (setup service area)                         |
| **Strike Time**    | 1 hour (cleanup and pack)                                 |
| **Crew Required**  | 1 to 4 catering staff (varies by headcount)               |
| **Power**          | 20A (for hot items, coffee)                               |
| **Footprint**      | 8ft x 4ft (buffet line) to full kitchen                   |
| **Truck Space**    | Catering van or box truck                                 |
| **Weather**        | `sheltered`                                               |
| **Compliance**     | `HEALTH_DEPT                                              | SERVSAFE`      |
| **Sustainability** | `COMPOSTABLE`                                             |

###### Food Truck - Contracted

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | --------------- | -------------------- | -------------- |
| **Legacy Code**    | `HOSP-1013`                                              |
| **SKU**            | `HOSP-CATR-VIPC-004`                                     |
| **UNSPSC**         | `90101700`                                               |
| **Common Name**    | Contracted Food Truck                                    |
| **Search Aliases** | Food Truck                                               | Mobile Kitchen  | Food Vendor          | Catering Truck |
| **Description**    | Contracted food truck vendor for guest or crew service   |
| **Specifications** | Full menu, specialty cuisine, or branded options         |
| **Options**        | Standard Vendor                                          | Premium Gourmet | Custom Branded Menu  |
| **Modifiers**      | Cuisine Type                                             | Duration        | Meal Count Guarantee | Exclusivity    |
| **Prerequisites**  | Power (50A), water, gray water, health permit, level pad |
| **Pricing Unit**   | per truck/day                                            |
| **Lead Time**      | 672 hours                                                |
| **Setup Time**     | 1 to 2 hours (park, setup, connect utilities)            |
| **Strike Time**    | 1 hour                                                   |
| **Crew Required**  | 2 to 5 kitchen staff (vendor-provided)                   |
| **Power**          | 50A to 100A (or onboard generator)                       |
| **Footprint**      | 8ft x 20ft to 8ft x 30ft                                 |
| **Truck Space**    | Self-contained vehicle                                   |
| **Weather**        | `all_weather`                                            |
| **Compliance**     | `FIRE_MARSHAL                                            | HEALTH_DEPT`    |

[Back to top](#table-of-contents)

#### Green Room & Hospitality

##### Artist Hospitality

###### Green Room

|                    |                                                                             |
| ------------------ | --------------------------------------------------------------------------- | ----------------- | --------------------- | --------------------- |
| **Legacy Code**    | `HOSP-1100`                                                                 |
| **SKU**            | `HOSP-GRHP-ARTH-001`                                                        |
| **UNSPSC**         | `90101800`                                                                  |
| **Common Name**    | Green Room Setup                                                            |
| **Search Aliases** | Artist Lounge                                                               | Talent Green Room | Backstage Hospitality | Band Room             |
| **Description**    | Artist green room hospitality package per rider                             |
| **Specifications** | Furniture, refreshments, towels, mirror, garment rack, and snacks per rider |
| **Options**        | Basic                                                                       | Standard          | Premium               | Custom Rider-Specific |
| **Modifiers**      | Rider Spec                                                                  | Room Size         | Furniture             | Refreshments          |
| **Prerequisites**  | Private room or tented area, power, climate control                         |
| **Pricing Unit**   | per room/day                                                                |
| **Lead Time**      | 168 hours                                                                   |
| **Setup Time**     | 30 to 60 min                                                                |
| **Strike Time**    | 20 to 30 min                                                                |
| **Crew Required**  | 1 to 2 setup crew                                                           |
| **Power**          | 20A (lighting, climate, charging)                                           |
| **Footprint**      | 100 to 400 sq ft per room                                                   |
| **Truck Space**    | 1 van or small box truck                                                    |
| **Weather**        | `sheltered`                                                                 |
| **Compliance**     | `FIRE_MARSHAL`                                                              |
| **Sustainability** | `REUSABLE`                                                                  |

###### Per Diem - Artist

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | -------------------------- | ------------------- | ------------- |
| **Legacy Code**    | `HOSP-1101`                                               |
| **SKU**            | `HOSP-GRHP-ARTH-002`                                      |
| **UNSPSC**         | `90101800`                                                |
| **Common Name**    | Artist Per Diem                                           |
| **Search Aliases** | Meal Buyout                                               | Cash Per Diem              | Food Allowance      | Artist Buyout |
| **Description**    | Cash per diem or meal buyout in lieu of provided catering |
| **Specifications** | Per rider specification                                   | Cash or prepaid card       |
| **Options**        | Cash                                                      | Prepaid Visa or Mastercard | Restaurant Voucher  |
| **Modifiers**      | Amount Per Person                                         | Duration                   | Distribution Method |
| **Prerequisites**  | Budget approval, cash or card procurement                 |
| **Pricing Unit**   | per person/day                                            |
| **Lead Time**      | 168 hours                                                 |
| **Setup Time**     | 30 to 60 min                                              |
| **Strike Time**    | 20 to 30 min                                              |
| **Crew Required**  | 1 to 2 setup crew                                         |
| **Power**          | 20A (lighting, climate, charging)                         |
| **Footprint**      | 100 to 400 sq ft per room                                 |
| **Truck Space**    | 1 van or small box truck                                  |
| **Weather**        | `sheltered`                                               |
| **Compliance**     | `FIRE_MARSHAL`                                            |
| **Sustainability** | `REUSABLE`                                                |

###### Dressing Room

|                    |                                                                    |
| ------------------ | ------------------------------------------------------------------ | ------------------------------------ | ------------------------------- |
| **Legacy Code**    | `HOSP-1102`                                                        |
| **SKU**            | `HOSP-GRHP-ARTH-003`                                               |
| **UNSPSC**         | `90101800`                                                         |
| **Common Name**    | Dressing Room Setup                                                |
| **Search Aliases** | Quick Change Room                                                  | Wardrobe Room                        | Talent Dressing Room            |
| **Description**    | Private dressing and changing room with mirror, lighting, and rack |
| **Specifications** | Mirror, lighting, garment rack, steamer, and seating               |
| **Options**        | Basic (mirror and rack)                                            | Standard (plus lighting and seating) | Premium (plus AC and amenities) |
| **Modifiers**      | Setup Level                                                        | Quantity                             | Amenities                       |
| **Prerequisites**  | Private enclosed space, power                                      |
| **Pricing Unit**   | per room/day                                                       |
| **Lead Time**      | 168 hours                                                          |
| **Setup Time**     | 30 to 60 min                                                       |
| **Strike Time**    | 20 to 30 min                                                       |
| **Crew Required**  | 1 to 2 setup crew                                                  |
| **Power**          | 20A (lighting, climate, charging)                                  |
| **Footprint**      | 100 to 400 sq ft per room                                          |
| **Truck Space**    | 1 van or small box truck                                           |
| **Weather**        | `sheltered`                                                        |
| **Compliance**     | `FIRE_MARSHAL`                                                     |
| **Sustainability** | `REUSABLE`                                                         |

###### Rider Fulfillment

|                    |                                                                          |
| ------------------ | ------------------------------------------------------------------------ | ------------------------ | --------------- | ----------------- |
| **Legacy Code**    | `HOSP-1103`                                                              |
| **SKU**            | `HOSP-GRHP-ARTH-004`                                                     |
| **UNSPSC**         | `90101800`                                                               |
| **Common Name**    | Rider Fulfillment Package                                                |
| **Search Aliases** | Rider Items                                                              | Talent Rider             | Backstage Rider | Hospitality Rider |
| **Description**    | Miscellaneous rider items including specific brands, towels, and candles |
| **Specifications** | Per artist or talent rider                                               | Itemized procurement     |
| **Options**        | Standard Items                                                           | Premium or Luxury Brands | Specialty Items |
| **Modifiers**      | Item List from Rider                                                     | Budget Cap               | Sourcing        |
| **Prerequisites**  | Approved rider, procurement lead time                                    |
| **Pricing Unit**   | per rider                                                                |
| **Lead Time**      | 168 hours                                                                |
| **Setup Time**     | 30 to 60 min                                                             |
| **Strike Time**    | 20 to 30 min                                                             |
| **Crew Required**  | 1 to 2 setup crew                                                        |
| **Power**          | 20A (lighting, climate, charging)                                        |
| **Footprint**      | 100 to 400 sq ft per room                                                |
| **Truck Space**    | 1 van or small box truck                                                 |
| **Weather**        | `sheltered`                                                              |
| **Compliance**     | `FIRE_MARSHAL`                                                           |
| **Sustainability** | `REUSABLE`                                                               |

[Back to top](#table-of-contents)

##### VIP & Lounge

###### Lounge - VIP

|                    |                                                                |
| ------------------ | -------------------------------------------------------------- | ---------------------------------- | -------------------------- | ---------------------- | ------------ |
| **Legacy Code**    | `HOSP-1110`                                                    |
| **SKU**            | `HOSP-GRHP-VIPL-001`                                           |
| **UNSPSC**         | `90101900`                                                     |
| **Common Name**    | VIP Lounge Setup                                               |
| **Search Aliases** | VIP Area                                                       | Lounge Area                        | VIP Section                | Hospitality Suite      | Premium Area |
| **Description**    | Complete VIP lounge area with furniture, decor, and service    |
| **Specifications** | Lounge seating, tables, decor, lighting, and rope or stanchion |
| **Options**        | Basic (furniture only)                                         | Standard (plus decor and lighting) | Premium (plus staffed bar) |
| **Modifiers**      | Size                                                           | Style                              | Staffing                   | Bar and Bottle Service |
| **Prerequisites**  | Enclosed or roped area, power, staffing                        |
| **Pricing Unit**   | per lounge/day                                                 |
| **Lead Time**      | 336 hours                                                      |
| **Setup Time**     | 2 to 4 hours                                                   |
| **Strike Time**    | 1 to 2 hours                                                   |
| **Crew Required**  | 2 to 4 setup crew, staffing for service                        |
| **Power**          | 20A to 40A (lighting, POS, etc.)                               |
| **Footprint**      | 200 to 1,000+ sq ft                                            |
| **Truck Space**    | 1 to 2 box trucks (furniture)                                  |
| **Weather**        | `sheltered`                                                    |
| **Compliance**     | `ADA                                                           | FIRE_MARSHAL                       | LIQUOR_LICENSE`            |
| **Sustainability** | `REUSABLE                                                      | LED_EFFICIENT`                     |

###### Bottle Service - VIP

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | ------------------------------ | --------------------- | ----------- |
| **Legacy Code**    | `HOSP-1111`                                                  |
| **SKU**            | `HOSP-GRHP-VIPL-002`                                         |
| **UNSPSC**         | `90101900`                                                   |
| **Common Name**    | Bottle Service Setup                                         |
| **Search Aliases** | VIP Table                                                    | Bottle Service                 | Table Service         | VIP Bottles |
| **Description**    | VIP table and bottle service with sparklers, mixers, and ice |
| **Specifications** | Table, bucket, sparklers, mixers, ice, and server            |
| **Options**        | Standard                                                     | Premium (champagne, top shelf) | Ultra (Ace of Spades) |
| **Modifiers**      | Table Count                                                  | Bottle Selection               | Server Count          | Sparklers   |
| **Prerequisites**  | Liquor license, trained servers, ice, mixers                 |
| **Pricing Unit**   | per table/night                                              |
| **Lead Time**      | 168 hours                                                    |
| **Setup Time**     | 30 to 60 min                                                 |
| **Strike Time**    | 20 to 30 min                                                 |
| **Crew Required**  | 1 to 2 setup crew                                            |
| **Power**          | 20A (lighting, climate, charging)                            |
| **Footprint**      | 100 to 400 sq ft per room                                    |
| **Truck Space**    | 1 van or small box truck                                     |
| **Weather**        | `sheltered`                                                  |
| **Compliance**     | `FIRE_MARSHAL`                                               |
| **Sustainability** | `REUSABLE`                                                   |

###### Hookah Lounge

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | ---------------------------------- | --------------- | ------------ | -------------- |
| **Legacy Code**    | `HOSP-1112`                                                   |
| **SKU**            | `HOSP-GRHP-VIPL-003`                                          |
| **UNSPSC**         | `90101900`                                                    |
| **Common Name**    | Hookah Lounge Setup                                           |
| **Search Aliases** | Shisha Lounge                                                 | Hookah Bar                         | Hookah Service  | Shisha Setup |
| **Description**    | Hookah lounge setup with hookahs, coals, flavors, and seating |
| **Specifications** | 2 to 4 hookahs                                                | Coals                              | Flavors         | Low seating  | Tent or canopy |
| **Options**        | Standard (2 hookah)                                           | Premium (4 or more with attendant) | Custom Themed   |
| **Modifiers**      | Hookah Count                                                  | Flavor Selection                   | Attendant       | Duration     |
| **Prerequisites**  | Ventilation, fire safety compliance, local permit             |
| **Pricing Unit**   | per setup/day                                                 |
| **Lead Time**      | 336 hours                                                     |
| **Setup Time**     | 2 to 4 hours                                                  |
| **Strike Time**    | 1 to 2 hours                                                  |
| **Crew Required**  | 2 to 4 setup crew, staffing for service                       |
| **Power**          | 20A to 40A (lighting, POS, etc.)                              |
| **Footprint**      | 200 to 1,000+ sq ft                                           |
| **Truck Space**    | 1 to 2 box trucks (furniture)                                 |
| **Weather**        | `sheltered`                                                   |
| **Compliance**     | `ADA                                                          | FIRE_MARSHAL                       | LIQUOR_LICENSE` |
| **Sustainability** | `REUSABLE                                                     | LED_EFFICIENT`                     |

[Back to top](#table-of-contents)

##### Amenities & Services

###### Charging Station - Phone

|                    |                                                  |
| ------------------ | ------------------------------------------------ | ------------------------ | --------------- | --------------- |
| **Legacy Code**    | `HOSP-1120`                                      |
| **SKU**            | `HOSP-GRHP-AMEN-001`                             |
| **UNSPSC**         | `90102000`                                       |
| **Common Name**    | Phone Charging Station                           |
| **Search Aliases** | Charging Kiosk                                   | Power Station            | Charge Hub      | Battery Station |
| **Description**    | Shared phone charging station for guests or crew |
| **Specifications** | 8-port, 16-port, locker-style, or wireless       |
| **Options**        | Tabletop (8-port)                                | Standing Kiosk (16-port) | Locker (secure) | Branded         |
| **Modifiers**      | Type                                             | Quantity                 | Branding        |
| **Prerequisites**  | Power (20A per station)                          |
| **Pricing Unit**   | per station/day                                  |
| **Lead Time**      | 48 hours                                         |
| **Setup Time**     | 15 to 30 min per station                         |
| **Strike Time**    | 15 min per station                               |
| **Crew Required**  | 1 to 2 staff per station                         |
| **Power**          | 20A per charging station or digital display      |
| **Footprint**      | 4ft x 4ft per station                            |
| **Truck Space**    | 1 to 2 road cases                                |
| **Weather**        | `sheltered`                                      |
| **Sustainability** | `REUSABLE`                                       |

###### Coat Check

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ------------ | -------------------------- | --------------------- |
| **Legacy Code**    | `HOSP-1121`                                           |
| **SKU**            | `HOSP-GRHP-AMEN-002`                                  |
| **UNSPSC**         | `90102000`                                            |
| **Common Name**    | Coat Check Service                                    |
| **Search Aliases** | Bag Check                                             | Coat Room    | Luggage Storage            | Personal Item Storage |
| **Description**    | Staffed coat check or bag storage service             |
| **Specifications** | Racks, tickets, staff, and secure area                |
| **Options**        | Self-Service Lockers                                  | Staffed Rack | Staffed with Claim Tickets |
| **Modifiers**      | Capacity                                              | Staffing     | Locker vs Rack             | Duration              |
| **Prerequisites**  | Secure enclosed area, racks or lockers, claim tickets |
| **Pricing Unit**   | per station/day                                       |
| **Lead Time**      | 48 hours                                              |
| **Setup Time**     | 15 to 30 min per station                              |
| **Strike Time**    | 15 min per station                                    |
| **Crew Required**  | 1 to 2 staff per station                              |
| **Power**          | 20A per charging station or digital display           |
| **Footprint**      | 4ft x 4ft per station                                 |
| **Truck Space**    | 1 to 2 road cases                                     |
| **Weather**        | `sheltered`                                           |
| **Sustainability** | `REUSABLE`                                            |

###### Booth - Guest Services

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | ---------------- | --------------------- | -------------- |
| **Legacy Code**    | `HOSP-1122`                                                   |
| **SKU**            | `HOSP-GRHP-AMEN-003`                                          |
| **UNSPSC**         | `90102000`                                                    |
| **Common Name**    | Guest Services Booth                                          |
| **Search Aliases** | Info Booth                                                    | Information Desk | Help Desk             | Welcome Center |
| **Description**    | Staffed information booth for guest assistance and wayfinding |
| **Specifications** | Table or kiosk                                                | Signage          | Staff                 | FAQ materials  |
| **Options**        | Table with Banner                                             | Branded Kiosk    | Digital (with screen) |
| **Modifiers**      | Type                                                          | Staffing         | Materials             | Duration       |
| **Prerequisites**  | Staff training, FAQ document, site map, radio                 |
| **Pricing Unit**   | per booth/day                                                 |
| **Lead Time**      | 48 hours                                                      |
| **Setup Time**     | 15 to 30 min per station                                      |
| **Strike Time**    | 15 min per station                                            |
| **Crew Required**  | 1 to 2 staff per station                                      |
| **Power**          | 20A per charging station or digital display                   |
| **Footprint**      | 4ft x 4ft per station                                         |
| **Truck Space**    | 1 to 2 road cases                                             |
| **Weather**        | `sheltered`                                                   |
| **Sustainability** | `REUSABLE`                                                    |

###### Station - Lost and Found

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | ------------------------------- | ------------- |
| **Legacy Code**    | `HOSP-1123`                                            |
| **SKU**            | `HOSP-GRHP-AMEN-004`                                   |
| **UNSPSC**         | `90102000`                                             |
| **Common Name**    | Lost and Found Station                                 |
| **Search Aliases** | Lost and Found                                         | Property Return                 | Item Recovery |
| **Description**    | Organized lost and found collection and return station |
| **Specifications** | Bins, log book or app, signage, and staff              |
| **Options**        | Basic (bins and log)                                   | Digital (app-based with photos) | Staffed       |
| **Modifiers**      | Type                                                   | Staff                           | Duration      |
| **Prerequisites**  | Secure storage, logging system                         |
| **Pricing Unit**   | per station/day                                        |
| **Lead Time**      | 48 hours                                               |
| **Setup Time**     | 15 to 30 min per station                               |
| **Strike Time**    | 15 min per station                                     |
| **Crew Required**  | 1 to 2 staff per station                               |
| **Power**          | 20A per charging station or digital display            |
| **Footprint**      | 4ft x 4ft per station                                  |
| **Truck Space**    | 1 to 2 road cases                                      |
| **Weather**        | `sheltered`                                            |
| **Sustainability** | `REUSABLE`                                             |

[Back to top](#table-of-contents)

---

### Food & Beverage

_22 items_

#### Bar

##### Bar Equipment

###### Bar - Portable

|                    |                                                                    |
| ------------------ | ------------------------------------------------------------------ | ---------------- | --------------- | ------------------- | ----------------- |
| **Legacy Code**    | `FNB-1001`                                                         |
| **SKU**            | `FNBV-BARR-BEQP-001`                                               |
| **UNSPSC**         | `48101500`                                                         |
| **Common Name**    | Portable Bar Unit                                                  |
| **Search Aliases** | Mobile Bar                                                         | Event Bar        | Pop-Up Bar      | Freestanding Bar    |
| **Description**    | Freestanding portable bar with speed rail and ice well             |
| **Specifications** | 6ft or 8ft                                                         | Custom available | With sink       | LED-lit options     |
| **Options**        | Standard Black                                                     | White            | Custom Wrapped  | LED-Lit             | With Draft System |
| **Modifiers**      | Size                                                               | Sink             | Ice Well        | Draft Taps (add-on) | Wrap and Branding |
| **Prerequisites**  | Water and drain (if sink), power (if LED or draft), liquor license |
| **Pricing Unit**   | per unit/day                                                       |
| **Lead Time**      | 168 hours                                                          |
| **Setup Time**     | 1 to 2 hours per bar station                                       |
| **Strike Time**    | 1 hour                                                             |
| **Crew Required**  | 1 to 2 bar staff plus bartender(s)                                 |
| **Power**          | 20A per bar (LED, draft, POS)                                      |
| **Footprint**      | 6ft x 3ft to 8ft x 4ft per bar                                     |
| **Truck Space**    | 1 box truck per 2 to 3 bars                                        |
| **Weather**        | `sheltered`                                                        |
| **Compliance**     | `HEALTH_DEPT                                                       | TIPS             | LIQUOR_LICENSE` |
| **Sustainability** | `REUSABLE                                                          | COMPOSTABLE`     |

###### Beer System - Draft

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | -------------------------- | --------------- | ----------- | ------------ |
| **Legacy Code**    | `FNB-1002`                                                    |
| **SKU**            | `FNBV-BARR-BEQP-002`                                          |
| **UNSPSC**         | `48101500`                                                    |
| **Common Name**    | Draft Beer System                                             |
| **Search Aliases** | Jockey Box                                                    | Beer Tap                   | Glycol System   | Kegerator   | Draft System |
| **Description**    | Mobile draft beer dispensing system with jockey box or glycol |
| **Specifications** | 2-tap through 8-tap                                           | Glycol long-draw available |
| **Options**        | Jockey Box (2 to 4 tap)                                       | Glycol System (4 to 8 tap) | Kegerator       |
| **Modifiers**      | Tap Count                                                     | System Type                | CO2             | Keg Storage |
| **Prerequisites**  | CO2 tanks, kegs, ice or glycol chiller, power                 |
| **Pricing Unit**   | per system/day                                                |
| **Lead Time**      | 168 hours                                                     |
| **Setup Time**     | 1 to 2 hours per bar station                                  |
| **Strike Time**    | 1 hour                                                        |
| **Crew Required**  | 1 to 2 bar staff plus bartender(s)                            |
| **Power**          | 20A per bar (LED, draft, POS)                                 |
| **Footprint**      | 6ft x 3ft to 8ft x 4ft per bar                                |
| **Truck Space**    | 1 box truck per 2 to 3 bars                                   |
| **Weather**        | `sheltered`                                                   |
| **Compliance**     | `HEALTH_DEPT                                                  | TIPS                       | LIQUOR_LICENSE` |
| **Sustainability** | `REUSABLE                                                     | COMPOSTABLE`               |

###### Kit - Bar Tools

|                    |                                                                        |
| ------------------ | ---------------------------------------------------------------------- | -------------------------------- | ------------------ | ------- |
| **Legacy Code**    | `FNB-1003`                                                             |
| **SKU**            | `FNBV-BARR-BEQP-003`                                                   |
| **UNSPSC**         | `48101500`                                                             |
| **Common Name**    | Bar Tools Kit                                                          |
| **Search Aliases** | Speed Rail                                                             | Bartender Tools                  | Cocktail Kit       | Bar Set |
| **Description**    | Complete bartender tool kit with speed rail, shakers, and pourers      |
| **Specifications** | Speed rail, shaker set, jiggers, strainers, muddler, pourers, bar mats |
| **Options**        | Basic Kit                                                              | Premium Kit                      | Craft Cocktail Kit |
| **Modifiers**      | Kit Level                                                              | Quantity (per bartender station) |
| **Pricing Unit**   | per kit/day                                                            |
| **Lead Time**      | 168 hours                                                              |
| **Setup Time**     | 1 to 2 hours per bar station                                           |
| **Strike Time**    | 1 hour                                                                 |
| **Crew Required**  | 1 to 2 bar staff plus bartender(s)                                     |
| **Power**          | 20A per bar (LED, draft, POS)                                          |
| **Footprint**      | 6ft x 3ft to 8ft x 4ft per bar                                         |
| **Truck Space**    | 1 box truck per 2 to 3 bars                                            |
| **Weather**        | `sheltered`                                                            |
| **Compliance**     | `HEALTH_DEPT                                                           | TIPS                             | LIQUOR_LICENSE`    |
| **Sustainability** | `REUSABLE                                                              | COMPOSTABLE`                     |

###### Ice Bin - Portable

|                    |                                                 |
| ------------------ | ----------------------------------------------- | -------------------- | ---------------------- | ---------------- | ------------- |
| **Legacy Code**    | `FNB-1004`                                      |
| **SKU**            | `FNBV-BARR-BEQP-004`                            |
| **UNSPSC**         | `48101500`                                      |
| **Common Name**    | Portable Ice Bin                                |
| **Search Aliases** | Ice Well                                        | Cooler Bin           | Ice Chest              | Cold Storage Bin | Insulated Bin |
| **Description**    | Portable ice maker or insulated ice storage bin |
| **Specifications** | 100 lb through 500 lb                           | Ice maker option     |
| **Options**        | Insulated Bin (100 lb)                          | Rolling Bin (250 lb) | Maker (500 lb per day) |
| **Modifiers**      | Type                                            | Capacity             | Quantity               |
| **Prerequisites**  | Water supply (for maker), drainage              |
| **Pricing Unit**   | per unit/day                                    |
| **Lead Time**      | 168 hours                                       |
| **Setup Time**     | 1 to 2 hours per bar station                    |
| **Strike Time**    | 1 hour                                          |
| **Crew Required**  | 1 to 2 bar staff plus bartender(s)              |
| **Power**          | 20A per bar (LED, draft, POS)                   |
| **Footprint**      | 6ft x 3ft to 8ft x 4ft per bar                  |
| **Truck Space**    | 1 box truck per 2 to 3 bars                     |
| **Weather**        | `sheltered`                                     |
| **Compliance**     | `HEALTH_DEPT                                    | TIPS                 | LIQUOR_LICENSE`        |
| **Sustainability** | `REUSABLE                                       | COMPOSTABLE`         |

###### Display - Back Bar

|                    |                                                  |
| ------------------ | ------------------------------------------------ | ---------------------------- | --------------- | -------------- |
| **Legacy Code**    | `FNB-1005`                                       |
| **SKU**            | `FNBV-BARR-BEQP-005`                             |
| **UNSPSC**         | `48101500`                                       |
| **Common Name**    | Back Bar Display                                 |
| **Search Aliases** | Bottle Display                                   | Bar Shelving                 | LED Back Bar    | Liquor Shelf   |
| **Description**    | Illuminated back bar shelving for bottle display |
| **Specifications** | 3-tier or 4-tier                                 | LED-lit and mirrored options |
| **Options**        | Standard Shelf                                   | LED-Lit Acrylic              | Mirrored        | Custom Branded |
| **Modifiers**      | Size                                             | Tiers                        | Lighting        | Quantity       |
| **Prerequisites**  | Power for LED, stable mounting                   |
| **Pricing Unit**   | per unit/day                                     |
| **Lead Time**      | 168 hours                                        |
| **Setup Time**     | 1 to 2 hours per bar station                     |
| **Strike Time**    | 1 hour                                           |
| **Crew Required**  | 1 to 2 bar staff plus bartender(s)               |
| **Power**          | 20A per bar (LED, draft, POS)                    |
| **Footprint**      | 6ft x 3ft to 8ft x 4ft per bar                   |
| **Truck Space**    | 1 box truck per 2 to 3 bars                      |
| **Weather**        | `sheltered`                                      |
| **Compliance**     | `HEALTH_DEPT                                     | TIPS                         | LIQUOR_LICENSE` |
| **Sustainability** | `REUSABLE                                        | COMPOSTABLE`                 |

[Back to top](#table-of-contents)

##### Bar Consumables

###### Glassware - Rental

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | --------------- | ----------------- | ------------ |
| **Legacy Code**    | `FNB-1010`                                               |
| **SKU**            | `FNBV-BARR-BCON-001`                                     |
| **UNSPSC**         | `48101600`                                               |
| **Common Name**    | Rental Glassware                                         |
| **Search Aliases** | Event Glassware                                          | Glass Rental    | Bar Glass         | Stemware     |
| **Description**    | Rental glassware for bar service                         |
| **Specifications** | Rocks, highball, wine, champagne, pint, shot, or martini |
| **Options**        | Standard Clear                                           | Premium Crystal | Branded or Custom |
| **Modifiers**      | Type                                                     | Quantity        | Breakage Waiver   | Wash Service |
| **Prerequisites**  | Wash station or return logistics                         |
| **Pricing Unit**   | per piece/event                                          |
| **Lead Time**      | 24 hours                                                 |
| **Setup Time**     | N/A (consumable)                                         |
| **Strike Time**    | N/A                                                      |
| **Crew Required**  | None                                                     |
| **Power**          | None                                                     |
| **Footprint**      | Minimal (storage box)                                    |
| **Truck Space**    | Case or box, minimal                                     |
| **Weather**        | `sheltered`                                              |
| **Sustainability** | `REUSABLE                                                | SINGLE_USE`     |

###### Drinkware - Disposable

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | --------------------------------- | ----------- | -------------------- |
| **Legacy Code**    | `FNB-1011`                                           |
| **SKU**            | `FNBV-BARR-BCON-002`                                 |
| **UNSPSC**         | `48101600`                                           |
| **Common Name**    | Disposable Drinkware                                 |
| **Search Aliases** | Plastic Cups                                         | Compostable Cups                  | Event Cups  | Branded Cups         |
| **Description**    | Single-use cups and drinkware for high-volume events |
| **Specifications** | 16oz through 24oz                                    | Plastic, compostable, or aluminum |
| **Options**        | Clear Plastic                                        | Branded Plastic                   | Compostable | Aluminum             |
| **Modifiers**      | Size                                                 | Material                          | Branding    | Quantity (case lots) |
| **Prerequisites**  | Design file for custom print (if branded)            |
| **Pricing Unit**   | per case                                             |
| **Lead Time**      | 24 hours                                             |
| **Setup Time**     | N/A (consumable)                                     |
| **Strike Time**    | N/A                                                  |
| **Crew Required**  | None                                                 |
| **Power**          | None                                                 |
| **Footprint**      | Minimal (storage box)                                |
| **Truck Space**    | Case or box, minimal                                 |
| **Weather**        | `sheltered`                                          |
| **Sustainability** | `REUSABLE                                            | SINGLE_USE`                       |

###### Kit - Garnish and Mixers

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | ------------------------------ | ------------------------ | -------------------- |
| **Legacy Code**    | `FNB-1012`                                                       |
| **SKU**            | `FNBV-BARR-BCON-003`                                             |
| **UNSPSC**         | `48101600`                                                       |
| **Common Name**    | Cocktail Garnish and Mixers Kit                                  |
| **Search Aliases** | Garnish Kit                                                      | Mixer Pack                     | Bar Prep Kit             | Cocktail Ingredients |
| **Description**    | Pre-portioned garnish and mixer kit for craft cocktails          |
| **Specifications** | Citrus, herbs, simple syrup, tonic, bitters, and specialty items |
| **Options**        | Basic (lime, lemon, simple)                                      | Standard (plus herbs, bitters) | Premium (plus specialty) |
| **Modifiers**      | Kit Level                                                        | Guest Count Estimate           | Duration                 |
| **Prerequisites**  | Refrigeration for perishables                                    |
| **Pricing Unit**   | per kit/day                                                      |
| **Lead Time**      | 24 hours                                                         |
| **Setup Time**     | N/A (consumable)                                                 |
| **Strike Time**    | N/A                                                              |
| **Crew Required**  | None                                                             |
| **Power**          | None                                                             |
| **Footprint**      | Minimal (storage box)                                            |
| **Truck Space**    | Case or box, minimal                                             |
| **Weather**        | `sheltered`                                                      |
| **Sustainability** | `REUSABLE                                                        | SINGLE_USE`                    |

[Back to top](#table-of-contents)

#### Restaurant

##### Service Equipment

###### Chafing Dish

|                    |                                                    |
| ------------------ | -------------------------------------------------- | -------------- | ------------------ | ----------- | -------- |
| **Legacy Code**    | `FNB-1100`                                         |
| **SKU**            | `FNBV-REST-SEQP-001`                               |
| **UNSPSC**         | `48101700`                                         |
| **Common Name**    | Chafing Dish                                       |
| **Search Aliases** | Chafer                                             | Food Warmer    | Buffet Dish        | Steam Pan   |
| **Description**    | Stainless steel chafer for buffet hot food service |
| **Specifications** | Full-size, half-size, or round                     | With fuel cans |
| **Options**        | Full-Size                                          | Half-Size      | Round              | Gold Accent | Roll-Top |
| **Modifiers**      | Size                                               | Quantity       | Fuel Cans Included | Lid Style   |
| **Prerequisites**  | Sterno or electric heat, serving utensils          |
| **Pricing Unit**   | per unit/day                                       |
| **Lead Time**      | 48 hours                                           |
| **Setup Time**     | 10 to 15 min per unit                              |
| **Strike Time**    | 10 min per unit                                    |
| **Crew Required**  | 1 to 2 catering staff                              |
| **Power**          | None (Sterno) or 20A (electric)                    |
| **Footprint**      | 2ft x 1ft (chafer) to 6ft x 3ft (buffet setup)     |
| **Truck Space**    | Stacks and nests efficiently                       |
| **Weather**        | `sheltered`                                        |
| **Compliance**     | `HEALTH_DEPT`                                      |
| **Sustainability** | `REUSABLE`                                         |

###### Linen - Table

|                    |                                                  |
| ------------------ | ------------------------------------------------ | ------------------- | ------------ | ---------------- | ------------ |
| **Legacy Code**    | `FNB-1101`                                       |
| **SKU**            | `FNBV-REST-SEQP-002`                             |
| **UNSPSC**         | `48101700`                                       |
| **Common Name**    | Table Linen                                      |
| **Search Aliases** | Tablecloth                                       | Table Cover         | Linen Rental | Table Drape      |
| **Description**    | Table linen rental with sizing and color options |
| **Specifications** | 90x90 through 120in round                        | Runners and napkins |
| **Options**        | Polyester                                        | Satin               | Sequin       | Velvet           | Custom Color |
| **Modifiers**      | Size                                             | Color               | Quantity     | Napkins (add-on) | Laundering   |
| **Pricing Unit**   | per piece/event                                  |
| **Lead Time**      | 48 hours                                         |
| **Setup Time**     | 10 to 15 min per unit                            |
| **Strike Time**    | 10 min per unit                                  |
| **Crew Required**  | 1 to 2 catering staff                            |
| **Power**          | None (Sterno) or 20A (electric)                  |
| **Footprint**      | 2ft x 1ft (chafer) to 6ft x 3ft (buffet setup)   |
| **Truck Space**    | Stacks and nests efficiently                     |
| **Weather**        | `sheltered`                                      |
| **Compliance**     | `HEALTH_DEPT`                                    |
| **Sustainability** | `REUSABLE`                                       |

###### Flatware and China - Rental

|                    |                                                                    |
| ------------------ | ------------------------------------------------------------------ | ------------------ | ------------ | ---------- | ------------ |
| **Legacy Code**    | `FNB-1102`                                                         |
| **SKU**            | `FNBV-REST-SEQP-003`                                               |
| **UNSPSC**         | `48101700`                                                         |
| **Common Name**    | China and Flatware Rental                                          |
| **Search Aliases** | Place Setting                                                      | Tableware          | Dinnerware   | Silverware | Plate Rental |
| **Description**    | Rental place settings for plated service                           |
| **Specifications** | Dinner plate, salad plate, bread plate, full flatware, and charger |
| **Options**        | Standard White                                                     | Premium Bone China | Gold Rim     | Rustic     |
| **Modifiers**      | Setting Type                                                       | Quantity           | Wash Service |
| **Prerequisites**  | Wash station or return logistics                                   |
| **Pricing Unit**   | per setting/event                                                  |
| **Lead Time**      | 48 hours                                                           |
| **Setup Time**     | 10 to 15 min per unit                                              |
| **Strike Time**    | 10 min per unit                                                    |
| **Crew Required**  | 1 to 2 catering staff                                              |
| **Power**          | None (Sterno) or 20A (electric)                                    |
| **Footprint**      | 2ft x 1ft (chafer) to 6ft x 3ft (buffet setup)                     |
| **Truck Space**    | Stacks and nests efficiently                                       |
| **Weather**        | `sheltered`                                                        |
| **Compliance**     | `HEALTH_DEPT`                                                      |
| **Sustainability** | `REUSABLE`                                                         |

###### Dispenser - Beverage

|                    |                                                  |
| ------------------ | ------------------------------------------------ | --------------------------- | --------------- | ------------ |
| **Legacy Code**    | `FNB-1103`                                       |
| **SKU**            | `FNBV-REST-SEQP-004`                             |
| **UNSPSC**         | `48101700`                                       |
| **Common Name**    | Beverage Dispenser                               |
| **Search Aliases** | Drink Dispenser                                  | Infuser                     | Beverage Server | Lemonade Jar |
| **Description**    | Large beverage dispenser for self-serve stations |
| **Specifications** | 3 gallon or 5 gallon                             | Insulated and glass options |
| **Options**        | Glass (with spigot)                              | Insulated (hot or cold)     | Infuser Style   |
| **Modifiers**      | Size                                             | Type                        | Quantity        |
| **Prerequisites**  | Table or counter for placement                   |
| **Pricing Unit**   | per unit/day                                     |
| **Lead Time**      | 48 hours                                         |
| **Setup Time**     | 10 to 15 min per unit                            |
| **Strike Time**    | 10 min per unit                                  |
| **Crew Required**  | 1 to 2 catering staff                            |
| **Power**          | None (Sterno) or 20A (electric)                  |
| **Footprint**      | 2ft x 1ft (chafer) to 6ft x 3ft (buffet setup)   |
| **Truck Space**    | Stacks and nests efficiently                     |
| **Weather**        | `sheltered`                                      |
| **Compliance**     | `HEALTH_DEPT`                                    |
| **Sustainability** | `REUSABLE`                                       |

###### Utensils and Trays

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ------------ | -------------- | ------------------ | ------------ |
| **Legacy Code**    | `FNB-1104`                                              |
| **SKU**            | `FNBV-REST-SEQP-005`                                    |
| **UNSPSC**         | `48101700`                                              |
| **Common Name**    | Serving Utensils and Trays                              |
| **Search Aliases** | Serving Spoons                                          | Tongs        | Platters       | Catering Trays     | Service Ware |
| **Description**    | Serving spoons, tongs, trays, and platters for catering |
| **Specifications** | Various types and materials                             |
| **Options**        | Stainless                                               | Silver-Plate | Disposable Eco | Charcuterie Boards |
| **Modifiers**      | Type                                                    | Quantity     | Material       |
| **Pricing Unit**   | per kit/day                                             |
| **Lead Time**      | 48 hours                                                |
| **Setup Time**     | 10 to 15 min per unit                                   |
| **Strike Time**    | 10 min per unit                                         |
| **Crew Required**  | 1 to 2 catering staff                                   |
| **Power**          | None (Sterno) or 20A (electric)                         |
| **Footprint**      | 2ft x 1ft (chafer) to 6ft x 3ft (buffet setup)          |
| **Truck Space**    | Stacks and nests efficiently                            |
| **Weather**        | `sheltered`                                             |
| **Compliance**     | `HEALTH_DEPT`                                           |
| **Sustainability** | `REUSABLE`                                              |

[Back to top](#table-of-contents)

#### Kitchen

##### Kitchen Equipment

###### Kitchen Trailer - Mobile

|                    |                                                                         |
| ------------------ | ----------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------- | ------------------ |
| **Legacy Code**    | `FNB-1200`                                                              |
| **SKU**            | `FNBV-KTCH-KEQP-001`                                                    |
| **UNSPSC**         | `48101800`                                                              |
| **Common Name**    | Mobile Kitchen Trailer                                                  |
| **Search Aliases** | Kitchen Trailer                                                         | Catering Trailer                               | Prep Trailer                      | Commercial Kitchen |
| **Description**    | Fully equipped mobile kitchen trailer for on-site cooking               |
| **Specifications** | 16ft through 36ft                                                       | With hood, cooktop, oven, fridge, and handwash |
| **Options**        | Standard (grill and fryer)                                              | Full Service (grill, oven, fryer, flat-top)    | Custom                            |
| **Modifiers**      | Size                                                                    | Equipment Configuration                        | Power (208V 3-phase or generator) | Water              |
| **Prerequisites**  | Power (100A or more 208V), water supply, waste water, health department |
| **Pricing Unit**   | per trailer/day                                                         |
| **Lead Time**      | 672 hours                                                               |
| **Setup Time**     | 2 to 4 hours (position, connect, inspect)                               |
| **Strike Time**    | 2 hours                                                                 |
| **Crew Required**  | CDL driver, electrician, plumber, kitchen staff                         |
| **Power**          | 100A to 200A 208V 3-phase                                               |
| **Footprint**      | 8ft x 16ft to 8ft x 36ft                                                |
| **Truck Space**    | Self-contained trailer                                                  |
| **Weather**        | `all_weather`                                                           |
| **Compliance**     | `OSHA                                                                   | FIRE_MARSHAL                                   | HEALTH_DEPT`                      |
| **Sustainability** | `REUSABLE`                                                              |

###### Grill - Portable

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | ------------------- | ----------------- | ----------------- |
| **Legacy Code**    | `FNB-1201`                                                  |
| **SKU**            | `FNBV-KTCH-KEQP-002`                                        |
| **UNSPSC**         | `48101800`                                                  |
| **Common Name**    | Portable Commercial Grill                                   |
| **Search Aliases** | Event Grill                                                 | Outdoor Grill       | Flat-Top Griddle  | BBQ Grill         |
| **Description**    | Freestanding commercial-grade grill for outdoor events      |
| **Specifications** | 24in through 48in                                           | Multiple fuel types |
| **Options**        | Charcoal Grill                                              | Propane Grill       | Flat-Top Griddle  | Combination       |
| **Modifiers**      | Size                                                        | Fuel Type           | With Hood or Vent | With Propane Tank |
| **Prerequisites**  | Propane tanks, fire extinguisher, clearance from structures |
| **Pricing Unit**   | per unit/day                                                |
| **Lead Time**      | 168 hours                                                   |
| **Setup Time**     | 15 to 60 min per unit                                       |
| **Strike Time**    | 15 to 30 min                                                |
| **Crew Required**  | 1 to 2 kitchen staff                                        |
| **Power**          | 20A to 50A (varies by equipment)                            |
| **Footprint**      | 2ft x 3ft to 4ft x 6ft per unit                             |
| **Truck Space**    | Varies by equipment                                         |
| **Weather**        | `sheltered`                                                 |
| **Compliance**     | `HEALTH_DEPT`                                               |
| **Sustainability** | `REUSABLE`                                                  |

###### Refrigerator - Portable

|                    |                                                                          |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------ | -------------- | ---------------- | ------------ |
| **Legacy Code**    | `FNB-1202`                                                               |
| **SKU**            | `FNBV-KTCH-KEQP-003`                                                     |
| **UNSPSC**         | `48101800`                                                               |
| **Common Name**    | Portable Refrigerator                                                    |
| **Search Aliases** | Event Fridge                                                             | Reach-In Cooler                | Walk-In Cooler | Portable Freezer |
| **Description**    | Temporary refrigeration for food and beverage storage                    |
| **Specifications** | Reach-in 1-door through walk-in 8x20                                     | Freezer options                |
| **Options**        | Reach-In 1-Door                                                          | Reach-In 2-Door                | Walk-In 8x8    | Walk-In 8x12     | Walk-In 8x20 |
| **Modifiers**      | Size                                                                     | Temp Range (cooler vs freezer) | Power          | Shelving         |
| **Prerequisites**  | Dedicated power (20A per unit, walk-in may need 30 to 60A), level ground |
| **Pricing Unit**   | per unit/day                                                             |
| **Lead Time**      | 168 hours                                                                |
| **Setup Time**     | 15 to 60 min per unit                                                    |
| **Strike Time**    | 15 to 30 min                                                             |
| **Crew Required**  | 1 to 2 kitchen staff                                                     |
| **Power**          | 20A to 50A (varies by equipment)                                         |
| **Footprint**      | 2ft x 3ft to 4ft x 6ft per unit                                          |
| **Truck Space**    | Varies by equipment                                                      |
| **Weather**        | `sheltered`                                                              |
| **Compliance**     | `HEALTH_DEPT`                                                            |
| **Sustainability** | `REUSABLE`                                                               |

###### Ice Machine - Portable

|                    |                                                     |
| ------------------ | --------------------------------------------------- | ---------------- | ----------------- |
| **Legacy Code**    | `FNB-1203`                                          |
| **SKU**            | `FNBV-KTCH-KEQP-004`                                |
| **UNSPSC**         | `48101800`                                          |
| **Common Name**    | Portable Ice Machine                                |
| **Search Aliases** | Ice Maker                                           | Ice Generator    | Event Ice Machine |
| **Description**    | Temporary ice-making machine for high-volume events |
| **Specifications** | 250, 500, or 1,000 lb per day                       | With bin         |
| **Options**        | 250 lb per day                                      | 500 lb per day   | 1,000 lb per day  |
| **Modifiers**      | Production Rate                                     | With Storage Bin | Water Hookup      |
| **Prerequisites**  | Water supply, power (20A), drainage                 |
| **Pricing Unit**   | per unit/day                                        |
| **Lead Time**      | 168 hours                                           |
| **Setup Time**     | 15 to 60 min per unit                               |
| **Strike Time**    | 15 to 30 min                                        |
| **Crew Required**  | 1 to 2 kitchen staff                                |
| **Power**          | 20A to 50A (varies by equipment)                    |
| **Footprint**      | 2ft x 3ft to 4ft x 6ft per unit                     |
| **Truck Space**    | Varies by equipment                                 |
| **Weather**        | `sheltered`                                         |
| **Compliance**     | `HEALTH_DEPT`                                       |
| **Sustainability** | `REUSABLE`                                          |

###### Warmer - Food Holding

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | -------------------------- | ----------------- | ----------------- |
| **Legacy Code**    | `FNB-1204`                                                   |
| **SKU**            | `FNBV-KTCH-KEQP-005`                                         |
| **UNSPSC**         | `48101800`                                                   |
| **Common Name**    | Food Warming Cabinet                                         |
| **Search Aliases** | Hot Holding                                                  | Food Warmer                | Steam Table       | Heat Lamp Station |
| **Description**    | Portable food warming cabinet or steam table for hot holding |
| **Specifications** | Half-size, full-size, or steam table                         | Heat lamp options          |
| **Options**        | Insulated Cabinet                                            | Steam Table (2 to 5 wells) | Heat Lamp Station |
| **Modifiers**      | Type                                                         | Well Count                 | Power             |
| **Prerequisites**  | Power (20A), water for steam table                           |
| **Pricing Unit**   | per unit/day                                                 |
| **Lead Time**      | 168 hours                                                    |
| **Setup Time**     | 15 to 60 min per unit                                        |
| **Strike Time**    | 15 to 30 min                                                 |
| **Crew Required**  | 1 to 2 kitchen staff                                         |
| **Power**          | 20A to 50A (varies by equipment)                             |
| **Footprint**      | 2ft x 3ft to 4ft x 6ft per unit                              |
| **Truck Space**    | Varies by equipment                                          |
| **Weather**        | `sheltered`                                                  |
| **Compliance**     | `HEALTH_DEPT`                                                |
| **Sustainability** | `REUSABLE`                                                   |

###### Prep Table - Stainless

|                    |                                                 |
| ------------------ | ----------------------------------------------- | -------------------------------------- | ---------------------- | --------------- |
| **Legacy Code**    | `FNB-1205`                                      |
| **SKU**            | `FNBV-KTCH-KEQP-006`                            |
| **UNSPSC**         | `48101800`                                      |
| **Common Name**    | Stainless Prep Table                            |
| **Search Aliases** | Prep Table                                      | Work Table                             | NSF Table              | Kitchen Counter |
| **Description**    | Stainless steel prep table for food preparation |
| **Specifications** | 24x48 through 30x72                             | With undershelf and backsplash options |
| **Options**        | Standard                                        | With Undershelf                        | With Cutting Board Top |
| **Modifiers**      | Size                                            | Quantity                               | Undershelf             |
| **Prerequisites**  | NSF-rated for food contact                      |
| **Pricing Unit**   | per unit/day                                    |
| **Lead Time**      | 168 hours                                       |
| **Setup Time**     | 15 to 60 min per unit                           |
| **Strike Time**    | 15 to 30 min                                    |
| **Crew Required**  | 1 to 2 kitchen staff                            |
| **Power**          | 20A to 50A (varies by equipment)                |
| **Footprint**      | 2ft x 3ft to 4ft x 6ft per unit                 |
| **Truck Space**    | Varies by equipment                             |
| **Weather**        | `sheltered`                                     |
| **Compliance**     | `HEALTH_DEPT`                                   |
| **Sustainability** | `REUSABLE`                                      |

[Back to top](#table-of-contents)

##### Concessions & Carts

###### Concession Stand

|                    |                                                     |
| ------------------ | --------------------------------------------------- | ---------------------------- | -------------- | --------- |
| **Legacy Code**    | `FNB-1210`                                          |
| **SKU**            | `FNBV-KTCH-CART-001`                                |
| **UNSPSC**         | `48101900`                                          |
| **Common Name**    | Concession Stand                                    |
| **Search Aliases** | Concession Window                                   | Food Stand                   | Pop-Up Kitchen | Snack Bar |
| **Description**    | Pop-up or built concession stand for food sales     |
| **Specifications** | 8ft through 12ft window                             | With equipment or shell only |
| **Options**        | Shell Only                                          | Equipped (fryer, grill)      | Full Turnkey   |
| **Modifiers**      | Size                                                | Equipment Level              | Branding       | POS       |
| **Prerequisites**  | Power (50 to 100A), health permit, fire suppression |
| **Pricing Unit**   | per stand/day                                       |
| **Lead Time**      | 168 hours                                           |
| **Setup Time**     | 15 to 60 min per unit                               |
| **Strike Time**    | 15 to 30 min                                        |
| **Crew Required**  | 1 to 2 kitchen staff                                |
| **Power**          | 20A to 50A (varies by equipment)                    |
| **Footprint**      | 2ft x 3ft to 4ft x 6ft per unit                     |
| **Truck Space**    | Varies by equipment                                 |
| **Weather**        | `sheltered`                                         |
| **Compliance**     | `HEALTH_DEPT`                                       |
| **Sustainability** | `REUSABLE`                                          |

###### Cart - Specialty Food

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ----------- | --------------- | ----------------- |
| **Legacy Code**    | `FNB-1211`                                            |
| **SKU**            | `FNBV-KTCH-CART-002`                                  |
| **UNSPSC**         | `48101900`                                            |
| **Common Name**    | Specialty Food Cart                                   |
| **Search Aliases** | Coffee Cart                                           | Gelato Cart | Popcorn Machine | Cotton Candy Cart |
| **Description**    | Specialty mobile cart for single-product food service |
| **Specifications** | Coffee, gelato, popcorn, cotton candy, or pretzel     |
| **Options**        | Coffee Espresso Cart                                  | Gelato Cart | Popcorn Machine | Cotton Candy      |
| **Modifiers**      | Product Type                                          | Staffing    | Power           | Consumables       |
| **Prerequisites**  | Power (20A), consumable supplies, staff               |
| **Pricing Unit**   | per cart/day                                          |
| **Lead Time**      | 168 hours                                             |
| **Setup Time**     | 15 to 60 min per unit                                 |
| **Strike Time**    | 15 to 30 min                                          |
| **Crew Required**  | 1 to 2 kitchen staff                                  |
| **Power**          | 20A to 50A (varies by equipment)                      |
| **Footprint**      | 2ft x 3ft to 4ft x 6ft per unit                       |
| **Truck Space**    | Varies by equipment                                   |
| **Weather**        | `sheltered`                                           |
| **Compliance**     | `HEALTH_DEPT`                                         |
| **Sustainability** | `REUSABLE`                                            |

###### Cart - Beverage

|                    |                                                                      |
| ------------------ | -------------------------------------------------------------------- | ------------ | ------------ | ---------------- |
| **Legacy Code**    | `FNB-1212`                                                           |
| **SKU**            | `FNBV-KTCH-CART-003`                                                 |
| **UNSPSC**         | `48101900`                                                           |
| **Common Name**    | Mobile Beverage Cart                                                 |
| **Search Aliases** | Drink Cart                                                           | Roaming Bar  | Rolling Bar  | Beverage Trolley |
| **Description**    | Rolling beverage cart for roaming drink service                      |
| **Specifications** | Iced beverages, pre-mixed cocktails, beer and wine, or non-alcoholic |
| **Options**        | Standard Cooler Cart                                                 | Branded Cart | LED-Lit Cart |
| **Modifiers**      | Cart Type                                                            | Product      | Staffing     | Branding         |
| **Prerequisites**  | Liquor license (if alcohol), ice, cups, staff                        |
| **Pricing Unit**   | per cart/day                                                         |
| **Lead Time**      | 168 hours                                                            |
| **Setup Time**     | 15 to 60 min per unit                                                |
| **Strike Time**    | 15 to 30 min                                                         |
| **Crew Required**  | 1 to 2 kitchen staff                                                 |
| **Power**          | 20A to 50A (varies by equipment)                                     |
| **Footprint**      | 2ft x 3ft to 4ft x 6ft per unit                                      |
| **Truck Space**    | Varies by equipment                                                  |
| **Weather**        | `sheltered`                                                          |
| **Compliance**     | `HEALTH_DEPT`                                                        |
| **Sustainability** | `REUSABLE`                                                           |

[Back to top](#table-of-contents)

---

### Retail

_14 items_

#### Merchandise

##### Display & Fixtures

###### Booth - Merchandise

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | -------------------------------------- | --------------- | ------------ | ------- |
| **Legacy Code**    | `RETAIL-1001`                                                |
| **SKU**            | `RETL-MRCH-DISP-001`                                         |
| **UNSPSC**         | `52141500`                                                   |
| **Common Name**    | Merchandise Booth                                            |
| **Search Aliases** | Merch Tent                                                   | Sales Booth                            | Retail Pop-Up   | Merch Stand  |
| **Description**    | Dedicated merch sales structure with counter and display     |
| **Specifications** | 10x10 through 20x20                                          | With lighting, counter, racks, and POS |
| **Options**        | Pop-Up Tent                                                  | Hard-Wall Booth                        | Container-Based | Custom Build |
| **Modifiers**      | Size                                                         | Display Fixtures                       | Lighting        | POS Station  | Signage |
| **Prerequisites**  | Power (2 to 4x 20A), staffing, POS system, inventory storage |
| **Pricing Unit**   | per booth/day                                                |
| **Lead Time**      | 72 hours                                                     |
| **Setup Time**     | 15 min                                                       |
| **Strike Time**    | 15 min                                                       |
| **Crew Required**  | 1 person                                                     |
| **Power**          | None                                                         |
| **Footprint**      | Varies                                                       |
| **Truck Space**    | Minimal                                                      |
| **Weather**        | `outdoor_rated`                                              |
| **Sustainability** | `REUSABLE`                                                   |

###### Rack - Garment

|                    |                                            |
| ------------------ | ------------------------------------------ | ----------------- | ---------------- | ---------------- |
| **Legacy Code**    | `RETAIL-1002`                              |
| **SKU**            | `RETL-MRCH-DISP-002`                       |
| **UNSPSC**         | `52141500`                                 |
| **Common Name**    | Garment Rack                               |
| **Search Aliases** | Clothing Rack                              | Display Rack      | Rolling Rack     | Z-Rack           |
| **Description**    | Rolling or stationary garment display rack |
| **Specifications** | Single bar, double bar, round, or Z-rack   |
| **Options**        | Chrome Single-Bar                          | Chrome Double-Bar | Round            | Z-Rack (rolling) |
| **Modifiers**      | Type                                       | Quantity          | Hangers (add-on) |
| **Pricing Unit**   | per unit/day                               |
| **Lead Time**      | 72 hours                                   |
| **Setup Time**     | 15 min                                     |
| **Strike Time**    | 15 min                                     |
| **Crew Required**  | 1 person                                   |
| **Power**          | None                                       |
| **Footprint**      | Varies                                     |
| **Truck Space**    | Minimal                                    |
| **Weather**        | `outdoor_rated`                            |
| **Sustainability** | `REUSABLE`                                 |

###### Table - Display

|                    |                                            |
| ------------------ | ------------------------------------------ | -------------------------- | ----------------- | --------------- |
| **Legacy Code**    | `RETAIL-1003`                              |
| **SKU**            | `RETL-MRCH-DISP-003`                       |
| **UNSPSC**         | `52141500`                                 |
| **Common Name**    | Display Table                              |
| **Search Aliases** | Merch Table                                | Sales Counter              | Retail Counter    | Display Surface |
| **Description**    | Merchandise display table or sales counter |
| **Specifications** | 4ft through 8ft                            | Folding and custom options |
| **Options**        | Folding (skirted)                          | Retail Counter             | Slatwall Display  | Custom Built    |
| **Modifiers**      | Size                                       | Type                       | Skirting or Cover | Shelving        |
| **Pricing Unit**   | per unit/day                               |
| **Lead Time**      | 72 hours                                   |
| **Setup Time**     | 15 min                                     |
| **Strike Time**    | 15 min                                     |
| **Crew Required**  | 1 person                                   |
| **Power**          | None                                       |
| **Footprint**      | Varies                                     |
| **Truck Space**    | Minimal                                    |
| **Weather**        | `outdoor_rated`                            |
| **Sustainability** | `REUSABLE`                                 |

###### Shelving - Display

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | --------------------- | ------------------------------------- | ------------ | ------------ |
| **Legacy Code**    | `RETAIL-1004`                                         |
| **SKU**            | `RETL-MRCH-DISP-004`                                  |
| **UNSPSC**         | `52141500`                                            |
| **Common Name**    | Modular Display Shelving                              |
| **Search Aliases** | Gridwall                                              | Slatwall              | Wire Shelving                         | Pegboard     | Cube Display |
| **Description**    | Modular display shelving for product merchandising    |
| **Specifications** | Gridwall (2x6, 2x8), slatwall panel, or wire shelving |
| **Options**        | Gridwall with Hooks                                   | Slatwall with Shelves | Wire Freestanding                     | Cube Display |
| **Modifiers**      | Type                                                  | Size                  | Accessories (hooks, shelves, baskets) |
| **Pricing Unit**   | per unit/day                                          |
| **Lead Time**      | 72 hours                                              |
| **Setup Time**     | 15 min                                                |
| **Strike Time**    | 15 min                                                |
| **Crew Required**  | 1 person                                              |
| **Power**          | None                                                  |
| **Footprint**      | Varies                                                |
| **Truck Space**    | Minimal                                               |
| **Weather**        | `outdoor_rated`                                       |
| **Sustainability** | `REUSABLE`                                            |

###### Mannequin - Display

|                    |                                             |
| ------------------ | ------------------------------------------- | --------- | ------------- | -------------- |
| **Legacy Code**    | `RETAIL-1005`                               |
| **SKU**            | `RETL-MRCH-DISP-005`                        |
| **UNSPSC**         | `52141500`                                  |
| **Common Name**    | Display Mannequin                           |
| **Search Aliases** | Dress Form                                  | Body Form | Torso Display | Half Mannequin |
| **Description**    | Display mannequin for apparel merchandising |
| **Specifications** | Full body, half body, or dress form         |
| **Options**        | Full Body (male or female)                  | Half Body | Dress Form    | Abstract       |
| **Modifiers**      | Type                                        | Quantity  |
| **Pricing Unit**   | per unit/day                                |
| **Lead Time**      | 72 hours                                    |
| **Setup Time**     | 15 min                                      |
| **Strike Time**    | 15 min                                      |
| **Crew Required**  | 1 person                                    |
| **Power**          | None                                        |
| **Footprint**      | Varies                                      |
| **Truck Space**    | Minimal                                     |
| **Weather**        | `outdoor_rated`                             |
| **Sustainability** | `REUSABLE`                                  |

###### Display Case - Lockable

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | ----------------------------------- | -------------- | -------- |
| **Legacy Code**    | `RETAIL-1006`                                             |
| **SKU**            | `RETL-MRCH-DISP-006`                                      |
| **UNSPSC**         | `52141500`                                                |
| **Common Name**    | Lockable Display Case                                     |
| **Search Aliases** | Jewelry Case                                              | Glass Case                          | Secure Display | Showcase |
| **Description**    | Secure glass or acrylic display case for high-value items |
| **Specifications** | 2ft through 4ft                                           | Countertop and freestanding options |
| **Options**        | Countertop                                                | Pedestal                            | Wall-Mount     | LED-Lit  |
| **Modifiers**      | Size                                                      | Locking                             | LED Lighting   | Quantity |
| **Pricing Unit**   | per unit/day                                              |
| **Lead Time**      | 72 hours                                                  |
| **Setup Time**     | 15 min                                                    |
| **Strike Time**    | 15 min                                                    |
| **Crew Required**  | 1 person                                                  |
| **Power**          | None                                                      |
| **Footprint**      | Varies                                                    |
| **Truck Space**    | Minimal                                                   |
| **Weather**        | `outdoor_rated`                                           |
| **Sustainability** | `REUSABLE`                                                |

[Back to top](#table-of-contents)

##### POS & Technology

###### POS System - Mobile

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ------------------------------- | -------------------- | ---------------- |
| **Legacy Code**    | `RETAIL-1010`                                              |
| **SKU**            | `RETL-MRCH-POST-001`                                       |
| **UNSPSC**         | `52161600`                                                 |
| **Common Name**    | Mobile POS System                                          |
| **Search Aliases** | Mobile Register                                            | Card Reader                     | Tablet POS           | Payment Terminal |
| **Description**    | Mobile point-of-sale system for merch and concession sales |
| **Specifications** | Square, Clover, Toast, or Shopify POS                      |
| **Options**        | Square Reader with iPad                                    | Clover Flex                     | Shopify POS          | Custom           |
| **Modifiers**      | Hardware                                                   | Connectivity (WiFi or cellular) | Cash Drawer (add-on) | Receipt Printer  |
| **Prerequisites**  | WiFi or cellular connectivity, power or battery            |
| **Pricing Unit**   | per station/day                                            |
| **Lead Time**      | 72 hours                                                   |
| **Setup Time**     | 15 min                                                     |
| **Strike Time**    | 15 min                                                     |
| **Crew Required**  | 1 person                                                   |
| **Power**          | None                                                       |
| **Footprint**      | Varies                                                     |
| **Truck Space**    | Minimal                                                    |
| **Weather**        | `outdoor_rated`                                            |
| **Sustainability** | `REUSABLE`                                                 |

###### Supplies - Cash Handling

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | ----------------------- | -------------------- | --------- |
| **Legacy Code**    | `RETAIL-1011`                                                   |
| **SKU**            | `RETL-MRCH-POST-002`                                            |
| **UNSPSC**         | `52161600`                                                      |
| **Common Name**    | Cash Handling Supplies                                          |
| **Search Aliases** | Cash Drawer                                                     | Bill Counter            | Counterfeit Detector | Money Bag |
| **Description**    | Cash drawer, coin changer, counterfeit detector, and money bags |
| **Specifications** | Drawer, counter, changer, and detection                         |
| **Options**        | Basic (drawer and pens)                                         | Standard (plus counter) | Secure (plus safe)   |
| **Modifiers**      | Kit Level                                                       | Quantity                |
| **Pricing Unit**   | per kit/event                                                   |
| **Lead Time**      | 72 hours                                                        |
| **Setup Time**     | 15 min                                                          |
| **Strike Time**    | 15 min                                                          |
| **Crew Required**  | 1 person                                                        |
| **Power**          | None                                                            |
| **Footprint**      | Varies                                                          |
| **Truck Space**    | Minimal                                                         |
| **Weather**        | `outdoor_rated`                                                 |
| **Sustainability** | `REUSABLE`                                                      |

###### ATM - Portable

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | ---------------------------- | ----------------------- | ---------------- |
| **Legacy Code**    | `RETAIL-1012`                                          |
| **SKU**            | `RETL-MRCH-POST-003`                                   |
| **UNSPSC**         | `52161600`                                             |
| **Common Name**    | Portable ATM                                           |
| **Search Aliases** | Event ATM                                              | Cash Machine                 | ATM Rental              | Freestanding ATM |
| **Description**    | Portable ATM for cash access at events                 |
| **Specifications** | Freestanding or countertop                             | With surcharge configuration |
| **Options**        | Standard Freestanding                                  | Premium (branded wrap)       | Multi-Denomination      |
| **Modifiers**      | Quantity                                               | Cash Load                    | Surcharge Configuration | Internet         |
| **Prerequisites**  | Power (20A), cellular or ethernet, armored car service |
| **Pricing Unit**   | per unit/day                                           |
| **Lead Time**      | 72 hours                                               |
| **Setup Time**     | 15 min                                                 |
| **Strike Time**    | 15 min                                                 |
| **Crew Required**  | 1 person                                               |
| **Power**          | None                                                   |
| **Footprint**      | Varies                                                 |
| **Truck Space**    | Minimal                                                |
| **Weather**        | `outdoor_rated`                                        |
| **Sustainability** | `REUSABLE`                                             |

[Back to top](#table-of-contents)

##### Packaging & Supplies

###### Bag - Shopping - Branded

|                    |                                               |
| ------------------ | --------------------------------------------- | --------------------------- | ------------- | ------------------ | -------- |
| **Legacy Code**    | `RETAIL-1015`                                 |
| **SKU**            | `RETL-MRCH-PACK-001`                          |
| **UNSPSC**         | `55121500`                                    |
| **Common Name**    | Branded Shopping Bag                          |
| **Search Aliases** | Merch Bag                                     | Retail Bag                  | Custom Bag    | Swag Bag           | Gift Bag |
| **Description**    | Custom branded bags for merchandise purchases |
| **Specifications** | Small through large                           | Paper, plastic, or reusable |
| **Options**        | Paper (kraft or white)                        | Plastic                     | Reusable Tote | Gift Bag           |
| **Modifiers**      | Size                                          | Material                    | Branding      | Quantity (per 100) |
| **Prerequisites**  | Design file for print                         |
| **Pricing Unit**   | per 100                                       |
| **Lead Time**      | 72 hours                                      |
| **Setup Time**     | 15 min                                        |
| **Strike Time**    | 15 min                                        |
| **Crew Required**  | 1 person                                      |
| **Power**          | None                                          |
| **Footprint**      | Varies                                        |
| **Truck Space**    | Minimal                                       |
| **Weather**        | `outdoor_rated`                               |
| **Sustainability** | `REUSABLE`                                    |

###### Supplies - Retail Packaging

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ------------ | -------------- | --------- | ---------------- |
| **Legacy Code**    | `RETAIL-1016`                                        |
| **SKU**            | `RETL-MRCH-PACK-002`                                 |
| **UNSPSC**         | `55121500`                                           |
| **Common Name**    | Retail Packaging Supplies                            |
| **Search Aliases** | Receipt Paper                                        | Tissue Paper | Stickers       | Gift Wrap | Packing Supplies |
| **Description**    | Receipt paper, tissue paper, stickers, and gift wrap |
| **Specifications** | Receipt rolls, tissue, brand stickers, and wrapping  |
| **Options**        | Receipt Roll (thermal)                               | Tissue Paper | Brand Stickers | Gift Wrap |
| **Modifiers**      | Type                                                 | Quantity     |
| **Prerequisites**  | Compatible POS printer for receipts                  |
| **Pricing Unit**   | per kit/event                                        |
| **Lead Time**      | 72 hours                                             |
| **Setup Time**     | 15 min                                               |
| **Strike Time**    | 15 min                                               |
| **Crew Required**  | 1 person                                             |
| **Power**          | None                                                 |
| **Footprint**      | Varies                                               |
| **Truck Space**    | Minimal                                              |
| **Weather**        | `outdoor_rated`                                      |
| **Sustainability** | `REUSABLE`                                           |

[Back to top](#table-of-contents)

#### Vendor Marketplace

##### Vendor Infrastructure

###### Booth Space - Vendor

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ----------------------- | ----------------- | ------------- |
| **Legacy Code**    | `RETAIL-1100`                                            |
| **SKU**            | `RETL-VMKT-VINF-001`                                     |
| **UNSPSC**         | `80141600`                                               |
| **Common Name**    | Vendor Booth Space                                       |
| **Search Aliases** | Market Booth                                             | Vendor Stall            | Marketplace Booth | Artisan Booth |
| **Description**    | Designated vendor marketplace booth with power and table |
| **Specifications** | 10x10 through 10x20                                      | Shared tent or open-air |
| **Options**        | Open-Air (BYO tent)                                      | Under Shared Tent       | Hard-Wall Booth   |
| **Modifiers**      | Size                                                     | Power (20A circuit)     | Table             | Lighting      |
| **Prerequisites**  | Vendor agreement, insurance, fire marshal compliance     |
| **Pricing Unit**   | per booth/day                                            |
| **Lead Time**      | 336 hours                                                |
| **Setup Time**     | 4 to 8 hours                                             |
| **Strike Time**    | 3 to 6 hours                                             |
| **Crew Required**  | 3 to 6 tent crew                                         |
| **Power**          | Per lighting and HVAC package                            |
| **Footprint**      | Varies (20x20 to 60x120)                                 |
| **Truck Space**    | 1 to 2 box trucks per tent                               |
| **Weather**        | `outdoor_rated`                                          |
| **Compliance**     | `ADA                                                     | FIRE_MARSHAL            | TENT_PERMIT`      |
| **Sustainability** | `REUSABLE`                                               |

###### Vendor Pad - Food Truck

|                    |                                                                     |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------ | ----------------------- | ------------ |
| **Legacy Code**    | `RETAIL-1101`                                                       |
| **SKU**            | `RETL-VMKT-VINF-002`                                                |
| **UNSPSC**         | `80141600`                                                          |
| **Common Name**    | Food Vendor Pad                                                     |
| **Search Aliases** | Food Truck Pad                                                      | Vendor Space                         | Mobile Kitchen Pad      |
| **Description**    | Level prepared pad for food truck or food vendor tent               |
| **Specifications** | 10x20 through 20x30                                                 | With power, water, and waste         |
| **Options**        | Unprepared (gravel or grass)                                        | Level Pad                            | Paved Pad               | With Hookups |
| **Modifiers**      | Size                                                                | Utilities (power, water, gray water) | Fire Suppression Access |
| **Prerequisites**  | Health department approval, fire marshal clearance, utility hookups |
| **Pricing Unit**   | per pad/day                                                         |
| **Lead Time**      | 336 hours                                                           |
| **Setup Time**     | 4 to 8 hours                                                        |
| **Strike Time**    | 3 to 6 hours                                                        |
| **Crew Required**  | 3 to 6 tent crew                                                    |
| **Power**          | Per lighting and HVAC package                                       |
| **Footprint**      | Varies (20x20 to 60x120)                                            |
| **Truck Space**    | 1 to 2 box trucks per tent                                          |
| **Weather**        | `outdoor_rated`                                                     |
| **Compliance**     | `ADA                                                                | FIRE_MARSHAL                         | TENT_PERMIT`            |
| **Sustainability** | `REUSABLE`                                                          |

###### Activation Space - Sponsor

|                    |                                                   |
| ------------------ | ------------------------------------------------- | ------------------------------------ | ------------- | --------------- | -------- |
| **Legacy Code**    | `RETAIL-1102`                                     |
| **SKU**            | `RETL-VMKT-VINF-003`                              |
| **UNSPSC**         | `80141600`                                        |
| **Common Name**    | Sponsor Activation Space                          |
| **Search Aliases** | Activation Footprint                              | Branded Space                        | Sponsor Build | Experience Zone |
| **Description**    | Dedicated footprint for sponsor brand activation  |
| **Specifications** | 10x10 through custom                              | Tented, hard-wall, or full build-out |
| **Options**        | Open Footprint                                    | Tented                               | Hard-Wall     | Full Build-Out  |
| **Modifiers**      | Size                                              | Power                                | Water         | Exclusivity     | Duration |
| **Prerequisites**  | Sponsor agreement, build schedule, power, permits |
| **Pricing Unit**   | per space/day                                     |
| **Lead Time**      | 336 hours                                         |
| **Setup Time**     | 4 to 8 hours                                      |
| **Strike Time**    | 3 to 6 hours                                      |
| **Crew Required**  | 3 to 6 tent crew                                  |
| **Power**          | Per lighting and HVAC package                     |
| **Footprint**      | Varies (20x20 to 60x120)                          |
| **Truck Space**    | 1 to 2 box trucks per tent                        |
| **Weather**        | `outdoor_rated`                                   |
| **Compliance**     | `ADA                                              | FIRE_MARSHAL                         | TENT_PERMIT`  |
| **Sustainability** | `REUSABLE`                                        |

[Back to top](#table-of-contents)

---

### Workplace

_38 items_

#### Access & Credentials

##### Credentials

###### Badge - Credential

|                    |                                                                     |
| ------------------ | ------------------------------------------------------------------- | -------------- | ---------------- | --------------------------- | --------------- |
| **Legacy Code**    | `WORK-1001`                                                         |
| **SKU**            | `WORK-ACCS-CRED-001`                                                |
| **UNSPSC**         | `44103100`                                                          |
| **Common Name**    | Laminated Credential Badge                                          |
| **Search Aliases** | Event Badge                                                         | Backstage Pass | Laminate         | All-Access Pass             | Photo ID Badge  |
| **Description**    | Custom printed credential with lanyard for staff, artist, or vendor |
| **Specifications** | PVC card                                                            | Holographic    | RFID or NFC      | Tyvek wristband alternative |
| **Options**        | Standard PVC                                                        | Holographic    | RFID-Enabled     | NFC-Enabled                 | Tyvek Wristband |
| **Modifiers**      | Type                                                                | Quantity       | Design and Print | Lanyard Color               | RFID Encoding   |
| **Prerequisites**  | Design file, printer or print vendor, encoding hardware (if RFID)   |
| **Pricing Unit**   | per unit                                                            |
| **Lead Time**      | 336 hours                                                           |
| **Setup Time**     | N/A (distribution item)                                             |
| **Strike Time**    | N/A                                                                 |
| **Crew Required**  | 1 to 2 people for distribution                                      |
| **Power**          | None                                                                |
| **Footprint**      | Minimal (distribution table)                                        |
| **Truck Space**    | Boxes, minimal                                                      |
| **Weather**        | `not_applicable`                                                    |
| **Sustainability** | `REUSABLE                                                           | RECYCLABLE`    |

###### Wristband - Event

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ----------------- | -------------- | ------------- | ---- |
| **Legacy Code**    | `WORK-1002`                                              |
| **SKU**            | `WORK-ACCS-CRED-002`                                     |
| **UNSPSC**         | `44103100`                                               |
| **Common Name**    | Event Wristband                                          |
| **Search Aliases** | Tyvek Wristband                                          | Fabric Wristband  | RFID Wristband | Silicone Band |
| **Description**    | Event wristband for general admission or tiered access   |
| **Specifications** | Tyvek (paper), cloth (fabric), silicone, or RFID-enabled |
| **Options**        | Tyvek (1-day)                                            | Cloth (multi-day) | Silicone (VIP) | RFID Cloth    |
| **Modifiers**      | Material                                                 | Color Coding      | Quantity       | Custom Print  | RFID |
| **Prerequisites**  | Distribution plan, design file                           |
| **Pricing Unit**   | per unit                                                 |
| **Lead Time**      | 336 hours                                                |
| **Setup Time**     | N/A (distribution item)                                  |
| **Strike Time**    | N/A                                                      |
| **Crew Required**  | 1 to 2 people for distribution                           |
| **Power**          | None                                                     |
| **Footprint**      | Minimal (distribution table)                             |
| **Truck Space**    | Boxes, minimal                                           |
| **Weather**        | `not_applicable`                                         |
| **Sustainability** | `REUSABLE                                                | RECYCLABLE`       |

###### Pass - Parking

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | ----------------- | ------------------------ | ---------------------- |
| **Legacy Code**    | `WORK-1003`                                                     |
| **SKU**            | `WORK-ACCS-CRED-003`                                            |
| **UNSPSC**         | `44103100`                                                      |
| **Common Name**    | Parking Pass                                                    |
| **Search Aliases** | Parking Placard                                                 | Parking Hang Tag  | Vehicle Credential       | Lot Pass               |
| **Description**    | Vehicle access credential for parking lots and restricted areas |
| **Specifications** | Hang tag, dashboard placard, windshield sticker, or RFID        |
| **Options**        | Paper Hang Tag                                                  | Laminated Placard | RFID Windshield Tag      |
| **Modifiers**      | Type                                                            | Quantity          | Lot and Zone Designation | License Plate Encoding |
| **Prerequisites**  | Parking plan, lot designations                                  |
| **Pricing Unit**   | per unit                                                        |
| **Lead Time**      | 336 hours                                                       |
| **Setup Time**     | N/A (distribution item)                                         |
| **Strike Time**    | N/A                                                             |
| **Crew Required**  | 1 to 2 people for distribution                                  |
| **Power**          | None                                                            |
| **Footprint**      | Minimal (distribution table)                                    |
| **Truck Space**    | Boxes, minimal                                                  |
| **Weather**        | `not_applicable`                                                |
| **Sustainability** | `REUSABLE                                                       | RECYCLABLE`       |

[Back to top](#table-of-contents)

##### Access Control

###### Metal Detector - Walk-Through

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ------------------- | ----------------------- | --------------- |
| **Legacy Code**    | `WORK-1005`                                           |
| **SKU**            | `WORK-ACCS-ACTC-001`                                  |
| **UNSPSC**         | `46171600`                                            |
| **Common Name**    | Walk-Through Metal Detector                           |
| **Search Aliases** | Security Gate                                         | Metal Detector Gate | Screening Gate          | Checkpoint Gate |
| **Description**    | Walk-through metal detector for venue entry screening |
| **Specifications** | 6-zone through 33-zone                                | With person counter |
| **Options**        | Standard (6-zone)                                     | Enhanced (18-zone)  | High-Security (33-zone) |
| **Modifiers**      | Sensitivity Level                                     | Quantity            | Operator                |
| **Prerequisites**  | Power (20A), entry lanes, trained operators           |
| **Pricing Unit**   | per unit/day                                          |
| **Lead Time**      | 168 hours                                             |
| **Setup Time**     | 30 to 60 min per unit                                 |
| **Strike Time**    | 15 to 30 min                                          |
| **Crew Required**  | 1 trained operator per unit                           |
| **Power**          | 1x 20A per unit                                       |
| **Footprint**      | 3ft x 7ft per unit (with queue space: 6ft x 10ft)     |
| **Truck Space**    | 1 unit per pallet                                     |
| **Weather**        | `sheltered`                                           |
| **Compliance**     | `ADA`                                                 |
| **Sustainability** | `REUSABLE`                                            |

###### Metal Detector - Handheld

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ------------------------- | ------------ | -------------- |
| **Legacy Code**    | `WORK-1006`                                          |
| **SKU**            | `WORK-ACCS-ACTC-002`                                 |
| **UNSPSC**         | `46171600`                                           |
| **Common Name**    | Handheld Metal Detector                              |
| **Search Aliases** | Security Wand                                        | Detection Wand            | Hand Scanner | Screening Wand |
| **Description**    | Portable wand metal detector for secondary screening |
| **Specifications** | Standard sensitivity                                 | Vibrate and audible alert |
| **Options**        | Standard                                             | High-Sensitivity          | With Holster |
| **Modifiers**      | Quantity                                             | Sensitivity Level         |
| **Prerequisites**  | Trained security staff                               |
| **Pricing Unit**   | per unit/day                                         |
| **Lead Time**      | 168 hours                                            |
| **Setup Time**     | 30 to 60 min per unit                                |
| **Strike Time**    | 15 to 30 min                                         |
| **Crew Required**  | 1 trained operator per unit                          |
| **Power**          | 1x 20A per unit                                      |
| **Footprint**      | 3ft x 7ft per unit (with queue space: 6ft x 10ft)    |
| **Truck Space**    | 1 unit per pallet                                    |
| **Weather**        | `sheltered`                                          |
| **Compliance**     | `ADA`                                                |
| **Sustainability** | `REUSABLE`                                           |

###### Scanner - RFID Access

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ----------------- | -------------------- | --------------------- |
| **Legacy Code**    | `WORK-1007`                                              |
| **SKU**            | `WORK-ACCS-ACTC-003`                                     |
| **UNSPSC**         | `46171600`                                               |
| **Common Name**    | RFID Access Scanner                                      |
| **Search Aliases** | NFC Reader                                               | RFID Gate         | Tap Scanner          | Access Control Reader |
| **Description**    | Automated access control scanning for credentialed entry |
| **Specifications** | Handheld reader, fixed turnstile reader, or tap gate     |
| **Options**        | Handheld Scanner                                         | Pedestal Reader   | Turnstile Integrated |
| **Modifiers**      | Reader Count                                             | Software Platform | Credential Encoding  |
| **Prerequisites**  | RFID credentials, software platform, network             |
| **Pricing Unit**   | per reader/day                                           |
| **Lead Time**      | 672 hours                                                |
| **Setup Time**     | 30 to 60 min per station                                 |
| **Strike Time**    | 15 min per station                                       |
| **Crew Required**  | 1 person per station                                     |
| **Power**          | 1x 20A per station (or battery)                          |
| **Footprint**      | 2ft x 2ft per reader                                     |
| **Truck Space**    | 1 case per 4 to 8 readers                                |
| **Weather**        | `outdoor_rated`                                          |
| **Compliance**     | `PCI`                                                    |
| **Sustainability** | `REUSABLE`                                               |

###### Scanner Station - Ticket

|                    |                                                |
| ------------------ | ---------------------------------------------- | --------------- | ---------------- | ---------------- |
| **Legacy Code**    | `WORK-1008`                                    |
| **SKU**            | `WORK-ACCS-ACTC-004`                           |
| **UNSPSC**         | `46171600`                                     |
| **Common Name**    | Ticket Scanner Station                         |
| **Search Aliases** | Box Office                                     | Ticket Booth    | Scanning Station | Will-Call Window |
| **Description**    | Ticket scanning hardware and box office setup  |
| **Specifications** | Handheld scanner, kiosk, or will-call station  |
| **Options**        | Handheld (phone or scanner)                    | Dedicated Kiosk | Full Box Office  |
| **Modifiers**      | Scanner Count                                  | Will-Call       | Cash Handling    | Printers         |
| **Prerequisites**  | Ticketing platform integration, network, power |
| **Pricing Unit**   | per station/day                                |
| **Lead Time**      | 672 hours                                      |
| **Setup Time**     | 30 to 60 min per station                       |
| **Strike Time**    | 15 min per station                             |
| **Crew Required**  | 1 person per station                           |
| **Power**          | 1x 20A per station (or battery)                |
| **Footprint**      | 2ft x 2ft per reader                           |
| **Truck Space**    | 1 case per 4 to 8 readers                      |
| **Weather**        | `outdoor_rated`                                |
| **Compliance**     | `PCI`                                          |
| **Sustainability** | `REUSABLE`                                     |

[Back to top](#table-of-contents)

#### Radio & Communications

##### Two-Way Radios

###### Radio - Two-Way - Standard

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | -------------- | ---------------------------- | ------------------------- |
| **Legacy Code**    | `WORK-1100`                                            |
| **SKU**            | `WORK-COMM-RDIO-001`                                   |
| **UNSPSC**         | `43191500`                                             |
| **Common Name**    | Standard Two-Way Radio                                 |
| **Search Aliases** | Walkie-Talkie                                          | Handheld Radio | UHF Radio                    | Event Radio               |
| **Description**    | UHF or VHF handheld two-way radio for event operations |
| **Specifications** | Motorola CP200d                                        | CLP1010        | Kenwood NX-P1300             |
| **Options**        | UHF 4-Channel                                          | UHF 16-Channel | Digital (DMR)                |
| **Modifiers**      | Model                                                  | Quantity       | Earpiece or Surveillance Kit | Charger (single or multi) |
| **Prerequisites**  | FCC license (Part 90) or GMRS, channel programming     |
| **Pricing Unit**   | per unit/day                                           |
| **Lead Time**      | 168 hours                                              |
| **Setup Time**     | 15 to 30 min per unit (program and test)               |
| **Strike Time**    | 10 min per unit                                        |
| **Crew Required**  | 1 comms tech for programming, users self-distribute    |
| **Power**          | 110V for chargers                                      |
| **Footprint**      | Minimal (belt-clip device)                             |
| **Truck Space**    | 1 case per 10 to 20 radios                             |
| **Weather**        | `outdoor_rated`                                        |
| **Compliance**     | `FCC                                                   | FCC_PART90`    |
| **Sustainability** | `REUSABLE`                                             |

###### Radio - Two-Way - Digital

|                    |                                                     |
| ------------------ | --------------------------------------------------- | ---------------------- | -------------- | --------------- | -------- |
| **Legacy Code**    | `WORK-1101`                                         |
| **SKU**            | `WORK-COMM-RDIO-002`                                |
| **UNSPSC**         | `43191500`                                          |
| **Common Name**    | Digital Trunked Radio                               |
| **Search Aliases** | DMR Radio                                           | P25 Radio              | Advanced Radio | Encrypted Radio |
| **Description**    | Advanced digital radio for large-scale operations   |
| **Specifications** | Motorola SL300                                      | XPR 7550e              | Hytera PD682   |
| **Options**        | DMR Tier II                                         | DMR Tier III (trunked) | P25            |
| **Modifiers**      | Model                                               | Quantity               | Encryption     | GPS Tracking    | Earpiece |
| **Prerequisites**  | Repeater infrastructure, FCC license, programming   |
| **Pricing Unit**   | per unit/day                                        |
| **Lead Time**      | 168 hours                                           |
| **Setup Time**     | 15 to 30 min per unit (program and test)            |
| **Strike Time**    | 10 min per unit                                     |
| **Crew Required**  | 1 comms tech for programming, users self-distribute |
| **Power**          | 110V for chargers                                   |
| **Footprint**      | Minimal (belt-clip device)                          |
| **Truck Space**    | 1 case per 10 to 20 radios                          |
| **Weather**        | `outdoor_rated`                                     |
| **Compliance**     | `FCC                                                | FCC_PART90`            |
| **Sustainability** | `REUSABLE`                                          |

###### Repeater - Radio

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | ------------- | ------------------------- | ------------- |
| **Legacy Code**    | `WORK-1102`                                                 |
| **SKU**            | `WORK-COMM-RDIO-003`                                        |
| **UNSPSC**         | `43191500`                                                  |
| **Common Name**    | Radio Repeater                                              |
| **Search Aliases** | Signal Repeater                                             | Base Station  | Coverage Extender         | Relay Station |
| **Description**    | Signal repeater to extend radio coverage across large sites |
| **Specifications** | UHF or VHF                                                  | Digital DMR   | With antenna and duplexer |
| **Options**        | Portable (tripod mount)                                     | Vehicle Mount | Permanent Install         |
| **Modifiers**      | Frequency                                                   | Power Output  | Antenna Height            | Coverage Area |
| **Prerequisites**  | FCC coordination, antenna mast or structure, power          |
| **Pricing Unit**   | per unit/day                                                |
| **Lead Time**      | 168 hours                                                   |
| **Setup Time**     | 15 to 30 min per unit (program and test)                    |
| **Strike Time**    | 10 min per unit                                             |
| **Crew Required**  | 1 comms tech for programming, users self-distribute         |
| **Power**          | 110V for chargers                                           |
| **Footprint**      | Minimal (belt-clip device)                                  |
| **Truck Space**    | 1 case per 10 to 20 radios                                  |
| **Weather**        | `outdoor_rated`                                             |
| **Compliance**     | `FCC                                                        | FCC_PART90`   |
| **Sustainability** | `REUSABLE`                                                  |

###### Charger - Radio - Multi-Bay

|                    |                                                     |
| ------------------ | --------------------------------------------------- | ------------------------- | ----------------------------------- | ------------- |
| **Legacy Code**    | `WORK-1103`                                         |
| **SKU**            | `WORK-COMM-RDIO-004`                                |
| **UNSPSC**         | `43191500`                                          |
| **Common Name**    | Multi-Bay Radio Charger                             |
| **Search Aliases** | Gang Charger                                        | 6-Bay Charger             | Conditioning Charger                | Charging Rack |
| **Description**    | 6-unit or 12-unit charging station for radios       |
| **Specifications** | 6-bay or 12-bay                                     | With conditioning display |
| **Options**        | 6-Bay                                               | 12-Bay                    | With Display (conditioning charger) |
| **Modifiers**      | Bay Count                                           | Quantity                  | Radio Model Compatibility           |
| **Prerequisites**  | Power (dedicated outlet)                            |
| **Pricing Unit**   | per unit/day                                        |
| **Lead Time**      | 168 hours                                           |
| **Setup Time**     | 15 to 30 min per unit (program and test)            |
| **Strike Time**    | 10 min per unit                                     |
| **Crew Required**  | 1 comms tech for programming, users self-distribute |
| **Power**          | 110V for chargers                                   |
| **Footprint**      | Minimal (belt-clip device)                          |
| **Truck Space**    | 1 case per 10 to 20 radios                          |
| **Weather**        | `outdoor_rated`                                     |
| **Compliance**     | `FCC                                                | FCC_PART90`               |
| **Sustainability** | `REUSABLE`                                          |

[Back to top](#table-of-contents)

##### Intercoms

###### Intercom - Wired

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ---------------------- | ----------------- | ------------ |
| **Legacy Code**    | `WORK-1110`                                             |
| **SKU**            | `WORK-COMM-INTC-001`                                    |
| **UNSPSC**         | `43191600`                                              |
| **Common Name**    | Wired Intercom Station                                  |
| **Search Aliases** | Clear-Com                                               | Production Intercom    | Hardline Intercom | PL System    |
| **Description**    | Hard-wired intercom for stage management and production |
| **Specifications** | Clear-Com MS-702 station                                | 2-channel or 4-channel | With headset      |
| **Options**        | 2-Channel Beltpack                                      | 4-Channel Beltpack     | Desk Station      | With Headset |
| **Modifiers**      | Channel Count                                           | Station Count          | Cable Runs        | Headsets     |
| **Prerequisites**  | Intercom main station, cable infrastructure             |
| **Pricing Unit**   | per station/day                                         |
| **Lead Time**      | 168 hours                                               |
| **Setup Time**     | 15 to 30 min per unit (program and test)                |
| **Strike Time**    | 10 min per unit                                         |
| **Crew Required**  | 1 comms tech for programming, users self-distribute     |
| **Power**          | 110V for chargers                                       |
| **Footprint**      | Minimal (belt-clip device)                              |
| **Truck Space**    | 1 case per 10 to 20 radios                              |
| **Weather**        | `outdoor_rated`                                         |
| **Compliance**     | `FCC                                                    | FCC_PART90`            |
| **Sustainability** | `REUSABLE`                                              |

###### Intercom - Wireless

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | ---------------------- | ------------- | ----------- | ---------------- |
| **Legacy Code**    | `WORK-1111`                                                     |
| **SKU**            | `WORK-COMM-INTC-002`                                            |
| **UNSPSC**         | `43191600`                                                      |
| **Common Name**    | Wireless Intercom Beltpack                                      |
| **Search Aliases** | Riedel Bolero                                                   | FreeSpeak              | Green-GO      | Wireless PL | Digital Intercom |
| **Description**    | Digital wireless intercom for mobile production staff           |
| **Specifications** | Riedel Bolero                                                   | Clear-Com FreeSpeak II | Green-GO      |
| **Options**        | Riedel Bolero Beltpack                                          | Clear-Com FreeSpeak II | Green-GO      |
| **Modifiers**      | System                                                          | Beltpack Count         | Antenna Count | Headsets    |
| **Prerequisites**  | Base station and antenna infrastructure, frequency coordination |
| **Pricing Unit**   | per beltpack/day                                                |
| **Lead Time**      | 168 hours                                                       |
| **Setup Time**     | 15 to 30 min per unit (program and test)                        |
| **Strike Time**    | 10 min per unit                                                 |
| **Crew Required**  | 1 comms tech for programming, users self-distribute             |
| **Power**          | 110V for chargers                                               |
| **Footprint**      | Minimal (belt-clip device)                                      |
| **Truck Space**    | 1 case per 10 to 20 radios                                      |
| **Weather**        | `outdoor_rated`                                                 |
| **Compliance**     | `FCC                                                            | FCC_PART90`            |
| **Sustainability** | `REUSABLE`                                                      |

[Back to top](#table-of-contents)

#### Uniforms

##### Staff Apparel

###### T-Shirt - Staff

|                    |                                                 |
| ------------------ | ----------------------------------------------- | -------------------- | ----------------------------- | --------------- |
| **Legacy Code**    | `WORK-1200`                                     |
| **SKU**            | `WORK-UNIF-APRL-001`                            |
| **UNSPSC**         | `53101500`                                      |
| **Common Name**    | Staff T-Shirt                                   |
| **Search Aliases** | Event Tee                                       | Crew Shirt           | Staff Shirt                   | Volunteer Shirt |
| **Description**    | Custom printed staff t-shirt for identification |
| **Specifications** | S through 3XL                                   | Cotton or poly blend | Screen print or DTG           |
| **Options**        | Standard Cotton                                 | Moisture-Wicking     | Long-Sleeve                   | Hi-Vis          |
| **Modifiers**      | Sizes                                           | Quantity             | Print (1-color to full-color) | Material        |
| **Prerequisites**  | Design file, size distribution                  |
| **Pricing Unit**   | per unit                                        |
| **Lead Time**      | 672 hours                                       |
| **Setup Time**     | N/A (distribution item)                         |
| **Strike Time**    | N/A (keep or return)                            |
| **Crew Required**  | 1 to 2 people for sizing and distribution       |
| **Power**          | None                                            |
| **Footprint**      | Distribution table (6ft to 8ft)                 |
| **Truck Space**    | Boxes, 1 to 3 per size run                      |
| **Weather**        | `not_applicable`                                |
| **Sustainability** | `LED_EFFICIENT                                  | NATURAL_FIBER        | RECYCLED_MATERIAL`            |

###### Polo - Staff

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | -------------------------------- | ------------------- | ---------- |
| **Legacy Code**    | `WORK-1201`                                                 |
| **SKU**            | `WORK-UNIF-APRL-002`                                        |
| **UNSPSC**         | `53101500`                                                  |
| **Common Name**    | Staff Polo Shirt                                            |
| **Search Aliases** | Crew Polo                                                   | Management Polo                  | Embroidered Polo    | Event Polo |
| **Description**    | Custom embroidered or printed polo for leads and management |
| **Specifications** | S through 3XL                                               | Pique cotton or performance poly |
| **Options**        | Standard Pique                                              | Performance (moisture-wicking)   | Long-Sleeve         |
| **Modifiers**      | Sizes                                                       | Quantity                         | Embroidery or Print | Color      |
| **Prerequisites**  | Design file, size distribution                              |
| **Pricing Unit**   | per unit                                                    |
| **Lead Time**      | 672 hours                                                   |
| **Setup Time**     | N/A (distribution item)                                     |
| **Strike Time**    | N/A (keep or return)                                        |
| **Crew Required**  | 1 to 2 people for sizing and distribution                   |
| **Power**          | None                                                        |
| **Footprint**      | Distribution table (6ft to 8ft)                             |
| **Truck Space**    | Boxes, 1 to 3 per size run                                  |
| **Weather**        | `not_applicable`                                            |
| **Sustainability** | `LED_EFFICIENT                                              | NATURAL_FIBER                    | RECYCLED_MATERIAL`  |

###### Vest - Safety - Hi-Vis

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ------------------ | ----------------------- | -------------------- | --------- |
| **Legacy Code**    | `WORK-1202`                                                |
| **SKU**            | `WORK-UNIF-APRL-003`                                       |
| **UNSPSC**         | `53101500`                                                 |
| **Common Name**    | High-Visibility Safety Vest                                |
| **Search Aliases** | Hi-Vis Vest                                                | Reflective Vest    | ANSI Vest               | Safety Vest          | Neon Vest |
| **Description**    | ANSI-rated high-visibility safety vest for site operations |
| **Specifications** | S through 5XL                                              | Class 2 or Class 3 | With or without pockets |
| **Options**        | Standard Mesh                                              | Solid              | Breakaway               | With Company Logo    |
| **Modifiers**      | Class                                                      | Size               | Quantity                | Custom Print or Logo |
| **Pricing Unit**   | per unit                                                   |
| **Lead Time**      | 672 hours                                                  |
| **Setup Time**     | N/A (distribution item)                                    |
| **Strike Time**    | N/A (keep or return)                                       |
| **Crew Required**  | 1 to 2 people for sizing and distribution                  |
| **Power**          | None                                                       |
| **Footprint**      | Distribution table (6ft to 8ft)                            |
| **Truck Space**    | Boxes, 1 to 3 per size run                                 |
| **Weather**        | `not_applicable`                                           |
| **Sustainability** | `LED_EFFICIENT                                             | NATURAL_FIBER      | RECYCLED_MATERIAL`      |

###### Poncho - Rain

|                    |                                             |
| ------------------ | ------------------------------------------- | ------------------------------------ | ------------------ | ----------------- |
| **Legacy Code**    | `WORK-1203`                                 |
| **SKU**            | `WORK-UNIF-APRL-004`                        |
| **UNSPSC**         | `53101500`                                  |
| **Common Name**    | Rain Poncho                                 |
| **Search Aliases** | Rain Jacket                                 | Waterproof Poncho                    | Wet Weather Gear   | Disposable Poncho |
| **Description**    | Waterproof outerwear for wet-weather events |
| **Specifications** | S through 3XL                               | Disposable poncho or reusable jacket |
| **Options**        | Disposable Poncho                           | Reusable Rain Jacket                 | Branded Jacket     |
| **Modifiers**      | Type                                        | Sizes                                | Quantity           |
| **Pricing Unit**   | per unit                                    |
| **Lead Time**      | 672 hours                                   |
| **Setup Time**     | N/A (distribution item)                     |
| **Strike Time**    | N/A (keep or return)                        |
| **Crew Required**  | 1 to 2 people for sizing and distribution   |
| **Power**          | None                                        |
| **Footprint**      | Distribution table (6ft to 8ft)             |
| **Truck Space**    | Boxes, 1 to 3 per size run                  |
| **Weather**        | `not_applicable`                            |
| **Sustainability** | `LED_EFFICIENT                              | NATURAL_FIBER                        | RECYCLED_MATERIAL` |

###### Jacket - Staff

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ---------------------------- | ------------------ | ------------------- |
| **Legacy Code**    | `WORK-1204`                                           |
| **SKU**            | `WORK-UNIF-APRL-005`                                  |
| **UNSPSC**         | `53101500`                                            |
| **Common Name**    | Staff Jacket                                          |
| **Search Aliases** | Crew Jacket                                           | Staff Hoodie                 | Event Hoodie       | Warm Layer          |
| **Description**    | Branded crew jacket or hoodie for cold-weather events |
| **Specifications** | S through 3XL                                         | Fleece, softshell, or puffer |
| **Options**        | Hoodie (pullover)                                     | Hoodie (zip)                 | Softshell          | Puffer              |
| **Modifiers**      | Type                                                  | Sizes                        | Quantity           | Embroidery or Print |
| **Prerequisites**  | Design file, size distribution                        |
| **Pricing Unit**   | per unit                                              |
| **Lead Time**      | 672 hours                                             |
| **Setup Time**     | N/A (distribution item)                               |
| **Strike Time**    | N/A (keep or return)                                  |
| **Crew Required**  | 1 to 2 people for sizing and distribution             |
| **Power**          | None                                                  |
| **Footprint**      | Distribution table (6ft to 8ft)                       |
| **Truck Space**    | Boxes, 1 to 3 per size run                            |
| **Weather**        | `not_applicable`                                      |
| **Sustainability** | `LED_EFFICIENT                                        | NATURAL_FIBER                | RECYCLED_MATERIAL` |

[Back to top](#table-of-contents)

#### Furnishings

##### Office & Production

###### Table - Folding - 6ft

|                    |                                                |
| ------------------ | ---------------------------------------------- | ------------------- | ----------------- | -------------- |
| **Legacy Code**    | `WORK-1300`                                    |
| **SKU**            | `WORK-FURN-OFFC-001`                           |
| **UNSPSC**         | `56101500`                                     |
| **Common Name**    | 6-Foot Folding Table                           |
| **Search Aliases** | Banquet Table                                  | Rectangular Table   | Trestle Table     | Catering Table |
| **Description**    | Standard 6ft rectangular folding banquet table |
| **Specifications** | 6ft x 30in                                     | Plastic or wood top | 30in height       |
| **Options**        | Plastic (white or black)                       | Wood (banquet)      |
| **Modifiers**      | Quantity                                       | Linen (add-on)      | Skirting (add-on) |
| **Pricing Unit**   | per unit/day                                   |
| **Lead Time**      | 48 hours                                       |
| **Setup Time**     | 5 to 10 min per unit                           |
| **Strike Time**    | 5 min per unit                                 |
| **Crew Required**  | 1 to 2 setup crew                              |
| **Power**          | None                                           |
| **Footprint**      | Varies (2ft x 3ft table to 6ft x 30in table)   |
| **Truck Space**    | Tables and chairs stack, 20 to 50 per truck    |
| **Weather**        | `sheltered`                                    |
| **Sustainability** | `REUSABLE`                                     |

###### Table - Folding - 8ft

|                    |                                                |
| ------------------ | ---------------------------------------------- | ------------------- | ------------- |
| **Legacy Code**    | `WORK-1301`                                    |
| **SKU**            | `WORK-FURN-OFFC-002`                           |
| **UNSPSC**         | `56101500`                                     |
| **Common Name**    | 8-Foot Folding Table                           |
| **Search Aliases** | Long Banquet Table                             | 8ft Rectangle       | Utility Table |
| **Description**    | Standard 8ft rectangular folding banquet table |
| **Specifications** | 8ft x 30in                                     | Plastic or wood top | 30in height   |
| **Options**        | Plastic                                        | Wood                |
| **Modifiers**      | Quantity                                       | Linen               | Skirting      |
| **Pricing Unit**   | per unit/day                                   |
| **Lead Time**      | 48 hours                                       |
| **Setup Time**     | 5 to 10 min per unit                           |
| **Strike Time**    | 5 min per unit                                 |
| **Crew Required**  | 1 to 2 setup crew                              |
| **Power**          | None                                           |
| **Footprint**      | Varies (2ft x 3ft table to 6ft x 30in table)   |
| **Truck Space**    | Tables and chairs stack, 20 to 50 per truck    |
| **Weather**        | `sheltered`                                    |
| **Sustainability** | `REUSABLE`                                     |

###### Chair - Folding

|                    |                                              |
| ------------------ | -------------------------------------------- | ------------------ | --------------------------------- | -------------- |
| **Legacy Code**    | `WORK-1302`                                  |
| **SKU**            | `WORK-FURN-OFFC-003`                         |
| **UNSPSC**         | `56101500`                                   |
| **Common Name**    | Folding Chair                                |
| **Search Aliases** | Event Chair                                  | Banquet Chair      | Resin Chair                       | Chiavari Chair |
| **Description**    | Standard folding event chair                 |
| **Specifications** | Metal or plastic                             | Padded or unpadded | Indoor and outdoor                |
| **Options**        | White Resin                                  | Black Metal        | Chiavari (gold, silver, or black) | Padded         |
| **Modifiers**      | Type                                         | Quantity           | Cushion (add-on)                  |
| **Pricing Unit**   | per unit/day                                 |
| **Lead Time**      | 48 hours                                     |
| **Setup Time**     | 5 to 10 min per unit                         |
| **Strike Time**    | 5 min per unit                               |
| **Crew Required**  | 1 to 2 setup crew                            |
| **Power**          | None                                         |
| **Footprint**      | Varies (2ft x 3ft table to 6ft x 30in table) |
| **Truck Space**    | Tables and chairs stack, 20 to 50 per truck  |
| **Weather**        | `sheltered`                                  |
| **Sustainability** | `REUSABLE`                                   |

###### Table - Cocktail

|                    |                                                 |
| ------------------ | ----------------------------------------------- | -------------------------- | ------------------ | ------------- |
| **Legacy Code**    | `WORK-1303`                                     |
| **SKU**            | `WORK-FURN-OFFC-004`                            |
| **UNSPSC**         | `56101500`                                      |
| **Common Name**    | Cocktail Table                                  |
| **Search Aliases** | High-Top Table                                  | Standing Table             | Pub Table          | Poseur Table  |
| **Description**    | Cocktail-height round table for standing events |
| **Specifications** | 30in round x 42in tall                          | With spandex cover options |
| **Options**        | Black                                           | White                      | Custom Color Cover | With LED Base |
| **Modifiers**      | Quantity                                        | Cover Color                | LED Option         |
| **Pricing Unit**   | per unit/day                                    |
| **Lead Time**      | 48 hours                                        |
| **Setup Time**     | 5 to 10 min per unit                            |
| **Strike Time**    | 5 min per unit                                  |
| **Crew Required**  | 1 to 2 setup crew                               |
| **Power**          | None                                            |
| **Footprint**      | Varies (2ft x 3ft table to 6ft x 30in table)    |
| **Truck Space**    | Tables and chairs stack, 20 to 50 per truck     |
| **Weather**        | `sheltered`                                     |
| **Sustainability** | `REUSABLE`                                      |

###### Office Package - Production

|                    |                                                                        |
| ------------------ | ---------------------------------------------------------------------- | ----------------------------------- | ------------------------------ | -------------- |
| **Legacy Code**    | `WORK-1304`                                                            |
| **SKU**            | `WORK-FURN-OFFC-005`                                                   |
| **UNSPSC**         | `56101500`                                                             |
| **Common Name**    | Production Office Package                                              |
| **Search Aliases** | Temp Office                                                            | On-Site Office                      | Pop-Up Office                  | Command Center |
| **Description**    | Complete temporary production office with furniture and equipment      |
| **Specifications** | Desk, chair, whiteboard, printer, power strip, trash can, and supplies |
| **Options**        | Basic (desk and chair)                                                 | Standard (plus printer, whiteboard) | Premium (plus AC, full office) |
| **Modifiers**      | Setup Level                                                            | Duration                            | Tent or Trailer (add-on)       |
| **Prerequisites**  | Enclosed space (tent, trailer, or room), power, network                |
| **Pricing Unit**   | per office/day                                                         |
| **Lead Time**      | 48 hours                                                               |
| **Setup Time**     | 5 to 10 min per unit                                                   |
| **Strike Time**    | 5 min per unit                                                         |
| **Crew Required**  | 1 to 2 setup crew                                                      |
| **Power**          | None                                                                   |
| **Footprint**      | Varies (2ft x 3ft table to 6ft x 30in table)                           |
| **Truck Space**    | Tables and chairs stack, 20 to 50 per truck                            |
| **Weather**        | `sheltered`                                                            |
| **Sustainability** | `REUSABLE`                                                             |

###### Whiteboard - Freestanding

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ------------------------------- | --------- | ---------------- |
| **Legacy Code**    | `WORK-1305`                                                |
| **SKU**            | `WORK-FURN-OFFC-006`                                       |
| **UNSPSC**         | `56101500`                                                 |
| **Common Name**    | Freestanding Whiteboard                                    |
| **Search Aliases** | Dry Erase Board                                            | Mobile Whiteboard               | Corkboard | Planning Board   |
| **Description**    | Freestanding whiteboard or corkboard for production office |
| **Specifications** | 24x36 through 48x72                                        | Double-sided and mobile options |
| **Options**        | Whiteboard                                                 | Corkboard                       | Combo     | Glass Board      |
| **Modifiers**      | Size                                                       | Type                            | Quantity  | Markers and Pins |
| **Pricing Unit**   | per unit/day                                               |
| **Lead Time**      | 48 hours                                                   |
| **Setup Time**     | 5 to 10 min per unit                                       |
| **Strike Time**    | 5 min per unit                                             |
| **Crew Required**  | 1 to 2 setup crew                                          |
| **Power**          | None                                                       |
| **Footprint**      | Varies (2ft x 3ft table to 6ft x 30in table)               |
| **Truck Space**    | Tables and chairs stack, 20 to 50 per truck                |
| **Weather**        | `sheltered`                                                |
| **Sustainability** | `REUSABLE`                                                 |

###### Printer - Portable

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | ------------- | ------------ | ----------------------------- |
| **Legacy Code**    | `WORK-1306`                                                     |
| **SKU**            | `WORK-FURN-OFFC-007`                                            |
| **UNSPSC**         | `56101500`                                                      |
| **Common Name**    | Portable Printer                                                |
| **Search Aliases** | Event Printer                                                   | Mobile Copier | Temp MFP     | Wireless Printer              |
| **Description**    | Temporary printer or multifunction device for production office |
| **Specifications** | Inkjet, laser, MFP, or large format                             |
| **Options**        | Inkjet MFP                                                      | Laser MFP     | Color Laser  | Large Format (24in and above) |
| **Modifiers**      | Type                                                            | Paper Supply  | Toner or Ink | Network or WiFi               |
| **Prerequisites**  | Power (20A), paper, toner, network                              |
| **Pricing Unit**   | per unit/day                                                    |
| **Lead Time**      | 48 hours                                                        |
| **Setup Time**     | 15 to 30 min                                                    |
| **Strike Time**    | 10 min                                                          |
| **Crew Required**  | 1 person                                                        |
| **Power**          | 1x 20A                                                          |
| **Footprint**      | 2ft x 2ft to 3ft x 4ft                                          |
| **Truck Space**    | 1 box per unit                                                  |
| **Weather**        | `indoor_only`                                                   |
| **Sustainability** | `REUSABLE                                                       | RECYCLABLE`   |

###### Table - Round - 60in or 72in

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- | --------------- | ------------ | --------------- |
| **Legacy Code**    | `WORK-1307`                                                       |
| **SKU**            | `WORK-FURN-OFFC-008`                                              |
| **UNSPSC**         | `56101500`                                                        |
| **Common Name**    | 60-Inch Round Table                                               |
| **Search Aliases** | Banquet Round                                                     | 8-Person Table  | Dining Round | Reception Table |
| **Description**    | Standard 60 or 72 inch round banquet table for dining or meetings |
| **Specifications** | 60in (seats 8) or 72in (seats 10)                                 | Plastic or wood |
| **Options**        | 60in                                                              | 72in            | Plastic      | Wood            |
| **Modifiers**      | Size                                                              | Quantity        | Linen        | Centerpiece     |
| **Pricing Unit**   | per unit/day                                                      |
| **Lead Time**      | 48 hours                                                          |
| **Setup Time**     | 5 to 10 min per unit                                              |
| **Strike Time**    | 5 min per unit                                                    |
| **Crew Required**  | 1 to 2 setup crew                                                 |
| **Power**          | None                                                              |
| **Footprint**      | Varies (2ft x 3ft table to 6ft x 30in table)                      |
| **Truck Space**    | Tables and chairs stack, 20 to 50 per truck                       |
| **Weather**        | `sheltered`                                                       |
| **Sustainability** | `REUSABLE`                                                        |

[Back to top](#table-of-contents)

##### Lounge & VIP

###### Furniture Set - Lounge

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | ---------------- | --------------- | -------------- |
| **Legacy Code**    | `WORK-1310`                                                     |
| **SKU**            | `WORK-FURN-LNGE-001`                                            |
| **UNSPSC**         | `56101600`                                                      |
| **Common Name**    | Lounge Furniture Set                                            |
| **Search Aliases** | Event Lounge                                                    | Sofa Set         | Seating Group   | Lounge Package |
| **Description**    | Styled lounge seating group with sofa, chairs, and coffee table |
| **Specifications** | Sofa plus 2 chairs plus coffee table plus side table            | Various styles   |
| **Options**        | Modern White                                                    | Industrial Black | Boho Rattan     | Custom         |
| **Modifiers**      | Style                                                           | Quantity of Sets | Rug (add-on)    | Accessories    |
| **Prerequisites**  | Covered or protected area for fabric furniture                  |
| **Pricing Unit**   | per set/day                                                     |
| **Lead Time**      | 336 hours                                                       |
| **Setup Time**     | 2 to 4 hours                                                    |
| **Strike Time**    | 1 to 2 hours                                                    |
| **Crew Required**  | 2 to 4 setup crew, staffing for service                         |
| **Power**          | 20A to 40A (lighting, POS, etc.)                                |
| **Footprint**      | 200 to 1,000+ sq ft                                             |
| **Truck Space**    | 1 to 2 box trucks (furniture)                                   |
| **Weather**        | `sheltered`                                                     |
| **Compliance**     | `ADA                                                            | FIRE_MARSHAL     | LIQUOR_LICENSE` |
| **Sustainability** | `REUSABLE                                                       | LED_EFFICIENT`   |

###### Ottoman

|                    |                                                 |
| ------------------ | ----------------------------------------------- | --------------- | ----------- | ------------- |
| **Legacy Code**    | `WORK-1311`                                     |
| **SKU**            | `WORK-FURN-LNGE-002`                            |
| **UNSPSC**         | `56101600`                                      |
| **Common Name**    | Ottoman                                         |
| **Search Aliases** | Pouf                                            | Cube Seat       | Accent Seat | Floor Cushion |
| **Description**    | Accent seating ottoman or pouf for lounge areas |
| **Specifications** | Round, square, or cube                          | Various fabrics |
| **Options**        | Leather                                         | Velvet          | Linen       | Knit Pouf     |
| **Modifiers**      | Style                                           | Quantity        |
| **Pricing Unit**   | per unit/day                                    |
| **Lead Time**      | 168 hours                                       |
| **Setup Time**     | 30 to 60 min                                    |
| **Strike Time**    | 20 to 30 min                                    |
| **Crew Required**  | 1 to 2 setup crew                               |
| **Power**          | 20A (lighting, climate, charging)               |
| **Footprint**      | 100 to 400 sq ft per room                       |
| **Truck Space**    | 1 van or small box truck                        |
| **Weather**        | `sheltered`                                     |
| **Compliance**     | `FIRE_MARSHAL`                                  |
| **Sustainability** | `REUSABLE`                                      |

###### Stool - Bar

|                    |                                            |
| ------------------ | ------------------------------------------ | -------------------- | ----------- | ---------- |
| **Legacy Code**    | `WORK-1312`                                |
| **SKU**            | `WORK-FURN-LNGE-003`                       |
| **UNSPSC**         | `56101600`                                 |
| **Common Name**    | Bar Stool                                  |
| **Search Aliases** | Counter Stool                              | High Chair           | Pub Stool   | Tall Seat  |
| **Description**    | Tall seating for bars and high-top tables  |
| **Specifications** | 30in (bar height) or 26in (counter height) | With or without back |
| **Options**        | Standard Metal                             | Wood                 | Upholstered | Industrial |
| **Modifiers**      | Height                                     | Type                 | Quantity    |
| **Pricing Unit**   | per unit/day                               |
| **Lead Time**      | 168 hours                                  |
| **Setup Time**     | 30 to 60 min                               |
| **Strike Time**    | 20 to 30 min                               |
| **Crew Required**  | 1 to 2 setup crew                          |
| **Power**          | 20A (lighting, climate, charging)          |
| **Footprint**      | 100 to 400 sq ft per room                  |
| **Truck Space**    | 1 van or small box truck                   |
| **Weather**        | `sheltered`                                |
| **Compliance**     | `FIRE_MARSHAL`                             |
| **Sustainability** | `REUSABLE`                                 |

[Back to top](#table-of-contents)

#### Health & Safety

##### Medical

###### EMT - On-Site

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | --------- | --------------- | ----------------- | --------- |
| **Legacy Code**    | `WORK-1400`                                                 |
| **SKU**            | `WORK-HLTH-MEDL-001`                                        |
| **UNSPSC**         | `85121800`                                                  |
| **Common Name**    | On-Site EMT                                                 |
| **Search Aliases** | Event Medic                                                 | Paramedic | First Responder | Medical Staff     | Event EMT |
| **Description**    | Licensed EMT or paramedic for on-site medical coverage      |
| **Specifications** | EMT-Basic, EMT-Intermediate, or Paramedic (ALS)             |
| **Options**        | EMT-B                                                       | EMT-I     | Paramedic       | With ALS Supplies |
| **Modifiers**      | Certification Level                                         | Headcount | Shift Duration  | Medical Supplies  |
| **Prerequisites**  | Medical supplies, treatment area, incident reporting system |
| **Pricing Unit**   | per person/shift                                            |
| **Lead Time**      | 336 hours                                                   |
| **Setup Time**     | 1 to 2 hours                                                |
| **Strike Time**    | 30 to 60 min                                                |
| **Crew Required**  | 1 to 4 medical staff (EMT, paramedic, or RN)                |
| **Power**          | 20A (lighting, climate, equipment)                          |
| **Footprint**      | 10ft x 10ft to 20ft x 20ft                                  |
| **Truck Space**    | Medical supplies in bins, 1 to 2 per vehicle                |
| **Weather**        | `sheltered`                                                 |
| **Compliance**     | `OSHA                                                       | HIPAA`    |
| **Sustainability** | `REUSABLE`                                                  |

###### Station - Medical

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | --------------------------------------- | ----------------------------- | ---------- |
| **Legacy Code**    | `WORK-1401`                                                  |
| **SKU**            | `WORK-HLTH-MEDL-002`                                         |
| **UNSPSC**         | `85121800`                                                   |
| **Common Name**    | Medical Treatment Station                                    |
| **Search Aliases** | First Aid Tent                                               | Medical Tent                            | Aid Station                   | EMS Post   |
| **Description**    | Dedicated medical treatment area with supplies and cots      |
| **Specifications** | 10x10 through 20x20                                          | With AC, lighting, and privacy curtains |
| **Options**        | Basic (tent and supplies)                                    | Standard (plus cots, AC)                | Advanced (plus ALS equipment) |
| **Modifiers**      | Size                                                         | Equipment Level                         | Staffing (add-on)             | ADA Access |
| **Prerequisites**  | Power, climate control, proximity to event, ambulance access |
| **Pricing Unit**   | per station/day                                              |
| **Lead Time**      | 336 hours                                                    |
| **Setup Time**     | 1 to 2 hours                                                 |
| **Strike Time**    | 30 to 60 min                                                 |
| **Crew Required**  | 1 to 4 medical staff (EMT, paramedic, or RN)                 |
| **Power**          | 20A (lighting, climate, equipment)                           |
| **Footprint**      | 10ft x 10ft to 20ft x 20ft                                   |
| **Truck Space**    | Medical supplies in bins, 1 to 2 per vehicle                 |
| **Weather**        | `sheltered`                                                  |
| **Compliance**     | `OSHA                                                        | HIPAA`                                  |
| **Sustainability** | `REUSABLE`                                                   |

###### Ambulance - Standby

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | -------------------- | ----------------- | --------------- |
| **Legacy Code**    | `WORK-1402`                                                  |
| **SKU**            | `WORK-HLTH-MEDL-003`                                         |
| **UNSPSC**         | `85121800`                                                   |
| **Common Name**    | Standby Ambulance                                            |
| **Search Aliases** | On-Site Ambulance                                            | EMS Standby          | Medical Transport | Event Ambulance |
| **Description**    | Dedicated ambulance and crew on-site for medical emergencies |
| **Specifications** | BLS or ALS ambulance                                         | With 2-person crew   |
| **Options**        | BLS (EMT crew)                                               | ALS (Paramedic crew) |
| **Modifiers**      | Level (BLS or ALS)                                           | Duration             | Crew              |
| **Prerequisites**  | Clear ambulance access route, staging area                   |
| **Pricing Unit**   | per unit/shift                                               |
| **Lead Time**      | 336 hours                                                    |
| **Setup Time**     | 15 min (stage in position)                                   |
| **Strike Time**    | Immediate (drives away)                                      |
| **Crew Required**  | 2 EMTs or paramedics per ambulance                           |
| **Power**          | Vehicle power (shore power 20A for idle)                     |
| **Footprint**      | 8ft x 24ft (plus clear access route)                         |
| **Truck Space**    | Self-contained vehicle                                       |
| **Weather**        | `all_weather`                                                |

[Back to top](#table-of-contents)

##### PPE

###### Hard Hat - ANSI

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ------------------ | -------------------- | -------- |
| **Legacy Code**    | `WORK-1410`                                          |
| **SKU**            | `WORK-HLTH-PPEE-001`                                 |
| **UNSPSC**         | `46181500`                                           |
| **Common Name**    | Hard Hat                                             |
| **Search Aliases** | Construction Helmet                                  | Safety Helmet      | Head Protection      | Bump Cap |
| **Description**    | ANSI-rated construction hard hat for site operations |
| **Specifications** | Type I (top impact) or Type II (top plus lateral)    | Face shield option |
| **Options**        | Standard White                                       | Hi-Vis Yellow      | Custom Color or Logo | Vented   |
| **Modifiers**      | Type                                                 | Quantity           | Custom Branding      |
| **Pricing Unit**   | per unit                                             |
| **Lead Time**      | 48 hours                                             |
| **Setup Time**     | N/A (distribution item)                              |
| **Strike Time**    | N/A                                                  |
| **Crew Required**  | 1 safety officer for distribution                    |
| **Power**          | None                                                 |
| **Footprint**      | Distribution bin or table                            |
| **Truck Space**    | Boxes, minimal                                       |
| **Weather**        | `not_applicable`                                     |
| **Compliance**     | `OSHA                                                | ANSI`              |
| **Sustainability** | `REUSABLE`                                           |

###### Glasses - Safety

|                    |                                                |
| ------------------ | ---------------------------------------------- | ---------------- | -------------- | ---------------------- |
| **Legacy Code**    | `WORK-1411`                                    |
| **SKU**            | `WORK-HLTH-PPEE-002`                           |
| **UNSPSC**         | `46181500`                                     |
| **Common Name**    | Safety Glasses                                 |
| **Search Aliases** | Protective Eyewear                             | Safety Goggles   | Eye Protection | Z87 Glasses            |
| **Description**    | ANSI Z87.1 rated eye protection                |
| **Specifications** | Clear, tinted, anti-fog, or over-glasses (OTG) |
| **Options**        | Clear                                          | Tinted (outdoor) | Mirror         | Goggles (splash-proof) |
| **Modifiers**      | Type                                           | Quantity         |
| **Pricing Unit**   | per unit                                       |
| **Lead Time**      | 48 hours                                       |
| **Setup Time**     | N/A (distribution item)                        |
| **Strike Time**    | N/A                                            |
| **Crew Required**  | 1 safety officer for distribution              |
| **Power**          | None                                           |
| **Footprint**      | Distribution bin or table                      |
| **Truck Space**    | Boxes, minimal                                 |
| **Weather**        | `not_applicable`                               |
| **Compliance**     | `OSHA                                          | ANSI`            |
| **Sustainability** | `REUSABLE`                                     |

###### Hearing Protection

|                    |                                                                       |
| ------------------ | --------------------------------------------------------------------- | ----------------- | ------------------------------- | ----------------- |
| **Legacy Code**    | `WORK-1412`                                                           |
| **SKU**            | `WORK-HLTH-PPEE-003`                                                  |
| **UNSPSC**         | `46181500`                                                            |
| **Common Name**    | Hearing Protection                                                    |
| **Search Aliases** | Ear Plugs                                                             | Ear Muffs         | Noise Reduction                 | Hearing PPE       |
| **Description**    | Noise reduction ear plugs or ear muffs                                |
| **Specifications** | Foam plugs (NRR 32), reusable plugs, over-ear muffs, or custom molded |
| **Options**        | Disposable Foam                                                       | Reusable Silicone | Over-Ear Muffs (NRR 25 or more) | Custom Molded IEM |
| **Modifiers**      | Type                                                                  | Quantity          |
| **Pricing Unit**   | per unit                                                              |
| **Lead Time**      | 48 hours                                                              |
| **Setup Time**     | N/A (distribution item)                                               |
| **Strike Time**    | N/A                                                                   |
| **Crew Required**  | 1 safety officer for distribution                                     |
| **Power**          | None                                                                  |
| **Footprint**      | Distribution bin or table                                             |
| **Truck Space**    | Boxes, minimal                                                        |
| **Weather**        | `not_applicable`                                                      |
| **Compliance**     | `OSHA                                                                 | ANSI`             |
| **Sustainability** | `REUSABLE`                                                            |

###### Gloves - Work

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | -------------------- | --------------- | -------------- |
| **Legacy Code**    | `WORK-1413`                                                   |
| **SKU**            | `WORK-HLTH-PPEE-004`                                          |
| **UNSPSC**         | `46181500`                                                    |
| **Common Name**    | Work Gloves                                                   |
| **Search Aliases** | Safety Gloves                                                 | Rigger Gloves        | Mechanic Gloves | Leather Gloves |
| **Description**    | Protective work gloves for rigging, loading, and construction |
| **Specifications** | Leather, mechanic, cut-resistant, or insulated                |
| **Options**        | Leather Work                                                  | Mechanic (dexterity) | Cut-Resistant   | Insulated      |
| **Modifiers**      | Type                                                          | Size Range           | Quantity        |
| **Pricing Unit**   | per pair                                                      |
| **Lead Time**      | 48 hours                                                      |
| **Setup Time**     | N/A (distribution item)                                       |
| **Strike Time**    | N/A                                                           |
| **Crew Required**  | 1 safety officer for distribution                             |
| **Power**          | None                                                          |
| **Footprint**      | Distribution bin or table                                     |
| **Truck Space**    | Boxes, minimal                                                |
| **Weather**        | `not_applicable`                                              |
| **Compliance**     | `OSHA                                                         | ANSI`                |
| **Sustainability** | `REUSABLE`                                                    |

[Back to top](#table-of-contents)

##### Security Systems

###### Camera - Security - Temp

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ------------------------------- | ---------------- | ------------ | --------- |
| **Legacy Code**    | `WORK-1420`                                          |
| **SKU**            | `WORK-HLTH-SECU-001`                                 |
| **UNSPSC**         | `46171500`                                           |
| **Common Name**    | Temporary Security Camera                            |
| **Search Aliases** | CCTV                                                 | Surveillance Camera             | Wireless Camera  | Event Camera | IP Camera |
| **Description**    | Temporary security camera system for site monitoring |
| **Specifications** | Fixed, PTZ, or wireless                              | With recording and night vision |
| **Options**        | Fixed Bullet                                         | PTZ Dome                        | Wireless Battery | With NVR     |
| **Modifiers**      | Camera Count                                         | Recording                       | Monitoring       | Night Vision |
| **Prerequisites**  | Network, power, monitoring station, storage          |
| **Pricing Unit**   | per camera/day                                       |
| **Lead Time**      | 336 hours                                            |
| **Setup Time**     | 30 to 60 min per unit                                |
| **Strike Time**    | 15 to 30 min per unit                                |
| **Crew Required**  | 1 to 2 security techs                                |
| **Power**          | 20A per 4 to 8 cameras (PoE switch)                  |
| **Footprint**      | Minimal (pole or structure mounted)                  |
| **Truck Space**    | 1 case per 4 to 8 cameras                            |
| **Weather**        | `outdoor_rated`                                      |
| **Sustainability** | `REUSABLE                                            | LOW_POWER`                      |

###### Lighting - Security

|                    |                                                |
| ------------------ | ---------------------------------------------- | ---------------- | ---------- | --------------- |
| **Legacy Code**    | `WORK-1421`                                    |
| **SKU**            | `WORK-HLTH-SECU-002`                           |
| **UNSPSC**         | `46171500`                                     |
| **Common Name**    | Temporary Security Lighting                    |
| **Search Aliases** | Security Flood                                 | Motion Light     | Area Light | Perimeter Light |
| **Description**    | Temporary high-intensity security lighting     |
| **Specifications** | LED flood, motion-activated, solar, or battery |
| **Options**        | Hardwired LED Flood                            | Motion-Activated | Solar      | Battery Pack    |
| **Modifiers**      | Type                                           | Quantity         | Mounting   |
| **Prerequisites**  | Power (for hardwired), mounting structure      |
| **Pricing Unit**   | per unit/day                                   |
| **Lead Time**      | 336 hours                                      |
| **Setup Time**     | 30 to 60 min per unit                          |
| **Strike Time**    | 15 to 30 min per unit                          |
| **Crew Required**  | 1 to 2 security techs                          |
| **Power**          | 20A per 4 to 8 cameras (PoE switch)            |
| **Footprint**      | Minimal (pole or structure mounted)            |
| **Truck Space**    | 1 case per 4 to 8 cameras                      |
| **Weather**        | `outdoor_rated`                                |
| **Sustainability** | `REUSABLE                                      | LOW_POWER`       |

[Back to top](#table-of-contents)

---

### Travel & Accommodations

_25 items_

#### Airfare

##### Flights

###### Flight - Domestic - Economy

|                    |                                              |
| ------------------ | -------------------------------------------- | ------------------ | ----------------------------- | -------------- |
| **Legacy Code**    | `TRAVEL-1001`                                |
| **SKU**            | `TRVL-AIRF-FLIT-001`                         |
| **UNSPSC**         | `78111500`                                   |
| **Common Name**    | Domestic Economy Flight                      |
| **Search Aliases** | Coach Ticket                                 | Economy Fare       | Domestic Roundtrip            | Main Cabin     |
| **Description**    | Round-trip domestic economy airfare          |
| **Specifications** | Coach class                                  | Carry-on included  | Checked bag varies by airline |
| **Options**        | Basic Economy                                | Main Cabin         | Comfort Plus or Economy Plus  |
| **Modifiers**      | Class                                        | Airline Preference | Baggage                       | Seat Selection |
| **Prerequisites**  | Passport or ID, travel dates, booking window |
| **Pricing Unit**   | per ticket                                   |
| **Lead Time**      | 72 hours                                     |
| **Setup Time**     | 15 min                                       |
| **Strike Time**    | 15 min                                       |
| **Crew Required**  | 1 person                                     |
| **Power**          | None                                         |
| **Footprint**      | Varies                                       |
| **Truck Space**    | Minimal                                      |
| **Weather**        | `outdoor_rated`                              |
| **Sustainability** | `REUSABLE`                                   |

###### Flight - Domestic - Business or First

|                    |                                                     |
| ------------------ | --------------------------------------------------- | -------------- | --------------------------- | -------------------- |
| **Legacy Code**    | `TRAVEL-1002`                                       |
| **SKU**            | `TRVL-AIRF-FLIT-002`                                |
| **UNSPSC**         | `78111500`                                          |
| **Common Name**    | Domestic Business or First Class Flight             |
| **Search Aliases** | First Class                                         | Business Class | Premium Domestic            | Upgraded Fare        |
| **Description**    | Round-trip domestic business or first class airfare |
| **Specifications** | Priority boarding                                   | Lounge access  | 2 or more bags included     |
| **Options**        | Business Class                                      | First Class    | Lie-Flat (transcontinental) |
| **Modifiers**      | Class                                               | Airline        | Lounge                      | Upgrade from Economy |
| **Pricing Unit**   | per ticket                                          |
| **Lead Time**      | 72 hours                                            |
| **Setup Time**     | 15 min                                              |
| **Strike Time**    | 15 min                                              |
| **Crew Required**  | 1 person                                            |
| **Power**          | None                                                |
| **Footprint**      | Varies                                              |
| **Truck Space**    | Minimal                                             |
| **Weather**        | `outdoor_rated`                                     |
| **Sustainability** | `REUSABLE`                                          |

###### Flight - International - Economy

|                    |                                                  |
| ------------------ | ------------------------------------------------ | ------------------------------ | ------------------------------ |
| **Legacy Code**    | `TRAVEL-1003`                                    |
| **SKU**            | `TRVL-AIRF-FLIT-003`                             |
| **UNSPSC**         | `78111500`                                       |
| **Common Name**    | International Economy Flight                     |
| **Search Aliases** | International Coach                              | Overseas Ticket                | Long-Haul Economy              |
| **Description**    | Round-trip international economy airfare         |
| **Specifications** | Coach class                                      | Checked bag typically included | Meal service                   |
| **Options**        | Basic                                            | Main Cabin                     | Premium Economy                |
| **Modifiers**      | Class                                            | Airline                        | Routing (direct vs connection) |
| **Prerequisites**  | Passport, visa (if applicable), travel insurance |
| **Pricing Unit**   | per ticket                                       |
| **Lead Time**      | 72 hours                                         |
| **Setup Time**     | 15 min                                           |
| **Strike Time**    | 15 min                                           |
| **Crew Required**  | 1 person                                         |
| **Power**          | None                                             |
| **Footprint**      | Varies                                           |
| **Truck Space**    | Minimal                                          |
| **Weather**        | `outdoor_rated`                                  |
| **Sustainability** | `REUSABLE`                                       |

###### Flight - International - Business or First

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ------------- | ------------------- |
| **Legacy Code**    | `TRAVEL-1004`                                            |
| **SKU**            | `TRVL-AIRF-FLIT-004`                                     |
| **UNSPSC**         | `78111500`                                               |
| **Common Name**    | International Business or First Class Flight             |
| **Search Aliases** | International Premium                                    | Lie-Flat      | Long-Haul Business  |
| **Description**    | Round-trip international business or first class airfare |
| **Specifications** | Lie-flat seat                                            | Lounge access | Priority everything |
| **Options**        | Business Class                                           | First Class   |
| **Modifiers**      | Class                                                    | Airline       | Routing             |
| **Prerequisites**  | Passport, visa, travel insurance                         |
| **Pricing Unit**   | per ticket                                               |
| **Lead Time**      | 72 hours                                                 |
| **Setup Time**     | 15 min                                                   |
| **Strike Time**    | 15 min                                                   |
| **Crew Required**  | 1 person                                                 |
| **Power**          | None                                                     |
| **Footprint**      | Varies                                                   |
| **Truck Space**    | Minimal                                                  |
| **Weather**        | `outdoor_rated`                                          |
| **Sustainability** | `REUSABLE`                                               |

###### Baggage Fee - Excess

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | ---------------------------------- | --------------------------- | ----------------- |
| **Legacy Code**    | `TRAVEL-1005`                                                 |
| **SKU**            | `TRVL-AIRF-FLIT-005`                                          |
| **UNSPSC**         | `78111500`                                                    |
| **Common Name**    | Excess Baggage Fee                                            |
| **Search Aliases** | Overweight Bag                                                | Oversize Bag                       | Equipment Bag               | Extra Checked Bag |
| **Description**    | Additional or overweight baggage fees for equipment transport |
| **Specifications** | Per checked bag                                               | Oversize and overweight surcharges |
| **Options**        | Standard Checked                                              | Oversized (sports or equipment)    | Overweight (50 lbs or more) |
| **Modifiers**      | Bag Count                                                     | Size and Weight                    | Airline                     |
| **Prerequisites**  | Airline baggage policy review                                 |
| **Pricing Unit**   | per bag                                                       |
| **Lead Time**      | 72 hours                                                      |
| **Setup Time**     | 15 min                                                        |
| **Strike Time**    | 15 min                                                        |
| **Crew Required**  | 1 person                                                      |
| **Power**          | None                                                          |
| **Footprint**      | Varies                                                        |
| **Truck Space**    | Minimal                                                       |
| **Weather**        | `outdoor_rated`                                               |
| **Sustainability** | `REUSABLE`                                                    |

###### Flight - Charter

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | -------------------- | --------------- | ---------------------- |
| **Legacy Code**    | `TRAVEL-1006`                                                 |
| **SKU**            | `TRVL-AIRF-FLIT-006`                                          |
| **UNSPSC**         | `78111500`                                                    |
| **Common Name**    | Charter Flight                                                |
| **Search Aliases** | Private Jet                                                   | Private Aviation     | Air Charter     | On-Demand Flight       |
| **Description**    | Private charter flight for talent or time-sensitive transport |
| **Specifications** | Turboprop through heavy jet                                   |
| **Options**        | Turboprop (King Air)                                          | Light Jet (Citation) | Midsize Jet     | Heavy Jet (Gulfstream) |
| **Modifiers**      | Aircraft Type                                                 | Route                | Passenger Count | Catering               |
| **Prerequisites**  | FBO coordination, manifest, customs (international)           |
| **Pricing Unit**   | per flight                                                    |
| **Lead Time**      | 72 hours                                                      |
| **Setup Time**     | 15 min                                                        |
| **Strike Time**    | 15 min                                                        |
| **Crew Required**  | 1 person                                                      |
| **Power**          | None                                                          |
| **Footprint**      | Varies                                                        |
| **Truck Space**    | Minimal                                                       |
| **Weather**        | `outdoor_rated`                                               |
| **Sustainability** | `REUSABLE`                                                    |

[Back to top](#table-of-contents)

#### Lodging

##### Hotels

###### Hotel Room - Standard

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ------------------ | -------------------- | ---------------- | ------- |
| **Legacy Code**    | `TRAVEL-1010`                                         |
| **SKU**            | `TRVL-LODG-HOTL-001`                                  |
| **UNSPSC**         | `90111500`                                            |
| **Common Name**    | Standard Hotel Room                                   |
| **Search Aliases** | Hotel                                                 | Motel              | Crew Hotel           | Production Hotel | Lodging |
| **Description**    | Standard hotel room for crew and production staff     |
| **Specifications** | Queen or King bed                                     | WiFi               | Near venue preferred |
| **Options**        | Budget (2-star)                                       | Mid-Range (3-star) | Upscale (4-star)     |
| **Modifiers**      | Star Level                                            | Room Type          | Proximity to Venue   | Duration         |
| **Prerequisites**  | Credit card for incidentals, room block if 10 or more |
| **Pricing Unit**   | per room/night                                        |
| **Lead Time**      | 72 hours                                              |
| **Setup Time**     | 15 min                                                |
| **Strike Time**    | 15 min                                                |
| **Crew Required**  | 1 person                                              |
| **Power**          | None                                                  |
| **Footprint**      | Varies                                                |
| **Truck Space**    | Minimal                                               |
| **Weather**        | `outdoor_rated`                                       |
| **Sustainability** | `REUSABLE`                                            |

###### Hotel Suite - Premium

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | ------------------ | ------------------ | --------- | --------------- |
| **Legacy Code**    | `TRAVEL-1011`                                          |
| **SKU**            | `TRVL-LODG-HOTL-002`                                   |
| **UNSPSC**         | `90111500`                                             |
| **Common Name**    | Hotel Suite                                            |
| **Search Aliases** | Premium Room                                           | Talent Suite       | VIP Suite          | Penthouse | Executive Suite |
| **Description**    | Suite or premium room for talent and senior production |
| **Specifications** | Suite with living area                                 | Premium amenities  |
| **Options**        | Junior Suite                                           | 1-Bedroom Suite    | Presidential Suite | Penthouse |
| **Modifiers**      | Suite Type                                             | Rider Requirements | Duration           |
| **Prerequisites**  | Credit card, rider specifications                      |
| **Pricing Unit**   | per room/night                                         |
| **Lead Time**      | 72 hours                                               |
| **Setup Time**     | 15 min                                                 |
| **Strike Time**    | 15 min                                                 |
| **Crew Required**  | 1 person                                               |
| **Power**          | None                                                   |
| **Footprint**      | Varies                                                 |
| **Truck Space**    | Minimal                                                |
| **Weather**        | `outdoor_rated`                                        |
| **Sustainability** | `REUSABLE`                                             |

###### Hotel Block - Group Rate

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ---------- | ----------------------- | ----------------- |
| **Legacy Code**    | `TRAVEL-1012`                                            |
| **SKU**            | `TRVL-LODG-HOTL-003`                                     |
| **UNSPSC**         | `90111500`                                               |
| **Common Name**    | Hotel Room Block                                         |
| **Search Aliases** | Group Block                                              | Crew Block | Production Block        | Negotiated Rate   |
| **Description**    | Negotiated group rate hotel block for production team    |
| **Specifications** | 10 or more rooms                                         | Group rate | Rooming list management | Attrition clause  |
| **Options**        | 3-Star                                                   | 4-Star     | 5-Star                  | Mix of Room Types |
| **Modifiers**      | Room Count                                               | Star Level | Duration                | Attrition Terms   |
| **Prerequisites**  | Rooming list, credit card authorization, contract review |
| **Pricing Unit**   | per room/night                                           |
| **Lead Time**      | 72 hours                                                 |
| **Setup Time**     | 15 min                                                   |
| **Strike Time**    | 15 min                                                   |
| **Crew Required**  | 1 person                                                 |
| **Power**          | None                                                     |
| **Footprint**      | Varies                                                   |
| **Truck Space**    | Minimal                                                  |
| **Weather**        | `outdoor_rated`                                          |
| **Sustainability** | `REUSABLE`                                               |

[Back to top](#table-of-contents)

##### Alternative Lodging

###### Rental - Vacation

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ------------------ | ----------------- | ------------ | ---------------- |
| **Legacy Code**    | `TRAVEL-1020`                                           |
| **SKU**            | `TRVL-LODG-ALTL-001`                                    |
| **UNSPSC**         | `90111600`                                              |
| **Common Name**    | Vacation Rental                                         |
| **Search Aliases** | Airbnb                                                  | VRBO               | Short-Term Rental | House Rental | Apartment Rental |
| **Description**    | Short-term rental house or apartment for crew or talent |
| **Specifications** | 1-bedroom through 4-bedroom or more                     | House or apartment |
| **Options**        | Apartment                                               | House              | Condo             | Villa        |
| **Modifiers**      | Bedrooms                                                | Location           | Duration          | Amenities    |
| **Prerequisites**  | Booking platform, deposit, check-in logistics           |
| **Pricing Unit**   | per property/night                                      |
| **Lead Time**      | 72 hours                                                |
| **Setup Time**     | 15 min                                                  |
| **Strike Time**    | 15 min                                                  |
| **Crew Required**  | 1 person                                                |
| **Power**          | None                                                    |
| **Footprint**      | Varies                                                  |
| **Truck Space**    | Minimal                                                 |
| **Weather**        | `outdoor_rated`                                         |
| **Sustainability** | `REUSABLE`                                              |

###### RV - Motorhome

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | ------------------ | -------------- | -------------- | --------- |
| **Legacy Code**    | `TRAVEL-1021`                                                |
| **SKU**            | `TRVL-LODG-ALTL-002`                                         |
| **UNSPSC**         | `90111600`                                                   |
| **Common Name**    | RV or Motorhome                                              |
| **Search Aliases** | Recreational Vehicle                                         | Tour Bus           | Band Bus       | RV Rental      | Motorhome |
| **Description**    | RV or motorhome for mobile talent or crew accommodation      |
| **Specifications** | Class A through travel trailer                               | With hookups       |
| **Options**        | Class A (bus-style)                                          | Class C (cab-over) | Travel Trailer | With Generator |
| **Modifiers**      | Class                                                        | Duration           | Hookups        | Driver         |
| **Prerequisites**  | RV pad with hookups or self-contained, CDL for large Class A |
| **Pricing Unit**   | per unit/day                                                 |
| **Lead Time**      | 72 hours                                                     |
| **Setup Time**     | 15 min                                                       |
| **Strike Time**    | 15 min                                                       |
| **Crew Required**  | 1 person                                                     |
| **Power**          | None                                                         |
| **Footprint**      | Varies                                                       |
| **Truck Space**    | Minimal                                                      |
| **Weather**        | `outdoor_rated`                                              |
| **Sustainability** | `REUSABLE`                                                   |

[Back to top](#table-of-contents)

#### Transportation

##### Ground Transport

###### Transfer - Sedan

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | ------------------------------- | ------------------------- | -------- | -------------- |
| **Legacy Code**    | `TRAVEL-1100`                                                |
| **SKU**            | `TRVL-TRNS-GRND-001`                                         |
| **UNSPSC**         | `78111800`                                                   |
| **Common Name**    | Sedan Transfer                                               |
| **Search Aliases** | Airport Pickup                                               | Car Service                     | Black Car                 | Town Car | Private Driver |
| **Description**    | Private sedan or SUV for airport-to-venue or hotel transport |
| **Specifications** | Sedan or SUV                                                 | Up to 3 passengers plus luggage |
| **Options**        | Sedan (3 pax)                                                | SUV (5 pax)                     | Premium (Mercedes or BMW) |
| **Modifiers**      | Vehicle Type                                                 | Meet and Greet                  | Round-Trip vs One-Way     |
| **Prerequisites**  | Flight details for meet and greet, address                   |
| **Pricing Unit**   | per trip                                                     |
| **Lead Time**      | 168 hours                                                    |
| **Setup Time**     | Delivery only                                                |
| **Strike Time**    | Pickup only                                                  |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                        |
| **Power**          | Fuel (gasoline or diesel)                                    |
| **Footprint**      | Varies by vehicle type                                       |
| **Truck Space**    | Is the vehicle                                               |
| **Weather**        | `all_weather`                                                |
| **Compliance**     | `DOT                                                         | CDL`                            |

###### Shuttle - Airport

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ------------------------------ | ----------------------- | ------------ |
| **Legacy Code**    | `TRAVEL-1101`                                        |
| **SKU**            | `TRVL-TRNS-GRND-002`                                 |
| **UNSPSC**         | `78111800`                                           |
| **Common Name**    | Group Airport Shuttle                                |
| **Search Aliases** | Van Transfer                                         | Shuttle Bus                    | Airport Van             | Group Pickup |
| **Description**    | Passenger van or shuttle for group airport transfers |
| **Specifications** | 12 to 40 passenger vehicles                          | With luggage trailer available |
| **Options**        | Passenger Van (12 pax)                               | Shuttle (15 to 25 pax)         | Mini-Bus (25 to 40 pax) |
| **Modifiers**      | Vehicle Size                                         | Meet and Greet                 | Round-Trip vs One-Way   |
| **Prerequisites**  | Flight manifests, luggage count                      |
| **Pricing Unit**   | per trip                                             |
| **Lead Time**      | 168 hours                                            |
| **Setup Time**     | Delivery only                                        |
| **Strike Time**    | Pickup only                                          |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                |
| **Power**          | Fuel (gasoline or diesel)                            |
| **Footprint**      | Varies by vehicle type                               |
| **Truck Space**    | Is the vehicle                                       |
| **Weather**        | `all_weather`                                        |
| **Compliance**     | `DOT                                                 | CDL`                           |

###### Shuttle - Sprinter

|                    |                                               |
| ------------------ | --------------------------------------------- | ----------------------- | ---------------- | ------------- |
| **Legacy Code**    | `TRAVEL-1102`                                 |
| **SKU**            | `TRVL-TRNS-GRND-003`                          |
| **UNSPSC**         | `78111800`                                    |
| **Common Name**    | Executive Sprinter Shuttle                    |
| **Search Aliases** | Sprinter Service                              | VIP Shuttle             | Artist Transport | Limo Sprinter |
| **Description**    | Mercedes Sprinter for VIP or artist transport |
| **Specifications** | 12 to 14 passenger                            | Executive interior      | WiFi available   |
| **Options**        | Standard                                      | Executive (leather, TV) | Limo Conversion  |
| **Modifiers**      | Interior Level                                | Duration                | Driver           |
| **Pricing Unit**   | per vehicle/day                               |
| **Lead Time**      | 168 hours                                     |
| **Setup Time**     | Delivery only                                 |
| **Strike Time**    | Pickup only                                   |
| **Crew Required**  | 1 licensed driver (CDL if applicable)         |
| **Power**          | Fuel (gasoline or diesel)                     |
| **Footprint**      | Varies by vehicle type                        |
| **Truck Space**    | Is the vehicle                                |
| **Weather**        | `all_weather`                                 |
| **Compliance**     | `DOT                                          | CDL`                    |

###### Motor Coach - Charter

|                    |                                                                |
| ------------------ | -------------------------------------------------------------- | -------------------------------- | --------------- | --------------- | --------- |
| **Legacy Code**    | `TRAVEL-1103`                                                  |
| **SKU**            | `TRVL-TRNS-GRND-004`                                           |
| **UNSPSC**         | `78111800`                                                     |
| **Common Name**    | Charter Motor Coach                                            |
| **Search Aliases** | Charter Bus                                                    | Tour Bus                         | Coach Bus       | Motor Coach     | Group Bus |
| **Description**    | Full-size charter motor coach for large group transport        |
| **Specifications** | 40 to 56 passenger                                             | Restroom                         | Climate control | Luggage bays    |
| **Options**        | Standard                                                       | Premium (leather, WiFi, outlets) | Double-Decker   |
| **Modifiers**      | Seat Count                                                     | Duration                         | Distance        | Driver and Fuel |
| **Prerequisites**  | Parking for 45ft or longer vehicle, DOT driver rest compliance |
| **Pricing Unit**   | per bus/day                                                    |
| **Lead Time**      | 168 hours                                                      |
| **Setup Time**     | Delivery only                                                  |
| **Strike Time**    | Pickup only                                                    |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                          |
| **Power**          | Fuel (gasoline or diesel)                                      |
| **Footprint**      | Varies by vehicle type                                         |
| **Truck Space**    | Is the vehicle                                                 |
| **Weather**        | `all_weather`                                                  |
| **Compliance**     | `DOT                                                           | CDL`                             |

###### Limousine

|                    |                                             |
| ------------------ | ------------------------------------------- | ------------------ | ------------- | ----------------- |
| **Legacy Code**    | `TRAVEL-1104`                               |
| **SKU**            | `TRVL-TRNS-GRND-005`                        |
| **UNSPSC**         | `78111800`                                  |
| **Common Name**    | Limousine                                   |
| **Search Aliases** | Black Car                                   | Stretch Limo       | Executive Car | Chauffeur Service |
| **Description**    | Luxury sedan or limousine for VIP transport |
| **Specifications** | Sedan through stretch limo                  | Chauffeur included |
| **Options**        | Lincoln Town Car                            | Escalade           | Stretch Limo  | Sprinter Limo     |
| **Modifiers**      | Vehicle                                     | Duration           | Chauffeur     | Amenities         |
| **Pricing Unit**   | per vehicle/hour                            |
| **Lead Time**      | 168 hours                                   |
| **Setup Time**     | Delivery only                               |
| **Strike Time**    | Pickup only                                 |
| **Crew Required**  | 1 licensed driver (CDL if applicable)       |
| **Power**          | Fuel (gasoline or diesel)                   |
| **Footprint**      | Varies by vehicle type                      |
| **Truck Space**    | Is the vehicle                              |
| **Weather**        | `all_weather`                               |
| **Compliance**     | `DOT                                        | CDL`               |

###### Pedicab

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ----------- | ------------------ | --------- |
| **Legacy Code**    | `TRAVEL-1105`                                         |
| **SKU**            | `TRVL-TRNS-GRND-006`                                  |
| **UNSPSC**         | `78111800`                                            |
| **Common Name**    | Pedicab                                               |
| **Search Aliases** | Rickshaw                                              | Bike Taxi   | Cycle Cab          | Pedal Cab |
| **Description**    | Human-powered pedicab for short-range guest transport |
| **Specifications** | 2 to 3 passenger                                      | With canopy | Branded options    |
| **Options**        | Standard                                              | With Canopy | Branded or Wrapped | LED-Lit   |
| **Modifiers**      | Quantity                                              | Duration    | Branding           | Route     |
| **Prerequisites**  | Designated routes, level ground                       |
| **Pricing Unit**   | per unit/day                                          |
| **Lead Time**      | 168 hours                                             |
| **Setup Time**     | Delivery only                                         |
| **Strike Time**    | Pickup only                                           |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                 |
| **Power**          | Fuel (gasoline or diesel)                             |
| **Footprint**      | Varies by vehicle type                                |
| **Truck Space**    | Is the vehicle                                        |
| **Weather**        | `all_weather`                                         |
| **Compliance**     | `DOT                                                  | CDL`        |

[Back to top](#table-of-contents)

##### Water Transport

###### Charter - Boat

|                    |                                                  |
| ------------------ | ------------------------------------------------ | -------------------- | -------------- | ---------------- | -------- |
| **Legacy Code**    | `TRAVEL-1110`                                    |
| **SKU**            | `TRVL-TRNS-WTRT-001`                             |
| **UNSPSC**         | `78111900`                                       |
| **Common Name**    | Boat Charter                                     |
| **Search Aliases** | Water Taxi                                       | Yacht Charter        | Pontoon Rental | Boat Rental      | Ferry    |
| **Description**    | Water taxi or boat charter for waterfront events |
| **Specifications** | 6-pax through 50-pax and above                   | Various vessel types |
| **Options**        | Pontoon                                          | Speedboat            | Yacht          | Water Taxi       | Sailboat |
| **Modifiers**      | Vessel Type                                      | Capacity             | Duration       | Captain and Crew |
| **Prerequisites**  | Marina or dock access, USCG compliance           |
| **Pricing Unit**   | per vessel/hour                                  |
| **Lead Time**      | 168 hours                                        |
| **Setup Time**     | Delivery only                                    |
| **Strike Time**    | Pickup only                                      |
| **Crew Required**  | 1 licensed driver (CDL if applicable)            |
| **Power**          | Fuel (gasoline or diesel)                        |
| **Footprint**      | Varies by vehicle type                           |
| **Truck Space**    | Is the vehicle                                   |
| **Weather**        | `all_weather`                                    |
| **Compliance**     | `DOT                                             | CDL`                 |

[Back to top](#table-of-contents)

#### Rental Vehicles

##### Cars & Trucks

###### Rental Car - Economy

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- | ---------- | ------------ | -------------- |
| **Legacy Code**    | `TRAVEL-1200`                                               |
| **SKU**            | `TRVL-RENT-CARS-001`                                        |
| **UNSPSC**         | `78111600`                                                  |
| **Common Name**    | Economy Rental Car                                          |
| **Search Aliases** | Compact Rental                                              | Budget Car | Small Rental | Crew Car       |
| **Description**    | Economy or compact rental car for individual production use |
| **Specifications** | Economy or compact                                          | 4-door     | Automatic    |
| **Options**        | Economy                                                     | Compact    | With GPS     | With Insurance |
| **Modifiers**      | Class                                                       | Duration   | Insurance    | GPS            |
| **Prerequisites**  | Driver license, credit card, minimum age 21 to 25           |
| **Pricing Unit**   | per car/day                                                 |
| **Lead Time**      | 168 hours                                                   |
| **Setup Time**     | Delivery only                                               |
| **Strike Time**    | Pickup only                                                 |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                       |
| **Power**          | Fuel (gasoline or diesel)                                   |
| **Footprint**      | Varies by vehicle type                                      |
| **Truck Space**    | Is the vehicle                                              |
| **Weather**        | `all_weather`                                               |
| **Compliance**     | `DOT                                                        | CDL`       |

###### Rental Car - Full-Size or SUV

|                    |                                             |
| ------------------ | ------------------------------------------- | ----------- | ------------- | ------------------ |
| **Legacy Code**    | `TRAVEL-1201`                               |
| **SKU**            | `TRVL-RENT-CARS-002`                        |
| **UNSPSC**         | `78111600`                                  |
| **Common Name**    | Full-Size Rental Car or SUV                 |
| **Search Aliases** | SUV Rental                                  | Midsize SUV | Large Car     | Production Vehicle |
| **Description**    | Full-size sedan or SUV for production leads |
| **Specifications** | Full-size sedan through full-size SUV       |
| **Options**        | Full-Size Sedan                             | Midsize SUV | Full-Size SUV | Premium SUV        |
| **Modifiers**      | Class                                       | Duration    | Insurance     | GPS                |
| **Prerequisites**  | Driver license, credit card                 |
| **Pricing Unit**   | per car/day                                 |
| **Lead Time**      | 168 hours                                   |
| **Setup Time**     | Delivery only                               |
| **Strike Time**    | Pickup only                                 |
| **Crew Required**  | 1 licensed driver (CDL if applicable)       |
| **Power**          | Fuel (gasoline or diesel)                   |
| **Footprint**      | Varies by vehicle type                      |
| **Truck Space**    | Is the vehicle                              |
| **Weather**        | `all_weather`                               |
| **Compliance**     | `DOT                                        | CDL`        |

###### Rental - Cargo Van or Box Truck

|                    |                                                   |
| ------------------ | ------------------------------------------------- | ---------------- | ------------ | ------------- | ---------- |
| **Legacy Code**    | `TRAVEL-1202`                                     |
| **SKU**            | `TRVL-RENT-CARS-003`                              |
| **UNSPSC**         | `78111600`                                        |
| **Common Name**    | Rental Cargo Van or Box Truck                     |
| **Search Aliases** | Moving Truck                                      | Equipment Van    | Cargo Rental | U-Haul        | Penske     |
| **Description**    | Cargo van or small box truck for equipment runs   |
| **Specifications** | Cargo van through 15ft box truck                  | Liftgate options |
| **Options**        | Cargo Van                                         | 10ft Box         | 15ft Box     | With Liftgate | With Dolly |
| **Modifiers**      | Size                                              | Duration         | Mileage      | Liftgate      |
| **Prerequisites**  | Driver license (CDL not needed under 26,001 GVWR) |
| **Pricing Unit**   | per vehicle/day                                   |
| **Lead Time**      | 168 hours                                         |
| **Setup Time**     | Delivery only                                     |
| **Strike Time**    | Pickup only                                       |
| **Crew Required**  | 1 licensed driver (CDL if applicable)             |
| **Power**          | Fuel (gasoline or diesel)                         |
| **Footprint**      | Varies by vehicle type                            |
| **Truck Space**    | Is the vehicle                                    |
| **Weather**        | `all_weather`                                     |
| **Compliance**     | `DOT                                              | CDL`             |

###### Van - 15 Passenger

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ---------- | ----------------- | ------------- |
| **Legacy Code**    | `TRAVEL-1203`                                              |
| **SKU**            | `TRVL-RENT-CARS-004`                                       |
| **UNSPSC**         | `78111600`                                                 |
| **Common Name**    | 15-Passenger Van                                           |
| **Search Aliases** | Crew Van                                                   | 15-Pax Van | Group Van         | Transit Van   |
| **Description**    | 15-passenger van for crew transport                        |
| **Specifications** | 15-passenger                                               | V8         | Automatic         | Luggage space |
| **Options**        | Standard                                                   | Extended   | With Luggage Rack |
| **Modifiers**      | Duration                                                   | Insurance  | Driver            |
| **Prerequisites**  | License (some states require endorsement for 15-passenger) |
| **Pricing Unit**   | per van/day                                                |
| **Lead Time**      | 168 hours                                                  |
| **Setup Time**     | Delivery only                                              |
| **Strike Time**    | Pickup only                                                |
| **Crew Required**  | 1 licensed driver (CDL if applicable)                      |
| **Power**          | Fuel (gasoline or diesel)                                  |
| **Footprint**      | Varies by vehicle type                                     |
| **Truck Space**    | Is the vehicle                                             |
| **Weather**        | `all_weather`                                              |
| **Compliance**     | `DOT                                                       | CDL`       |

[Back to top](#table-of-contents)

##### Specialty Rentals

###### Trailer - Enclosed

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ----------------- | ----------- | --------------- | ------ | --------- |
| **Legacy Code**    | `TRAVEL-1210`                                           |
| **SKU**            | `TRVL-RENT-SPCR-001`                                    |
| **UNSPSC**         | `78111700`                                              |
| **Common Name**    | Enclosed Trailer                                        |
| **Search Aliases** | Cargo Trailer                                           | Equipment Trailer | Box Trailer | Utility Trailer |
| **Description**    | Enclosed trailer for equipment or merchandise transport |
| **Specifications** | 6x12 through 8.5x24                                     | With ramp         |
| **Options**        | 6x12                                                    | 7x14              | 7x16        | 8.5x20          | 8.5x24 | With Ramp |
| **Modifiers**      | Size                                                    | Duration          | E-Track     | Ramp            |
| **Prerequisites**  | Tow vehicle with adequate towing capacity, hitch        |
| **Pricing Unit**   | per trailer/day                                         |
| **Lead Time**      | 72 hours                                                |
| **Setup Time**     | 15 min                                                  |
| **Strike Time**    | 15 min                                                  |
| **Crew Required**  | 1 person                                                |
| **Power**          | None                                                    |
| **Footprint**      | Varies                                                  |
| **Truck Space**    | Minimal                                                 |
| **Weather**        | `outdoor_rated`                                         |
| **Sustainability** | `REUSABLE`                                              |

###### Fuel Card - Prepaid

|                    |                                            |
| ------------------ | ------------------------------------------ | --------------------------- | ------------------ | -------- | ------- |
| **Legacy Code**    | `TRAVEL-1211`                              |
| **SKU**            | `TRVL-RENT-SPCR-002`                       |
| **UNSPSC**         | `78111700`                                 |
| **Common Name**    | Fuel Card                                  |
| **Search Aliases** | Gas Card                                   | Fleet Card                  | Prepaid Fuel       | WEX Card | Fuelman |
| **Description**    | Prepaid fuel card for rental vehicle fleet |
| **Specifications** | 100 through 500 dollar denominations       | Fleet card options          |
| **Options**        | Prepaid Visa Gas                           | Fleet Card (WEX or Fuelman) | Company Card       |
| **Modifiers**      | Value                                      | Card Type                   | Vehicle Assignment |
| **Prerequisites**  | Vehicle list, driver list                  |
| **Pricing Unit**   | per card                                   |
| **Lead Time**      | 72 hours                                   |
| **Setup Time**     | 15 min                                     |
| **Strike Time**    | 15 min                                     |
| **Crew Required**  | 1 person                                   |
| **Power**          | None                                       |
| **Footprint**      | Varies                                     |
| **Truck Space**    | Minimal                                    |
| **Weather**        | `outdoor_rated`                            |
| **Sustainability** | `REUSABLE`                                 |

###### Parking Pass - Off-Site

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | --------------------- | --------------- | ----------- |
| **Legacy Code**    | `TRAVEL-1212`                                          |
| **SKU**            | `TRVL-RENT-SPCR-003`                                   |
| **UNSPSC**         | `78111700`                                             |
| **Common Name**    | Off-Site Parking Pass                                  |
| **Search Aliases** | Crew Parking                                           | Overflow Parking      | Remote Lot Pass | Garage Pass |
| **Description**    | Pre-paid parking for off-site crew parking or overflow |
| **Specifications** | Daily through monthly                                  | Garage or surface lot |
| **Options**        | Surface Lot                                            | Covered Garage        | Valet           | Reserved    |
| **Modifiers**      | Duration                                               | Lot Type              | Quantity        |
| **Prerequisites**  | Parking lot agreement, distribution plan               |
| **Pricing Unit**   | per pass/day                                           |
| **Lead Time**      | 72 hours                                               |
| **Setup Time**     | 15 min                                                 |
| **Strike Time**    | 15 min                                                 |
| **Crew Required**  | 1 person                                               |
| **Power**          | None                                                   |
| **Footprint**      | Varies                                                 |
| **Truck Space**    | Minimal                                                |
| **Weather**        | `outdoor_rated`                                        |
| **Sustainability** | `REUSABLE`                                             |

[Back to top](#table-of-contents)

---

### Labor

_48 items_

#### Leadership

##### Production Management

###### Manager - Production

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | ----------------------------- | ---------------------------- | --------------- |
| **Legacy Code**    | `LABOR-1001`                                                  |
| **SKU**            | `LABR-LEAD-PMGT-001`                                          |
| **UNSPSC**         | `80111600`                                                    |
| **Common Name**    | Production Manager                                            |
| **Search Aliases** | PM                                                            | Show Producer                 | Event Producer               | Production Lead |
| **Description**    | Overall production operations lead, manages crew and timeline |
| **Specifications** | Full-day (10 to 12hr)                                         | Pre-production plus show days | Cross-departmental authority |
| **Options**        | Day Rate                                                      | Weekly Rate                   | Project Rate                 |
| **Modifiers**      | Duration                                                      | Pre-Production Days           | Travel and Per Diem          |
| **Prerequisites**  | Advance docs, production schedule, radio, site access         |
| **Pricing Unit**   | per day                                                       |
| **Lead Time**      | 72 hours                                                      |
| **Setup Time**     | 15 min                                                        |
| **Strike Time**    | 15 min                                                        |
| **Crew Required**  | 1 person                                                      |
| **Power**          | None                                                          |
| **Footprint**      | Varies                                                        |
| **Truck Space**    | Minimal                                                       |
| **Weather**        | `outdoor_rated`                                               |
| **Sustainability** | `REUSABLE`                                                    |

###### Manager - Stage

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | ---------------- | ----------------------------- | ------------- |
| **Legacy Code**    | `LABOR-1002`                                                  |
| **SKU**            | `LABR-LEAD-PMGT-002`                                          |
| **UNSPSC**         | `80111600`                                                    |
| **Common Name**    | Stage Manager                                                 |
| **Search Aliases** | SM                                                            | Show Caller      | Deck Manager                  | Floor Manager |
| **Description**    | Manages stage flow, artist changeovers, and show calling      |
| **Specifications** | Full-day                                                      | Show-critical    | All-department communications |
| **Options**        | Day Rate                                                      | Show Rate        | Per-Stage Rate                |
| **Modifiers**      | Duration                                                      | Number of Stages | Show Complexity               |
| **Prerequisites**  | Stage plot, set times, intercom or radio, production schedule |
| **Pricing Unit**   | per day                                                       |
| **Lead Time**      | 72 hours                                                      |
| **Setup Time**     | 15 min                                                        |
| **Strike Time**    | 15 min                                                        |
| **Crew Required**  | 1 person                                                      |
| **Power**          | None                                                          |
| **Footprint**      | Varies                                                        |
| **Truck Space**    | Minimal                                                       |
| **Weather**        | `outdoor_rated`                                               |
| **Sustainability** | `REUSABLE`                                                    |

###### Director - Technical

|                    |                                                                |
| ------------------ | -------------------------------------------------------------- | ------------------------ | ------------------------------------ | ------------------ |
| **Legacy Code**    | `LABOR-1003`                                                   |
| **SKU**            | `LABR-LEAD-PMGT-003`                                           |
| **UNSPSC**         | `80111600`                                                     |
| **Common Name**    | Technical Director                                             |
| **Search Aliases** | TD                                                             | Tech Director            | Systems Designer                     | Head of Production |
| **Description**    | Overall technical production lead, system design and oversight |
| **Specifications** | Full-day                                                       | Pre-production plus show | Cross-department technical authority |
| **Options**        | Day Rate                                                       | Weekly                   | Project                              |
| **Modifiers**      | Duration                                                       | Pre-Production           | System Complexity                    |
| **Prerequisites**  | Technical riders, system design docs, CAD, radio               |
| **Pricing Unit**   | per day                                                        |
| **Lead Time**      | 72 hours                                                       |
| **Setup Time**     | 15 min                                                         |
| **Strike Time**    | 15 min                                                         |
| **Crew Required**  | 1 person                                                       |
| **Power**          | None                                                           |
| **Footprint**      | Varies                                                         |
| **Truck Space**    | Minimal                                                        |
| **Weather**        | `outdoor_rated`                                                |
| **Sustainability** | `REUSABLE`                                                     |

###### Manager - Site Operations

|                    |                                                                      |
| ------------------ | -------------------------------------------------------------------- | ------------------------- | ------------------- | ---------------- |
| **Legacy Code**    | `LABOR-1004`                                                         |
| **SKU**            | `LABR-LEAD-PMGT-004`                                                 |
| **UNSPSC**         | `80111600`                                                           |
| **Common Name**    | Site Operations Manager                                              |
| **Search Aliases** | Site Manager                                                         | Ops Lead                  | Logistics Manager   | Site Coordinator |
| **Description**    | On-site operations lead for logistics, infrastructure, and site flow |
| **Specifications** | Full-day                                                             | Multi-day build plus show | Site-wide authority |
| **Options**        | Day Rate                                                             | Weekly                    | Project             |
| **Modifiers**      | Duration                                                             | Site Complexity           | Build Days          |
| **Prerequisites**  | Site plan, CAD, radio, vehicle                                       |
| **Pricing Unit**   | per day                                                              |
| **Lead Time**      | 72 hours                                                             |
| **Setup Time**     | 15 min                                                               |
| **Strike Time**    | 15 min                                                               |
| **Crew Required**  | 1 person                                                             |
| **Power**          | None                                                                 |
| **Footprint**      | Varies                                                               |
| **Truck Space**    | Minimal                                                              |
| **Weather**        | `outdoor_rated`                                                      |
| **Sustainability** | `REUSABLE`                                                           |

###### Caller - Show

|                    |                                                                               |
| ------------------ | ----------------------------------------------------------------------------- | --------------------- | -------------------- | ---------- |
| **Legacy Code**    | `LABOR-1005`                                                                  |
| **SKU**            | `LABR-LEAD-PMGT-005`                                                          |
| **UNSPSC**         | `80111600`                                                                    |
| **Common Name**    | Show Caller                                                                   |
| **Search Aliases** | Cue Caller                                                                    | Calling Stage Manager | Show Director        | Cue-to-Cue |
| **Description**    | Calls cues for multi-element shows including lighting, video, audio, and pyro |
| **Specifications** | Show-critical                                                                 | Headset and intercom  | Script and cue sheet |
| **Options**        | Show Rate                                                                     | Day Rate              |
| **Modifiers**      | Show Count                                                                    | Complexity            | Rehearsal            |
| **Prerequisites**  | Cue sheet, intercom, FOH or booth position                                    |
| **Pricing Unit**   | per show                                                                      |
| **Lead Time**      | 72 hours                                                                      |
| **Setup Time**     | 15 min                                                                        |
| **Strike Time**    | 15 min                                                                        |
| **Crew Required**  | 1 person                                                                      |
| **Power**          | None                                                                          |
| **Footprint**      | Varies                                                                        |
| **Truck Space**    | Minimal                                                                       |
| **Weather**        | `outdoor_rated`                                                               |
| **Sustainability** | `REUSABLE`                                                                    |

[Back to top](#table-of-contents)

##### Department Heads

###### Engineer - Audio FOH

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | --------------------- | ---------------- | ---------- | --- |
| **Legacy Code**    | `LABOR-1010`                                           |
| **SKU**            | `LABR-LEAD-DEPT-001`                                   |
| **UNSPSC**         | `80111700`                                             |
| **Common Name**    | Front-of-House Audio Engineer                          |
| **Search Aliases** | FOH Engineer                                           | Sound Engineer        | Mix Engineer     | Audio Lead | A1  |
| **Description**    | Front-of-house audio mix engineer for live performance |
| **Specifications** | Full-day                                               | Sound check plus show | Console-specific |
| **Options**        | Day Rate                                               | Show Rate             | Per-Act Rate     |
| **Modifiers**      | Duration                                               | Console Platform      | Number of Acts   | Complexity |
| **Prerequisites**  | Console spec in rider, audio snake or patch, radio     |
| **Pricing Unit**   | per day                                                |
| **Lead Time**      | 72 hours                                               |
| **Setup Time**     | 15 min                                                 |
| **Strike Time**    | 15 min                                                 |
| **Crew Required**  | 1 person                                               |
| **Power**          | None                                                   |
| **Footprint**      | Varies                                                 |
| **Truck Space**    | Minimal                                                |
| **Weather**        | `outdoor_rated`                                        |
| **Sustainability** | `REUSABLE`                                             |

###### Designer - Lighting

|                    |                                                   |
| ------------------ | ------------------------------------------------- | ---------------------------------- | -------------------- | ---------------- |
| **Legacy Code**    | `LABOR-1011`                                      |
| **SKU**            | `LABR-LEAD-DEPT-002`                              |
| **UNSPSC**         | `80111700`                                        |
| **Common Name**    | Lighting Designer                                 |
| **Search Aliases** | LD                                                | Lighting Programmer                | Light Show Designer  | Console Operator |
| **Description**    | Lighting designer and console programmer          |
| **Specifications** | Full-day                                          | Pre-viz plus programming plus show | Console-specific     |
| **Options**        | Day Rate                                          | Show Rate                          | Programming Day Rate |
| **Modifiers**      | Duration                                          | Console (MA, Hog, or Eos)          | Pre-Viz Time         | Complexity       |
| **Prerequisites**  | Console, network, lighting plot, fixture schedule |
| **Pricing Unit**   | per day                                           |
| **Lead Time**      | 72 hours                                          |
| **Setup Time**     | 15 min                                            |
| **Strike Time**    | 15 min                                            |
| **Crew Required**  | 1 person                                          |
| **Power**          | None                                              |
| **Footprint**      | Varies                                            |
| **Truck Space**    | Minimal                                           |
| **Weather**        | `outdoor_rated`                                   |
| **Sustainability** | `REUSABLE`                                        |

###### Director - Video

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | ------------- | ------------------------ | ------------------ |
| **Legacy Code**    | `LABOR-1012`                                                     |
| **SKU**            | `LABR-LEAD-DEPT-003`                                             |
| **UNSPSC**         | `80111700`                                                       |
| **Common Name**    | Video Director                                                   |
| **Search Aliases** | Video Engineer                                                   | Vision Mixer  | IMAG Director            | Broadcast Director |
| **Description**    | Video switching and directing lead for IMAG and content playback |
| **Specifications** | Full-day                                                         | Show-critical | Multi-camera or playback |
| **Options**        | Day Rate                                                         | Show Rate     |
| **Modifiers**      | Duration                                                         | Camera Count  | Complexity               | Playback vs Live   |
| **Prerequisites**  | Video village, switcher, comms, content files                    |
| **Pricing Unit**   | per day                                                          |
| **Lead Time**      | 72 hours                                                         |
| **Setup Time**     | 15 min                                                           |
| **Strike Time**    | 15 min                                                           |
| **Crew Required**  | 1 person                                                         |
| **Power**          | None                                                             |
| **Footprint**      | Varies                                                           |
| **Truck Space**    | Minimal                                                          |
| **Weather**        | `outdoor_rated`                                                  |
| **Sustainability** | `REUSABLE`                                                       |

###### Rigger - Head

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | --------------- | --------------------------------- | ---------------- |
| **Legacy Code**    | `LABOR-1013`                                               |
| **SKU**            | `LABR-LEAD-DEPT-004`                                       |
| **UNSPSC**         | `80111700`                                                 |
| **Common Name**    | Head Rigger                                                |
| **Search Aliases** | Lead Rigger                                                | Master Rigger   | Rigging Supervisor                | ETCP Rigger      |
| **Description**    | Lead rigger overseeing all overhead and structural rigging |
| **Specifications** | Full-day                                                   | Build plus show | Certified rigger (ETCP preferred) |
| **Options**        | Day Rate                                                   | Weekly          |
| **Modifiers**      | Duration                                                   | Complexity      | Points Count                      | Arena vs Outdoor |
| **Prerequisites**  | Rigging plot, venue specs, motor inventory, safety docs    |
| **Pricing Unit**   | per day                                                    |
| **Lead Time**      | 72 hours                                                   |
| **Setup Time**     | 15 min                                                     |
| **Strike Time**    | 15 min                                                     |
| **Crew Required**  | 1 person                                                   |
| **Power**          | None                                                       |
| **Footprint**      | Varies                                                     |
| **Truck Space**    | Minimal                                                    |
| **Weather**        | `outdoor_rated`                                            |
| **Sustainability** | `REUSABLE`                                                 |

###### Manager - Catering

|                    |                                                                    |
| ------------------ | ------------------------------------------------------------------ | ---------------------------- | ------------------------------- | ---- |
| **Legacy Code**    | `LABOR-1014`                                                       |
| **SKU**            | `LABR-LEAD-DEPT-005`                                               |
| **UNSPSC**         | `80111700`                                                         |
| **Common Name**    | Catering Manager                                                   |
| **Search Aliases** | Kitchen Manager                                                    | Food Service Manager         | Hospitality Lead                | Chef |
| **Description**    | Oversees all catering operations, meal planning, and dietary needs |
| **Specifications** | Full-day                                                           | Multi-day                    | Kitchen plus service management |
| **Options**        | Day Rate                                                           | Event Rate                   |
| **Modifiers**      | Duration                                                           | Headcount (crew plus talent) | Dietary Complexity              |
| **Prerequisites**  | Menu approval, kitchen or prep space, dietary requirements list    |
| **Pricing Unit**   | per day                                                            |
| **Lead Time**      | 72 hours                                                           |
| **Setup Time**     | 15 min                                                             |
| **Strike Time**    | 15 min                                                             |
| **Crew Required**  | 1 person                                                           |
| **Power**          | None                                                               |
| **Footprint**      | Varies                                                             |
| **Truck Space**    | Minimal                                                            |
| **Weather**        | `outdoor_rated`                                                    |
| **Sustainability** | `REUSABLE`                                                         |

###### Director - Security

|                    |                                                                  |
| ------------------ | ---------------------------------------------------------------- | ------------------- | ------------------------- | ------------------- |
| **Legacy Code**    | `LABOR-1015`                                                     |
| **SKU**            | `LABR-LEAD-DEPT-006`                                             |
| **UNSPSC**         | `80111700`                                                       |
| **Common Name**    | Security Director                                                |
| **Search Aliases** | Security Manager                                                 | Chief of Security   | Security Coordinator      |
| **Description**    | Lead security operations, threat assessment, and team management |
| **Specifications** | Full-day                                                         | Pre-event plus show | Cross-agency coordination |
| **Options**        | Day Rate                                                         | Event Rate          |
| **Modifiers**      | Duration                                                         | Threat Level        | Team Size                 | Agency Coordination |
| **Prerequisites**  | Security plan, radio, credentials, briefing                      |
| **Pricing Unit**   | per day                                                          |
| **Lead Time**      | 72 hours                                                         |
| **Setup Time**     | 15 min                                                           |
| **Strike Time**    | 15 min                                                           |
| **Crew Required**  | 1 person                                                         |
| **Power**          | None                                                             |
| **Footprint**      | Varies                                                           |
| **Truck Space**    | Minimal                                                          |
| **Weather**        | `outdoor_rated`                                                  |
| **Sustainability** | `REUSABLE`                                                       |

###### Manager - Guest Experience

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | -------------------- | ------------ | ------------------- |
| **Legacy Code**    | `LABOR-1016`                                              |
| **SKU**            | `LABR-LEAD-DEPT-007`                                      |
| **UNSPSC**         | `80111700`                                                |
| **Common Name**    | Guest Experience Manager                                  |
| **Search Aliases** | Guest Services Lead                                       | Hospitality Director | CX Manager   | Front-of-House Lead |
| **Description**    | Leads guest services, info, accessibility, and complaints |
| **Specifications** | Full-day                                                  | FOH authority        | Guest-facing |
| **Options**        | Day Rate                                                  | Event Rate           |
| **Modifiers**      | Duration                                                  | Venue Complexity     | Team Size    |
| **Prerequisites**  | Site map, FAQ, radio, guest services station              |
| **Pricing Unit**   | per day                                                   |
| **Lead Time**      | 72 hours                                                  |
| **Setup Time**     | 15 min                                                    |
| **Strike Time**    | 15 min                                                    |
| **Crew Required**  | 1 person                                                  |
| **Power**          | None                                                      |
| **Footprint**      | Varies                                                    |
| **Truck Space**    | Minimal                                                   |
| **Weather**        | `outdoor_rated`                                           |
| **Sustainability** | `REUSABLE`                                                |

[Back to top](#table-of-contents)

#### Heavy Equipment Operators

##### Certified Operators

###### Operator - Forklift

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------- | ------------- |
| **Legacy Code**    | `LABOR-1100`                                                      |
| **SKU**            | `LABR-OPER-CERT-001`                                              |
| **UNSPSC**         | `80111800`                                                        |
| **Common Name**    | Certified Forklift Operator                                       |
| **Search Aliases** | Forklift Driver                                                   | Lift Truck Operator                         | OSHA Forklift |
| **Description**    | Certified forklift operator for loading, unloading, and placement |
| **Specifications** | 8 to 12hr shift                                                   | OSHA 1910.178 certified                     |
| **Options**        | Day Rate                                                          | Half-Day                                    | Overtime      |
| **Modifiers**      | Shift Duration                                                    | Equipment (operator brings own vs provided) |
| **Prerequisites**  | Forklift, OSHA certification verification                         |
| **Pricing Unit**   | per shift                                                         |
| **Lead Time**      | 72 hours                                                          |
| **Setup Time**     | 15 min                                                            |
| **Strike Time**    | 15 min                                                            |
| **Crew Required**  | 1 person                                                          |
| **Power**          | None                                                              |
| **Footprint**      | Varies                                                            |
| **Truck Space**    | Minimal                                                           |
| **Weather**        | `outdoor_rated`                                                   |
| **Sustainability** | `REUSABLE`                                                        |

###### Operator - Aerial Lift

|                    |                                                  |
| ------------------ | ------------------------------------------------ | --------------------------- | ------------ |
| **Legacy Code**    | `LABOR-1101`                                     |
| **SKU**            | `LABR-OPER-CERT-002`                             |
| **UNSPSC**         | `80111800`                                       |
| **Common Name**    | Certified Aerial Lift Operator                   |
| **Search Aliases** | Boom Operator                                    | Scissor Lift Operator       | AWP Operator |
| **Description**    | Certified aerial lift operator for elevated work |
| **Specifications** | 8 to 12hr shift                                  | ANSI and OSHA certified     |
| **Options**        | Day Rate                                         | Half-Day                    | Overtime     |
| **Modifiers**      | Shift Duration                                   | Lift Type (boom vs scissor) |
| **Prerequisites**  | Lift, certification verification, spotter        |
| **Pricing Unit**   | per shift                                        |
| **Lead Time**      | 72 hours                                         |
| **Setup Time**     | 15 min                                           |
| **Strike Time**    | 15 min                                           |
| **Crew Required**  | 1 person                                         |
| **Power**          | None                                             |
| **Footprint**      | Varies                                           |
| **Truck Space**    | Minimal                                          |
| **Weather**        | `outdoor_rated`                                  |
| **Sustainability** | `REUSABLE`                                       |

###### Operator - Crane

|                    |                                                |
| ------------------ | ---------------------------------------------- | ------------------- | ---------------------------- |
| **Legacy Code**    | `LABOR-1102`                                   |
| **SKU**            | `LABR-OPER-CERT-003`                           |
| **UNSPSC**         | `80111800`                                     |
| **Common Name**    | Certified Crane Operator                       |
| **Search Aliases** | Crane Driver                                   | NCCCO Operator      | Mobile Crane Operator        |
| **Description**    | Certified crane operator for heavy lifts       |
| **Specifications** | 8 to 12hr shift                                | NCCCO certified     | With oiler and signal person |
| **Options**        | Day Rate                                       | With Oiler (add-on) |
| **Modifiers**      | Shift Duration                                 | Crane Tonnage       | Oiler and Signal Person      |
| **Prerequisites**  | Crane, NCCCO certification, lift plan, permits |
| **Pricing Unit**   | per shift                                      |
| **Lead Time**      | 72 hours                                       |
| **Setup Time**     | 15 min                                         |
| **Strike Time**    | 15 min                                         |
| **Crew Required**  | 1 person                                       |
| **Power**          | None                                           |
| **Footprint**      | Varies                                         |
| **Truck Space**    | Minimal                                        |
| **Weather**        | `outdoor_rated`                                |
| **Sustainability** | `REUSABLE`                                     |

###### Driver - CDL

|                    |                                               |
| ------------------ | --------------------------------------------- | ---------------- | ---------------------- | ---------- |
| **Legacy Code**    | `LABOR-1103`                                  |
| **SKU**            | `LABR-OPER-CERT-004`                          |
| **UNSPSC**         | `80111800`                                    |
| **Common Name**    | CDL Commercial Driver                         |
| **Search Aliases** | Truck Driver                                  | CDL Driver       | Heavy Vehicle Operator | OTR Driver |
| **Description**    | Commercial driver for trucks over 26,001 GVWR |
| **Specifications** | Full-day or per-trip                          | CDL Class A or B | DOT compliant          |
| **Options**        | Per Trip                                      | Day Rate         | With Helper (lumper)   |
| **Modifiers**      | Trip or Day                                   | Vehicle Class    | Helper                 |
| **Prerequisites**  | CDL verification, DOT medical card, drug test |
| **Pricing Unit**   | per day                                       |
| **Lead Time**      | 72 hours                                      |
| **Setup Time**     | 15 min                                        |
| **Strike Time**    | 15 min                                        |
| **Crew Required**  | 1 person                                      |
| **Power**          | None                                          |
| **Footprint**      | Varies                                        |
| **Truck Space**    | Minimal                                       |
| **Weather**        | `outdoor_rated`                               |
| **Sustainability** | `REUSABLE`                                    |

[Back to top](#table-of-contents)

#### Skilled Labor

##### Technical Crew

###### Technician - Audio

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- | ----------------------------------- | ---------------------- | ----------- | ------- |
| **Legacy Code**    | `LABOR-1200`                                                      |
| **SKU**            | `LABR-SKIL-TCRE-001`                                              |
| **UNSPSC**         | `80111900`                                                        |
| **Common Name**    | Audio Technician                                                  |
| **Search Aliases** | A2                                                                | Audio Tech                          | Sound Tech             | System Tech | RF Tech |
| **Description**    | Audio system tech, patch, RF coordination, and stage tech support |
| **Specifications** | 8 to 12hr shift                                                   | System deployment plus show support |
| **Options**        | Day Rate                                                          | Half-Day                            | Overtime               |
| **Modifiers**      | Shift                                                             | System Size                         | RF Coordination Duties |
| **Prerequisites**  | Audio system, tools, radio                                        |
| **Pricing Unit**   | per shift                                                         |
| **Lead Time**      | 672 hours                                                         |
| **Setup Time**     | N/A (personnel)                                                   |
| **Strike Time**    | N/A                                                               |
| **Crew Required**  | Self (individual)                                                 |
| **Power**          | N/A                                                               |
| **Footprint**      | N/A                                                               |
| **Truck Space**    | N/A                                                               |
| **Weather**        | `not_applicable`                                                  |
| **Compliance**     | `ETCP                                                             | FAA_PART107`                        |

###### Technician - Lighting

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ | --------------------------------- | ----------------------- | ------- |
| **Legacy Code**    | `LABOR-1201`                                                 |
| **SKU**            | `LABR-SKIL-TCRE-002`                                         |
| **UNSPSC**         | `80111900`                                                   |
| **Common Name**    | Lighting Technician                                          |
| **Search Aliases** | Light Tech                                                   | Electrician (entertainment)       | Lamp Op                 | Spot Op |
| **Description**    | Lighting focus, programming support, and fixture maintenance |
| **Specifications** | 8 to 12hr shift                                              | Hang plus focus plus show support |
| **Options**        | Day Rate                                                     | Half-Day                          | Overtime                |
| **Modifiers**      | Shift                                                        | Rig Size                          | Moving Light Experience |
| **Prerequisites**  | Tools, gloves, radio, harness (if at height)                 |
| **Pricing Unit**   | per shift                                                    |
| **Lead Time**      | 672 hours                                                    |
| **Setup Time**     | N/A (personnel)                                              |
| **Strike Time**    | N/A                                                          |
| **Crew Required**  | Self (individual)                                            |
| **Power**          | N/A                                                          |
| **Footprint**      | N/A                                                          |
| **Truck Space**    | N/A                                                          |
| **Weather**        | `not_applicable`                                             |
| **Compliance**     | `ETCP                                                        | FAA_PART107`                      |

###### Technician - Video

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | ------------------------------------------ | -------------- | ------------ |
| **Legacy Code**    | `LABOR-1202`                                           |
| **SKU**            | `LABR-SKIL-TCRE-003`                                   |
| **UNSPSC**         | `80111900`                                             |
| **Common Name**    | Video Technician                                       |
| **Search Aliases** | LED Tech                                               | Camera Op                                  | Video Engineer | Display Tech |
| **Description**    | LED wall build, camera operation, and cable management |
| **Specifications** | 8 to 12hr shift                                        | Build plus show support                    |
| **Options**        | Day Rate                                               | Half-Day                                   | Overtime       |
| **Modifiers**      | Shift                                                  | System Type (LED wall, projection, camera) |
| **Prerequisites**  | Tools, radio                                           |
| **Pricing Unit**   | per shift                                              |
| **Lead Time**      | 672 hours                                              |
| **Setup Time**     | N/A (personnel)                                        |
| **Strike Time**    | N/A                                                    |
| **Crew Required**  | Self (individual)                                      |
| **Power**          | N/A                                                    |
| **Footprint**      | N/A                                                    |
| **Truck Space**    | N/A                                                    |
| **Weather**        | `not_applicable`                                       |
| **Compliance**     | `ETCP                                                  | FAA_PART107`                               |

###### Rigger - Certified

|                    |                                                      |
| ------------------ | ---------------------------------------------------- | ---------------- | ----------------- | -------- |
| **Legacy Code**    | `LABOR-1203`                                         |
| **SKU**            | `LABR-SKIL-TCRE-004`                                 |
| **UNSPSC**         | `80111900`                                           |
| **Common Name**    | Certified Rigger                                     |
| **Search Aliases** | Arena Rigger                                         | ETCP Rigger      | Chain Motor Tech  | Fly Tech |
| **Description**    | Arena or outdoor rigging technician, ETCP preferred  |
| **Specifications** | 8 to 12hr shift                                      | Build plus show  | Working at height |
| **Options**        | Day Rate                                             | Half-Day         | Overtime          |
| **Modifiers**      | Shift                                                | Arena vs Outdoor | ETCP Certified    |
| **Prerequisites**  | Harness, hard hat, tools, certification verification |
| **Pricing Unit**   | per shift                                            |
| **Lead Time**      | 672 hours                                            |
| **Setup Time**     | N/A (personnel)                                      |
| **Strike Time**    | N/A                                                  |
| **Crew Required**  | Self (individual)                                    |
| **Power**          | N/A                                                  |
| **Footprint**      | N/A                                                  |
| **Truck Space**    | N/A                                                  |
| **Weather**        | `not_applicable`                                     |
| **Compliance**     | `ETCP                                                | FAA_PART107`     |

###### Electrician - Licensed

|                    |                                                       |
| ------------------ | ----------------------------------------------------- | ------------------------------------------------ | ------------------------------------ | --------------- |
| **Legacy Code**    | `LABOR-1204`                                          |
| **SKU**            | `LABR-SKIL-TCRE-005`                                  |
| **UNSPSC**         | `80111900`                                            |
| **Common Name**    | Licensed Electrician                                  |
| **Search Aliases** | Event Electrician                                     | Journeyman Electrician                           | Master Electrician                   | Temp Power Tech |
| **Description**    | Licensed electrician for temporary power installation |
| **Specifications** | 8 to 12hr shift                                       | Power distribution, tie-ins, and troubleshooting |
| **Options**        | Day Rate                                              | Half-Day                                         | Emergency or OT                      |
| **Modifiers**      | Shift                                                 | Scope (distribution vs tie-in)                   | License Level (journeyman or master) |
| **Prerequisites**  | License verification, tools, PPE                      |
| **Pricing Unit**   | per shift                                             |
| **Lead Time**      | 672 hours                                             |
| **Setup Time**     | N/A (personnel)                                       |
| **Strike Time**    | N/A                                                   |
| **Crew Required**  | Self (individual)                                     |
| **Power**          | N/A                                                   |
| **Footprint**      | N/A                                                   |
| **Truck Space**    | N/A                                                   |
| **Weather**        | `not_applicable`                                      |
| **Compliance**     | `ETCP                                                 | FAA_PART107`                                     |

###### Carpenter - Scenic

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ------------------------------- | -------------- | ---------- | --------------- |
| **Legacy Code**    | `LABOR-1205`                                               |
| **SKU**            | `LABR-SKIL-TCRE-006`                                       |
| **UNSPSC**         | `80111900`                                                 |
| **Common Name**    | Scenic Carpenter                                           |
| **Search Aliases** | Carpenter                                                  | Set Builder                     | Scenic Builder | Fabricator | Stage Carpenter |
| **Description**    | Skilled carpenter for scenic construction and stage builds |
| **Specifications** | 8 to 12hr shift                                            | Build plus strike               |
| **Options**        | Day Rate                                                   | Half-Day                        | Overtime       |
| **Modifiers**      | Shift                                                      | Scope (framing, finish, scenic) |
| **Prerequisites**  | Tools (personal or provided), materials                    |
| **Pricing Unit**   | per shift                                                  |
| **Lead Time**      | 672 hours                                                  |
| **Setup Time**     | N/A (personnel)                                            |
| **Strike Time**    | N/A                                                        |
| **Crew Required**  | Self (individual)                                          |
| **Power**          | N/A                                                        |
| **Footprint**      | N/A                                                        |
| **Truck Space**    | N/A                                                        |
| **Weather**        | `not_applicable`                                           |
| **Compliance**     | `ETCP                                                      | FAA_PART107`                    |

###### Welder - Certified

|                    |                                                     |
| ------------------ | --------------------------------------------------- | ------------------ | -------------------------- | ----------------- |
| **Legacy Code**    | `LABOR-1206`                                        |
| **SKU**            | `LABR-SKIL-TCRE-007`                                |
| **UNSPSC**         | `80111900`                                          |
| **Common Name**    | Certified Welder                                    |
| **Search Aliases** | Metal Fabricator                                    | MIG Welder         | TIG Welder                 | Structural Welder |
| **Description**    | Certified welder for on-site fabrication and repair |
| **Specifications** | 8 to 12hr shift                                     | MIG, TIG, or Stick | Structural or scenic       |
| **Options**        | Day Rate                                            | Half-Day           | Emergency                  |
| **Modifiers**      | Shift                                               | Weld Type          | Material (steel, aluminum) |
| **Prerequisites**  | Welding equipment, PPE, fire watch, hot work permit |
| **Pricing Unit**   | per shift                                           |
| **Lead Time**      | 672 hours                                           |
| **Setup Time**     | N/A (personnel)                                     |
| **Strike Time**    | N/A                                                 |
| **Crew Required**  | Self (individual)                                   |
| **Power**          | N/A                                                 |
| **Footprint**      | N/A                                                 |
| **Truck Space**    | N/A                                                 |
| **Weather**        | `not_applicable`                                    |
| **Compliance**     | `ETCP                                               | FAA_PART107`       |

[Back to top](#table-of-contents)

##### Creative & Specialty

###### Photographer - Event

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- | --------------------------- | ----------------------------- | ------------ |
| **Legacy Code**    | `LABOR-1210`                                                  |
| **SKU**            | `LABR-SKIL-CREA-001`                                          |
| **UNSPSC**         | `80112000`                                                    |
| **Common Name**    | Event Photographer                                            |
| **Search Aliases** | Production Photographer                                       | Show Photographer           | Content Photographer          |
| **Description**    | Professional event photographer for documentation and content |
| **Specifications** | 4 to 8hr coverage                                             | Edited deliverables         | Digital                       |
| **Options**        | Standard (4hr, 200 images)                                    | Full Day (8hr, 500 or more) | Premium (plus drone or video) |
| **Modifiers**      | Coverage Hours                                                | Editing                     | Deliverable Count             | Usage Rights |
| **Prerequisites**  | Camera gear (own), shot list, access credentials              |
| **Pricing Unit**   | per day                                                       |
| **Lead Time**      | 672 hours                                                     |
| **Setup Time**     | N/A (personnel)                                               |
| **Strike Time**    | N/A                                                           |
| **Crew Required**  | Self (individual)                                             |
| **Power**          | N/A                                                           |
| **Footprint**      | N/A                                                           |
| **Truck Space**    | N/A                                                           |
| **Weather**        | `not_applicable`                                              |
| **Compliance**     | `ETCP                                                         | FAA_PART107`                |

###### Videographer - Event

|                    |                                                        |
| ------------------ | ------------------------------------------------------ | -------------------------- | ------------------------------ | ------------------ |
| **Legacy Code**    | `LABOR-1211`                                           |
| **SKU**            | `LABR-SKIL-CREA-002`                                   |
| **UNSPSC**         | `80112000`                                             |
| **Common Name**    | Event Videographer                                     |
| **Search Aliases** | Camera Operator                                        | Filmmaker                  | Content Creator                | Recap Videographer |
| **Description**    | Professional videographer for recap or content capture |
| **Specifications** | 4 to 8hr                                               | Raw or edited deliverables | 4K                             |
| **Options**        | Standard (4hr raw)                                     | Full Day (8hr edited)      | Premium (multi-cam plus drone) |
| **Modifiers**      | Coverage Hours                                         | Editing Level              | Deliverables                   | Usage Rights       |
| **Prerequisites**  | Camera gear (own), shot list, access, storage          |
| **Pricing Unit**   | per day                                                |
| **Lead Time**      | 672 hours                                              |
| **Setup Time**     | N/A (personnel)                                        |
| **Strike Time**    | N/A                                                    |
| **Crew Required**  | Self (individual)                                      |
| **Power**          | N/A                                                    |
| **Footprint**      | N/A                                                    |
| **Truck Space**    | N/A                                                    |
| **Weather**        | `not_applicable`                                       |
| **Compliance**     | `ETCP                                                  | FAA_PART107`               |

###### Drone Pilot - Licensed

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ------------ | ------------------- | -------------- | ------------------ |
| **Legacy Code**    | `LABOR-1212`                                            |
| **SKU**            | `LABR-SKIL-CREA-003`                                    |
| **UNSPSC**         | `80112000`                                              |
| **Common Name**    | Licensed Drone Pilot                                    |
| **Search Aliases** | Drone Operator                                          | UAV Pilot    | Aerial Photographer | Part 107 Pilot |
| **Description**    | FAA Part 107 licensed drone pilot for aerial capture    |
| **Specifications** | Photography, videography, mapping, or FPV               |
| **Options**        | Photo                                                   | Video        | Photo and Video     | FPV Cinematic  | Survey and Mapping |
| **Modifiers**      | Coverage Type                                           | Duration     | FAA Waiver          | Insurance      |
| **Prerequisites**  | FAA Part 107 cert, insurance, airspace clearance, LAANC |
| **Pricing Unit**   | per day                                                 |
| **Lead Time**      | 672 hours                                               |
| **Setup Time**     | N/A (personnel)                                         |
| **Strike Time**    | N/A                                                     |
| **Crew Required**  | Self (individual)                                       |
| **Power**          | N/A                                                     |
| **Footprint**      | N/A                                                     |
| **Truck Space**    | N/A                                                     |
| **Weather**        | `not_applicable`                                        |
| **Compliance**     | `ETCP                                                   | FAA_PART107` |

###### Designer - Graphic

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | --------------------------- | ------------------- | -------------- |
| **Legacy Code**    | `LABOR-1213`                                              |
| **SKU**            | `LABR-SKIL-CREA-004`                                      |
| **UNSPSC**         | `80112000`                                                |
| **Common Name**    | On-Site Graphic Designer                                  |
| **Search Aliases** | Event Designer                                            | Day-Of Designer             | Production Designer | Print Designer |
| **Description**    | On-site graphic designer for day-of signage and changes   |
| **Specifications** | Full-day                                                  | Laptop plus design software | Quick turnaround    |
| **Options**        | Day Rate                                                  | Half-Day                    | Emergency           |
| **Modifiers**      | Shift                                                     | Software (Adobe CC)         | Print Access        |
| **Prerequisites**  | Laptop (own or provided), design software, printer access |
| **Pricing Unit**   | per day                                                   |
| **Lead Time**      | 672 hours                                                 |
| **Setup Time**     | N/A (personnel)                                           |
| **Strike Time**    | N/A                                                       |
| **Crew Required**  | Self (individual)                                         |
| **Power**          | N/A                                                       |
| **Footprint**      | N/A                                                       |
| **Truck Space**    | N/A                                                       |
| **Weather**        | `not_applicable`                                          |
| **Compliance**     | `ETCP                                                     | FAA_PART107`                |

###### Artist - Hair and Makeup

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- | ------------------------- | ----------------- | -------- | ------------- |
| **Legacy Code**    | `LABOR-1214`                                               |
| **SKU**            | `LABR-SKIL-CREA-005`                                       |
| **UNSPSC**         | `80112000`                                                 |
| **Common Name**    | Hair and Makeup Artist                                     |
| **Search Aliases** | HMUA                                                       | MUA                       | Glam              | Stylist  | Beauty Artist |
| **Description**    | Professional hair and makeup for talent or branding        |
| **Specifications** | Per person                                                 | Bridal or editorial level | With kit          |
| **Options**        | Standard                                                   | Bridal or Editorial       | SFX or Theatrical |
| **Modifiers**      | Per Person                                                 | Style Complexity          | Duration          | Products |
| **Prerequisites**  | Chair, mirror, lighting, power, products (own or provided) |
| **Pricing Unit**   | per person                                                 |
| **Lead Time**      | 672 hours                                                  |
| **Setup Time**     | N/A (personnel)                                            |
| **Strike Time**    | N/A                                                        |
| **Crew Required**  | Self (individual)                                          |
| **Power**          | N/A                                                        |
| **Footprint**      | N/A                                                        |
| **Truck Space**    | N/A                                                        |
| **Weather**        | `not_applicable`                                           |
| **Compliance**     | `ETCP                                                      | FAA_PART107`              |

###### Stylist - Wardrobe

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ------------------------------------ | --------------- | ----------------- |
| **Legacy Code**    | `LABOR-1215`                                            |
| **SKU**            | `LABR-SKIL-CREA-006`                                    |
| **UNSPSC**         | `80112000`                                              |
| **Common Name**    | Wardrobe Stylist                                        |
| **Search Aliases** | Costume Coordinator                                     | Wardrobe Manager                     | Fashion Stylist |
| **Description**    | Wardrobe management and costume coordination for talent |
| **Specifications** | Full-day                                                | Steaming, fitting, and quick changes |
| **Options**        | Day Rate                                                | Show Rate                            |
| **Modifiers**      | Duration                                                | Talent Count                         | Quick Changes   | Costume Inventory |
| **Prerequisites**  | Steamer, rack, iron, sewing kit, dressing area          |
| **Pricing Unit**   | per day                                                 |
| **Lead Time**      | 672 hours                                               |
| **Setup Time**     | N/A (personnel)                                         |
| **Strike Time**    | N/A                                                     |
| **Crew Required**  | Self (individual)                                       |
| **Power**          | N/A                                                     |
| **Footprint**      | N/A                                                     |
| **Truck Space**    | N/A                                                     |
| **Weather**        | `not_applicable`                                        |
| **Compliance**     | `ETCP                                                   | FAA_PART107`                         |

[Back to top](#table-of-contents)

#### General Labor

##### Stagehands

###### Stagehand - IATSE

|                    |                                                 |
| ------------------ | ----------------------------------------------- | ----------------------------------------------------- | ------------- | ---------- |
| **Legacy Code**    | `LABOR-1300`                                    |
| **SKU**            | `LABR-GENL-HAND-001`                            |
| **UNSPSC**         | `80111500`                                      |
| **Common Name**    | IATSE Stagehand                                 |
| **Search Aliases** | Union Stagehand                                 | IATSE Hand                                            | Union Crew    | Local Hand |
| **Description**    | Union stagehand for load-in, show, and load-out |
| **Specifications** | 8hr call (minimum)                              | IATSE local rates apply                               | OT after 8hrs |
| **Options**        | 8hr Call                                        | 10hr Call                                             | 12hr Call     | Show Call  |
| **Modifiers**      | Call Length                                     | Department (audio, lighting, video, carpentry, props) | OT            |
| **Prerequisites**  | IATSE contract, steward, breaks per contract    |
| **Pricing Unit**   | per person/call                                 |
| **Lead Time**      | 168 hours                                       |
| **Setup Time**     | 15 to 60 min depending on type                  |
| **Strike Time**    | 10 to 30 min                                    |
| **Crew Required**  | 2 to 4 stagehands                               |
| **Power**          | None (unless lit)                               |
| **Footprint**      | Varies                                          |
| **Truck Space**    | Stacks or bundles, efficient                    |
| **Weather**        | `outdoor_rated`                                 |
| **Compliance**     | `ADA`                                           |
| **Sustainability** | `REUSABLE`                                      |

###### Stagehand - Non-Union

|                    |                                                     |
| ------------------ | --------------------------------------------------- | ---------------------------------- | ---------- | ------------ | ---- |
| **Legacy Code**    | `LABOR-1301`                                        |
| **SKU**            | `LABR-GENL-HAND-002`                                |
| **UNSPSC**         | `80111500`                                          |
| **Common Name**    | Non-Union Stagehand                                 |
| **Search Aliases** | Freelance Stagehand                                 | Local Crew                         | Day Labor  | Load-In Crew | Grip |
| **Description**    | Non-union stagehand for load-in, show, and load-out |
| **Specifications** | 8 to 12hr shift                                     | General production labor           |
| **Options**        | 8hr Shift                                           | 10hr Shift                         | 12hr Shift |
| **Modifiers**      | Shift Length                                        | Skill Level (experienced vs green) | OT Rate    |
| **Pricing Unit**   | per person/shift                                    |
| **Lead Time**      | 168 hours                                           |
| **Setup Time**     | 15 to 60 min depending on type                      |
| **Strike Time**    | 10 to 30 min                                        |
| **Crew Required**  | 2 to 4 stagehands                                   |
| **Power**          | None (unless lit)                                   |
| **Footprint**      | Varies                                              |
| **Truck Space**    | Stacks or bundles, efficient                        |
| **Weather**        | `outdoor_rated`                                     |
| **Compliance**     | `ADA`                                               |
| **Sustainability** | `REUSABLE`                                          |

[Back to top](#table-of-contents)

##### Event Staff

###### Security Guard - Unarmed

|                    |                                                                         |
| ------------------ | ----------------------------------------------------------------------- | -------------- | ------------------------------------ | ---------------- |
| **Legacy Code**    | `LABOR-1310`                                                            |
| **SKU**            | `LABR-GENL-EVST-001`                                                    |
| **UNSPSC**         | `80111501`                                                              |
| **Common Name**    | Unarmed Security Guard                                                  |
| **Search Aliases** | Event Security                                                          | Crowd Control  | Access Control                       | Security Officer |
| **Description**    | Licensed unarmed security guard for access control and crowd management |
| **Specifications** | 8 to 12hr shift                                                         | State-licensed | Uniformed                            |
| **Options**        | Standard                                                                | Supervisor     | Bike Patrol                          | Roving           |
| **Modifiers**      | Shift                                                                   | Quantity       | Position (gate, roving, VIP, artist) | Supervisor Ratio |
| **Prerequisites**  | State license, background check, briefing                               |
| **Pricing Unit**   | per person/shift                                                        |
| **Lead Time**      | 336 hours                                                               |
| **Setup Time**     | N/A (personnel, requires briefing)                                      |
| **Strike Time**    | N/A                                                                     |
| **Crew Required**  | Per event staffing plan                                                 |
| **Power**          | N/A                                                                     |
| **Footprint**      | N/A                                                                     |
| **Truck Space**    | N/A                                                                     |
| **Weather**        | `not_applicable`                                                        |
| **Compliance**     | `SERVSAFE                                                               | TIPS           | BG_CHECK`                            |

###### Security Guard - Armed

|                    |                                                                |
| ------------------ | -------------------------------------------------------------- | -------------------- | ---------------- | -------------------- |
| **Legacy Code**    | `LABOR-1311`                                                   |
| **SKU**            | `LABR-GENL-EVST-002`                                           |
| **UNSPSC**         | `80111501`                                                     |
| **Common Name**    | Armed Security Guard                                           |
| **Search Aliases** | Armed Officer                                                  | Executive Protection | Close Protection | K-9 Handler          |
| **Description**    | Licensed armed security for high-value or executive protection |
| **Specifications** | 8 to 12hr shift                                                | State-licensed       | Armed            | Executive protection |
| **Options**        | Armed Guard                                                    | Executive Protection | K-9 Unit         |
| **Modifiers**      | Shift                                                          | Quantity             | Detail Type      | Threat Assessment    |
| **Prerequisites**  | State license, insurance, background check, threat assessment  |
| **Pricing Unit**   | per person/shift                                               |
| **Lead Time**      | 336 hours                                                      |
| **Setup Time**     | N/A (personnel, requires briefing)                             |
| **Strike Time**    | N/A                                                            |
| **Crew Required**  | Per event staffing plan                                        |
| **Power**          | N/A                                                            |
| **Footprint**      | N/A                                                            |
| **Truck Space**    | N/A                                                            |
| **Weather**        | `not_applicable`                                               |
| **Compliance**     | `SERVSAFE                                                      | TIPS                 | BG_CHECK`        |

###### Usher - Event

|                    |                                                                         |
| ------------------ | ----------------------------------------------------------------------- | --------- | -------------------------- | --------------- | ---------- |
| **Legacy Code**    | `LABOR-1312`                                                            |
| **SKU**            | `LABR-GENL-EVST-003`                                                    |
| **UNSPSC**         | `80111501`                                                              |
| **Common Name**    | Event Usher                                                             |
| **Search Aliases** | Ticket Scanner                                                          | Greeter   | Door Staff                 | Guest Assistant | Gate Staff |
| **Description**    | Front-of-house staff for ticket scanning, seating, and guest assistance |
| **Specifications** | 6 to 10hr shift                                                         | Uniformed | Trained on scanning system |
| **Options**        | Standard                                                                | Bilingual | With Scanning Device       |
| **Modifiers**      | Shift                                                                   | Quantity  | Language Requirements      |
| **Prerequisites**  | Scanning hardware, training, uniform                                    |
| **Pricing Unit**   | per person/shift                                                        |
| **Lead Time**      | 336 hours                                                               |
| **Setup Time**     | N/A (personnel, requires briefing)                                      |
| **Strike Time**    | N/A                                                                     |
| **Crew Required**  | Per event staffing plan                                                 |
| **Power**          | N/A                                                                     |
| **Footprint**      | N/A                                                                     |
| **Truck Space**    | N/A                                                                     |
| **Weather**        | `not_applicable`                                                        |
| **Compliance**     | `SERVSAFE                                                               | TIPS      | BG_CHECK`                  |

###### Ambassador - Brand

|                    |                                                                 |
| ------------------ | --------------------------------------------------------------- | ------------------- | --------------------- | ------------------ |
| **Legacy Code**    | `LABOR-1313`                                                    |
| **SKU**            | `LABR-GENL-EVST-004`                                            |
| **UNSPSC**         | `80111501`                                                      |
| **Common Name**    | Brand Ambassador                                                |
| **Search Aliases** | Promo Staff                                                     | Promotional Model   | Street Team           | Sampling Staff     |
| **Description**    | Outgoing promotional staff for activations and brand engagement |
| **Specifications** | 4 to 8hr shift                                                  | On-brand appearance | Trained on messaging  |
| **Options**        | Standard                                                        | Bilingual           | Model or Talent-Grade | Costumed           |
| **Modifiers**      | Shift                                                           | Quantity            | Skill Level           | Costume or Uniform |
| **Prerequisites**  | Brand training, uniform or costume, talking points              |
| **Pricing Unit**   | per person/shift                                                |
| **Lead Time**      | 336 hours                                                       |
| **Setup Time**     | N/A (personnel, requires briefing)                              |
| **Strike Time**    | N/A                                                             |
| **Crew Required**  | Per event staffing plan                                         |
| **Power**          | N/A                                                             |
| **Footprint**      | N/A                                                             |
| **Truck Space**    | N/A                                                             |
| **Weather**        | `not_applicable`                                                |
| **Compliance**     | `SERVSAFE                                                       | TIPS                | BG_CHECK`             |

###### Staff - Janitorial

|                    |                                                    |
| ------------------ | -------------------------------------------------- | ------------------- | ----------------------------------- | ------------ | ---------- |
| **Legacy Code**    | `LABOR-1314`                                       |
| **SKU**            | `LABR-GENL-EVST-005`                               |
| **UNSPSC**         | `80111501`                                         |
| **Common Name**    | Janitorial Staff                                   |
| **Search Aliases** | Cleaning Crew                                      | Porters             | Restroom Attendant                  | Custodian    | Sanitation |
| **Description**    | On-site cleaning staff for restrooms, FOH, and BOH |
| **Specifications** | 8 to 12hr shift                                    | Restroom monitoring | Trash runs                          | FOH cleaning |
| **Options**        | Standard                                           | Bio-Hazard Trained  | Overnight Deep Clean                |
| **Modifiers**      | Shift                                              | Crew Size           | Scope (restrooms only vs full site) |
| **Prerequisites**  | Cleaning supplies, cart, PPE, trash bags           |
| **Pricing Unit**   | per person/shift                                   |
| **Lead Time**      | 336 hours                                          |
| **Setup Time**     | N/A (personnel, requires briefing)                 |
| **Strike Time**    | N/A                                                |
| **Crew Required**  | Per event staffing plan                            |
| **Power**          | N/A                                                |
| **Footprint**      | N/A                                                |
| **Truck Space**    | N/A                                                |
| **Weather**        | `not_applicable`                                   |
| **Compliance**     | `SERVSAFE                                          | TIPS                | BG_CHECK`                           |

###### Runner - Production

|                    |                                                                         |
| ------------------ | ----------------------------------------------------------------------- | ------------------------ | ---------------- | ------------- | ----------- |
| **Legacy Code**    | `LABOR-1315`                                                            |
| **SKU**            | `LABR-GENL-EVST-006`                                                    |
| **UNSPSC**         | `80111501`                                                              |
| **Common Name**    | Production Runner                                                       |
| **Search Aliases** | PA                                                                      | Production Assistant     | Gopher           | Errand Runner | Show Runner |
| **Description**    | General production support, errands, equipment moves, and runner duties |
| **Specifications** | 8 to 12hr shift                                                         | Vehicle access preferred | Radio equipped   |
| **Options**        | Standard (on-foot)                                                      | With Vehicle             | Overnight        |
| **Modifiers**      | Shift                                                                   | Vehicle Access           | Experience Level |
| **Prerequisites**  | Radio, site map, contact sheet, vehicle (if applicable)                 |
| **Pricing Unit**   | per person/shift                                                        |
| **Lead Time**      | 336 hours                                                               |
| **Setup Time**     | N/A (personnel, requires briefing)                                      |
| **Strike Time**    | N/A                                                                     |
| **Crew Required**  | Per event staffing plan                                                 |
| **Power**          | N/A                                                                     |
| **Footprint**      | N/A                                                                     |
| **Truck Space**    | N/A                                                                     |
| **Weather**        | `not_applicable`                                                        |
| **Compliance**     | `SERVSAFE                                                               | TIPS                     | BG_CHECK`        |

###### Attendant - Parking

|                    |                                               |
| ------------------ | --------------------------------------------- | --------------- | ------------------- | ---------- |
| **Legacy Code**    | `LABOR-1316`                                  |
| **SKU**            | `LABR-GENL-EVST-007`                          |
| **UNSPSC**         | `80111501`                                    |
| **Common Name**    | Parking Attendant                             |
| **Search Aliases** | Lot Attendant                                 | Traffic Staff   | Parking Guide       | Lot Jockey |
| **Description**    | Parking lot and traffic flow management staff |
| **Specifications** | 6 to 10hr shift                               | Reflective vest | Flashlight and wand |
| **Options**        | Standard                                      | With Radio      | Supervisor          |
| **Modifiers**      | Shift                                         | Quantity        | Lot Assignments     |
| **Prerequisites**  | Vest, flashlight, wand, radio, lot map        |
| **Pricing Unit**   | per person/shift                              |
| **Lead Time**      | 336 hours                                     |
| **Setup Time**     | N/A (personnel, requires briefing)            |
| **Strike Time**    | N/A                                           |
| **Crew Required**  | Per event staffing plan                       |
| **Power**          | N/A                                           |
| **Footprint**      | N/A                                           |
| **Truck Space**    | N/A                                           |
| **Weather**        | `not_applicable`                              |
| **Compliance**     | `SERVSAFE                                     | TIPS            | BG_CHECK`           |

###### Staff - Registration

|                    |                                                          |
| ------------------ | -------------------------------------------------------- | ----------------- | --------------- | --------------- |
| **Legacy Code**    | `LABOR-1317`                                             |
| **SKU**            | `LABR-GENL-EVST-008`                                     |
| **UNSPSC**         | `80111501`                                               |
| **Common Name**    | Registration Staff                                       |
| **Search Aliases** | Check-In Staff                                           | Front Desk        | Welcome Staff   | Enrollment Desk |
| **Description**    | Front desk or registration table staff                   |
| **Specifications** | 6 to 10hr shift                                          | Trained on system | Customer-facing |
| **Options**        | Standard                                                 | Bilingual         | Tech-Savvy      |
| **Modifiers**      | Shift                                                    | Quantity          | System Training |
| **Prerequisites**  | Registration system, laptop or tablet, printer, supplies |
| **Pricing Unit**   | per person/shift                                         |
| **Lead Time**      | 336 hours                                                |
| **Setup Time**     | N/A (personnel, requires briefing)                       |
| **Strike Time**    | N/A                                                      |
| **Crew Required**  | Per event staffing plan                                  |
| **Power**          | N/A                                                      |
| **Footprint**      | N/A                                                      |
| **Truck Space**    | N/A                                                      |
| **Weather**        | `not_applicable`                                         |
| **Compliance**     | `SERVSAFE                                                | TIPS              | BG_CHECK`       |

[Back to top](#table-of-contents)

##### Specialty Staff

###### Bartender - Event

|                    |                                               |
| ------------------ | --------------------------------------------- | -------------------------- | -------------- | -------------------------------- |
| **Legacy Code**    | `LABOR-1320`                                  |
| **SKU**            | `LABR-GENL-SPST-001`                          |
| **UNSPSC**         | `80111502`                                    |
| **Common Name**    | Event Bartender                               |
| **Search Aliases** | Licensed Bartender                            | Mixologist                 | Bar Staff      | Cocktail Bartender               |
| **Description**    | Licensed bartender for event bar service      |
| **Specifications** | 6 to 10hr shift                               | TIPS or ServSafe certified | With bar tools |
| **Options**        | Standard                                      | Craft Cocktail             | Flair or Show  | Bilingual                        |
| **Modifiers**      | Shift                                         | Skill Level                | Certification  | Bar Type (beer and wine vs full) |
| **Prerequisites**  | Alcohol service license, TIPS cert, bar setup |
| **Pricing Unit**   | per person/shift                              |
| **Lead Time**      | 672 hours                                     |
| **Setup Time**     | N/A (personnel)                               |
| **Strike Time**    | N/A                                           |
| **Crew Required**  | Self (individual or team)                     |
| **Power**          | N/A                                           |
| **Footprint**      | N/A                                           |
| **Truck Space**    | N/A                                           |
| **Weather**        | `not_applicable`                              |
| **Compliance**     | `FIRE_MARSHAL                                 | LIQUOR_LICENSE`            |

###### Server - Event

|                    |                                                  |
| ------------------ | ------------------------------------------------ | ------------------ | --------------------- | -------------- |
| **Legacy Code**    | `LABOR-1321`                                     |
| **SKU**            | `LABR-GENL-SPST-002`                             |
| **UNSPSC**         | `80111502`                                       |
| **Common Name**    | Event Server                                     |
| **Search Aliases** | Wait Staff                                       | Waiter             | Catering Server       | Banquet Server |
| **Description**    | Professional server for plated or passed service |
| **Specifications** | 6 to 10hr shift                                  | ServSafe preferred | Uniformed             |
| **Options**        | Standard                                         | Fine Dining        | Passed Hors d'Oeuvres | Bilingual      |
| **Modifiers**      | Shift                                            | Quantity           | Service Style         | Uniform        |
| **Prerequisites**  | Uniform, service training, menu knowledge        |
| **Pricing Unit**   | per person/shift                                 |
| **Lead Time**      | 672 hours                                        |
| **Setup Time**     | N/A (personnel)                                  |
| **Strike Time**    | N/A                                              |
| **Crew Required**  | Self (individual or team)                        |
| **Power**          | N/A                                              |
| **Footprint**      | N/A                                              |
| **Truck Space**    | N/A                                              |
| **Weather**        | `not_applicable`                                 |
| **Compliance**     | `FIRE_MARSHAL                                    | LIQUOR_LICENSE`    |

###### Attendant - Valet

|                    |                                                           |
| ------------------ | --------------------------------------------------------- | ----------------------------------- | --------------- | --------- |
| **Legacy Code**    | `LABOR-1322`                                              |
| **SKU**            | `LABR-GENL-SPST-003`                                      |
| **UNSPSC**         | `80111502`                                                |
| **Common Name**    | Valet Attendant                                           |
| **Search Aliases** | Valet Parker                                              | Valet Driver                        | Parking Valet   |
| **Description**    | Professional valet driver for guest vehicle parking       |
| **Specifications** | 4 to 8hr shift                                            | Licensed driver                     | Insured service |
| **Options**        | Standard                                                  | Premium (luxury vehicle experience) |
| **Modifiers**      | Shift                                                     | Quantity                            | Lot Distance    | Insurance |
| **Prerequisites**  | Valet insurance, key management system, cones and signage |
| **Pricing Unit**   | per person/shift                                          |
| **Lead Time**      | 672 hours                                                 |
| **Setup Time**     | N/A (personnel)                                           |
| **Strike Time**    | N/A                                                       |
| **Crew Required**  | Self (individual or team)                                 |
| **Power**          | N/A                                                       |
| **Footprint**      | N/A                                                       |
| **Truck Space**    | N/A                                                       |
| **Weather**        | `not_applicable`                                          |
| **Compliance**     | `FIRE_MARSHAL                                             | LIQUOR_LICENSE`                     |

###### Flagger - Traffic

|                    |                                                                     |
| ------------------ | ------------------------------------------------------------------- | ------------------------ | ---------------------- | ------------------------ |
| **Legacy Code**    | `LABOR-1323`                                                        |
| **SKU**            | `LABR-GENL-SPST-004`                                                |
| **UNSPSC**         | `80111502`                                                          |
| **Common Name**    | Certified Traffic Flagger                                           |
| **Search Aliases** | Traffic Controller                                                  | Flagging Crew            | MOT Flagger            | Road Crew                |
| **Description**    | Certified traffic control flagger for road closures and site access |
| **Specifications** | 8hr shift                                                           | ATSSA or state-certified | With PPE and equipment |
| **Options**        | Standard                                                            | MOT-Certified (FL)       | With Arrow Board       |
| **Modifiers**      | Shift                                                               | Quantity                 | Certifications         | Equipment (signs, cones) |
| **Prerequisites**  | Certification, PPE, signage, traffic control plan                   |
| **Pricing Unit**   | per person/shift                                                    |
| **Lead Time**      | 672 hours                                                           |
| **Setup Time**     | N/A (personnel)                                                     |
| **Strike Time**    | N/A                                                                 |
| **Crew Required**  | Self (individual or team)                                           |
| **Power**          | N/A                                                                 |
| **Footprint**      | N/A                                                                 |
| **Truck Space**    | N/A                                                                 |
| **Weather**        | `not_applicable`                                                    |
| **Compliance**     | `FIRE_MARSHAL                                                       | LIQUOR_LICENSE`          |

###### DJ - Event

|                    |                                                 |
| ------------------ | ----------------------------------------------- | ------------------------------- | ------------- | ------- | -------- |
| **Legacy Code**    | `LABOR-1324`                                    |
| **SKU**            | `LABR-GENL-SPST-005`                            |
| **UNSPSC**         | `80111502`                                      |
| **Common Name**    | Event DJ                                        |
| **Search Aliases** | Disc Jockey                                     | Mobile DJ                       | Party DJ      | Club DJ | House DJ |
| **Description**    | DJ for event entertainment                      |
| **Specifications** | 4 to 8hr set                                    | With equipment or gear provided |
| **Options**        | DJ (own gear)                                   | DJ (gear provided)              | Live Musician | Band    |
| **Modifiers**      | Set Length                                      | Equipment Needs                 | Genre         | Riders  |
| **Prerequisites**  | Performance area, power, backline (if provided) |
| **Pricing Unit**   | per set                                         |
| **Lead Time**      | 672 hours                                       |
| **Setup Time**     | N/A (personnel)                                 |
| **Strike Time**    | N/A                                             |
| **Crew Required**  | Self (individual or team)                       |
| **Power**          | N/A                                             |
| **Footprint**      | N/A                                             |
| **Truck Space**    | N/A                                             |
| **Weather**        | `not_applicable`                                |
| **Compliance**     | `FIRE_MARSHAL                                   | LIQUOR_LICENSE`                 |

###### MC - Event

|                    |                                                   |
| ------------------ | ------------------------------------------------- | -------------------- | ----------------- | -------------------- | --------- |
| **Legacy Code**    | `LABOR-1325`                                      |
| **SKU**            | `LABR-GENL-SPST-006`                              |
| **UNSPSC**         | `80111502`                                        |
| **Common Name**    | Event MC                                          |
| **Search Aliases** | Emcee                                             | Host                 | Announcer         | Master of Ceremonies | Presenter |
| **Description**    | Professional host or master of ceremonies         |
| **Specifications** | 4 to 8hr                                          | Script or improvised | With wireless mic |
| **Options**        | Standard MC                                       | Bilingual MC         | Celebrity Host    |
| **Modifiers**      | Duration                                          | Script or Improv     | Language          | Profile              |
| **Prerequisites**  | Wireless mic, stage access, script or run of show |
| **Pricing Unit**   | per event                                         |
| **Lead Time**      | 672 hours                                         |
| **Setup Time**     | N/A (personnel)                                   |
| **Strike Time**    | N/A                                               |
| **Crew Required**  | Self (individual or team)                         |
| **Power**          | N/A                                               |
| **Footprint**      | N/A                                               |
| **Truck Space**    | N/A                                               |
| **Weather**        | `not_applicable`                                  |
| **Compliance**     | `FIRE_MARSHAL                                     | LIQUOR_LICENSE`      |

###### Interpreter

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | --------------- | ------------------------ | ----------------- |
| **Legacy Code**    | `LABOR-1326`                                            |
| **SKU**            | `LABR-GENL-SPST-007`                                    |
| **UNSPSC**         | `80111502`                                              |
| **Common Name**    | Professional Interpreter                                |
| **Search Aliases** | Translator                                              | ASL Interpreter | Simultaneous Interpreter | Language Services |
| **Description**    | Professional interpreter for live events or meetings    |
| **Specifications** | Simultaneous, consecutive, or sign language (ASL)       |
| **Options**        | Simultaneous (booth)                                    | Consecutive     | ASL Interpreter          |
| **Modifiers**      | Type                                                    | Language Pair   | Duration                 | Equipment         |
| **Prerequisites**  | Interpreter booth (simultaneous), headsets for audience |
| **Pricing Unit**   | per person/day                                          |
| **Lead Time**      | 672 hours                                               |
| **Setup Time**     | N/A (personnel)                                         |
| **Strike Time**    | N/A                                                     |
| **Crew Required**  | Self (individual or team)                               |
| **Power**          | N/A                                                     |
| **Footprint**      | N/A                                                     |
| **Truck Space**    | N/A                                                     |
| **Weather**        | `not_applicable`                                        |
| **Compliance**     | `FIRE_MARSHAL                                           | LIQUOR_LICENSE` |

###### Officer - Off-Duty

|                    |                                                         |
| ------------------ | ------------------------------------------------------- | ----------------- | ------------------- | -------------- |
| **Legacy Code**    | `LABOR-1327`                                            |
| **SKU**            | `LABR-GENL-SPST-008`                                    |
| **UNSPSC**         | `80111502`                                              |
| **Common Name**    | Off-Duty Law Enforcement                                |
| **Search Aliases** | Off-Duty Police                                         | Sheriff Detail    | Uniformed Officer   | Police Detail  |
| **Description**    | Off-duty law enforcement for event security and traffic |
| **Specifications** | 4 to 8hr detail                                         | Armed             | Uniformed           | Jurisdictional |
| **Options**        | Off-Duty Officer                                        | Off-Duty Sergeant | With Patrol Vehicle |
| **Modifiers**      | Detail Length                                           | Quantity          | Vehicle             | Jurisdiction   |
| **Prerequisites**  | Agency agreement, insurance, advance coordination       |
| **Pricing Unit**   | per officer/detail                                      |
| **Lead Time**      | 672 hours                                               |
| **Setup Time**     | N/A (personnel)                                         |
| **Strike Time**    | N/A                                                     |
| **Crew Required**  | Self (individual or team)                               |
| **Power**          | N/A                                                     |
| **Footprint**      | N/A                                                     |
| **Truck Space**    | N/A                                                     |
| **Weather**        | `not_applicable`                                        |
| **Compliance**     | `FIRE_MARSHAL                                           | LIQUOR_LICENSE`   |

###### Fire Watch

|                    |                                                                    |
| ------------------ | ------------------------------------------------------------------ | -------------------- | ---------- | ----------- |
| **Legacy Code**    | `LABOR-1328`                                                       |
| **SKU**            | `LABR-GENL-SPST-009`                                               |
| **UNSPSC**         | `80111502`                                                         |
| **Common Name**    | Fire Watch Personnel                                               |
| **Search Aliases** | Fire Marshal Detail                                                | Fire Safety          | Fire Watch | Pyro Safety |
| **Description**    | Required fire watch personnel for pyro, tents, or assembly permits |
| **Specifications** | Per fire marshal or permit requirement                             | Certified            |
| **Options**        | Fire Watch (during show)                                           | Fire Marshal Standby | Inspection |
| **Modifiers**      | Duration                                                           | Quantity             | Scope      |
| **Prerequisites**  | Fire marshal permit, extinguishers, radio                          |
| **Pricing Unit**   | per person/shift                                                   |
| **Lead Time**      | 672 hours                                                          |
| **Setup Time**     | N/A (personnel)                                                    |
| **Strike Time**    | N/A                                                                |
| **Crew Required**  | Self (individual or team)                                          |
| **Power**          | N/A                                                                |
| **Footprint**      | N/A                                                                |
| **Truck Space**    | N/A                                                                |
| **Weather**        | `not_applicable`                                                   |
| **Compliance**     | `FIRE_MARSHAL                                                      | LIQUOR_LICENSE`      |

[Back to top](#table-of-contents)

---

## Pricing

MSRP ranges by country and tier (Basic, Standard, Premium). All prices are indicative ranges (±15% of tier midpoint).

### Currency Reference

| Code | Country              | Currency | Symbol | USD Multiplier |
| ---- | -------------------- | -------- | ------ | -------------: |
| US   | United States        | USD      | $      |          1.00x |
| UK   | United Kingdom       | GBP      | £      |          0.79x |
| EU   | European Union       | EUR      | €      |          0.92x |
| UAE  | United Arab Emirates | AED      | د.إ    |          3.67x |
| AU   | Australia            | AUD      | A$     |          1.55x |
| CA   | Canada               | CAD      | C$     |          1.38x |
| MX   | Mexico               | MXN      | MX$    |          17.2x |
| BR   | Brazil               | BRL      | R$     |           5.1x |

### Tier Definitions

- **Basic:** Entry-level spec. Budget-conscious. Off-brand or older models. Suitable for corporate events and small activations.
- **Standard:** Industry-standard spec. Professional-grade at market rate. Suitable for festivals, brand activations, and touring.
- **Premium:** Top-tier spec. Flagship equipment, premium brands, white-glove service. Suitable for headliner stages and broadcast.

### Pricing by Item (USD)

| Code          | Display Name                               | Unit               |            Basic |         Standard |          Premium |
| ------------- | ------------------------------------------ | ------------------ | ---------------: | ---------------: | ---------------: |
| `SITE-1001`   | Barricade - Bike Rack - 8ft                | per section/day    |           $7 - 9 |         $10 - 14 |         $15 - 21 |
| `SITE-1002`   | Barrier - Jersey - Water-Filled            | per unit/day       |         $21 - 29 |         $34 - 46 |         $50 - 70 |
| `SITE-1003`   | Fence Panel - Chain Link - 6ft Temp        | per panel/day      |          $8 - 12 |         $13 - 17 |         $19 - 25 |
| `SITE-1004`   | Barrier - Jersey - Concrete                | per unit/day       |         $30 - 40 |         $47 - 65 |         $70 - 90 |
| `SITE-1005`   | Stanchion - Retractable Belt               | per unit/day       |        $4.25 - 6 |           $7 - 9 |         $13 - 17 |
| `SITE-1006`   | Barrier - Median - Concrete DOT            | per unit/day       |         $38 - 50 |         $60 - 80 |        $85 - 115 |
| `SITE-1007`   | Bollard - Removable                        | per unit           |        $85 - 115 |       $210 - 290 |       $500 - 700 |
| `SITE-1008`   | Barrier - Front of Stage                   | per section/day    |         $21 - 29 |         $38 - 50 |         $65 - 85 |
| `SITE-1009`   | Cone - Traffic                             | per unit/day       |        $1 - 1.15 |       $1.7 - 2.3 |       $3.4 - 4.6 |
| `SITE-1010`   | Tent - Frame                               | per tent/day       |       $675 - 925 |   $1,275 - 1,725 |   $2,975 - 4,025 |
| `SITE-1011`   | Tent - Pole - High Peak                    | per tent/day       |       $500 - 700 |   $1,025 - 1,375 |   $2,375 - 3,225 |
| `SITE-1012`   | Canopy - Pop-Up - 10x10                    | per unit/day       |         $30 - 40 |         $50 - 70 |       $100 - 140 |
| `SITE-1013`   | Structure - Clear Span                     | per sq ft/day      |     $2.55 - 3.45 |           $5 - 7 |         $10 - 14 |
| `SITE-1014`   | Shade Sail - Tension                       | per unit/day       |       $170 - 230 |       $380 - 525 |     $775 - 1,025 |
| `SITE-1015`   | Shipping Container - Office                | per unit/day       |       $170 - 230 |       $425 - 575 |   $1,275 - 1,725 |
| `SITE-1016`   | Shipping Container - Storage               | per unit/day       |         $65 - 85 |       $105 - 145 |       $190 - 260 |
| `SITE-1020`   | Mat - Ground Protection                    | per panel/day      |         $13 - 17 |         $21 - 29 |         $34 - 46 |
| `SITE-1021`   | Dance Floor - Portable                     | per sq ft/day      |       $1.7 - 2.3 |       $3.4 - 4.6 |           $7 - 9 |
| `SITE-1022`   | Dance Floor - Marley                       | per sq ft/day      |        $1 - 1.15 |       $1.7 - 2.3 |       $3.4 - 4.6 |
| `SITE-1023`   | Turf - Synthetic                           | per sq ft/day      |        $1 - 1.15 |       $1.7 - 2.3 |       $3.4 - 4.6 |
| `SITE-1024`   | Carpet - Event                             | per linear ft/day  |        $1 - 1.15 |     $2.55 - 3.45 |           $5 - 7 |
| `SITE-1025`   | Mat - Rubber - Anti-Fatigue                | per tile/day       |     $2.55 - 3.45 |           $5 - 7 |          $8 - 12 |
| `SITE-1026`   | Floor - Raised Access                      | per sq ft/day      |       $3.4 - 4.6 |           $7 - 9 |         $13 - 17 |
| `SITE-1030`   | Restroom - Portable - Standard             | per unit/day       |         $65 - 85 |       $105 - 145 |       $170 - 230 |
| `SITE-1031`   | Restroom Trailer - Luxury                  | per trailer/day    |       $425 - 575 |   $1,025 - 1,375 |   $2,550 - 3,450 |
| `SITE-1032`   | Hand Wash Station - Portable               | per unit/day       |         $34 - 46 |         $65 - 85 |       $105 - 145 |
| `SITE-1033`   | Shower Trailer - Portable                  | per trailer/day    |       $340 - 460 |     $775 - 1,025 |   $1,700 - 2,300 |
| `SITE-1034`   | Trailer - Office                           | per trailer/day    |        $85 - 115 |       $210 - 290 |       $500 - 700 |
| `SITE-1035`   | Booth - Guard                              | per unit/day       |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `SITE-1036`   | Restroom - Portable - ADA                  | per unit/day       |        $85 - 115 |       $150 - 200 |       $235 - 315 |
| `SITE-1100`   | Golf Cart - 4 Seat                         | per unit/day       |         $65 - 85 |       $105 - 145 |       $170 - 230 |
| `SITE-1101`   | Golf Cart - 6 Seat                         | per unit/day       |        $85 - 115 |       $150 - 200 |       $235 - 315 |
| `SITE-1102`   | UTV - Utility Vehicle                      | per unit/day       |       $130 - 170 |       $210 - 290 |       $340 - 460 |
| `SITE-1103`   | ATV - All Terrain                          | per unit/day       |       $130 - 170 |       $235 - 315 |       $380 - 525 |
| `SITE-1104`   | Scooter - Electric                         | per unit/day       |         $21 - 29 |         $42 - 55 |        $70 - 100 |
| `SITE-1110`   | Box Truck - 16ft                           | per truck/day      |       $130 - 170 |       $210 - 290 |       $340 - 460 |
| `SITE-1111`   | Box Truck - 26ft                           | per truck/day      |       $170 - 230 |       $300 - 400 |       $470 - 625 |
| `SITE-1112`   | Truck - Flatbed                            | per truck/day      |       $255 - 345 |       $425 - 575 |       $675 - 925 |
| `SITE-1113`   | Van - Sprinter                             | per van/day        |       $105 - 145 |       $170 - 230 |       $300 - 400 |
| `SITE-1114`   | Truck - Pickup                             | per truck/day      |         $65 - 85 |       $105 - 145 |       $170 - 230 |
| `SITE-1115`   | Tractor-Trailer - 53ft                     | per truck/day      |       $425 - 575 |     $775 - 1,025 |   $1,275 - 1,725 |
| `SITE-1120`   | Truck - Water                              | per truck/day      |       $255 - 345 |       $500 - 700 |     $850 - 1,150 |
| `SITE-1121`   | Truck - Fuel Service                       | per service        |       $170 - 230 |       $425 - 575 |     $850 - 1,150 |
| `SITE-1122`   | Sweeper - Street                           | per unit/day       |       $210 - 290 |       $425 - 575 |     $850 - 1,150 |
| `SITE-1200`   | Scissor Lift - Electric                    | per unit/day       |       $130 - 170 |       $235 - 315 |       $380 - 525 |
| `SITE-1201`   | Boom Lift - Articulating                   | per unit/day       |       $210 - 290 |       $425 - 575 |   $1,025 - 1,375 |
| `SITE-1202`   | Boom Lift - Telescopic                     | per unit/day       |       $255 - 345 |       $500 - 700 |   $1,275 - 1,725 |
| `SITE-1203`   | Lift - Vertical - Push-Around              | per unit/day       |         $65 - 85 |       $105 - 145 |       $170 - 230 |
| `SITE-1210`   | Forklift - Standard                        | per unit/day       |       $170 - 230 |       $300 - 400 |       $500 - 700 |
| `SITE-1211`   | Telehandler                                | per unit/day       |       $300 - 400 |       $500 - 700 |     $850 - 1,150 |
| `SITE-1212`   | Loader - Skid Steer                        | per unit/day       |       $170 - 230 |       $300 - 400 |       $470 - 625 |
| `SITE-1220`   | Crane - Mobile                             | per unit/day       |   $1,275 - 1,725 |   $2,975 - 4,025 |   $6,800 - 9,200 |
| `SITE-1221`   | Crane - Tower                              | per unit/week      |   $4,250 - 5,800 | $10,200 - 13,800 | $21,200 - 28,700 |
| `SITE-1300`   | Generator - Towable                        | per unit/day       |       $210 - 290 |       $675 - 925 |   $2,550 - 3,450 |
| `SITE-1301`   | Distribution Box - Power                   | per unit/day       |         $42 - 55 |       $105 - 145 |       $255 - 345 |
| `SITE-1302`   | Cable Run - Feeder                         | per run/day        |         $21 - 29 |         $65 - 85 |       $170 - 230 |
| `SITE-1303`   | Tie-In - Electrical                        | per service        |       $425 - 575 |   $1,025 - 1,375 |   $2,550 - 3,450 |
| `SITE-1304`   | Battery Pack - Portable                    | per unit/day       |         $21 - 29 |         $65 - 85 |       $170 - 230 |
| `SITE-1305`   | Light Tower - Portable                     | per unit/day       |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `SITE-1310`   | Water Tank - Potable                       | per unit/day       |        $85 - 115 |       $210 - 290 |       $425 - 575 |
| `SITE-1311`   | Tank - Gray Water                          | per unit/day       |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `SITE-1320`   | Dumpster - Roll-Off                        | per unit/haul      |       $255 - 345 |       $425 - 575 |       $675 - 925 |
| `SITE-1321`   | Receptacle - Trash and Recycling           | per unit/day       |        $4.25 - 6 |          $8 - 12 |         $21 - 29 |
| `SITE-1322`   | Service - Waste Removal                    | per day            |       $425 - 575 |   $1,025 - 1,375 |   $2,550 - 3,450 |
| `SITE-1323`   | Compactor - Portable                       | per unit/day       |        $85 - 115 |       $210 - 290 |       $425 - 575 |
| `SITE-1330`   | Air Conditioner - Portable                 | per unit/day       |       $130 - 170 |       $340 - 460 |   $1,025 - 1,375 |
| `SITE-1331`   | Heater - Portable                          | per unit/day       |         $65 - 85 |       $150 - 200 |       $340 - 460 |
| `SITE-1332`   | Fan - Industrial                           | per unit/day       |         $21 - 29 |         $42 - 55 |        $85 - 115 |
| `SITE-1340`   | WiFi Network - Temporary                   | per event/day      |       $425 - 575 |   $1,700 - 2,300 |   $6,800 - 9,200 |
| `SITE-1341`   | Signal Booster - Cellular                  | per unit/day       |       $425 - 575 |   $2,125 - 2,875 |  $8,500 - 11,500 |
| `SITE-1342`   | Network - Ethernet - Temp                  | per run/day        |         $13 - 17 |         $30 - 40 |         $65 - 85 |
| `SITE-1400`   | Fire Extinguisher - ABC                    | per unit/event     |         $13 - 17 |         $21 - 29 |         $42 - 55 |
| `SITE-1401`   | First Aid Kit - Event                      | per kit/event      |         $26 - 34 |         $65 - 85 |       $170 - 230 |
| `SITE-1402`   | Defibrillator - AED                        | per unit/event     |         $42 - 55 |        $85 - 115 |       $170 - 230 |
| `SITE-1403`   | Kit - Crowd Management                     | per kit/event      |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `SITE-1404`   | Kit - Spill Containment                    | per kit/event      |         $26 - 34 |         $65 - 85 |       $170 - 230 |
| `SITE-1410`   | Tool Kit - Production                      | per kit/day        |         $26 - 34 |         $50 - 70 |       $100 - 140 |
| `SITE-1411`   | Ladder - A-Frame                           | per unit/day       |         $13 - 17 |         $21 - 29 |         $42 - 55 |
| `SITE-1412`   | Ladder - Extension                         | per unit/day       |         $17 - 23 |         $30 - 40 |         $50 - 70 |
| `SITE-1413`   | Hand Truck                                 | per unit/day       |          $8 - 12 |         $13 - 17 |         $21 - 29 |
| `SITE-1414`   | Pallet Jack - Manual                       | per unit/day       |         $17 - 23 |         $30 - 40 |         $47 - 65 |
| `SITE-1420`   | Tape - Gaffer                              | per roll           |          $8 - 12 |         $13 - 17 |         $19 - 25 |
| `SITE-1421`   | Cable Ties - Assorted                      | per bag            |        $4.25 - 6 |          $8 - 12 |         $15 - 21 |
| `SITE-1422`   | Sandbag - Ballast                          | per unit           |     $2.55 - 3.45 |           $5 - 7 |         $10 - 14 |
| `SITE-1423`   | Strap - Ratchet                            | per unit           |        $4.25 - 6 |          $8 - 12 |         $17 - 23 |
| `SITE-1500`   | Sign - Coroplast                           | per sign           |           $7 - 9 |         $13 - 17 |         $26 - 34 |
| `SITE-1501`   | Sign - A-Frame                             | per unit/day       |         $13 - 17 |         $26 - 34 |         $50 - 70 |
| `SITE-1502`   | Banner - Vinyl                             | per banner         |         $21 - 29 |         $50 - 70 |       $130 - 170 |
| `SITE-1503`   | Sign - Truss-Mounted                       | per sign           |       $170 - 230 |       $500 - 700 |   $1,700 - 2,300 |
| `SITE-1504`   | Sign - Foam Board                          | per sign           |          $8 - 12 |         $21 - 29 |         $42 - 55 |
| `SITE-1505`   | Banner Stand - Retractable                 | per unit           |         $42 - 55 |        $85 - 115 |       $170 - 230 |
| `SITE-1506`   | Flag - Feather                             | per unit           |         $34 - 46 |         $70 - 90 |       $150 - 200 |
| `SITE-1510`   | Message Board - LED                        | per unit/day       |         $65 - 85 |       $170 - 230 |       $425 - 575 |
| `SITE-1511`   | Kiosk - Digital                            | per unit/day       |       $130 - 170 |       $340 - 460 |       $675 - 925 |
| `SITE-1515`   | Archway - Inflatable                       | per unit/day       |       $130 - 170 |       $340 - 460 |     $850 - 1,150 |
| `SITE-1516`   | Neon Sign - LED Custom                     | per unit/event     |        $85 - 115 |       $255 - 345 |       $675 - 925 |
| `SITE-1517`   | Balloon Installation                       | per installation   |         $65 - 85 |       $170 - 230 |       $500 - 700 |
| `TECH-1001`   | Line Array - Small                         | per system/day     |   $2,125 - 2,875 |   $4,250 - 5,800 |   $6,800 - 9,200 |
| `TECH-1002`   | Line Array - Medium                        | per system/day     |   $6,800 - 9,200 | $12,800 - 17,200 | $21,200 - 28,700 |
| `TECH-1003`   | Line Array - Large                         | per system/day     | $17,000 - 23,000 | $34,000 - 46,000 | $64,000 - 86,000 |
| `TECH-1004`   | Speaker System - Point Source              | per system/day     |       $340 - 460 |       $675 - 925 |   $1,275 - 1,725 |
| `TECH-1005`   | Delay System - Tower                       | per tower/day      |       $425 - 575 |   $1,025 - 1,375 |   $2,125 - 2,875 |
| `TECH-1006`   | Audio System - Distributed                 | per zone/day       |       $170 - 230 |       $425 - 575 |   $1,025 - 1,375 |
| `TECH-1010`   | DJ Package - Standard                      | per package/day    |       $425 - 575 |     $850 - 1,150 |   $1,525 - 2,075 |
| `TECH-1011`   | DJ Package - Premium                       | per package/day    |   $1,275 - 1,725 |   $2,125 - 2,875 |   $3,825 - 5,200 |
| `TECH-1012`   | Turntable Package - Vinyl                  | per package/day    |       $255 - 345 |       $500 - 700 |     $850 - 1,150 |
| `TECH-1013`   | DJ Booth - Freestanding                    | per unit/day       |         $42 - 55 |       $130 - 170 |       $425 - 575 |
| `TECH-1020`   | Microphone - Vocal - Wired                 | per unit/day       |         $13 - 17 |         $26 - 34 |         $50 - 70 |
| `TECH-1021`   | Microphone - Wireless System               | per channel/day    |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `TECH-1022`   | Direct Box - DI                            | per unit/day       |           $7 - 9 |         $13 - 17 |         $26 - 34 |
| `TECH-1023`   | Microphone Kit - Drum                      | per kit/day        |         $65 - 85 |       $150 - 200 |       $300 - 400 |
| `TECH-1024`   | Microphone - Instrument                    | per unit/day       |         $13 - 17 |         $30 - 40 |         $65 - 85 |
| `TECH-1030`   | Mixing Console - Small                     | per console/day    |       $170 - 230 |       $425 - 575 |     $850 - 1,150 |
| `TECH-1031`   | Mixing Console - Large                     | per console/day    |       $675 - 925 |   $1,700 - 2,300 |   $4,250 - 5,800 |
| `TECH-1040`   | Snake - Audio                              | per unit/day       |         $42 - 55 |       $130 - 170 |       $340 - 460 |
| `TECH-1041`   | Monitor - Stage Wedge                      | per unit/day       |         $42 - 55 |        $85 - 115 |       $170 - 230 |
| `TECH-1042`   | Monitor - In-Ear                           | per channel/day    |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `TECH-1043`   | Amplifier Rack - Audio                     | per rack/day       |        $85 - 115 |       $210 - 290 |       $500 - 700 |
| `TECH-1044`   | Recording System - Live                    | per system/day     |       $130 - 170 |       $340 - 460 |     $850 - 1,150 |
| `TECH-1100`   | Moving Head - Wash                         | per unit/day       |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `TECH-1101`   | Moving Head - Spot                         | per unit/day       |        $85 - 115 |       $170 - 230 |       $380 - 525 |
| `TECH-1102`   | Moving Head - Beam                         | per unit/day       |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `TECH-1103`   | Moving Head - Profile                      | per unit/day       |        $85 - 115 |       $190 - 260 |       $380 - 525 |
| `TECH-1104`   | Wash Bar - LED                             | per unit/day       |         $26 - 34 |         $50 - 70 |       $105 - 145 |
| `TECH-1110`   | PAR Can - LED                              | per unit/day       |         $13 - 17 |         $26 - 34 |         $50 - 70 |
| `TECH-1111`   | Ellipsoidal - Source Four                  | per unit/day       |         $13 - 17 |         $30 - 40 |         $65 - 85 |
| `TECH-1112`   | Followspot                                 | per unit/day       |       $130 - 170 |       $300 - 400 |       $675 - 925 |
| `TECH-1113`   | Blinder - Audience                         | per unit/day       |         $21 - 29 |         $42 - 55 |        $85 - 115 |
| `TECH-1114`   | Strobe - DMX                               | per unit/day       |         $26 - 34 |         $50 - 70 |       $105 - 145 |
| `TECH-1115`   | String Lights - Bistro                     | per 100ft/day      |         $21 - 29 |         $42 - 55 |        $85 - 115 |
| `TECH-1116`   | Blacklight - UV                            | per unit/day       |         $13 - 17 |         $26 - 34 |         $50 - 70 |
| `TECH-1117`   | Pixel Tape - LED                           | per meter/event    |     $2.55 - 3.45 |           $7 - 9 |         $17 - 23 |
| `TECH-1120`   | Hazer - DMX                                | per unit/day       |         $42 - 55 |        $85 - 115 |       $210 - 290 |
| `TECH-1121`   | Fog Machine                                | per unit/day       |         $34 - 46 |        $85 - 115 |       $255 - 345 |
| `TECH-1122`   | Cryo Jet - CO2                             | per unit/day       |       $130 - 170 |       $255 - 345 |       $500 - 700 |
| `TECH-1123`   | Confetti Cannon                            | per unit/show      |         $42 - 55 |       $130 - 170 |       $340 - 460 |
| `TECH-1124`   | Flame Effect - Propane                     | per unit/show      |       $170 - 230 |       $425 - 575 |   $1,275 - 1,725 |
| `TECH-1125`   | Spark Machine - Cold                       | per unit/show      |         $65 - 85 |       $150 - 200 |       $340 - 460 |
| `TECH-1126`   | Laser - Show                               | per unit/show      |       $170 - 230 |       $500 - 700 |   $1,700 - 2,300 |
| `TECH-1130`   | Console - Lighting                         | per console/day    |       $255 - 345 |       $675 - 925 |   $1,700 - 2,300 |
| `TECH-1131`   | Node - DMX                                 | per unit/day       |         $21 - 29 |         $42 - 55 |        $85 - 115 |
| `TECH-1132`   | Dimmer Rack                                | per rack/day       |         $65 - 85 |       $150 - 200 |       $340 - 460 |
| `TECH-1200`   | LED Wall - Indoor                          | per panel/day      |         $42 - 55 |        $85 - 115 |       $170 - 230 |
| `TECH-1201`   | LED Wall - Outdoor                         | per panel/day      |         $50 - 70 |       $105 - 145 |       $210 - 290 |
| `TECH-1202`   | LED Tile - Floor or Ceiling                | per panel/day      |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `TECH-1203`   | LED Screen - Mobile                        | per unit/day       |   $1,275 - 1,725 |   $2,975 - 4,025 |   $6,000 - 8,000 |
| `TECH-1204`   | Display - Flat Panel                       | per unit/day       |         $42 - 55 |        $85 - 115 |       $210 - 290 |
| `TECH-1205`   | Monitor - Confidence                       | per unit/day       |         $42 - 55 |        $85 - 115 |       $170 - 230 |
| `TECH-1210`   | Camera - IMAG                              | per camera/day     |       $255 - 345 |       $675 - 925 |   $1,700 - 2,300 |
| `TECH-1211`   | Switcher - Video                           | per system/day     |       $210 - 290 |       $675 - 925 |   $2,550 - 3,450 |
| `TECH-1212`   | Livestream Package                         | per event          |     $850 - 1,150 |   $2,550 - 3,450 |   $6,800 - 9,200 |
| `TECH-1220`   | Projector - Standard                       | per unit/day       |       $130 - 170 |       $340 - 460 |       $675 - 925 |
| `TECH-1221`   | Projector - Large Venue                    | per unit/day       |     $850 - 1,150 |   $2,550 - 3,450 |   $6,800 - 9,200 |
| `TECH-1222`   | Screen - Projection                        | per screen/day     |        $85 - 115 |       $210 - 290 |       $500 - 700 |
| `TECH-1223`   | Projection Mapping                         | per project        |   $2,550 - 3,450 |  $8,500 - 11,500 | $42,500 - 57,500 |
| `TECH-1230`   | Media Server                               | per server/day     |       $425 - 575 |   $1,025 - 1,375 |   $2,550 - 3,450 |
| `TECH-1231`   | Processor - Video                          | per unit/day       |       $170 - 230 |       $425 - 575 |   $1,275 - 1,725 |
| `TECH-1300`   | Stage Deck - 4x8                           | per deck/day       |         $26 - 34 |         $42 - 55 |         $70 - 90 |
| `TECH-1301`   | Stage Deck - 4x4                           | per deck/day       |         $17 - 23 |         $30 - 40 |         $47 - 65 |
| `TECH-1302`   | Riser - Drum                               | per riser/day      |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `TECH-1303`   | Stairs - Stage                             | per unit/day       |         $34 - 46 |         $65 - 85 |       $130 - 170 |
| `TECH-1304`   | Runway - Stage                             | per section/day    |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `TECH-1305`   | Shell - Acoustic                           | per shell/day      |       $425 - 575 |   $1,275 - 1,725 |   $3,400 - 4,600 |
| `TECH-1310`   | Pipe and Drape                             | per linear ft/day  |        $4.25 - 6 |          $8 - 12 |         $17 - 23 |
| `TECH-1311`   | Backdrop - Custom Print                    | per backdrop/day   |       $170 - 230 |       $425 - 575 |   $1,275 - 1,725 |
| `TECH-1312`   | Skirting - Stage                           | per linear ft/day  |       $1.7 - 2.3 |       $3.4 - 4.6 |           $7 - 9 |
| `TECH-1313`   | Ramp - Photo Pit                           | per unit/day       |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `TECH-1400`   | Truss - 12in Box                           | per section/day    |         $17 - 23 |         $30 - 40 |         $50 - 70 |
| `TECH-1401`   | Truss - 20.5in Box                         | per section/day    |         $26 - 34 |         $47 - 65 |        $75 - 105 |
| `TECH-1402`   | Truss - 30in GP                            | per section/day    |         $38 - 50 |         $70 - 90 |       $110 - 150 |
| `TECH-1403`   | Truss - Circle                             | per section/day    |         $50 - 70 |       $100 - 140 |       $170 - 230 |
| `TECH-1410`   | Chain Motor - Half Ton                     | per unit/day       |         $42 - 55 |        $85 - 115 |       $150 - 200 |
| `TECH-1411`   | Chain Motor - One Ton                      | per unit/day       |         $65 - 85 |       $130 - 170 |       $210 - 290 |
| `TECH-1412`   | Tower - Ground Support                     | per tower set/day  |       $255 - 345 |       $500 - 700 |   $1,025 - 1,375 |
| `TECH-1415`   | Hardware Bundle - Rigging                  | per bundle/day     |         $21 - 29 |         $42 - 55 |        $85 - 115 |
| `TECH-1500`   | Amplifier - Guitar                         | per unit/day       |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `TECH-1501`   | Amplifier - Bass                           | per unit/day       |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `TECH-1510`   | Keyboard - Stage                           | per unit/day       |        $85 - 115 |       $210 - 290 |       $425 - 575 |
| `TECH-1511`   | Stand - Keyboard                           | per unit/day       |          $8 - 12 |         $17 - 23 |         $34 - 46 |
| `TECH-1520`   | Drum Kit - Acoustic                        | per kit/day        |       $130 - 170 |       $300 - 400 |       $600 - 800 |
| `TECH-1521`   | Drum Kit - Electronic                      | per kit/day        |       $130 - 170 |       $255 - 345 |       $500 - 700 |
| `TECH-1530`   | Stand - Music                              | per unit/day       |     $2.55 - 3.45 |           $5 - 7 |         $10 - 14 |
| `TECH-1531`   | Guitar or Bass - Rental                    | per unit/day       |         $42 - 55 |        $85 - 115 |       $210 - 290 |
| `TECH-1532`   | Percussion Kit                             | per kit/day        |         $65 - 85 |       $150 - 200 |       $340 - 460 |
| `HOSP-1001`   | Meal Service - Artist                      | per person/meal    |         $21 - 29 |         $38 - 50 |        $70 - 100 |
| `HOSP-1002`   | Meal Service - Crew                        | per person/meal    |         $13 - 17 |         $21 - 29 |         $38 - 50 |
| `HOSP-1003`   | Craft Services                             | per day            |       $130 - 170 |       $300 - 400 |       $650 - 850 |
| `HOSP-1004`   | Coffee Service                             | per day            |         $65 - 85 |       $170 - 230 |       $500 - 700 |
| `HOSP-1005`   | Water and Ice Service                      | per day            |         $42 - 55 |       $105 - 145 |       $255 - 345 |
| `HOSP-1010`   | Catering Package - VIP                     | per person         |         $42 - 55 |        $85 - 115 |       $210 - 290 |
| `HOSP-1011`   | Beverage Service                           | per person/day     |        $4.25 - 6 |         $10 - 14 |         $21 - 29 |
| `HOSP-1012`   | Station - Dessert                          | per station/day    |       $130 - 170 |       $340 - 460 |     $850 - 1,150 |
| `HOSP-1013`   | Food Truck - Contracted                    | per truck/day      |       $425 - 575 |   $1,025 - 1,375 |   $2,550 - 3,450 |
| `HOSP-1100`   | Green Room                                 | per room/day       |       $170 - 230 |       $425 - 575 |   $1,275 - 1,725 |
| `HOSP-1101`   | Per Diem - Artist                          | per person/day     |         $42 - 55 |         $65 - 85 |       $130 - 170 |
| `HOSP-1102`   | Dressing Room                              | per room/day       |        $85 - 115 |       $210 - 290 |       $500 - 700 |
| `HOSP-1103`   | Rider Fulfillment                          | per rider          |         $42 - 55 |       $170 - 230 |     $850 - 1,150 |
| `HOSP-1110`   | Lounge - VIP                               | per lounge/day     |       $425 - 575 |   $1,275 - 1,725 |   $4,250 - 5,800 |
| `HOSP-1111`   | Bottle Service - VIP                       | per table/night    |        $85 - 115 |       $300 - 400 |   $1,275 - 1,725 |
| `HOSP-1112`   | Hookah Lounge                              | per setup/day      |       $130 - 170 |       $340 - 460 |     $850 - 1,150 |
| `HOSP-1120`   | Charging Station - Phone                   | per station/day    |         $42 - 55 |       $105 - 145 |       $255 - 345 |
| `HOSP-1121`   | Coat Check                                 | per station/day    |        $85 - 115 |       $210 - 290 |       $425 - 575 |
| `HOSP-1122`   | Booth - Guest Services                     | per booth/day      |         $65 - 85 |       $150 - 200 |       $340 - 460 |
| `HOSP-1123`   | Station - Lost and Found                   | per station/day    |         $21 - 29 |         $65 - 85 |       $170 - 230 |
| `FNB-1001`    | Bar - Portable                             | per unit/day       |       $130 - 170 |       $300 - 400 |       $675 - 925 |
| `FNB-1002`    | Beer System - Draft                        | per system/day     |        $85 - 115 |       $210 - 290 |       $500 - 700 |
| `FNB-1003`    | Kit - Bar Tools                            | per kit/day        |         $21 - 29 |         $42 - 55 |        $85 - 115 |
| `FNB-1004`    | Ice Bin - Portable                         | per unit/day       |         $26 - 34 |         $65 - 85 |       $150 - 200 |
| `FNB-1005`    | Display - Back Bar                         | per unit/day       |         $26 - 34 |         $65 - 85 |       $170 - 230 |
| `FNB-1010`    | Glassware - Rental                         | per piece/event    |        $1 - 1.15 |       $1.7 - 2.3 |        $4.25 - 6 |
| `FNB-1011`    | Drinkware - Disposable                     | per case           |         $26 - 34 |         $50 - 70 |       $100 - 140 |
| `FNB-1012`    | Kit - Garnish and Mixers                   | per kit/day        |         $21 - 29 |         $50 - 70 |       $130 - 170 |
| `FNB-1100`    | Chafing Dish                               | per unit/day       |          $8 - 12 |         $17 - 23 |         $34 - 46 |
| `FNB-1101`    | Linen - Table                              | per piece/event    |        $4.25 - 6 |         $10 - 14 |         $26 - 34 |
| `FNB-1102`    | Flatware and China - Rental                | per setting/event  |     $2.55 - 3.45 |           $7 - 9 |         $17 - 23 |
| `FNB-1103`    | Dispenser - Beverage                       | per unit/day       |           $7 - 9 |         $13 - 17 |         $26 - 34 |
| `FNB-1104`    | Utensils and Trays                         | per kit/day        |         $13 - 17 |         $26 - 34 |         $50 - 70 |
| `FNB-1200`    | Kitchen Trailer - Mobile                   | per trailer/day    |       $675 - 925 |   $1,275 - 1,725 |   $2,975 - 4,025 |
| `FNB-1201`    | Grill - Portable                           | per unit/day       |         $42 - 55 |       $105 - 145 |       $210 - 290 |
| `FNB-1202`    | Refrigerator - Portable                    | per unit/day       |         $65 - 85 |       $170 - 230 |       $500 - 700 |
| `FNB-1203`    | Ice Machine - Portable                     | per unit/day       |         $65 - 85 |       $130 - 170 |       $255 - 345 |
| `FNB-1204`    | Warmer - Food Holding                      | per unit/day       |         $26 - 34 |         $50 - 70 |       $105 - 145 |
| `FNB-1205`    | Prep Table - Stainless                     | per unit/day       |         $13 - 17 |         $26 - 34 |         $42 - 55 |
| `FNB-1210`    | Concession Stand                           | per stand/day      |       $170 - 230 |       $425 - 575 |   $1,025 - 1,375 |
| `FNB-1211`    | Cart - Specialty Food                      | per cart/day       |       $130 - 170 |       $300 - 400 |       $675 - 925 |
| `FNB-1212`    | Cart - Beverage                            | per cart/day       |         $42 - 55 |       $105 - 145 |       $255 - 345 |
| `RETAIL-1001` | Booth - Merchandise                        | per booth/day      |       $170 - 230 |       $425 - 575 |   $1,025 - 1,375 |
| `RETAIL-1002` | Rack - Garment                             | per unit/day       |          $8 - 12 |         $17 - 23 |         $30 - 40 |
| `RETAIL-1003` | Table - Display                            | per unit/day       |         $13 - 17 |         $26 - 34 |         $65 - 85 |
| `RETAIL-1004` | Shelving - Display                         | per unit/day       |         $13 - 17 |         $26 - 34 |         $50 - 70 |
| `RETAIL-1005` | Mannequin - Display                        | per unit/day       |         $13 - 17 |         $26 - 34 |         $50 - 70 |
| `RETAIL-1006` | Display Case - Lockable                    | per unit/day       |         $17 - 23 |         $34 - 46 |         $70 - 90 |
| `RETAIL-1010` | POS System - Mobile                        | per station/day    |         $21 - 29 |         $42 - 55 |        $85 - 115 |
| `RETAIL-1011` | Supplies - Cash Handling                   | per kit/event      |         $26 - 34 |         $50 - 70 |       $100 - 140 |
| `RETAIL-1012` | ATM - Portable                             | per unit/day       |        $85 - 115 |       $210 - 290 |       $425 - 575 |
| `RETAIL-1015` | Bag - Shopping - Branded                   | per 100            |         $17 - 23 |         $42 - 55 |       $105 - 145 |
| `RETAIL-1016` | Supplies - Retail Packaging                | per kit/event      |         $13 - 17 |         $26 - 34 |         $50 - 70 |
| `RETAIL-1100` | Booth Space - Vendor                       | per booth/day      |         $42 - 55 |       $130 - 170 |       $340 - 460 |
| `RETAIL-1101` | Vendor Pad - Food Truck                    | per pad/day        |        $85 - 115 |       $210 - 290 |       $500 - 700 |
| `RETAIL-1102` | Activation Space - Sponsor                 | per space/day      |       $170 - 230 |       $500 - 700 |   $1,700 - 2,300 |
| `WORK-1001`   | Badge - Credential                         | per unit           |       $1.7 - 2.3 |        $4.25 - 6 |         $10 - 14 |
| `WORK-1002`   | Wristband - Event                          | per unit           |           $1 - 2 |        $1 - 1.15 |        $4.25 - 6 |
| `WORK-1003`   | Pass - Parking                             | per unit           |        $1 - 1.15 |     $2.55 - 3.45 |           $7 - 9 |
| `WORK-1005`   | Metal Detector - Walk-Through              | per unit/day       |         $65 - 85 |       $150 - 200 |       $300 - 400 |
| `WORK-1006`   | Metal Detector - Handheld                  | per unit/day       |           $7 - 9 |         $13 - 17 |         $26 - 34 |
| `WORK-1007`   | Scanner - RFID Access                      | per reader/day     |         $42 - 55 |       $105 - 145 |       $255 - 345 |
| `WORK-1008`   | Scanner Station - Ticket                   | per station/day    |         $21 - 29 |         $65 - 85 |       $170 - 230 |
| `WORK-1100`   | Radio - Two-Way - Standard                 | per unit/day       |           $7 - 9 |         $13 - 17 |         $21 - 29 |
| `WORK-1101`   | Radio - Two-Way - Digital                  | per unit/day       |         $13 - 17 |         $26 - 34 |         $42 - 55 |
| `WORK-1102`   | Repeater - Radio                           | per unit/day       |         $42 - 55 |       $105 - 145 |       $210 - 290 |
| `WORK-1103`   | Charger - Radio - Multi-Bay                | per unit/day       |          $8 - 12 |         $21 - 29 |         $42 - 55 |
| `WORK-1110`   | Intercom - Wired                           | per station/day    |         $26 - 34 |         $50 - 70 |       $105 - 145 |
| `WORK-1111`   | Intercom - Wireless                        | per beltpack/day   |         $42 - 55 |        $85 - 115 |       $170 - 230 |
| `WORK-1200`   | T-Shirt - Staff                            | per unit           |        $4.25 - 6 |         $10 - 14 |         $21 - 29 |
| `WORK-1201`   | Polo - Staff                               | per unit           |         $13 - 17 |         $21 - 29 |         $38 - 50 |
| `WORK-1202`   | Vest - Safety - Hi-Vis                     | per unit           |        $4.25 - 6 |         $10 - 14 |         $21 - 29 |
| `WORK-1203`   | Poncho - Rain                              | per unit           |     $2.55 - 3.45 |         $13 - 17 |         $42 - 55 |
| `WORK-1204`   | Jacket - Staff                             | per unit           |         $17 - 23 |         $34 - 46 |         $70 - 90 |
| `WORK-1300`   | Table - Folding - 6ft                      | per unit/day       |           $7 - 9 |         $10 - 14 |         $17 - 23 |
| `WORK-1301`   | Table - Folding - 8ft                      | per unit/day       |          $8 - 12 |         $13 - 17 |         $21 - 29 |
| `WORK-1302`   | Chair - Folding                            | per unit/day       |       $1.7 - 2.3 |       $3.4 - 4.6 |           $7 - 9 |
| `WORK-1303`   | Table - Cocktail                           | per unit/day       |           $7 - 9 |         $13 - 17 |         $26 - 34 |
| `WORK-1304`   | Office Package - Production                | per office/day     |         $65 - 85 |       $170 - 230 |       $425 - 575 |
| `WORK-1305`   | Whiteboard - Freestanding                  | per unit/day       |          $8 - 12 |         $17 - 23 |         $34 - 46 |
| `WORK-1306`   | Printer - Portable                         | per unit/day       |         $21 - 29 |         $50 - 70 |       $130 - 170 |
| `WORK-1307`   | Table - Round - 60in or 72in               | per unit/day       |          $8 - 12 |         $15 - 21 |         $26 - 34 |
| `WORK-1310`   | Furniture Set - Lounge                     | per set/day        |       $130 - 170 |       $300 - 400 |       $675 - 925 |
| `WORK-1311`   | Ottoman                                    | per unit/day       |         $13 - 17 |         $26 - 34 |         $50 - 70 |
| `WORK-1312`   | Stool - Bar                                | per unit/day       |        $4.25 - 6 |          $8 - 12 |         $17 - 23 |
| `WORK-1400`   | EMT - On-Site                              | per person/shift   |       $210 - 290 |       $340 - 460 |       $550 - 750 |
| `WORK-1401`   | Station - Medical                          | per station/day    |       $170 - 230 |       $425 - 575 |   $1,025 - 1,375 |
| `WORK-1402`   | Ambulance - Standby                        | per unit/shift     |       $500 - 700 |     $850 - 1,150 |   $1,525 - 2,075 |
| `WORK-1410`   | Hard Hat - ANSI                            | per unit           |           $7 - 9 |         $13 - 17 |         $26 - 34 |
| `WORK-1411`   | Glasses - Safety                           | per unit           |     $2.55 - 3.45 |           $5 - 7 |         $10 - 14 |
| `WORK-1412`   | Hearing Protection                         | per unit           |        $1 - 1.15 |        $4.25 - 6 |         $21 - 29 |
| `WORK-1413`   | Gloves - Work                              | per pair           |        $4.25 - 6 |          $8 - 12 |         $21 - 29 |
| `WORK-1420`   | Camera - Security - Temp                   | per camera/day     |         $21 - 29 |         $50 - 70 |       $130 - 170 |
| `WORK-1421`   | Lighting - Security                        | per unit/day       |         $13 - 17 |         $30 - 40 |         $65 - 85 |
| `TRAVEL-1001` | Flight - Domestic - Economy                | per ticket         |       $170 - 230 |       $340 - 460 |       $675 - 925 |
| `TRAVEL-1002` | Flight - Domestic - Business or First      | per ticket         |       $500 - 700 |   $1,025 - 1,375 |   $2,550 - 3,450 |
| `TRAVEL-1003` | Flight - International - Economy           | per ticket         |       $425 - 575 |     $850 - 1,150 |   $2,125 - 2,875 |
| `TRAVEL-1004` | Flight - International - Business or First | per ticket         |   $1,700 - 2,300 |   $4,250 - 5,800 | $12,800 - 17,200 |
| `TRAVEL-1005` | Baggage Fee - Excess                       | per bag            |         $26 - 34 |         $65 - 85 |       $170 - 230 |
| `TRAVEL-1006` | Flight - Charter                           | per flight         |   $2,550 - 3,450 | $12,800 - 17,200 | $64,000 - 86,000 |
| `TRAVEL-1010` | Hotel Room - Standard                      | per room/night     |         $70 - 90 |       $130 - 170 |       $255 - 345 |
| `TRAVEL-1011` | Hotel Suite - Premium                      | per room/night     |       $170 - 230 |       $425 - 575 |   $1,700 - 2,300 |
| `TRAVEL-1012` | Hotel Block - Group Rate                   | per room/night     |         $60 - 80 |       $110 - 150 |       $240 - 320 |
| `TRAVEL-1020` | Rental - Vacation                          | per property/night |        $85 - 115 |       $210 - 290 |       $675 - 925 |
| `TRAVEL-1021` | RV - Motorhome                             | per unit/day       |       $130 - 170 |       $300 - 400 |       $675 - 925 |
| `TRAVEL-1100` | Transfer - Sedan                           | per trip           |         $42 - 55 |        $85 - 115 |       $210 - 290 |
| `TRAVEL-1101` | Shuttle - Airport                          | per trip           |        $85 - 115 |       $210 - 290 |       $425 - 575 |
| `TRAVEL-1102` | Shuttle - Sprinter                         | per vehicle/day    |       $255 - 345 |       $500 - 700 |   $1,025 - 1,375 |
| `TRAVEL-1103` | Motor Coach - Charter                      | per bus/day        |       $675 - 925 |   $1,275 - 1,725 |   $2,550 - 3,450 |
| `TRAVEL-1104` | Limousine                                  | per vehicle/hour   |         $65 - 85 |       $130 - 170 |       $340 - 460 |
| `TRAVEL-1105` | Pedicab                                    | per unit/day       |        $85 - 115 |       $170 - 230 |       $340 - 460 |
| `TRAVEL-1110` | Charter - Boat                             | per vessel/hour    |       $130 - 170 |       $340 - 460 |   $1,275 - 1,725 |
| `TRAVEL-1200` | Rental Car - Economy                       | per car/day        |         $30 - 40 |         $47 - 65 |        $75 - 105 |
| `TRAVEL-1201` | Rental Car - Full-Size or SUV              | per car/day        |         $42 - 55 |        $70 - 100 |       $130 - 170 |
| `TRAVEL-1202` | Rental - Cargo Van or Box Truck            | per vehicle/day    |         $42 - 55 |        $85 - 115 |       $150 - 200 |
| `TRAVEL-1203` | Van - 15 Passenger                         | per van/day        |        $85 - 115 |       $150 - 200 |       $235 - 315 |
| `TRAVEL-1210` | Trailer - Enclosed                         | per trailer/day    |         $34 - 46 |         $65 - 85 |       $130 - 170 |
| `TRAVEL-1211` | Fuel Card - Prepaid                        | per card           |        $85 - 115 |       $210 - 290 |       $425 - 575 |
| `TRAVEL-1212` | Parking Pass - Off-Site                    | per pass/day       |          $8 - 12 |         $21 - 29 |         $42 - 55 |
| `LABOR-1001`  | Manager - Production                       | per day            |       $425 - 575 |       $675 - 925 |   $1,275 - 1,725 |
| `LABOR-1002`  | Manager - Stage                            | per day            |       $340 - 460 |       $550 - 750 |   $1,025 - 1,375 |
| `LABOR-1003`  | Director - Technical                       | per day            |       $500 - 700 |     $850 - 1,150 |   $1,525 - 2,075 |
| `LABOR-1004`  | Manager - Site Operations                  | per day            |       $340 - 460 |       $600 - 800 |   $1,025 - 1,375 |
| `LABOR-1005`  | Caller - Show                              | per show           |       $255 - 345 |       $425 - 575 |     $850 - 1,150 |
| `LABOR-1010`  | Engineer - Audio FOH                       | per day            |       $340 - 460 |       $600 - 800 |   $1,025 - 1,375 |
| `LABOR-1011`  | Designer - Lighting                        | per day            |       $340 - 460 |       $650 - 850 |   $1,275 - 1,725 |
| `LABOR-1012`  | Director - Video                           | per day            |       $340 - 460 |       $600 - 800 |   $1,100 - 1,500 |
| `LABOR-1013`  | Rigger - Head                              | per day            |       $425 - 575 |       $675 - 925 |   $1,200 - 1,600 |
| `LABOR-1014`  | Manager - Catering                         | per day            |       $255 - 345 |       $425 - 575 |     $775 - 1,025 |
| `LABOR-1015`  | Director - Security                        | per day            |       $425 - 575 |       $675 - 925 |   $1,275 - 1,725 |
| `LABOR-1016`  | Manager - Guest Experience                 | per day            |       $300 - 400 |       $470 - 625 |     $775 - 1,025 |
| `LABOR-1100`  | Operator - Forklift                        | per shift          |       $210 - 290 |       $300 - 400 |       $425 - 575 |
| `LABOR-1101`  | Operator - Aerial Lift                     | per shift          |       $210 - 290 |       $320 - 430 |       $470 - 625 |
| `LABOR-1102`  | Operator - Crane                           | per shift          |       $425 - 575 |       $675 - 925 |   $1,025 - 1,375 |
| `LABOR-1103`  | Driver - CDL                               | per day            |       $210 - 290 |       $340 - 460 |       $500 - 700 |
| `LABOR-1200`  | Technician - Audio                         | per shift          |       $255 - 345 |       $380 - 525 |       $550 - 750 |
| `LABOR-1201`  | Technician - Lighting                      | per shift          |       $235 - 315 |       $340 - 460 |       $500 - 700 |
| `LABOR-1202`  | Technician - Video                         | per shift          |       $235 - 315 |       $360 - 490 |       $525 - 725 |
| `LABOR-1203`  | Rigger - Certified                         | per shift          |       $300 - 400 |       $470 - 625 |       $675 - 925 |
| `LABOR-1204`  | Electrician - Licensed                     | per shift          |       $300 - 400 |       $470 - 625 |       $725 - 975 |
| `LABOR-1205`  | Carpenter - Scenic                         | per shift          |       $235 - 315 |       $340 - 460 |       $500 - 700 |
| `LABOR-1206`  | Welder - Certified                         | per shift          |       $300 - 400 |       $470 - 625 |       $725 - 975 |
| `LABOR-1210`  | Photographer - Event                       | per day            |       $255 - 345 |       $500 - 700 |   $1,275 - 1,725 |
| `LABOR-1211`  | Videographer - Event                       | per day            |       $340 - 460 |       $675 - 925 |   $1,700 - 2,300 |
| `LABOR-1212`  | Drone Pilot - Licensed                     | per day            |       $425 - 575 |     $850 - 1,150 |   $2,125 - 2,875 |
| `LABOR-1213`  | Designer - Graphic                         | per day            |       $255 - 345 |       $425 - 575 |       $675 - 925 |
| `LABOR-1214`  | Artist - Hair and Makeup                   | per person         |         $65 - 85 |       $130 - 170 |       $340 - 460 |
| `LABOR-1215`  | Stylist - Wardrobe                         | per day            |       $255 - 345 |       $425 - 575 |     $850 - 1,150 |
| `LABOR-1300`  | Stagehand - IATSE                          | per person/call    |       $300 - 400 |       $425 - 575 |       $650 - 850 |
| `LABOR-1301`  | Stagehand - Non-Union                      | per person/shift   |       $130 - 170 |       $210 - 290 |       $340 - 460 |
| `LABOR-1310`  | Security Guard - Unarmed                   | per person/shift   |       $130 - 170 |       $190 - 260 |       $300 - 400 |
| `LABOR-1311`  | Security Guard - Armed                     | per person/shift   |       $255 - 345 |       $425 - 575 |       $675 - 925 |
| `LABOR-1312`  | Usher - Event                              | per person/shift   |        $85 - 115 |       $130 - 170 |       $190 - 260 |
| `LABOR-1313`  | Ambassador - Brand                         | per person/shift   |       $105 - 145 |       $170 - 230 |       $340 - 460 |
| `LABOR-1314`  | Staff - Janitorial                         | per person/shift   |        $85 - 115 |       $150 - 200 |       $235 - 315 |
| `LABOR-1315`  | Runner - Production                        | per person/shift   |       $105 - 145 |       $170 - 230 |       $255 - 345 |
| `LABOR-1316`  | Attendant - Parking                        | per person/shift   |        $85 - 115 |       $130 - 170 |       $190 - 260 |
| `LABOR-1317`  | Staff - Registration                       | per person/shift   |        $85 - 115 |       $150 - 200 |       $235 - 315 |
| `LABOR-1320`  | Bartender - Event                          | per person/shift   |       $130 - 170 |       $210 - 290 |       $340 - 460 |
| `LABOR-1321`  | Server - Event                             | per person/shift   |       $105 - 145 |       $170 - 230 |       $275 - 375 |
| `LABOR-1322`  | Attendant - Valet                          | per person/shift   |        $85 - 115 |       $150 - 200 |       $235 - 315 |
| `LABOR-1323`  | Flagger - Traffic                          | per person/shift   |       $150 - 200 |       $235 - 315 |       $360 - 490 |
| `LABOR-1324`  | DJ - Event                                 | per set            |       $255 - 345 |       $650 - 850 |   $2,550 - 3,450 |
| `LABOR-1325`  | MC - Event                                 | per event          |       $255 - 345 |       $650 - 850 |   $2,550 - 3,450 |
| `LABOR-1326`  | Interpreter                                | per person/day     |       $340 - 460 |       $600 - 800 |   $1,025 - 1,375 |
| `LABOR-1327`  | Officer - Off-Duty                         | per officer/detail |       $210 - 290 |       $340 - 460 |       $550 - 750 |
| `LABOR-1328`  | Fire Watch                                 | per person/shift   |       $170 - 230 |       $300 - 400 |       $470 - 625 |

_Full 8-country pricing available in the XLSX workbook (Pricing sheet)._

[Back to top](#table-of-contents)

---

_Universal Advance Seed Catalog v6.0 | GHXSTSHIP Industries LLC | ATLVS Platform_

_5-Layer Normalized: UNSPSC Classification | Hierarchical SKU | Noun-First Display | Search Aliases | Typed Attributes_
