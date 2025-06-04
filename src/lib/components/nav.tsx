'use client'

import { useSession } from '~/auth/client'
import { SignOutButton } from './signOut'

export function Nav() {
	const { user } = useSession()
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				gap: '10px'
			}}
		>
			<a href="/">Chat</a>
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
				<p>signed in as {user.email}</p>
				<SignOutButton />
			</div>
		</div>
	)
}
