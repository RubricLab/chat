'use server'

import { Resend } from 'resend'
import type { z } from 'zod/v4'
import env from '~/env'
import type { user } from './index'

const resend = new Resend(env.RESEND_API_KEY)

export async function sendEmail({
	to,
	subject,
	body
}: {
	to: z.infer<typeof user>
	subject: string
	body: string
}) {
	const { error } = await resend.emails.send({
		from: 'Rubric Chat<chat@mail.rubric.sh>',
		subject,
		text: body,
		to: [to.email]
	})
	console.log('sent email')

	if (error) {
		throw error
	}

	return null
}
