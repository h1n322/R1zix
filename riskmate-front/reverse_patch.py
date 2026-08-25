import re

with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# 1. Restore setAssetDetails(simData.stock_info) in LSTM
# It was around setChartData(simData.chart_data);
content = re.sub(r'(setChartData\(simData\.chart_data\);)', r'\1\n        setAssetDetails(simData.stock_info);', content)

# 2. Restore setAssetDetails(null) in Markowitz
# It was around setHistogramData([]);
content = re.sub(r'(setHistogramData\(\[\]\);)', r'\1\n          setAssetDetails(null);', content)

# 3. Restore the old infoResp fetching logic in C# block
old_csharp_end = """        toast.success('Симуляцію завершено!', { id: loadingToast });

        // Спробуємо отримати AssetDetails з Python бекенду
        try {
          const infoResp = await fetch(`http://127.0.0.1:8000/api/info/${ticker}`);
          if (infoResp.ok) {
            const infoData = await infoResp.json();
            setAssetDetails(infoData);
          } else {
            setAssetDetails(null);
          }
        } catch (infoErr) {
          console.warn("Не вдалося завантажити AssetDetails", infoErr);
          setAssetDetails(null);
        }

        // Спробуємо отримати LSTM прогноз з Python бекенду"""
content = re.sub(r'        toast\.success\(\'Симуляцію завершено!\', \{ id: loadingToast \}\);\n\n        // Спробуємо отримати LSTM прогноз з Python бекенду', old_csharp_end, content)

# 4. Remove the FETCH ASSET DETAILS FOR ALL TICKERS block
multi_fetch = r"""      // --- FETCH ASSET DETAILS FOR ALL TICKERS ---
      try \{
        const tickersToFetch = ticker\.split\(\',\'\)\.map\(t => t\.trim\(\)\)\.filter\(t => t\);
        const detailsList = \[\];
        for \(const t of tickersToFetch\) \{
          try \{
            const r = await fetch\(`http://127\.0\.0\.1:8000/api/info/\$\{t\}`\);
            if \(r\.ok\) \{
              const data = await r\.json\(\);
              detailsList\.push\(\{ ticker: t, data: data \}\);
            \}
          \} catch\(e\) \{
            console\.warn\(`Не вдалося завантажити інфо для \$\{t\}`\);
          \}
        \}
        setAssetDetails\(detailsList\.length > 0 \? detailsList : null\);
      \} catch \(e\) \{
        console\.error\("Помилка завантаження деталей", e\);
      \}"""
content = re.sub(multi_fetch + r'\n\n', '', content)

# 5. Restore savePortfolio
save_old = r"""        // Мапимо деталі компанії \(C# очікує масив\)
        assetDetails: \(assetDetails && Array\.isArray\(assetDetails\)\) \? assetDetails\.map\(ad => \(\{
          ticker: ad\.ticker || ticker,
          companyName: \'\',
          sector: \'\',
          currentPrice: 0
        \}\)\) : \[\],"""
save_new = """        // Мапимо деталі компанії (C# очікує масив)
        assetDetails: assetDetails ? [{
          ticker: assetDetails.symbol || ticker,
          companyName: assetDetails.shortName || '',
          sector: assetDetails.sector || '',
          currentPrice: assetDetails.currentPrice || 0
        }] : [],"""
content = re.sub(save_old, save_new, content)

# 6. Restore loadPortfolio
load_old = r"""    // Відновлюємо деталі активу
    if \(data\.assetDetails && data\.assetDetails\.length > 0\) \{
      // Not fully restored because API data structure differs, so we keep it null to avoid breaking UI\.
      // We could trigger a re-fetch here if we wanted\.
      setAssetDetails\(null\);
    \} else \{
      
    \}"""
load_new = """    // Відновлюємо деталі активу
    if (data.assetDetails && data.assetDetails.length > 0) {
      setAssetDetails({
        symbol: data.assetDetails[0].ticker,
        shortName: data.assetDetails[0].companyName,
        sector: data.assetDetails[0].sector,
        currentPrice: data.assetDetails[0].currentPrice
      });
    } else {
      setAssetDetails(null);
    }"""
content = re.sub(load_old, load_new, content)

# 7. Restore the UI rendering of AssetDetails
ui_old = r"""        \{!isChartExpanded && \(
          <div style=\{\{ display: \'flex\', flexDirection: \'column\', gap: \'20px\', marginTop: \'20px\', marginBottom: \'20px\' \}\}>
            \{assetDetails && assetDetails\.length > 0 && \(
              <div style=\{\{ display: \'flex\', flexDirection: \'column\', gap: \'15px\' \}\}>
                \{assetDetails\.map\(\(item, idx\) => \(
                  <div key=\{idx\}>
                    <h4 style=\{\{ color: \'#94a3b8\', margin: \'0 0 10px 0\', fontSize: \'14px\', textTransform: \'uppercase\', letterSpacing: \'1px\' \}\}>
                      Деталі: \{item\.ticker\}
                    </h4>
                    <AssetDetails details=\{item\.data\} />
                  </div>
                \)\)\}
              </div>
            \)\}"""
ui_new = """        {!isChartExpanded && algorithm !== 'markowitz' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px', marginBottom: '20px' }}>
            <AssetDetails details={assetDetails} />"""
content = re.sub(ui_old, ui_new, content)

with open('src/pages/Dashboard.jsx', 'w') as f:
    f.write(content)
