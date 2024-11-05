import json
from datetime import datetime
from decimal import Decimal
from uuid import UUID
import os


class File:
    def __init__(self, path: str)-> None:
        self.file = path    
        
    def write_json(self, obj: any)-> any:
        def default_serializer(o):
            if isinstance(o, (datetime,)):
                return o.isoformat()
            elif isinstance(o, (Decimal, UUID)):
                return str(o)
            elif isinstance(o, dict):
                # Recursively serialize dictionary values
                return {key: default_serializer(value) for key, value in o.items()}
            elif isinstance(o, list):
                # Recursively serialize list elements
                return [default_serializer(element) for element in o]
            elif hasattr(o, "__dict__"):
                # Serialize custom objects by serializing their __dict__
                return default_serializer(o.__dict__)
            elif hasattr(o, "__slots__"):
                # Serialize objects using __slots__
                return {slot: default_serializer(getattr(o, slot)) for slot in o.__slots__}
            else:
                return str(o)  # Fallback to string representation

        try:
            with open(self.file, 'w', encoding='utf-8') as file:
                json.dump(obj, file, default=default_serializer, ensure_ascii=False, indent=4)
            print(f"Object successfully written to {self.file}")
        except (TypeError, OverflowError) as e:
            print(f"Error serializing object: {e}")
        except IOError as e:
            print(f"Error writing to file: {e}")
        

class Directory:
    def __init__(self, path: str)-> None:
        self.path = path
        
    def get_directory(self, name: str)-> 'Directory':
        path = f"{self.path}/{name}"
        os.makedirs(path, exist_ok=True)
        return Directory(path)
    
    def get_file(self, name: str)-> 'File':
        return File(f"{self.path}/{name}")
    
    def get_timed_path(self, name: str)-> str:
        return f"{self.path}/{datetime.now().isoformat()}_{name}".replace(":", ".")
    
    def get_timed_file(self, name: str)-> 'File':
        return File(self.get_timed_path(name))
    
    def get_timed_directory(self, name: str)-> 'Directory':
        path = self.get_timed_path(name)
        os.makedirs(path, exist_ok=True)
        return Directory(path)    
    
    

