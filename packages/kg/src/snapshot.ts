import { z } from 'zod';

export const snapshotSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  scope: z.string().optional(),
  entityCount: z.number().int().nonnegative().default(0),
  relationCount: z.number().int().nonnegative().default(0),
  assertionCount: z.number().int().nonnegative().default(0),
  snapshotData: z.record(z.unknown()).default({}),
  createdBy: z.string().optional(),
  createdAt: z.coerce.date().optional(),
});

export type Snapshot = z.infer<typeof snapshotSchema>;
