import os
import shutil
from pathlib import Path

def deduplicate_by_name(folder_path):
    folder_path = Path(folder_path)
    output_path = folder_path.parent / f"{folder_path.name}_unique"
    output_path.mkdir(exist_ok=True)

    seen_names = set()

    for filename in os.listdir(folder_path):
        file_path = folder_path / filename
        if file_path.is_file():
            base_name = filename.split('_')[1]
            if base_name not in seen_names:
                seen_names.add(base_name)
                shutil.copy(file_path, output_path / filename)

# Example usage
deduplicate_by_name('dataset/images')
