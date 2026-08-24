import json

log_path = '/Users/max/.gemini/antigravity-cli/brain/4611b0f6-fdfb-46df-b1be-00a33f3488ef/.system_generated/logs/transcript_full.jsonl'

lines = []
with open(log_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'content' in data and data['content']:
                if 'export default Dashboard;' in data['content']:
                    lines.append(data['content'])
        except:
            pass

if lines:
    print("Found full file in a generic response!")
    # Save the latest one
    with open('recovered.txt', 'w') as f:
        f.write(lines[-1])
else:
    print("No full file found.")
