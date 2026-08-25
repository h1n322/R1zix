import re

with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# 1. Add Iconify import
if 'from "@iconify/react"' not in content:
    content = content.replace("import AssetDetails from '../components/dashboard/AssetDetails';", "import AssetDetails from '../components/dashboard/AssetDetails';\nimport { Icon } from '@iconify/react';")

# 2. Fix AI Analytics styling
old_ai = """        {(chartData && chartData.length > 0 && algorithm !== 'markowitz') && (
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #3b82f6' }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🧠 AI Аналітика
            </h3>"""

new_ai = """        {(chartData && chartData.length > 0 && algorithm !== 'markowitz') && (
          <div style={{ 
            backgroundColor: '#0B0E14', 
            padding: '20px 24px', 
            borderRadius: '16px', 
            marginBottom: '20px', 
            border: '1px solid #1F2937',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ 
              color: '#f8fafc', 
              marginTop: 0, 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(59, 130, 246, 0.15)', 
                color: '#3b82f6', 
                padding: '8px', 
                borderRadius: '10px' 
              }}>
                <Icon icon="lucide:brain-circuit" width="22" height="22" />
              </div>
              AI Аналітика
            </h3>"""

content = content.replace(old_ai, new_ai)

# 3. Fix Hedging styling
old_hedging = """            {hedging && (
              <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #10b981', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🛡 Ідея для хеджування (Black-Scholes)
                </h3>"""

new_hedging = """            {hedging && (
              <div style={{ 
                backgroundColor: '#0B0E14', 
                padding: '20px 24px', 
                borderRadius: '16px', 
                border: '1px solid #1F2937', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px' 
              }}>
                <h3 style={{ 
                  color: '#f8fafc', 
                  marginTop: 0, 
                  marginBottom: '4px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                    color: '#10b981', 
                    padding: '8px', 
                    borderRadius: '10px' 
                  }}>
                    <Icon icon="lucide:shield-check" width="22" height="22" />
                  </div>
                  Ідея для хеджування (Black-Scholes)
                </h3>"""
content = content.replace(old_hedging, new_hedging)

# 4. Fix ticker state to be empty initially and validation
old_ticker = "  const [ticker, setTicker] = useState('AAPL');"
new_ticker = "  const [ticker, setTicker] = useState('');"
content = content.replace(old_ticker, new_ticker)

old_validation = """  const runSimulation = async () => {
    setIsLoading(true);"""
new_validation = """  const runSimulation = async () => {
    if (!ticker.trim()) {
      toast.error('Будь ласка, оберіть або введіть тикер', { id: 'loading' });
      return;
    }
    setIsLoading(true);"""
content = content.replace(old_validation, new_validation)

with open('src/pages/Dashboard.jsx', 'w') as f:
    f.write(content)

