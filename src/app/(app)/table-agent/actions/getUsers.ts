'use server'

import db from '~/db'
import { users } from '~/db/schema/auth'

export async function getUsers({ limit }: { limit: number }) {
	const u = await db.select().from(users).limit(limit)
	return u.map(user => ({ ...user, name: user.name ?? '' }))
}
