export class SourceClass {
    name: string
    // accessibilityModifier: string
    members: [string, string][]
    constructors: SourceFunction[]
    functions: SourceFunction[]
}

export class SourceFunction {
    name: string
    // accessibilityModifier: string
    parameters: [string, string][]
    calls: SourceFunction[]
    output: string
}

export class FunctionCall {
    caller: SourceFunction
    callee: SourceFunction
}
