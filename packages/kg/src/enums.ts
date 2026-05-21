/** First-version entity types (investment KG). */
export const EntityType = {
  Domain: 'Domain',
  Theme: 'Theme',
  Industry: 'Industry',
  SubIndustry: 'SubIndustry',
  SupplyChainStage: 'SupplyChainStage',
  Company: 'Company',
  Instrument: 'Instrument',
  Product: 'Product',
  Technology: 'Technology',
  Event: 'Event',
  Metric: 'Metric',
  Document: 'Document',
} as const;

export type EntityTypeValue = (typeof EntityType)[keyof typeof EntityType];

/** First-version relation predicates. */
export const RelationPredicate = {
  belongs_to: 'belongs_to',
  contains: 'contains',
  listed_as: 'listed_as',
  produces: 'produces',
  supplies_to: 'supplies_to',
  customer_of: 'customer_of',
  competes_with: 'competes_with',
  upstream_of: 'upstream_of',
  downstream_of: 'downstream_of',
  depends_on: 'depends_on',
  enables: 'enables',
  benefits_from: 'benefits_from',
  hurt_by: 'hurt_by',
  affected_by: 'affected_by',
  mentions: 'mentions',
  supports: 'supports',
  contradicts: 'contradicts',
  changes_metric: 'changes_metric',
  relates_to: 'relates_to',
} as const;

export type RelationPredicateValue =
  (typeof RelationPredicate)[keyof typeof RelationPredicate];

/** Lifecycle for entities, relations, assertions. */
export const RecordStatus = {
  draft: 'draft',
  extracted: 'extracted',
  candidate: 'candidate',
  verified: 'verified',
  active: 'active',
  rejected: 'rejected',
  deprecated: 'deprecated',
  merged: 'merged',
} as const;

export type RecordStatusValue = (typeof RecordStatus)[keyof typeof RecordStatus];

export const AssertionStatusFlow = [
  RecordStatus.extracted,
  RecordStatus.candidate,
  RecordStatus.verified,
  RecordStatus.active,
] as const;

export const OntologyKind = {
  entity_type: 'entity_type',
  relation_type: 'relation_type',
  attribute_schema: 'attribute_schema',
  hierarchy_rule: 'hierarchy_rule',
  review_policy: 'review_policy',
} as const;

export type OntologyKindValue = (typeof OntologyKind)[keyof typeof OntologyKind];

export const DocumentSourceType = {
  news: 'news',
  announcement: 'announcement',
  earnings: 'earnings',
  research_report: 'research_report',
  policy: 'policy',
  user_upload: 'user_upload',
  platform_article: 'platform_article',
} as const;

export type DocumentSourceTypeValue =
  (typeof DocumentSourceType)[keyof typeof DocumentSourceType];
