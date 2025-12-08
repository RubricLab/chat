'use server'

import { db } from '~/db'
import { users } from '~/db/schema/auth'

export async function getUsers() {
	return await db.select().from(users)
}
