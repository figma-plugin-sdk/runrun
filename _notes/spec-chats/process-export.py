# Write an executable script in any language you want called "chat-export-to-files" that takes 2 or 3 arguments:
#
#  - JSON_FILE         the path of a JSON file describind an array of objects, each with 2 properties: extension and code
#  - OUT_DIR           a directory where the files should be generated
#  - [FILE_NAME_Tpl]   Default: '${index + 1}.${extension}'. A template string for generating the file name
#
#  The script then:
#
#  - prints a help message explaining how to use the script when it is called with the wrong number of parameters, invalid parameters, a -h or --help option
#  - validates the JSON has the correct format
#  - for each item in the array, creates a file in OUT_DIR using the FILE_NAME_TPL
#  - asks before overriding any file
#  - reports how many files where generated

import os
import sys
import json

def print_help():
    print("""
    Usage: python chat-export-to-files.py JSON_FILE OUT_DIR [FILE_NAME_TPL]

    JSON_FILE: the path of a JSON file describing an array of objects, 
               each with 2 properties: extension and code

    OUT_DIR: a directory where the files should be generated

    FILE_NAME_TPL (optional): default: '{{index+1}}.{{extension}}'. 
    A template string for generating the file name. Expressions within {{ }} will be evaluated.
    """)

def evaluate_template(template, **kwargs):
    result = template
    for key, expression in kwargs.items():
        result = result.replace(f'{{{{{key}}}}}', str(eval(expression)))
    return result

def validate_json(data):
    if isinstance(data, list):
        for item in data:
            if not isinstance(item, dict):
                return False
            if 'extension' not in item or 'code' not in item:
                return False
        return True
    return False

def main():
    args = sys.argv
    if len(args) < 3 or len(args) > 4 or args[1] in ['-h', '--help']:
        return print_help()

    json_file, out_dir = args[1], args[2]
    tpl = args[3] if len(args) == 4 else 'recovered-{{index+1}}.{{extension}}'

    if not os.path.exists(json_file) or not os.path.isdir(out_dir):
        print("Invalid parameters")
        return print_help()

    with open(json_file, 'r') as f:
        data = json.load(f)
        if not validate_json(data):
            print("Invalid JSON format")
            return print_help()

        count = 0
        for i, item in enumerate(data):
            file_name = evaluate_template(tpl, index=i, extension=item['extension'])
            file_path = os.path.join(out_dir, file_name)

            if os.path.exists(file_path):
                response = input(f"File {file_name} already exists. Overwrite? (Y/N): ")
                if response.upper() != 'Y':
                    continue

            with open(file_path, 'w') as f:
                f.write(item['code'])
                count += 1

        print(f"{count} file(s) were generated")

if __name__ == "__main__":
    main()
