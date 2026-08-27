import os
import re

directories_to_scan = ["riskmate-front", "riskmate-mobile", "riskmate-ai-service"]
extensions = ('.jsx', '.js', '.ts', '.tsx', '.py', '.json')

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace RiskMate -> Rizix
    new_content = re.sub(r'RiskMate', 'Rizix', content)
    # Replace Riskmate -> Rizix
    new_content = re.sub(r'Riskmate', 'Rizix', new_content)
    # Replace riskmate -> rizix (useful for email, db names maybe - actually let's keep firebase as riskmate-ab32d to not break DB)
    
    # Let's be careful with lowercase riskmate.
    # We will replace riskmate.com -> rizix.com
    new_content = re.sub(r'riskmate\.com', 'rizix.com', new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for d in directories_to_scan:
    for root, _, files in os.walk(d):
        if 'node_modules' in root or '.git' in root or 'venv' in root or '.idea' in root:
            continue
        for file in files:
            if file.endswith(extensions):
                replace_in_file(os.path.join(root, file))
print("Done!")
