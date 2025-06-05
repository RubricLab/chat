'use client'

import type { ReactNode } from 'react'

const AgentRow = ({
	href,
	name,
	description,
	source
}: { href: string; name: string; description: ReactNode; source: string }) => (
	<tr className="border-gray-200 border-b">
		<td className="px-8 py-2">
			<a href={href}>{name}</a>
		</td>
		<td className="px-8 py-2">{description}</td>
		<td className="px-8 py-2">
			<a target="_blank" rel="noreferrer" href={source}>
				Source Code
			</a>
		</td>
	</tr>
)

export default function () {
	return (
		<table>
			<tbody>
				<AgentRow
					href="/addition-agent"
					name="Addition Agent"
					description="Simple tool-using agent demo"
					source="https://github.com/rubriclab/agents/tree/main/src/app/(app)/addition-agent"
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
					source="https://github.com/rubriclab/agents/tree/main/src/app/(app)/weather-agent"
				/>
				<AgentRow
					href="/research-agent"
					name="Research Agent"
					description="Agent with tools and custom response format"
					source="https://github.com/rubriclab/agents/tree/main/src/app/(app)/research-agent"
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
					source="https://github.com/rubriclab/agents/tree/main/src/app/(app)/db-agent"
				/>
				<AgentRow
					href="/calculator-agent"
					name="Calculator Agent"
					description={
						<>
							Recursive Calculator agent that uses{' '}
							<a target="_blank" rel="noreferrer" href="https://github.com/rubriclab/chains">
								@rubriclab/chains
							</a>
						</>
					}
					source="https://github.com/rubriclab/agents/tree/main/src/app/(app)/calculator-agent"
				/>
			</tbody>
		</table>
	)
}
