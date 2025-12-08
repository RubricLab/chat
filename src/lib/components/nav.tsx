'use client'

import { Container, Link, Text } from '@rubriclab/ui'
import { useSession } from '~/auth/client'
import { SignOutButton } from './signOut'

export function Nav() {
	const { user } = useSession()
	return (
		<Container gap="md" align="center" arrangement="row" padding="md" justify="between" height="fit">
			<Link href="/">Home</Link>
			<Container width="fit" arrangement="row" gap="md" align="center">
				<Text size="sm" variant="tertiary">
					Signed in as {user.email}
				</Text>
				<SignOutButton />
			</Container>
		</Container>
	)
}
