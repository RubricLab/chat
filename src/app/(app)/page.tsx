'use client'
import { Account } from '~/components/account'
// import { sendMessage } from '~/ai'
// import { useSession } from '~/auth'
import { useEvents } from '~/events/client'
// import { Chat, Page } from '~/ui'

export default function () {
	useEvents({ id: '_', on: {} })

	return (
		<Account />
		// <Page>
		// 	<Chat messages={events} sendMessage={sendMessage} />
		// </Page>
	)
}
