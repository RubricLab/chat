import { createEnv } from '@t3-oss/env-nextjs'
import z from 'zod'

export default createEnv({
	client: {
		NEXT_PUBLIC_AUTH_URL: z.string().min(1)
	},
	server: {
		DATABASE_URL: z.string().min(1),
		OPENAI_API_KEY: z.string().min(1),
		UPSTASH_REDIS_URL: z.string().min(1),
		GITHUB_CLIENT_ID: z.string().min(1),
		GITHUB_CLIENT_SECRET: z.string().min(1),

		EXA_API_KEY: z.string().min(1),
		RESEND_API_KEY: z.string().min(1)
	},
	runtimeEnv: {
		NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
		DATABASE_URL: process.env.DATABASE_URL,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
		GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
		GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

		EXA_API_KEY: process.env.EXA_API_KEY,
		RESEND_API_KEY: process.env.RESEND_API_KEY
	}
})
