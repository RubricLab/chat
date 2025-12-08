import { Button } from '@rubriclab/ui'
import { signIn } from '~/auth/actions'

export function SignInButton() {
	return (
		<form
			action={async () => {
				'use server'
				await signIn({ callbackUrl: '/', provider: 'github' })
			}}
		>
			<Button variant="primary" label="Sign in with GitHub" type="submit" />
		</form>
	)
}
