
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type IncrementCounterInput } from '../schema';
import { incrementCounter } from '../handlers/increment_counter';
import { eq } from 'drizzle-orm';

describe('incrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create first counter with default increment', async () => {
    const input: IncrementCounterInput = {
      increment: 1
    };

    const result = await incrementCounter(input);

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(1);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create first counter with custom increment', async () => {
    const input: IncrementCounterInput = {
      increment: 5
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(5);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing counter', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 10,
        updated_at: new Date()
      })
      .execute();

    const input: IncrementCounterInput = {
      increment: 3
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(13);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save counter to database', async () => {
    const input: IncrementCounterInput = {
      increment: 7
    };

    const result = await incrementCounter(input);

    // Verify in database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(7);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple increments correctly', async () => {
    // First increment
    await incrementCounter({ increment: 2 });
    
    // Second increment
    const result = await incrementCounter({ increment: 3 });

    expect(result.value).toEqual(5);

    // Third increment
    const finalResult = await incrementCounter({ increment: 1 });
    expect(finalResult.value).toEqual(6);
  });

  it('should update timestamp on each increment', async () => {
    // Create initial counter
    const firstResult = await incrementCounter({ increment: 1 });
    const firstTimestamp = firstResult.updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Increment again
    const secondResult = await incrementCounter({ increment: 1 });
    const secondTimestamp = secondResult.updated_at;

    expect(secondTimestamp.getTime()).toBeGreaterThan(firstTimestamp.getTime());
    expect(secondResult.value).toEqual(2);
  });
});
