'use server'

import Exa from 'exa-js'
import env from '~/env'

const exa = new Exa(env.EXA_API_KEY)

export async function search({ query }: { query: string }) {
	const { results } = await exa.searchAndContents(query, {
		type: 'auto',
		text: true,
		numResults: 10
	})

	return results.map(({ title, text, url }) => {
		return {
			title,
			content: text,
			url
		}
	})
}
