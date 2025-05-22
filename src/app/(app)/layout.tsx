import { ClientAuthProvider } from '@rubriclab/auth'
import { getSession } from '~/auth/actions'
// import { EventsProvider } from '~/events'
import { CreateLayout } from '~/ui'

export default CreateLayout([
	[
		ClientAuthProvider,
		async () => ({
			session: await getSession({ redirectUnauthorized: '/signin' })
		})
	]
])

// export default CreateLayout({
// 	providers: [ClientAuthProvider, EventsProvider]
// })
