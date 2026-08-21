import os
from fpdf import FPDF
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def generate_pdf_report(metrics, chart_data, ticker):
    pdf = FPDF()
    pdf.add_page()
    
    pdf.set_font("Arial", 'B', size=16)
    pdf.cell(0, 15, f"RiskMate Report: {ticker.upper()}", ln=True, align='C')
    
    pdf.set_font("Arial", 'B', size=12)
    pdf.cell(0, 10, "Key Metrics:", ln=True)
    
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 8, f"Expected price: ${metrics['expected_price']}", ln=True)
    pdf.cell(0, 8, f"VaR (5%): ${metrics['var_5']}", ln=True)
    pdf.cell(0, 8, f"CVaR (5%): ${metrics['cvar_5']}", ln=True)
    pdf.cell(0, 8, f"Volatility: {metrics['volatility']}%", ln=True)
    
    plt.figure(figsize=(9, 4.5))
    prices = []
    for d in chart_data:
        if 'history' in d and d['history'] is not None:
            prices.append(d['history'])
        elif 'forecast' in d and d['forecast'] is not None:
            prices.append(d['forecast'])
            
    plt.plot(prices, color='#0A84FF', linewidth=2)
    plt.title(f"{ticker.upper()} Price Simulation")
    plt.xlabel("Days")
    plt.ylabel("Price ($)")
    plt.grid(True, linestyle='--', alpha=0.5)
    
    safe_ticker = ticker.replace(",", "_").replace(" ", "")
    temp_chart_name = f"temp_chart_{safe_ticker}.png"
    plt.savefig(temp_chart_name, format='png', dpi=150, bbox_inches='tight')
    plt.close() 
    
    pdf.ln(5)
    pdf.image(temp_chart_name, x=15, w=180)
    
    if os.path.exists(temp_chart_name):
        os.remove(temp_chart_name)
    
    try:
        return pdf.output(dest='S')
    except TypeError:
        return pdf.output()
