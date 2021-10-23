import {ProjectAnalyzer} from "./ProjectAnalyzer";
import { JavaAnalyzer } from "./Analyzers"

function add(x: number, y: number ) : number {
    return x + y;
}

console.log(add(2,3))
// ProjectAnalyzer.readSourceDirectory("FizzBuzzProject", true)
JavaAnalyzer.analyze("FizzBuzzProject")
