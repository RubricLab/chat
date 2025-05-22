'use client'

import { useSession } from '@rubriclab/auth/lib/client'
import { SignOutButton } from './signOut'

export function Account() {
	const { userId } = useSession()
	return (
		<div>
			<p>signed in as {userId}</p>
			<SignOutButton />
		</div>
	)
}
