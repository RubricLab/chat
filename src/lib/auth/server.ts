import { createAuth, createGithubAuthenticationProvider, drizzleAdapter } from '@rubriclab/auth'
import db from '~/db'
import env from '~/env'

export const { routes, actions, __types } = createAuth({
	authUrl: env.NEXT_PUBLIC_AUTH_URL,
	databaseProvider: drizzleAdapter(db),
	oAuth2AuthenticationProviders: {
		github: createGithubAuthenticationProvider({
			githubClientId: env.GITHUB_CLIENT_ID,
			githubClientSecret: env.GITHUB_CLIENT_SECRET
		})
	}
})
