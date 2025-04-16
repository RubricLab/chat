import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import env from '~/env'
import * as authSchema from './schema/auth'
const client = neon(env.DATABASE_URL)

export default drizzle({ client, schema: { ...authSchema } })
