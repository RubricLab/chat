'use server'

import { Resend } from 'resend'
import env from '~/env'

const resend = new Resend(env.RESEND_API_KEY)

export async function sendEmail({
	to,
	subject,
	body
}: { to: string; subject: string; body: string }) {
	const { error } = await resend.emails.send({
		from: 'Rubric Chat <chat@mail.rubric.sh>',
		to: [to],
		subject,
		text: body
	})

	if (error) {
		throw error
	}

	return undefined
}
