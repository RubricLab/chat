import { getSession } from '~/auth/actions'
import { ClientAuthProvider } from '~/auth/client'
import { Layout } from '~/ui'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClientAuthProvider session={await getSession({ redirectUnauthorized: '/signin' })}>
			<Layout>{children}</Layout>
		</ClientAuthProvider>
	)
}
