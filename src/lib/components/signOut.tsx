'use client'

import { Button } from '@rubriclab/ui'
import { signOut } from '~/auth/actions'

export function SignOutButton() {
	return (
		<Button label="Sign out" variant="ghost" onClick={async () => signOut({ redirect: '/signin' })} />
	)
}
