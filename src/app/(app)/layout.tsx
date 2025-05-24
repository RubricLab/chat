import { getSession } from '~/auth/actions'
import { ClientAuthProvider } from '~/auth/client'
import { CreateLayout } from '~/ui'

export default CreateLayout([
	[
		ClientAuthProvider,
		async () => ({
			session: await getSession({ redirectUnauthorized: '/signin' })
		})
	]
])
