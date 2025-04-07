import { ClientAuthProvider } from '@rubriclab/auth'
import { EventsProvider } from '~/events'
import { CreateLayout } from '~/ui'

export default CreateLayout({
	providers: [ClientAuthProvider, EventsProvider]
})
