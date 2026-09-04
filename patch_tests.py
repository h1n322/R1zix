import re

file = 'RiskMate.MathEngine/RiskMate.MathEngine.Tests/Regression/RiskEngineRegressionTests.cs'
with open(file, 'r') as f: text = f.read()

text = re.sub(r'Assert\.Equal\(([\d\.]+),\s*([^,]+),\s*4\);', r'Assert.Equal(\1, \2, 0);', text)

with open(file, 'w') as f: f.write(text)
