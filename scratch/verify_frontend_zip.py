import os
import sys
import zipfile
import tempfile
import shutil
import json

zip_path = r"d:\raj-electric completed pg\New folder\main electric\RAJA-ELECTRICALS-FRONTEND-HOSTINGER-FINAL.zip"

print(f"=== VALIDATING FRONTEND ZIP: {zip_path} ===")

if not os.path.exists(zip_path):
    print("ERROR: Zip file does not exist!")
    sys.exit(1)

zip_size_bytes = os.path.getsize(zip_path)
zip_size_mb = round(zip_size_bytes / (1024 * 1024), 2)
print(f"Zip File Size: {zip_size_bytes} bytes ({zip_size_mb} MB)")

temp_dir = tempfile.mkdtemp(prefix="frontend_zip_test_")
print(f"Extracting to temp directory: {temp_dir}")

try:
    with zipfile.ZipFile(zip_path, 'r') as zipf:
        zipf.extractall(temp_dir)
        file_list = zipf.namelist()

    # Check structure
    top_level_items = set(os.listdir(temp_dir))
    print(f"Top-level items in ZIP: {sorted(list(top_level_items))}")

    # Check dist exists and contains required files
    dist_dir = os.path.join(temp_dir, "dist")
    dist_exists = os.path.isdir(dist_dir)
    print(f"dist/ directory exists: {dist_exists}")

    dist_files = os.listdir(dist_dir) if dist_exists else []
    print(f"dist/ contents: {dist_files}")

    required_dist_items = ["index.html", "assets", "robots.txt", "sitemap.xml"]
    missing_dist_items = [item for item in required_dist_items if item not in dist_files]

    if missing_dist_items:
        print(f"ERROR: Missing items in dist/: {missing_dist_items}")
    else:
        print("PASS: All required dist/ items present!")

    # Check node_modules
    has_node_modules = "node_modules" in top_level_items or any("node_modules/" in f for f in file_list)
    print(f"node_modules present: {has_node_modules}")

    # Check for secret files or env files with secrets
    forbidden_files = [".env.local", ".env"]
    found_forbidden_files = [f for f in file_list if any(f.endswith(ff) or f == ff for ff in forbidden_files)]
    print(f"Forbidden env files found: {found_forbidden_files}")

    # Scan extracted text/JS/JSON/HTML files for forbidden strings
    forbidden_strings = {
        "yfbzapzceoqkwzsmsjmk": "Old Supabase project reference",
        "raj-ms.onrender.com": "Old Render URL reference",
        "sb_secret_": "Supabase secret key prefix",
        "service_role": "Supabase service_role key",
        "JWT_SECRET": "JWT Secret identifier in build",
        "SUPABASE_SECRET_KEY": "Supabase Secret Key identifier in build"
    }

    found_violations = {}
    for rule_key in forbidden_strings:
        found_violations[rule_key] = 0

    scanned_file_count = 0
    for root, _, files in os.walk(temp_dir):
        for file in files:
            file_path = os.path.join(root, file)
            ext = os.path.splitext(file)[1].lower()
            if ext in ['.js', '.html', '.css', '.json', '.env', '.example', '.production', '.txt', '.xml', '.mjs']:
                scanned_file_count += 1
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        for term in forbidden_strings:
                            if term in content:
                                found_violations[term] += 1
                                print(f"WARNING: Found '{term}' in {os.path.relpath(file_path, temp_dir)}")
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")

    print(f"Scanned {scanned_file_count} text/code/build files.")

    print("\n=== SUMMARY ===")
    print(f"BUILD STATUS: PASS")
    print(f"ZIP SIZE: {zip_size_mb} MB ({zip_size_bytes} bytes)")
    print(f"TOP LEVEL STRUCTURE: {sorted(list(top_level_items))}")
    print(f"OLD SUPABASE REFERENCES (yfbzapzceoqkwzsmsjmk): {found_violations['yfbzapzceoqkwzsmsjmk']}")
    print(f"OLD RENDER URLS (raj-ms.onrender.com): {found_violations['raj-ms.onrender.com']}")
    print(f"SECRETS FOUND: {sum(found_violations[k] for k in ['sb_secret_', 'service_role', 'JWT_SECRET', 'SUPABASE_SECRET_KEY'])}")
    print(f"NODE_MODULES FOUND: {has_node_modules}")
    print(f"FORBIDDEN ENV FILES: {found_forbidden_files}")

    all_clean = (
        dist_exists and
        not missing_dist_items and
        not has_node_modules and
        not found_forbidden_files and
        all(count == 0 for count in found_violations.values())
    )

    if all_clean:
        print("\n*** ALL CHECKS PASSED FOR FRONTEND ZIP ***")
    else:
        print("\n*** VALIDATION FAILED ***")

finally:
    shutil.rmtree(temp_dir, ignore_errors=True)
    print(f"Temporary extraction directory cleaned up: {temp_dir}")
