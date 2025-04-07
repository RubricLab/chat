import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import env from '~/env'
import { users } from './schema/users'

const client = neon(env.DATABASE_URL)

const schema = { users }

export default drizzle<typeof schema>({ client })
