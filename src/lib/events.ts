import { eventTypes as agentEventTypes } from './agents'
import env from './env'

export const { useEvents, publish } = createEvents({
	eventTypes: {
		...agentEventTypes
	},
	redisURL: env.UPSTASH_REDIS_URL
})
