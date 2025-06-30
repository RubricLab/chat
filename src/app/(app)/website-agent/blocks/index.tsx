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
	// Content blocks
	heading: createBlock({
		schema: {
			input: {
				text: z.string(),
				level: z.number()
			},
		},
		render: ({ text, level }) => <Heading text={text} level={level} />,
		description: 'Render a heading'
	}),
	paragraph: createBlock({
		schema: { input: { text: z.string() },  },
		render: ({ text }) => <Paragraph text={text} />,
		description: 'Render a paragraph'
	}),
	code: createBlock({
		schema: { input: { code: z.string() },  },
		render: ({ code }) => <Code code={code} />,
		description: 'Render code block'
	}),
	quote: createBlock({
		schema: { input: { text: z.string() },  },
		render: ({ text }) => <Quote text={text} />,
		description: 'Render a quote'
	}),
	image: createBlock({
		schema: { input: { src: z.string(), alt: z.string() },  },
		render: ({ src, alt }) => <Image src={src} alt={alt} />,
		description: 'Render an image'
	}),
	link: createBlock({
		schema: { input: { href: z.string(), text: z.string() }, },
		render: ({ href, text }) => <Link href={href} text={text} />,
		description: 'Render a link'
	}),

	// Layout blocks
	container: createBlock({
		schema: {
			input: { children: z.array(REACT_NODE), maxWidth: z.number() },
			
		},
		render: ({ children, maxWidth }) => <Container maxWidth={maxWidth}>{children}</Container>,
		description: 'Container with max width'
	}),
	stack: createBlock({
		schema: {
			input: { children: z.array(REACT_NODE), spacing: z.number() },
			
		},
		render: ({ children, spacing }) => <Stack spacing={spacing}>{children}</Stack>,
		description: 'Stack children vertically'
	}),
	grid: createBlock({
		schema: { input: { children: z.array(REACT_NODE), columns: z.number() }, },
		render: ({ children, columns }) => <Grid columns={columns}>{children}</Grid>,
		description: 'Grid layout'
	}),
	section: createBlock({
		schema: { input: { children: z.array(REACT_NODE) },  },
		render: ({ children }) => <Section>{children}</Section>,
		description: 'Semantic section'
	}),
	footer: createBlock({
		schema: { input: { children: z.array(REACT_NODE) },  },
		render: ({ children }) => <Footer>{children}</Footer>,
		description: 'Semantic footer'
	}),
	card: createBlock({
		schema: { input: { children: z.array(REACT_NODE) }, },
		render: ({ children }) => <Card>{children}</Card>,
		description: 'Card container'
	}),
	hero: createBlock({
		schema: { input: { children: z.array(REACT_NODE) },  },
		render: ({ children }) => <Hero>{children}</Hero>,
		description: 'Hero section'
	}),
}
