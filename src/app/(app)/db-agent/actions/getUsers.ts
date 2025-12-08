'use server'

import { db } from '~/db'
import { users } from '~/db/schema/auth'

export async function getUsers({ limit }: { limit: number }) {
	return db.select().from(users).limit(limit)
}
