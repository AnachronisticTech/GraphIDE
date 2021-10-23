
/*
    - Reads from a source code directory:
        - All function names
        - Input types
        - Output types
    
    Produce JSON form:
        {
            [
                file_1:[
                    class_1:[
                        function_1:[
                            inputs:[
                                var_1: type,
                                var_2: type
                            ],
                            outputs:[
                                var_1: type,
                                var_2: type
                            ]
                        ],
                        function_2:[
                            inputs:[],
                            outputs:[]
                        ]
                    ],
                    class_2:[

                    ]
                ], 
                file_2:[],
                file_3: []
            ]
        }

*/

//const fs = require('fs')
import { readdir } from 'fs/promises';
import { readFileSync } from 'fs';
const javaMethodParser = require("./JAVA_PARSER.js");

type JavaMethod = {
    static : boolean,
    returnType : string,
    name : string,
    args : [{
        final : boolean,
        type : string,
        name : string
    }]
};

type JavaFile = {
    package : string,  // Pack age name
    name : string, // Class name
    methods : [JavaMethod]
};

export class ProjectAnalyzer {
    static async readSourceDirectory(directory: string = "", verbose: boolean = false) {
        console.log(`reading source directory ${directory}`);
        const files = await readdir(directory)
        for (let filePath of files) {
            ProjectAnalyzer.readFile(`${directory}/${filePath}`, verbose);
        }
    }

 

    // Reads a file and outputs a string
    static readFile(fileName : string, verbose: boolean = false) : JavaFile | undefined {
        let data;
        try {
            data = readFileSync(fileName, "utf8");
            const output = javaMethodParser(data);
            
            if (verbose){
                console.log(JSON.stringify(output, null, 4));
            }

            return output;
        

        } catch(err){
            console.log(err);
            return undefined;
        }
    } 
}       