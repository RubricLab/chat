import { brand } from '@rubriclab/shapes'
import z from 'zod/v4'

export const raw = brand('raw', false)

export const raw_string = raw(z.string())

export const raw_number = raw(z.number())

export const url = brand('url', false)(z.string())
