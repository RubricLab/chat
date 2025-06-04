import { getSession } from '~/auth/actions'
import { ClientAuthProvider } from '~/auth/client'
import { Nav } from '~/components/nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClientAuthProvider session={await getSession({ redirectUnauthorized: '/signin' })}>
			<div className="flex min-h-screen flex-col">
				<Nav />
				<div className="flex flex-1 flex-col items-center justify-center">{children}</div>
			</div>
		</ClientAuthProvider>
	)
}
