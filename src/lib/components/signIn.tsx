'use client'

import { signIn } from '~/auth/actions'

export function SignInButton() {
	return (
		<button type="button" onClick={async () => signIn({ provider: 'github', callbackUrl: '/' })}>
			Sign In With Github
		</button>
	)
}
