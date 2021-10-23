import re


def get_function_calls_or_declarations(lines):

    function_add_in_points = {}

    for i in range(len(lines)):
        function_add_in_points[i] = []

    while True:

        lines_modified_counter = 0

        for i in range(len(lines)):
            line = lines[i]
            # Get lines with function calls
            modified_line, function_add_in_pos = get_function_call_or_declaration(line)
            
            if modified_line is not None:
                lines[i] = modified_line
                function_add_in_points[i].append(function_add_in_pos)
                
                lines_modified_counter += 1

        if lines_modified_counter == 0:
            break

    return function_add_in_points


def remove_in_line_strings(line):

    positions = []
    for i in range(len(line)):
        if line[i] == "\"" and line [i-1] != "\\":
            positions.append(i)

    new_line = ""

    del_mode = False
    for j in range(len(line)):

        ignore_just_once = False
        if len(positions) > 0 and j == positions[0]:
            del_mode = not del_mode
            positions = positions[1:]
            new_line += "_"
            ignore_just_once = True

        if not ignore_just_once:
            if del_mode:
                new_line += "_"
            else:
                new_line += line[j]

    return new_line

def get_function_call_or_declaration(line):

    line = remove_in_line_strings(line)


    regex_match = re.search(r"(\w*(<(\s*\w*s*,?)*>)?)\(\s*(\s*\S*\s*,)*(\s*\S*\s*)\s*\)",line)
    if regex_match:
        if not re.search(r"^\s*(public|private|protected)",line):
            if not re.search(r"^\s*\w*\s*\(\)", line):

                new_line= ""
                match_span = regex_match.span()
                function_add_in_pos = match_span[0]
                
                end_pos = match_span[0]
                for i in range(match_span[0],match_span[1]):
                    if(line[i] == "("):
                        end_pos = i
                        break
                    

                for j in range(len(line)):  
                    if j in [k for k in range(match_span[0]-1,end_pos+1)]:
                        new_line = new_line + "_"
                    else:
                        new_line = new_line + line[j]

                return new_line, function_add_in_pos
    
    return None, None

directory = "C:/Users/Jorel/Documents/GitHub/GraphIDE/FizzBuzzProject/"

file_path = directory+"FizzBuzz.java"

f =  open(file_path, "r");

lines = f.readlines()



function_add_in_points = get_function_calls_or_declarations(lines)

print(function_add_in_points)

            

