module.exports = {
    parseFile: function(file_path) {

        let function_add_in_points = new Map();

        function get_function_calls_or_declarations(lines) {

            for (let i = 0; i < lines.length; i++) {
                function_add_in_points[i] = [];
            }

            while (true) {
                let lines_modified_counter = 0;

                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    // Get lines with function calls
                    let result = get_function_call_or_declaration(line);
                    let modified_line = result[0];
                    let function_add_in_pos = result[1];

                    if (modified_line != undefined) {
                        lines[i] = modified_line;
                        function_add_in_points[i].push(function_add_in_pos);

                        lines_modified_counter += 1;
                    }
                }

                if (lines_modified_counter == 0) {
                    break;
                }
            }
        }

        function get_function_call_or_declaration(line) {

            line = line.replace(/".*?"/g, (match) => {
                [...match].map(x => "_").join("")
            });

            let regex_match = line.match(/(\w*(<(\s*\w*s*,?)*>)?)\(\s*(\s*\S*\s*,)*(\s*\S*\s*)\s*\)/);
            if (regex_match) {
                if (!line.match(/^\s*(public|private|protected)/gm)) {
                    if (!line.match(/^\s*\w*\s*\(\)/gm)) {
                        const end_pos = line.indexOf("(", regex_match.index);

                        const new_line = [...line].map((char, index) =>
                            regex_match.index - 1 <= index && index <= end_pos + 1 ? "_" : char
                        ).join("");

                        return [new_line, regex_match.index];
                    }
                }
            }

            return [undefined, undefined];
        }


        try {
            let data = require('fs').readFileSync(file_path, "utf8");
            get_function_calls_or_declarations(data.split("\n"))

            console.log(function_add_in_points);
        } catch (err) {
            console.log("Error: " + err);
        }
    }
}