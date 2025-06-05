import { pgTable, primaryKey, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 })
})

export const oAuth2AuthenticationRequests = pgTable('oauth2_authentication_requests', {
	token: varchar('token', { length: 255 }).primaryKey(),
	callbackUrl: varchar('callback_url', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull()
})

export const oAuth2AuthorizationRequests = pgTable('oauth2_authorization_requests', {
	token: varchar('token', { length: 255 }).primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	callbackUrl: varchar('callback_url', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull()
})

export const magicLinkRequests = pgTable('magic_link_requests', {
	token: varchar('token', { length: 255 }).primaryKey(),
	email: varchar('email', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull()
})

export const oAuth2AuthenticationAccounts = pgTable(
	'oauth2_authentication_accounts',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		provider: varchar('provider', { length: 255 }).notNull(),
		accountId: varchar('account_id', { length: 255 }).notNull(),
		accessToken: varchar('access_token', { length: 255 }).notNull(),
		refreshToken: varchar('refresh_token', { length: 255 }).notNull(),
		expiresAt: timestamp('expires_at', { mode: 'date' }).notNull()
	},
	table => [primaryKey({ columns: [table.userId, table.provider, table.accountId] })]
)

export const oAuth2AuthorizationAccounts = pgTable(
	'oauth2_authorization_accounts',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		provider: varchar('provider', { length: 255 }).notNull(),
		accountId: varchar('account_id', { length: 255 }).notNull(),
		accessToken: varchar('access_token', { length: 255 }).notNull(),
		refreshToken: varchar('refresh_token', { length: 255 }).notNull(),
		expiresAt: timestamp('expires_at', { mode: 'date' }).notNull()
	},
	table => [primaryKey({ columns: [table.userId, table.provider, table.accountId] })]
)

export const apiKeyAuthorizationAccounts = pgTable(
	'api_key_authorization_accounts',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		provider: varchar('provider', { length: 255 }).notNull(),
		accountId: varchar('account_id', { length: 255 }).notNull(),
		apiKey: varchar('api_key', { length: 255 }).notNull()
	},
	table => [primaryKey({ columns: [table.userId, table.provider, table.accountId] })]
)

export const sessions = pgTable('sessions', {
	key: varchar('key', { length: 255 }).primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull()
})
