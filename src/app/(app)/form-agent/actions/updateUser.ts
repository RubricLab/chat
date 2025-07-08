'use server'

import { eq } from 'drizzle-orm'
import type z from 'zod/v4'
import db from '~/db'
import { users } from '~/db/schema/auth'
import type { user as userSchema } from './index'

export async function updateUser({
	user,
	update
}: {
	user: z.infer<typeof userSchema>
	update: { name: string }
}) {
	await db.update(users).set(update).where(eq(users.id, user.id))
	return null
}
