'use server'

import { actions } from './index'

export const { signIn, signOut, sendMagicLink, getAuthConstants, getSession } = actions
