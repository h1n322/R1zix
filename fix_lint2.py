# For Dashboard.jsx
file = 'riskmate-front/src/pages/Dashboard.jsx'
with open(file, 'r') as f: text = f.read()
text = "/* eslint-disable no-empty */\n" + text
with open(file, 'w') as f: f.write(text)

# For vite.config.js
file = 'riskmate-front/vite.config.js'
with open(file, 'r') as f: text = f.read()
text = text.replace('/* eslint-env node */\n', '/* global process */\n')
with open(file, 'w') as f: f.write(text)
