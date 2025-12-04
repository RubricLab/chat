import { createBlock, REACT_NODE } from '@rubriclab/blocks'
import { z } from 'zod'
import { raw_number, raw_string, url } from '../brands'
import { Card } from './card'
import { Code } from './code'
import { Container } from './container'
import { Footer } from './footer'
import { Grid } from './grid'
import { Heading } from './heading'
import { Hero } from './hero'
import { Image } from './image'
import { Link } from './link'
import { Paragraph } from './paragraph'
import { Quote } from './quote'
import { Section } from './section'
import { Stack } from './stack'

export const blocks = {
	card: createBlock({
		description: 'Card container',
		render: ({ children }) => <Card>{children}</Card>,
		schema: { input: z.object({ children: z.array(REACT_NODE) }) }
	}),
	code: createBlock({
		description: 'Render code block',
		render: ({ code }) => <Code code={code} />,
		schema: { input: z.object({ code: raw_string }) }
	}),

	// Layout blocks
	container: createBlock({
		description: 'Container with max width',
		render: ({ children, maxWidth }) => <Container maxWidth={maxWidth}>{children}</Container>,
		schema: {
			input: z.object({ children: z.array(REACT_NODE), maxWidth: raw_number })
		}
	}),
	footer: createBlock({
		description: 'Semantic footer',
		render: ({ children }) => <Footer>{children}</Footer>,
		schema: { input: z.object({ children: z.array(REACT_NODE) }) }
	}),
	grid: createBlock({
		description: 'Grid layout',
		render: ({ children, columns }) => <Grid columns={columns}>{children}</Grid>,
		schema: { input: z.object({ children: z.array(REACT_NODE), columns: raw_number }) }
	}),
	// Content blocks
	heading: createBlock({
		description: 'Render a heading',
		render: ({ text, level }) => <Heading text={text} level={level} />,
		schema: {
			input: z.object({
				level: raw_number,
				text: raw_string
			})
		}
	}),
	hero: createBlock({
		description: 'Hero section',
		render: ({ children }) => <Hero>{children}</Hero>,
		schema: { input: z.object({ children: z.array(REACT_NODE) }) }
	}),
	image: createBlock({
		description: 'Render an image',
		render: ({ src, alt }) => <Image src={src} alt={alt} />,
		schema: { input: z.object({ alt: raw_string, src: url }) }
	}),
	link: createBlock({
		description: 'Render a link',
		render: ({ href, text }) => <Link href={href} text={text} />,
		schema: { input: z.object({ href: raw_string, text: raw_string }) }
	}),
	paragraph: createBlock({
		description: 'Render a paragraph',
		render: ({ text }) => <Paragraph text={text} />,
		schema: { input: z.object({ text: raw_string }) }
	}),
	quote: createBlock({
		description: 'Render a quote',
		render: ({ text }) => <Quote text={text} />,
		schema: { input: z.object({ text: raw_string }) }
	}),
	section: createBlock({
		description: 'Semantic section',
		render: ({ children }) => <Section>{children}</Section>,
		schema: { input: z.object({ children: z.array(REACT_NODE) }) }
	}),
	stack: createBlock({
		description: 'Stack children vertically',
		render: ({ children, spacing }) => <Stack spacing={spacing}>{children}</Stack>,
		schema: {
			input: z.object({ children: z.array(REACT_NODE), spacing: raw_number })
		}
	})
}
