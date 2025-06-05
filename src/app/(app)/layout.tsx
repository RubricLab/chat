import { getSession } from '~/auth/actions'
import { ClientAuthProvider } from '~/auth/client'
import { Nav } from '~/components/nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClientAuthProvider session={await getSession({ redirectUnauthorized: '/signin' })}>
			<div className="flex min-h-screen flex-col">
				<Nav />
				<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center p-10">
					<div className="flex w-full flex-col items-center">{children}</div>
				</div>
			</div>
		</ClientAuthProvider>
	)
}
