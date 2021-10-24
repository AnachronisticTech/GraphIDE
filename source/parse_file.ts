import { readFileSync } from 'fs';

export default function parseFile(file_path : string) : Map<number, number[]> {

    let function_add_in_points : Map<number, number[]> = new Map<number, number[]>();

    function get_function_calls_or_declarations(lines : string[]) : void {

        for (let i : number = 0; i < lines.length; i++) {
            function_add_in_points[i] = [];
        }

        while (true) {
            let lines_modified_counter : number = 0;

            for (let i : number = 0; i < lines.length; i++) {
                let line : string = lines[i];
                // Get lines with function calls
                let result : [string | undefined, number | undefined] = get_function_call_or_declaration(line);

                if (result[0] != undefined) {
                    lines[i] = result[0];
                    function_add_in_points[i].push(result[1]);

                    lines_modified_counter += 1;
                }
            }

            if (lines_modified_counter == 0) {
                break;
            }
        }
    }

    function get_function_call_or_declaration(line : string) : [string | undefined, number | undefined] {

        // Replace quoted text (including the quotes) with underscores
        line = line.replace(/".*?"/g, (match : string) => Array.from(match).map(x => "_").join(""));

        const regex_match = line.match(/(\w*(<(\s*\w*s*,?)*>)?)\(\s*(\s*\S*\s*,)*(\s*\S*\s*)\s*\)/);
        if (regex_match) {
            if (!line.match(/^\s*(public|private|protected)/gm) && !line.match(/^\s*\w*\s*\(\)/gm)) {
                const end_pos = line.indexOf("(", regex_match.index);

                const new_line = Array.from(line).map((char : string, index : number) =>
                    regex_match.index - 1 <= index && index <= end_pos + 1 ? "_" : char
                ).join("");

                return [new_line, regex_match.index];
            }
        }

        return [undefined, undefined];
    }

    try {
        get_function_calls_or_declarations(readFileSync(file_path, "utf8").split("\n"));
        //console.log(function_add_in_points);
    } catch (err) {
        console.log("Error: " + err);
    }

    return function_add_in_points;
}