import { eq, and, ilike, or, inArray, sql, like } from 'drizzle-orm';
import type { Database } from '../client.js';
import { getDialect } from '../dialect.js';
import { getTables } from '../schema/index.js';
import type { Entity } from '@ai-vantage/kg';

export class EntityRepository {
  constructor(private db: Database) {}

  async findAll(status?: string): Promise<Entity[]> {
    const { entities } = getTables();
    const rows = status
      ? await this.db.select().from(entities).where(eq(entities.status, status))
      : await this.db.select().from(entities);
    return rows.map((row) => this.rowToEntity(row));
  }

  async findAllActive(): Promise<Entity[]> {
    const { entities } = getTables();
    const rows = await this.db
      .select()
      .from(entities)
      .where(eq(entities.status, 'active'));
    return rows.map((row) => this.rowToEntity(row));
  }

  async findById(id: string): Promise<Entity | null> {
    const { entities } = getTables();
    const [row] = await this.db.select().from(entities).where(eq(entities.id, id)).limit(1);
    return row ? this.rowToEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Entity | null> {
    const { entities } = getTables();
    const [row] = await this.db
      .select()
      .from(entities)
      .where(eq(entities.slug, slug))
      .limit(1);
    return row ? this.rowToEntity(row) : null;
  }

  async findByType(type: string, status = 'active'): Promise<Entity[]> {
    const { entities } = getTables();
    const rows = await this.db
      .select()
      .from(entities)
      .where(and(eq(entities.type, type), eq(entities.status, status)));
    return rows.map((row) => this.rowToEntity(row));
  }

  /** Resolve by primary id or slug. */
  async resolveIdOrSlug(key: string): Promise<Entity | null> {
    const byId = await this.findById(key);
    if (byId) return byId;
    return this.findBySlug(key);
  }

  async findByIds(ids: string[]): Promise<Entity[]> {
    const { entities } = getTables();
    if (ids.length === 0) return [];
    const rows = await this.db.select().from(entities).where(inArray(entities.id, ids));
    return rows.map((row) => this.rowToEntity(row));
  }

  async search(query: string, limit = 20): Promise<Entity[]> {
    const { entities } = getTables();
    const pattern = `%${query}%`;

    const rows =
      getDialect() === 'postgres'
        ? await this.db
            .select()
            .from(entities)
            .where(
              or(
                ilike(entities.name, pattern),
                ilike(entities.slug, pattern),
                ilike(entities.id, pattern),
              ),
            )
            .limit(limit)
        : await this.db
            .select()
            .from(entities)
            .where(
              or(
                like(sql`lower(${entities.name})`, pattern.toLowerCase()),
                like(sql`lower(${entities.slug})`, pattern.toLowerCase()),
                like(sql`lower(${entities.id})`, pattern.toLowerCase()),
              ),
            )
            .limit(limit);

    return rows.map((row) => this.rowToEntity(row));
  }

  async create(item: Entity): Promise<Entity> {
    const { entities } = getTables();
    await this.db.insert(entities).values({
      id: item.id,
      type: item.type,
      name: item.name,
      slug: item.slug,
      aliases: item.aliases,
      description: item.description ?? null,
      properties: item.properties,
      status: item.status,
      source: item.source ?? null,
      updatedAt: new Date(),
    });
    return (await this.findById(item.id))!;
  }

  async update(id: string, patch: Partial<Entity>): Promise<Entity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const { entities } = getTables();
    const merged: Entity = {
      ...existing,
      ...patch,
      id,
      updatedAt: new Date(),
    };
    await this.db
      .update(entities)
      .set({
        type: merged.type,
        name: merged.name,
        slug: merged.slug,
        aliases: merged.aliases,
        description: merged.description ?? null,
        properties: merged.properties,
        status: merged.status,
        source: merged.source ?? null,
        updatedAt: merged.updatedAt,
      })
      .where(eq(entities.id, id));
    return this.findById(id);
  }

  async deprecate(id: string): Promise<Entity | null> {
    return this.update(id, { status: 'deprecated' as Entity['status'] });
  }

  async upsertMany(items: Entity[]): Promise<void> {
    const { entities } = getTables();
    for (const item of items) {
      await this.db
        .insert(entities)
        .values({
          id: item.id,
          type: item.type,
          name: item.name,
          slug: item.slug,
          aliases: item.aliases,
          description: item.description ?? null,
          properties: item.properties,
          status: item.status,
          source: item.source ?? null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: entities.id,
          set: {
            type: item.type,
            name: item.name,
            slug: item.slug,
            aliases: item.aliases,
            description: item.description ?? null,
            properties: item.properties,
            status: item.status,
            source: item.source ?? null,
            updatedAt: new Date(),
          },
        });
    }
  }

  private rowToEntity(row: Record<string, unknown>): Entity {
    return {
      id: row.id as string,
      type: row.type as Entity['type'],
      name: row.name as string,
      slug: row.slug as string,
      aliases: (row.aliases as string[]) ?? [],
      description: (row.description as string) ?? undefined,
      properties: (row.properties as Record<string, unknown>) ?? {},
      status: row.status as Entity['status'],
      source: (row.source as string) ?? undefined,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    };
  }
}
