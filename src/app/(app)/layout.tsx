import { getSession } from '~/auth/actions'
import { ClientAuthProvider } from '~/auth/client'
import { Nav } from '~/components/nav'
import { Layout } from '~/ui'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClientAuthProvider session={await getSession({ redirectUnauthorized: '/signin' })}>
			<Layout>
				<Nav />
				{children}
			</Layout>
		</ClientAuthProvider>
	)
}
