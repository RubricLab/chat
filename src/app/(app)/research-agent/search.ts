'use server'

import Exa from 'exa-js'
import env from '~/env'

const exa = new Exa(env.EXA_API_KEY)

export async function search({ query, numResults }: { query: string; numResults: number }) {
	const { results } = await exa.search(query, {
		numResults
	})

	return results.map(({ title, url }) => {
		return {
			title,
			url
		}
	})
}

export async function getContents({ url }: { url: string }) {
	const { results } = await exa.getContents(url, { text: true, livecrawl: 'auto' })

	if (!results[0]) {
		return {
			title: 'No results found',
			content: 'No results found',
			url
		}
	}

	const { title, text } = results[0]

	return {
		title,
		content: text,
		url
	}
}
