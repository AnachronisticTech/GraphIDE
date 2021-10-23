import { readdir } from "fs/promises";
import { readFileSync } from "fs";
const javaMethodParser = require("./JAVA_PARSER.js");

class BaseAnalyzer {
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

    static analyzeDirectory(
        directory: string,
        parseOperation: (_: string) => void = function(_) {}
    ) {
        this.getFilePathsFromSourceDirectory(directory, filePaths => {
            for (let filePath of filePaths) {
                let contents = this.contentsOfFileAt(filePath)
                parseOperation(contents)
            }
        })
    }
}

export class JavaAnalyzer extends BaseAnalyzer {
    static analyze(directory: string) {
        this.analyzeDirectory(directory, fileContents => {
            console.log(JSON.stringify(javaMethodParser(fileContents)))
        })
    }
}
