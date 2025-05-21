import { Chat } from './components/chat'
import { Enabled } from './components/enabled'
import { UI } from './components/ui'

export default function Page() {
	return (
		<div style={{ display: 'flex' }}>
			{/* <Enabled /> */}
			<Chat />
			<UI />
		</div>
	)
}
