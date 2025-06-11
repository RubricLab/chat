'use client'

import type { ReactNode } from 'react'

const AgentRow = ({
	href,
	name,
	description,
	source
}: { href: string; name: string; description: ReactNode; source: string }) => (
	<tr className="border-gray-200 border-b dark:border-neutral-800">
		<td className="px-8 py-2">
			<a href={href}>{name}</a>
		</td>
		<td className="px-8 py-2">{description}</td>
		<td className="px-8 py-2">
			<a target="_blank" rel="noreferrer" href={source}>
				Source
			</a>
		</td>
	</tr>
)

export default function () {
	return (
		<div className="flex flex-col items-center gap-4">
			<h1 className="mb-4 font-bold text-2xl">Demos</h1>
			<table>
				<tbody>
					<AgentRow
						href="/addition-agent"
						name="Addition Agent"
						description="Simple tool-using agent demo"
						source="https://github.com/rubriclab/chat/tree/main/src/app/(app)/addition-agent"
					/>
					<AgentRow
						href="/weather-agent"
						name="Weather Agent"
						description={
							<>
								Agent with progress tracking using{' '}
								<a target="_blank" rel="noreferrer" href="https://github.com/rubriclab/actions">
									@rubriclab/events
								</a>
							</>
						}
						source="https://github.com/rubriclab/chat/tree/main/src/app/(app)/weather-agent"
					/>
					<AgentRow
						href="/research-agent"
						name="Research Agent"
						description="Agent with tools and custom response format"
						source="https://github.com/rubriclab/chat/tree/main/src/app/(app)/research-agent"
					/>
					<AgentRow
						href="/db-agent"
						name="DB Agent"
						description={
							<>
								Database interaction agent. Uses{' '}
								<a target="_blank" rel="noreferrer" href="https://github.com/rubriclab/actions">
									@rubriclab/actions
								</a>
							</>
						}
						source="https://github.com/rubriclab/chat/tree/main/src/app/(app)/db-agent"
					/>
					<AgentRow
						href="/calculator-agent"
						name="Calculator Agent"
						description={
							<>
								Calculator agent using recursive IO from{' '}
								<a target="_blank" rel="noreferrer" href="https://github.com/rubriclab/chains">
									@rubriclab/chains
								</a>
							</>
						}
						source="https://github.com/rubriclab/chat/tree/main/src/app/(app)/calculator-agent"
					/>
					<AgentRow
						href="/website-agent"
						name="Website Agent"
						description={
							<>
								Static website builder using{' '}
								<a target="_blank" rel="noreferrer" href="https://github.com/rubriclab/chains">
									@rubriclab/blocks
								</a>{' '}
								and{' '}
								<a target="_blank" rel="noreferrer" href="https://github.com/rubriclab/chains">
									@rubriclab/chains
								</a>
							</>
						}
						source="https://github.com/rubriclab/chat/tree/main/src/app/(app)/website-agent"
					/>
					<AgentRow
						href="/form-agent"
						name="Form Agent [WIP]"
						description={<>Form builder with generic blocks and dynamic structured chains</>}
						source="https://github.com/rubriclab/chat/tree/main/src/app/(app)/form-agent"
					/>
				</tbody>
			</table>
		</div>
	)
}
