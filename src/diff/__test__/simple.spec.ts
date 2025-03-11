import { 
    simpleDiffString, 
    patchString,
    simpleDiffArray, 
    patchArray,
    simpleDiffStringWithCursor 
} from '../simple';

describe('simpleDiffString', () => {
    test('returns no changes for identical strings', () => {
        const result = simpleDiffString('hello', 'hello');
        expect(result).toEqual({ index: 5, remove: 0, insert: '' });
        expect(patchString('hello', result)).toEqual('hello');
    });

    test('detects a single character change', () => {
        const result = simpleDiffString('hello', 'hellx');
        expect(result).toEqual({ index: 4, remove: 1, insert: 'x' });
        expect(patchString('hello', result)).toEqual('hellx');
    });

    test('detects character addition', () => {
        const result = simpleDiffString('hello', 'hello world');
        expect(result).toEqual({ index: 5, remove: 0, insert: ' world' });
        expect(patchString('hello', result)).toEqual('hello world');
    });

    test('detects character deletion', () => {
        const result = simpleDiffString('hello world', 'hello');
        expect(result).toEqual({ index: 5, remove: 6, insert: '' });
        expect(patchString('hello world', result)).toEqual('hello');
    });

    test('detects replacement of a substring', () => {
        const result = simpleDiffString('abcdef', 'abcXYZf');
        expect(result).toEqual({ index: 3, remove: 2, insert: 'XYZ' });
        expect(patchString('abcdef', result)).toEqual('abcXYZf');
    });

    test('handles high surrogate characters correctly', () => {
        const result = simpleDiffString('hello 😀 world', 'hello 😃 world');
        expect(result).toEqual({ index: 6, remove: 2, insert: '😃' }); // Emoji replacement
        expect(patchString('hello 😀 world', result)).toEqual('hello 😃 world');
    });

    test('handles low surrogate characters correctly', () => {
        const result = simpleDiffString('😀😃😄', '😀😅😄');
        expect(result).toEqual({ index: 2, remove: 2, insert: '😅' }); // Middle emoji change
        expect(patchString('😀😃😄', result)).toEqual('😀😅😄');
    });

    test('detects complete replacement', () => {
        const result = simpleDiffString('old string', 'new string');
        expect(result).toEqual({ index: 0, remove: 3, insert: 'new' });
        expect(patchString('old string', result)).toEqual('new string');
    });

    test('handles empty strings', () => {
        const result = simpleDiffString('', 'new string');
        expect(result).toEqual({ index: 0, remove: 0, insert: 'new string' });
        expect(patchString('', result)).toEqual('new string');
    });

    test('full string replacement', () => {
        const result = simpleDiffString('old string!', 'new string');
        expect(result).toEqual({ index: 0, remove: 11, insert: 'new string' });
        expect(patchString('old string!', result)).toEqual('new string');
    });
});

describe('simpleDiffArray', () => {
    test('returns no changes for identical arrays', () => {
        const result = simpleDiffArray([1, 2, 3], [1, 2, 3]);
        expect(result).toEqual({ index: 3, remove: 0, insert: [] });
        expect(patchArray([1, 2, 3], result)).toEqual([1, 2, 3]);
    });

    test('detects an element change', () => {
        const result = simpleDiffArray([1, 2, 3], [1, 2, 4]);
        expect(result).toEqual({ index: 2, remove: 1, insert: [4] });
        expect(patchArray([1, 2, 3], result)).toEqual([1, 2, 4]);
    });

    test('detects element addition', () => {
        const result = simpleDiffArray([1, 2, 3], [1, 2, 3, 4]);
        expect(result).toEqual({ index: 3, remove: 0, insert: [4] });
        expect(patchArray([1, 2, 3], result)).toEqual([1, 2, 3, 4]);
    });

    test('detects element removal', () => {
        const result = simpleDiffArray([1, 2, 3, 4], [1, 2, 3]);
        expect(result).toEqual({ index: 3, remove: 1, insert: [] });
        expect(patchArray([1, 2, 3, 4], result)).toEqual([1, 2, 3]);
    });

    test('detects multiple element changes', () => {
        const result = simpleDiffArray([1, 2, 3, 4, 5], [1, 2, 9, 10, 5]);
        expect(result).toEqual({ index: 2, remove: 2, insert: [9, 10] });
        expect(patchArray([1, 2, 3, 4, 5], result)).toEqual([1, 2, 9, 10, 5]);
    });

    test('detects full array replacement', () => {
        const result = simpleDiffArray([1, 2, 3], [4, 5, 6]);
        expect(result).toEqual({ index: 0, remove: 3, insert: [4, 5, 6] });
        expect(patchArray([1, 2, 3], result)).toEqual([4, 5, 6]);
    });

    test('full array replacement', () => {
        const result = simpleDiffArray([0, 1, 2, 6, 7, 8], [4, 5, 6, 7]);
        expect(result).toEqual({ index: 0, remove: 6, insert: [4, 5, 6, 7] });
        expect(patchArray([0, 1, 2, 6, 7, 8], result)).toEqual([4, 5, 6, 7]);
    });
});

describe('simpleDiffStringWithCursor', () => {
    test('returns no changes for identical strings', () => {
        const result = simpleDiffStringWithCursor('hello', 'hello', 3);
        expect(result).toEqual({ index: 3, remove: 0, insert: '' });
        expect(patchString('hello', result)).toEqual('hello');
    });

    test('detects a single character change before cursor', () => {
        const result = simpleDiffStringWithCursor('hello', 'hxllo', 2);
        expect(result).toEqual({ index: 1, remove: 1, insert: 'x' });
        expect(patchString('hello', result)).toEqual('hxllo');
    });

    test('detects a single character change after cursor', () => {
        const result = simpleDiffStringWithCursor('hello', 'helxo', 3);
        expect(result).toEqual({ index: 3, remove: 1, insert: 'x' });
        expect(patchString('hello', result)).toEqual('helxo');
    });

    test('detects text insertion at cursor', () => {
        const result = simpleDiffStringWithCursor('hello', 'helxlo', 3);
        expect(result).toEqual({ index: 3, remove: 0, insert: 'x' });
        expect(patchString('hello', result)).toEqual('helxlo');
    });

    test('detects text deletion before cursor', () => {
        const result = simpleDiffStringWithCursor('hello', 'hllo', 2);
        expect(result).toEqual({ index: 1, remove: 1, insert: '' });
        expect(patchString('hello', result)).toEqual('hllo');
    });

    test('detects text deletion after cursor', () => {
        const result = simpleDiffStringWithCursor('hello', 'helo', 3);
        expect(result).toEqual({ index: 3, remove: 1, insert: '' });
        expect(patchString('hello', result)).toEqual('helo');
    });

    test('detects text modification near cursor with surrogate pairs', () => {
        const result = simpleDiffStringWithCursor('hello 😀 world', 'hello 😃 world', 7);
        expect(result).toEqual({ index: 6, remove: 2, insert: '😃' });
        expect(patchString('hello 😀 world', result)).toEqual('hello 😃 world');
    });

    test('detects multiple character change with cursor in between', () => {
        const result = simpleDiffStringWithCursor('abcdefg', 'abXYZfg', 4);
        expect(result).toEqual({ index: 2, remove: 3, insert: 'XYZ' });
        expect(patchString('abcdefg', result)).toEqual('abXYZfg');
    });

    test('detects full string replacement', () => {
        const result = simpleDiffStringWithCursor('abcdef', 'ghijkl', 3);
        expect(result).toEqual({ index: 0, remove: 6, insert: 'ghijkl' });
        expect(patchString('abcdef', result)).toEqual('ghijkl');
    });
});
