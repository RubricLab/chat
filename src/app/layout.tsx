// import { ClientAuthProvider } from '@rubriclab/auth'
// import { EventsProvider } from '~/events'
// import { CreateLayout } from '~/ui'

// export default CreateLayout({
// 	providers: [ClientAuthProvider, EventsProvider]
// })

export default async function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
