import ast
from mailbox import Message
from fastapi import APIRouter, Body, Depends, File, Form, UploadFile
from typing import Annotated, Any, Dict, List, Optional, Union
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from app.src.routers.auth import is_admin, User
from app.src.routers.auth import get_distinct_team_ids
from app.src.routers.avatar import validate_object_id
import io
from dotenv import load_dotenv
from app.config import MONGO_DB,MONGO_URI

AVATAR_FUNCTIONS_PATH = "app/src/avatar/avatar_functions.py"


def extract_functions_from_file(file_path):
    # Create a dictionary to store function names and their objects
    functions_dict = {}

    # Read the Python source file
    with open(file_path, "r") as file:
        source_code = file.read()

    # Parse the source code into an AST
    tree = ast.parse(source_code)

    # Iterate over the AST nodes to find function definitions (both sync and async)
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):  # Handle both sync and async functions
            # Get the function name
            func_name = node.name
            
            # Use `exec` to create a local environment where the function gets defined
            local_env = {}
            exec(compile(ast.Module([node], []), filename="<ast>", mode="exec"), globals(), local_env)
            
            # Get the function object from the local environment
            functions_dict[func_name] = local_env[func_name]

    return functions_dict

def map_python_type_to_gpt_type(annotation):
    """Maps Python AST types to GPT-compatible types, handling complex types like List and Optional."""
    if isinstance(annotation, ast.Name):
        # Handle basic types like int, str, float, bool
        if annotation.id == 'int':
            return "integer"
        elif annotation.id == 'str':
            return "string"
        elif annotation.id == 'float':
            return "number"
        elif annotation.id == 'bool':
            return "boolean"
        elif annotation.id == 'UploadFile':
            return "string"  # Represent UploadFile as a string
        else:
            return "string"  # Default to string for unknown types

    elif isinstance(annotation, ast.Subscript):
        if isinstance(annotation.value, ast.Name):
            base_type = annotation.value.id

            # Handle Optional type (usually represented as Union in Python AST)
            if base_type == 'Optional':
                inner_type = map_python_type_to_gpt_type(annotation.slice)
                # Indicate that the type can be null by using an array of types
                return ["null", inner_type] if isinstance(inner_type, str) else inner_type

            # Handle List type
            elif base_type == 'List':
                element_type = map_python_type_to_gpt_type(annotation.slice)
                return {
                    "type": "array",
                    "items": {"type": element_type}
                }

    return "string"  # Default to string if type is unknown

def extract_function_strings_from_python_file(file_path):
    with open(file_path, "r") as f:
        file_content = f.read()

    # Parse the Python file content using AST (Abstract Syntax Tree)
    tree = ast.parse(file_content)
    tools = []

    # Loop through all the top-level nodes in the AST
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            function_name = node.name
            docstring = ast.get_docstring(node) or "No description available"

            params = {}
            required_params = []

            # Extract argument names and defaults
            arg_names = [arg.arg for arg in node.args.args]
            default_values = [None] * (len(arg_names) - len(node.args.defaults)) + node.args.defaults

            # Process each argument
            for arg, default in zip(node.args.args, default_values):
                param_name = arg.arg
                if param_name == 'self' or param_name == 'db':  # Skip 'self' in class methods
                    continue

                # Detect parameter type via type annotations
                param_type = map_python_type_to_gpt_type(arg.annotation) if arg.annotation else "string"

                # If param_type is a dict (e.g., for lists), merge it directly; otherwise, use "type"
                if isinstance(param_type, dict):
                    param_info = {**param_type, "description": f"Parameter {param_name}"}
                else:
                    param_info = {
                        "type": param_type,
                        "description": f"Parameter {param_name}"
                    }

                # Add to required params if no default value is provided
                if default is None:
                    required_params.append(param_name)

                params[param_name] = param_info

            # Define function schema
            function_tool = {
                "type": "function",
                "function": {
                    "name": function_name,
                    "description": docstring,
                    "parameters": {
                        "type": "object",
                        "properties": params,
                        "required": required_params,
                        "additionalProperties": False
                    }
                }
            }
            tools.append(function_tool)

    return tools

def extract_avatar_function_strings():
    return extract_function_strings_from_python_file(AVATAR_FUNCTIONS_PATH)

def extract_avatar_functions():
    return extract_functions_from_file(AVATAR_FUNCTIONS_PATH)


