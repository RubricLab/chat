'use client'

import { useSession } from '~/auth/client'
import { SignOutButton } from './signOut'

export function Account() {
	const { user } = useSession()
	return (
		<div>
			<p>signed in as {user.email}</p>
			<SignOutButton />
		</div>
	)
}
