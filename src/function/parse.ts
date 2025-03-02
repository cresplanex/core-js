// import { Parser } from "../vo/primitive";

interface FunctionParseResult {
    isMethod: boolean;
    methodName?: string;
    args?: string[];
    argCount?: number;
}

export function parseFunctionString(input: string): FunctionParseResult {
    const str = input.trim();
    const firstParenIndex = str.indexOf('(');
    const lastParenIndex = str.lastIndexOf(')');

    if (firstParenIndex === -1 || lastParenIndex === -1 || lastParenIndex < firstParenIndex) {
        return { isMethod: false };
    }

    const methodName = str.substring(0, firstParenIndex).trim();
    if (!methodName) {
        return { isMethod: false };
    }

    const argsStr = str.substring(firstParenIndex + 1, lastParenIndex);
    if (argsStr.trim() === "") {
        return {
        isMethod: true,
        methodName,
        args: [],
        argCount: 0,
        };
    }

    const args: string[] = [];
    let currentArg = "";
    let parenDepth = 0;

    for (let i = 0; i < argsStr.length; i++) {
        const char = argsStr[i];

        if (char === '(') {
        parenDepth++;
        } else if (char === ')') {
        parenDepth--;
        }

        if (char === ',' && parenDepth === 0) {
        if (currentArg.trim() === "") {
            throw new Error("Invalid argument: empty argument detected.");
        }
        args.push(currentArg.trim());
        currentArg = "";
        } else {
        currentArg += char;
        }
    }

    if (currentArg.trim() === "") {
        throw new Error("Invalid argument: empty argument detected.");
    }
    args.push(currentArg.trim());

    return {
        isMethod: true,
        methodName,
        args,
        argCount: args.length,
    };
}

// export function parse<Args extends Parser[]>(input: string, ...args: Args): Args {
//     args.forEach(arg => {
//         const val = arg.parse(input);
//     });
//     return args;
// }