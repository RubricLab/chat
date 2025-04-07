import { sendMessage } from '~/ai'
import { useSession } from '~/auth'
import { useEvents } from '~/events'
import { Chat, Page } from '~/ui'

export default function () {
	const { userId } = useSession()
	const { events } = useEvents(`chat_${userId}`)
	return (
		<Page>
			<Chat messages={events} sendMessage={sendMessage} />
		</Page>
	)
}
