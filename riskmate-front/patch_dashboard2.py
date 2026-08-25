import re

with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# Fix savePortfolio
old_save = """        // Мапимо деталі компанії (C# очікує масив)
        assetDetails: assetDetails ? [{
          ticker: assetDetails.symbol || ticker,
          companyName: assetDetails.shortName || '',
          sector: assetDetails.sector || '',
          currentPrice: assetDetails.currentPrice || 0
        }] : [],"""

new_save = """        // Мапимо деталі компанії (C# очікує масив)
        assetDetails: (assetDetails && Array.isArray(assetDetails)) ? assetDetails.map(ad => ({
          ticker: ad.ticker || ticker,
          companyName: '',
          sector: '',
          currentPrice: 0
        })) : [],"""

content = content.replace(old_save, new_save)

# Fix loadPortfolio
old_load = """    // Відновлюємо деталі активу
    if (data.assetDetails && data.assetDetails.length > 0) {
      setAssetDetails({
        symbol: data.assetDetails[0].ticker,
        shortName: data.assetDetails[0].companyName,
        sector: data.assetDetails[0].sector,
        currentPrice: data.assetDetails[0].currentPrice
      });
    } else {"""

new_load = """    // Відновлюємо деталі активу
    if (data.assetDetails && data.assetDetails.length > 0) {
      // Not fully restored because API data structure differs, so we keep it null to avoid breaking UI.
      // We could trigger a re-fetch here if we wanted.
      setAssetDetails(null);
    } else {"""

content = content.replace(old_load, new_load)

with open('src/pages/Dashboard.jsx', 'w') as f:
    f.write(content)

