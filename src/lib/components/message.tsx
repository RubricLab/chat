import { Container } from '@rubriclab/ui'
import type { ReactNode } from 'react'

export function UserMessage({ children }: { children: ReactNode }) {
	return (
		<Container arrangement="row" justify="end" className="mb-3">
			<div className="message-user max-w-3xl rounded-default px-2.5 py-2">{children}</div>
		</Container>
	)
}

export function AssistantMessage({ children }: { children: ReactNode }) {
	return (
		<Container arrangement="row" justify="start" className="mb-3">
			<div className="message-assistant max-w-3xl rounded-default px-2.5 py-2 sm:min-w-lg">
				{children}
			</div>
		</Container>
	)
}

export function ToolMessage({
	name,
	args,
	result
}: {
	name: string
	args: ReactNode
	result?: ReactNode
}) {
	return (
		<Container arrangement="row" justify="start" className="mb-3">
			<div className="message-assistant max-w-3xl rounded-default px-2.5 py-2">
				<div className="space-y-3 text-sm">
					<div>
						<div className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wide dark:text-neutral-400">
							Tool
						</div>
						<code className="text-amber-600">{name}</code>
					</div>
					<div>
						<div className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wide dark:text-neutral-400">
							Input
						</div>
						<div className="surface rounded p-2">{args}</div>
					</div>
					{result && (
						<div>
							<div className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wide dark:text-neutral-400">
								Output
							</div>
							<div className="surface rounded p-2">{result}</div>
						</div>
					)}
				</div>
			</div>
		</Container>
	)
}
