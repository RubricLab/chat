import { createBlock, REACT_NODE } from '@rubriclab/blocks'
import { z } from 'zod/v4'
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
		schema: { input: { children: z.array(REACT_NODE) } }
	}),
	code: createBlock({
		description: 'Render code block',
		render: ({ code }) => <Code code={code} />,
		schema: { input: { code: z.string() } }
	}),

	// Layout blocks
	container: createBlock({
		description: 'Container with max width',
		render: ({ children, maxWidth }) => <Container maxWidth={maxWidth}>{children}</Container>,
		schema: {
			input: { children: z.array(REACT_NODE), maxWidth: z.number() }
		}
	}),
	footer: createBlock({
		description: 'Semantic footer',
		render: ({ children }) => <Footer>{children}</Footer>,
		schema: { input: { children: z.array(REACT_NODE) } }
	}),
	grid: createBlock({
		description: 'Grid layout',
		render: ({ children, columns }) => <Grid columns={columns}>{children}</Grid>,
		schema: { input: { children: z.array(REACT_NODE), columns: z.number() } }
	}),
	// Content blocks
	heading: createBlock({
		description: 'Render a heading',
		render: ({ text, level }) => <Heading text={text} level={level} />,
		schema: {
			input: {
				level: z.number(),
				text: z.string()
			}
		}
	}),
	hero: createBlock({
		description: 'Hero section',
		render: ({ children }) => <Hero>{children}</Hero>,
		schema: { input: { children: z.array(REACT_NODE) } }
	}),
	image: createBlock({
		description: 'Render an image',
		render: ({ src, alt }) => <Image src={src} alt={alt} />,
		schema: { input: { alt: z.string(), src: z.string() } }
	}),
	link: createBlock({
		description: 'Render a link',
		render: ({ href, text }) => <Link href={href} text={text} />,
		schema: { input: { href: z.string(), text: z.string() } }
	}),
	paragraph: createBlock({
		description: 'Render a paragraph',
		render: ({ text }) => <Paragraph text={text} />,
		schema: { input: { text: z.string() } }
	}),
	quote: createBlock({
		description: 'Render a quote',
		render: ({ text }) => <Quote text={text} />,
		schema: { input: { text: z.string() } }
	}),
	section: createBlock({
		description: 'Semantic section',
		render: ({ children }) => <Section>{children}</Section>,
		schema: { input: { children: z.array(REACT_NODE) } }
	}),
	stack: createBlock({
		description: 'Stack children vertically',
		render: ({ children, spacing }) => <Stack spacing={spacing}>{children}</Stack>,
		schema: {
			input: { children: z.array(REACT_NODE), spacing: z.number() }
		}
	})
}
