import json

log_path = '/Users/max/.gemini/antigravity-cli/brain/4611b0f6-fdfb-46df-b1be-00a33f3488ef/.system_generated/logs/transcript_full.jsonl'
target_file = '/Users/max/Public/Riskmate/Riskmate/riskmate-front/src/pages/Dashboard.jsx'

with open(target_file, 'r') as f:
    content = f.read()

applied_count = 0
with open(log_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] == 'replace_file_content':
                        args = call['args']
                        if args['TargetFile'] == target_file:
                            target = args['TargetContent']
                            replacement = args['ReplacementContent']
                            if target in content:
                                content = content.replace(target, replacement)
                                applied_count += 1
                            else:
                                print(f"Warning: Target not found for a replacement! (Instruction: {args.get('Instruction')})")
        except:
            pass

with open('Dashboard_recovered.jsx', 'w') as f:
    f.write(content)

print(f"Applied {applied_count} replacements.")
