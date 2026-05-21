import { z } from 'zod';
import { DocumentSourceType } from './enums';

export const documentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sourceType: z.enum([
    DocumentSourceType.news,
    DocumentSourceType.announcement,
    DocumentSourceType.earnings,
    DocumentSourceType.research_report,
    DocumentSourceType.policy,
    DocumentSourceType.user_upload,
    DocumentSourceType.platform_article,
  ]),
  sourceUrl: z.string().url().optional(),
  publisher: z.string().optional(),
  publishedAt: z.coerce.date().optional(),
  rawText: z.string().optional(),
  contentHash: z.string().optional(),
  parseStatus: z.enum(['pending', 'parsed', 'failed']).default('pending'),
  ingestionStatus: z.enum(['registered', 'ingesting', 'completed', 'failed']).default('registered'),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Document = z.infer<typeof documentSchema>;
