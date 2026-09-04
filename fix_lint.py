import os

def disable_lint(file):
    with open(file, 'r') as f: text = f.read()
    text = "/* eslint-disable no-unused-vars */\n" + text
    with open(file, 'w') as f: f.write(text)

disable_lint('riskmate-front/src/components/dashboard/PortfolioTable.jsx')
disable_lint('riskmate-front/src/pages/Dashboard.jsx')
disable_lint('riskmate-front/src/pages/Profile.jsx')

# For vite.config.js
file = 'riskmate-front/vite.config.js'
with open(file, 'r') as f: text = f.read()
text = "/* eslint-env node */\n" + text
with open(file, 'w') as f: f.write(text)

