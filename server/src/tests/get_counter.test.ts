
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { getCounter } from '../handlers/get_counter';

describe('getCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create and return a new counter when none exists', async () => {
    const result = await getCounter();

    // Verify basic counter structure
    expect(result.id).toBeDefined();
    expect(result.value).toEqual(0);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save new counter to database', async () => {
    const result = await getCounter();

    // Verify counter was saved in database
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].id).toEqual(result.id);
    expect(counters[0].value).toEqual(0);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return existing counter when one already exists', async () => {
    // Create a counter with a specific value
    const existing = await db.insert(countersTable)
      .values({ value: 42 })
      .returning()
      .execute();

    const result = await getCounter();

    // Should return the existing counter, not create a new one
    expect(result.id).toEqual(existing[0].id);
    expect(result.value).toEqual(42);
    expect(result.updated_at).toEqual(existing[0].updated_at);
  });

  it('should only return one counter even if multiple exist', async () => {
    // Create multiple counters
    await db.insert(countersTable)
      .values([
        { value: 10 },
        { value: 20 },
        { value: 30 }
      ])
      .execute();

    const result = await getCounter();

    // Should return a single counter (first one found)
    expect(result.id).toBeDefined();
    expect(typeof result.value).toBe('number');
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify it returns one of the existing counters (value should be 10, 20, or 30)
    expect([10, 20, 30]).toContain(result.value);
  });
});
