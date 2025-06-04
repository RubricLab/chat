'use client'

export default function () {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
			<h1>Agents</h1>

			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
				<h3>
					<a href="/addition-agent">Addition Agent</a>
				</h3>
				<p>Ultra simple demo of a tool-using agent using server actions.</p>
			</div>
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
				<h3>
					<a href="/weather-agent">Weather Agent</a>
				</h3>
				<p>A tool use agent that uses events to show the progress of the agent.</p>
			</div>
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
				<h3>
					<a href="/research-agent">Research Agent</a>
				</h3>
				<p>An agent that has tools AND a custom response format</p>
			</div>
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
				<h3>
					<a href="/db-agent">Db Agent</a>
				</h3>
				<p>
					An agent that uses the <a href="https://github.com/rubriclab/actions">@rubriclab/actions</a>{' '}
					package to interact with a database.
				</p>
			</div>
		</div>
	)
}
