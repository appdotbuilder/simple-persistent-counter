
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type IncrementCounterInput, type Counter } from '../schema';
import { eq } from 'drizzle-orm';

export const incrementCounter = async (input: IncrementCounterInput): Promise<Counter> => {
  try {
    // Try to get existing counter (assuming single counter with id=1)
    const existingCounters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, 1))
      .execute();

    if (existingCounters.length === 0) {
      // Create first counter if it doesn't exist
      const result = await db.insert(countersTable)
        .values({
          value: input.increment,
          updated_at: new Date()
        })
        .returning()
        .execute();

      return result[0];
    } else {
      // Update existing counter
      const currentCounter = existingCounters[0];
      const newValue = currentCounter.value + input.increment;

      const result = await db.update(countersTable)
        .set({
          value: newValue,
          updated_at: new Date()
        })
        .where(eq(countersTable.id, 1))
        .returning()
        .execute();

      return result[0];
    }
  } catch (error) {
    console.error('Counter increment failed:', error);
    throw error;
  }
};
