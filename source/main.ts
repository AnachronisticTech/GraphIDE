import { JavaAnalyzer } from "./Analyzers"

let analyzer = new JavaAnalyzer()
analyzer.analyze("FizzBuzzProject", () => {
    console.log("OUTPUT:");
    console.log(analyzer.classes)
})
