import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, fullName: string, role: 'OFFICER' | 'AUDITOR' | 'ADMIN' = 'OFFICER') {
  const result = await db.insert(users)
    .values({
      uid,
      email,
      fullName,
      role
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        fullName, // update name if changed
      },
    })
    .returning();

  return result[0];
}
