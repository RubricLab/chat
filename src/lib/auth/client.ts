'use client'

import { CreateAuthContext } from '@rubriclab/auth/client'
import type { DrizzleSession } from '@rubriclab/auth/providers/drizzle'
import type { users } from '~/db/schema/auth'

export const { ClientAuthProvider, useSession } =
	CreateAuthContext<DrizzleSession<typeof users.$inferSelect>>()
