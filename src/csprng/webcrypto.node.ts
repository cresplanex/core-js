import { webcrypto } from 'node:crypto'

export const subtle = (webcrypto).subtle
export const getRandomValues = (webcrypto).getRandomValues.bind(webcrypto)