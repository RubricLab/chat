'use client'

import { signOut } from '~/auth/actions'

export function SignOutButton() {
	return (
		<button type="button" onClick={async () => signOut({ redirect: '/signin' })}>
			Sign Out
		</button>
	)
}
