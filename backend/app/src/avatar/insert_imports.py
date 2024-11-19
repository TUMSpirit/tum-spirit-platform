import ast
from typing import List, Tuple, Union
from pathlib import Path

AVATAR_FUNCTIONS_PATH = "app/src/avatar/avatar_functions"
TRANSLATE_FUNCTIONS_PATH = "app/src/avatar/translate_functions.py"

def extract_imports(file_path: str) -> List[Tuple[str, Union[List[str], None]]]:
    # Read the Python file content
    with open(file_path, "r") as file:
        tree = ast.parse(file.read())

    imports = []

    # Traverse the AST nodes
    for node in ast.walk(tree):
        # Handle `import` statements
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append((alias.name, None))  # Whole module imported, `None` for specific content

        # Handle `from ... import ...` statements
        elif isinstance(node, ast.ImportFrom):
            module_name = node.module
            specific_imports = [alias.name for alias in node.names]  # List of specific contents imported
            imports.append((module_name, specific_imports))

    return imports


def update_auto_imports(file_path: str, new_imports: List[Tuple[str, Union[List[str], None]]]) -> None:
    # Read the original file
    with open(file_path, "r") as file:
        lines = file.readlines()

    # Locate `#auto imports` and `#end auto imports` markers
    auto_import_start = None
    auto_import_end = None
    for i, line in enumerate(lines):
        if line.strip() == "#auto imports":
            auto_import_start = i
        elif line.strip() == "#end auto imports":
            auto_import_end = i
            break

    # Error handling if markers are missing
    if auto_import_start is None:
        raise ValueError("No '#auto imports' section found in the file.")
    if auto_import_end is None:
        raise ValueError("No '#end auto imports' marker found in the file.")

    # Keep lines outside the auto-imports section
    updated_lines = lines[:auto_import_start + 1]  # Include `#auto imports` line

    # Insert the new imports in the specified format
    for library, specific_content in new_imports:
        if specific_content is None:
            updated_lines.append(f"import {library}\n")
        else:
            specific_imports = ", ".join(specific_content)
            updated_lines.append(f"from {library} import {specific_imports}\n")

    # Re-add the `#end auto imports` marker after new imports
    updated_lines.append("#end auto imports\n")

    # Add remaining lines after the auto-imports section
    updated_lines.extend(lines[auto_import_end + 1:])
    # Write the updated content back to the file
    with open(file_path, "w") as file:
        file.writelines(updated_lines)



def remove_duplicate_imports(imports: List[Tuple[str, Union[List[str], None]]]) -> List[
    Tuple[str, Union[List[str], None]]]:
    unique_imports = {}

    for library, specific_content in imports:
        if specific_content is None:
            # If entire library is imported, remove all specific imports for this library
            unique_imports[library] = None
        else:
            # If specific parts are imported, manage the parts list
            if library in unique_imports:
                if unique_imports[library] is not None:
                    # Only add new parts not already in the specific list
                    unique_imports[library].update(specific_content)
            else:
                # Initialize with a set for unique specific content parts
                unique_imports[library] = set(specific_content)

    # Prepare the final deduplicated imports list
    deduped_imports = []
    for library, specific_content in unique_imports.items():
        if specific_content is None:
            deduped_imports.append((library, None))
        else:
            deduped_imports.append((library, list(specific_content)))

    return deduped_imports

def list_python_scripts(folder_path: str):
    # Get all .py files in the folder
    return [file.name for file in Path(folder_path).glob("*.py")]


import_list = []
folder_path = AVATAR_FUNCTIONS_PATH
python_scripts = list_python_scripts(folder_path)
for script in python_scripts:
    import_list += extract_imports(AVATAR_FUNCTIONS_PATH + "/" + script)
import_list = remove_duplicate_imports(import_list)
update_auto_imports(TRANSLATE_FUNCTIONS_PATH,import_list)
