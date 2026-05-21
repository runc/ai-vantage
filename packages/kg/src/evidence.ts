import { z } from 'zod';
import { DocumentSourceType } from './enums';

export const evidenceSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().optional(),
  sourceType: z.enum([
    DocumentSourceType.news,
    DocumentSourceType.announcement,
    DocumentSourceType.earnings,
    DocumentSourceType.research_report,
    DocumentSourceType.policy,
    DocumentSourceType.user_upload,
    DocumentSourceType.platform_article,
  ]),
  sourceTitle: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  publisher: z.string().optional(),
  publishedAt: z.coerce.date().optional(),
  evidenceSpan: z.string().optional(),
  pageNumber: z.number().int().positive().optional(),
  reliabilityScore: z.number().min(0).max(1).default(0.5),
  createdAt: z.coerce.date().optional(),
});

export type Evidence = z.infer<typeof evidenceSchema>;
