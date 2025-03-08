export function createIterator<T>(next: () => IteratorResult<T>) {
    return ({
        [Symbol.iterator] () {
            return this
        },
        next
    })
}

export function iteratorFilter<T>(iterator: Iterator<T>, filter: (value: T) => boolean) {
    return createIterator(() => {
        let res
        do {
            res = iterator.next()
        } while (!res.done && !filter(res.value))
        return res
    })
}

export function iteratorMap<T, M>(iterator: Iterator<T>, fmap: (value: T) => M) {
    return createIterator(() => {
            const { done, value } = iterator.next()
            return { done, value: done ? undefined : fmap(value) }
        }
    )
}
