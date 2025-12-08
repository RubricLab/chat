'use client'

import { Container, Heading, Link, Text } from '@rubriclab/ui'
import type { ReactNode } from 'react'

const AgentRow = ({
	href,
	name,
	description,
	source
}: {
	href: string
	name: string
	description: ReactNode
	source: string
}) => (
	<tr className="hover:bg-muted">
		<td className="whitespace-nowrap px-6 py-3">
			<Link href={href}>{name}</Link>
		</td>
		<td className="px-6 py-3">
			<Text size="sm" variant="tertiary">
				{description}
			</Text>
		</td>
		<td className="px-6 py-3">
			<Link target="_blank" href={source}>
				Source
			</Link>
		</td>
	</tr>
)

export default function () {
	return (
		<Container gap="lg" align="center" justify="center">
			<Heading level="1">Demos</Heading>
			<table>
				<tbody className="divide-y divide-border">
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
					<AgentRow
						href="/table-agent"
						name="Table Agent [WIP]"
						description={<>...</>}
						source="https://github.com/rubriclab/chat/tree/main/src/app/(app)/table-agent"
					/>
				</tbody>
			</table>
		</Container>
	)
}
