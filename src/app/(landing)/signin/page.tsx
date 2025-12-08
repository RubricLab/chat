import { Container, Heading } from '@rubriclab/ui'
import { SignInButton } from '~/components/signIn'

export default function SignInPage() {
	return (
		<Container gap="md" align="center" justify="center" height="screen">
			<Heading level="1">Welcome to Rubric Chat</Heading>
			<p>Get started by signing in.</p>
			<SignInButton />
		</Container>
	)
}
