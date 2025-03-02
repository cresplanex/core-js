export const create = (s: string): Error => new Error(s)

export const methodUnimplemented = (): never => {
    throw create('Method unimplemented')
}

export const unexpectedCase = (): never => {
    throw create('Unexpected case')
}
