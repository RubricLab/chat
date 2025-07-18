'use server'

import { eq } from 'drizzle-orm'
import type z from 'zod/v4'
import db from '~/db'
import { users } from '~/db/schema/auth'
import type { user as userSchema } from './index'

export async function updateUser({
	user,
	name
}: {
	user: z.infer<typeof userSchema>
	name: string
}) {
	await db.update(users).set({ name }).where(eq(users.id, user.id))
	return null
}
