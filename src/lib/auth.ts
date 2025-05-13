import {
	createAuth,
	createGithubAuthenticationProvider,
	createGoogleAuthorizationProvider,
	drizzleAdapter
} from '@rubriclab/auth'
import db from '~/db'
import env from '~/env'

export const { routes, actions, __types } = createAuth({
	authUrl: env.NEXT_PUBLIC_AUTH_URL,
	oAuth2AuthenticationProviders: {
		github: createGithubAuthenticationProvider({
			githubClientId: env.GITHUB_CLIENT_ID,
			githubClientSecret: env.GITHUB_CLIENT_SECRET
		})
	},
	oAuth2AuthorizationProviders: {
		google: createGoogleAuthorizationProvider({
			googleClientId: env.GOOGLE_CLIENT_ID,
			googleClientSecret: env.GOOGLE_CLIENT_SECRET,
			scopes: [
				'https://www.googleapis.com/auth/gmail.readonly',
				'https://www.googleapis.com/auth/gmail.modify',
				'https://www.googleapis.com/auth/gmail.compose',
				'https://www.googleapis.com/auth/gmail.send',
				'https://www.googleapis.com/auth/gmail.full'
			]
		})
	},
	databaseProvider: drizzleAdapter(db)
})
