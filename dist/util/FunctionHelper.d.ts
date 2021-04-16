export default class FunctionHelper {
    static getFunctionParameterNames(fn: () => unknown): RegExpMatchArray;
    static callFunctionWithArgumentNames(fn: () => unknown, args?: {
        [key: string]: unknown;
    }, context?: unknown): Promise<unknown>;
}
