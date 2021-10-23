import { readdir } from "fs/promises"
import { readFileSync } from "fs"
import { FunctionCall, SourceClass, SourceFunction } from "./LanguageConstructs"
const javaMethodParser = require("./JAVA_PARSER.js")

interface Analyzer {
    classes: SourceClass[]
    functionCalls: FunctionCall[]

    analyze(directory: string, onComplete: () => void): void
}

class BaseAnalyzer implements Analyzer {
    classes: SourceClass[] = []
    functionCalls: FunctionCall[] = []

    analyze(
        directory: string,
        onComplete: () => void = function() {}
    ) {
        throw new Error("Analyzer must override BaseAnalyzer.analyze(directory: string)")
    }

    protected static async getFilePathsFromSourceDirectory(
        directory: string,
        callback: (_: string[]) => void
    ) {
        const files = await readdir(directory)
        callback(files.map(fileName => `${directory}/${fileName}`))
    }

    protected static contentsOfFileAt(path: string): string | undefined {
        try {
            return readFileSync(path, "utf8")
        } catch (error) {
            console.log(`[ERROR] Failed to read file at ${path}`);
            console.log(error);
            return null
        }
    }

    protected static analyzeDirectory(
        directory: string,
        parseOperation: (_: string) => void = function(_) {},
        onComplete: () => void = function() {}
    ) {
        this.getFilePathsFromSourceDirectory(directory, filePaths => {
            for (let filePath of filePaths) {
                let contents = this.contentsOfFileAt(filePath)
                parseOperation(contents)
            }
            onComplete()
        })
    }
}

export class JavaAnalyzer extends BaseAnalyzer {
    analyze(
        directory: string,
        onComplete: () => void = function() {}
    ) {
        BaseAnalyzer.analyzeDirectory(
            directory, 
            fileContents => {
                let parsedClass = javaMethodParser(fileContents)
                let sourceClass = new SourceClass()
                sourceClass.name = parsedClass["name"]
                sourceClass.functions = parsedClass["methods"].map(method => {
                    let sourceFunction = new SourceFunction()
                    sourceFunction.name = method["name"]
                    sourceFunction.parameters = method["args"]
                        .map(param => [param["name"], param["type"]])
                    // MARK implement sourceFunction.calls here
                    sourceFunction.output = method["returnType"]
                    return sourceFunction
                })
                this.classes.push(sourceClass)
            },
            onComplete
        )
    }
}
