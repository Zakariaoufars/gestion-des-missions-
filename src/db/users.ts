import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role: email.includes('admin') || email.includes('direct') ? 'ADMIN' : 'CHEF_SERVICE',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(displayName ? { displayName } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('getOrCreateUser error:', error);
    // If table query fails, fallback gracefully
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    return existing[0] || null;
  }
}
