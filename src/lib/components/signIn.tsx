import { signIn } from '~/auth/actions'

export function SignInButton() {
	return (
		<form
			action={async () => {
				'use server'
				await signIn({ callbackUrl: '/', provider: 'github' })
			}}
		>
			<button type="submit">Sign In With Github</button>
		</form>
	)
}
