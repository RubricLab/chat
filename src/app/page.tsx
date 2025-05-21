'use client'
// import { sendMessage } from '~/ai'
// import { useSession } from '~/auth'
import { useEvents } from '~/events/client'
// import { Chat, Page } from '~/ui'

export default function () {
	// const { userId } = useSession()
	useEvents({ id: '_', on: {} })

	return (
		<>HI</>
		// <Page>
		// 	<Chat messages={events} sendMessage={sendMessage} />
		// </Page>
	)
}
