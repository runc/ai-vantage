# Legacy Graph → Investment KG Mapping

Maps [`content/graph/relations.json`](../content/graph/relations.json) and MDX content to the standard model in `@ai-vantage/kg`.

## Node types

| Legacy `type` | Entity.type | Notes |
|---------------|-------------|--------|
| `layer` | `SupplyChainStage` | Seven-layer industry stack; `rank`, `certainty` → `properties` |
| `target` | `Company` | Investment targets; `layer` → `belongs_to` edge to stage |
| `concept` | `Theme` | Investment concepts / frameworks |

## Edge types

| Legacy `type` | Relation.predicate | Notes |
|---------------|-------------------|--------|
| `belongs-to` | `belongs_to` | Company → layer membership |
| `supplies-to` | `supplies_to` | Supply / dependency (direction preserved from JSON) |
| `competes-with` | `competes_with` | Competition |
| `threatens` | `hurt_by` | Threat / disintermediation risk |
| `relates-to` | `relates_to` | Weak conceptual link; lower default confidence (0.7) |

## IDs

- Entity `id` and `slug` use the legacy node `id` (e.g. `nvidia`, `chip-design`).
- Relation `id` format: `rel-{source}-{target}-{index}` (stable with relations.json order).

## Status (seed)

- All seeded entities and relations: `status = active`, `confidence = 1` (except `relates_to` at 0.7).

## Dual source (M2)

- **Structure**: API / PostgreSQL (entities + relations).
- **Narrative**: MDX under `content/layers`, `content/targets`, `content/concepts` (moat, summary, changelog).
