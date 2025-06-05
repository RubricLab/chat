import type { ReactNode } from 'react'

export function UserMessage({ children }: { children: ReactNode }) {
	return (
		<div className="mb-3 flex justify-end">
			<div className="max-w-sm rounded-lg bg-neutral-900 px-3 py-2 text-white dark:bg-neutral-100 dark:text-neutral-900">
				{children}
			</div>
		</div>
	)
}

export function AssistantMessage({ children }: { children: ReactNode }) {
	return (
		<div className="mb-3 flex justify-start">
			<div className="max-w-2xl rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800 dark:text-neutral-100">
				{children}
			</div>
		</div>
	)
}

export function ToolMessage({
	name,
	args,
	result
}: {
	name: string
	args: ReactNode
	result: ReactNode
}) {
	return (
		<div className="mb-3 flex justify-start">
			<div className="max-w-2xl rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
				<div className="mb-2 font-medium text-neutral-700 text-sm dark:text-neutral-300">
					Tool: {name}
				</div>

				<div className="space-y-2 text-sm">
					<div>
						<div className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wide dark:text-neutral-400">
							Input
						</div>
						<div className="rounded bg-white p-2 dark:bg-neutral-800 dark:text-neutral-100">{args}</div>
					</div>

					<div>
						<div className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wide dark:text-neutral-400">
							Output
						</div>
						<div className="rounded bg-white p-2 dark:bg-neutral-800 dark:text-neutral-100">{result}</div>
					</div>
				</div>
			</div>
		</div>
	)
}
