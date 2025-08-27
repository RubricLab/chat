import { SignInButton } from '~/components/signIn'

export default function SignInPage() {
	return (
		<div className="flex h-screen flex-col items-center justify-center gap-4">
			<h1>Welcome.</h1>
			<SignInButton />
		</div>
	)
}
