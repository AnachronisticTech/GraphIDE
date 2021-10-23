function get_function_calls_or_declarations(lines) {

    let function_add_in_points = new Map();

    for (let i = 0; i < lines.length; i++) {
        function_add_in_points[i] = []
    }

    while (true) {
        let lines_modified_counter = 0

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i]
                // Get lines with function calls
            let result = get_function_call_or_declaration(line)
            let modified_line = result[0];
            let function_add_in_pos = result[1];

            if (modified_line != undefined) {
                lines[i] = modified_line
                function_add_in_points[i].push(function_add_in_pos)

                lines_modified_counter += 1
            }
        }

        if (lines_modified_counter == 0) {
            break;
        }

    }

    return function_add_in_points
}

function get_function_call_or_declaration(line) {

    line = line.replace(/".*?"/g, (match) => {
        [...match].map(x => "_").join("")
    });

    let regex_match = line.match(/(\w*(<(\s*\w*s*,?)*>)?)\(\s*(\s*\S*\s*,)*(\s*\S*\s*)\s*\)/)
    if (regex_match) {
        if (!line.match(/^\s*(public|private|protected)/gm)) {
            if (!line.match(/^\s*\w*\s*\(\)/gm)) {

                let new_line = ""

                let match_span_0 = regex_match.index;
                let match_span_1 = match_span_0 + regex_match[0].length;
                //match_span = regex_match.span() // TODO: sort this out
                let function_add_in_pos = match_span_0

                function mkRange(start, end) {
                    // console.log(start)
                    // console.log(end)
                    // console.log([...Array(end).keys()])
                    return [...Array(end).keys()].slice(start);
                }

                let end_pos = match_span_0
                for (i of mkRange(match_span_0, match_span_1)) {
                    if (line[i] == "(") {
                        end_pos = i
                        break
                    }
                }


                new_line = [...line].map((char, index) => {
                    if (match_span_0 - 1 <= index && index <= end_pos + 1) {
                        return "_";
                    } else {
                        return char;
                    }
                }).join("");

                console.log({ line: line, new_line: new_line });

                //for (let j = 0; j < line.length; j++) {
                //    if (mkRange(match_span_0 - 1, end_pos + 1).includes(j)) {
                //        new_line = new_line + "_"
                //    } else {
                //        new_line = new_line + line[j]
                //    }
                //}

                return [new_line, function_add_in_pos]
            }
        }
    }

    return [undefined, undefined]
}

directory = "C:/Users/Jorel/Documents/GitHub/GraphIDE/FizzBuzzProject/"

file_path = directory + "FizzBuzzManager.java"



try {
    let data = require('fs').readFileSync(file_path, "utf8");

    //f = open(file_path, "r");

    lines = data.split("\n"); //f.readlines()



    function_add_in_points = get_function_calls_or_declarations(lines)

    console.log(function_add_in_points)


    //const output = javaMethodParser(data);
    //
    //if (verbose){
    //    console.log(JSON.stringify(output, null, 4));
    //}

    //return output;


} catch (err) {
    console.log("Error: ");
    console.log(err);
    //return undefined;
}