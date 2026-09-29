import os
import zipfile

client_dir = r"d:\raj-electric completed pg\New folder\main electric\client"
output_zip = r"d:\raj-electric completed pg\New folder\main electric\RAJA-ELECTRICALS-FRONTEND-HOSTINGER-FINAL.zip"

excluded_dirs = {'node_modules', '.git', 'test-results'}
excluded_files = {'.env.local', '.env'}

with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(client_dir):
        # Prune excluded dirs
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        
        for file in files:
            if file in excluded_files or file.endswith('.zip'):
                continue
            
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, client_dir)
            zipf.write(full_path, rel_path)

print(f"Zip created successfully: {output_zip}")
print(f"Size: {os.path.getsize(output_zip)} bytes")
