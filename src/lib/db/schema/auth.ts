import { pgTable, primaryKey, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

const users = pgTable('users', {
	email: varchar('email', { length: 255 }).notNull().unique(),
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 })
})

const oAuth2AuthenticationRequests = pgTable('oauth2_authentication_requests', {
	callbackUrl: varchar('callback_url', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	token: varchar('token', { length: 255 }).primaryKey()
})

const oAuth2AuthorizationRequests = pgTable('oauth2_authorization_requests', {
	callbackUrl: varchar('callback_url', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	token: varchar('token', { length: 255 }).primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
})

const magicLinkRequests = pgTable('magic_link_requests', {
	email: varchar('email', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	token: varchar('token', { length: 255 }).primaryKey()
})

const oAuth2AuthenticationAccounts = pgTable(
	'oauth2_authentication_accounts',
	{
		accessToken: varchar('access_token', { length: 255 }).notNull(),
		accountId: varchar('account_id', { length: 255 }).notNull(),
		expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
		provider: varchar('provider', { length: 255 }).notNull(),
		refreshToken: varchar('refresh_token', { length: 255 }).notNull(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	table => [primaryKey({ columns: [table.userId, table.provider, table.accountId] })]
)

const oAuth2AuthorizationAccounts = pgTable(
	'oauth2_authorization_accounts',
	{
		accessToken: varchar('access_token', { length: 255 }).notNull(),
		accountId: varchar('account_id', { length: 255 }).notNull(),
		expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
		provider: varchar('provider', { length: 255 }).notNull(),
		refreshToken: varchar('refresh_token', { length: 255 }).notNull(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	table => [primaryKey({ columns: [table.userId, table.provider, table.accountId] })]
)

const apiKeyAuthorizationAccounts = pgTable(
	'api_key_authorization_accounts',
	{
		accountId: varchar('account_id', { length: 255 }).notNull(),
		apiKey: varchar('api_key', { length: 255 }).notNull(),
		provider: varchar('provider', { length: 255 }).notNull(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	table => [primaryKey({ columns: [table.userId, table.provider, table.accountId] })]
)

const sessions = pgTable('sessions', {
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	key: varchar('key', { length: 255 }).primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
})

export {
	users,
	oAuth2AuthenticationRequests,
	oAuth2AuthorizationRequests,
	magicLinkRequests,
	oAuth2AuthenticationAccounts,
	oAuth2AuthorizationAccounts,
	apiKeyAuthorizationAccounts,
	sessions
}
