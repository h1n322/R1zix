import re

with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# 1. Remove setAssetDetails(simData.stock_info) in LSTM
content = re.sub(r'setAssetDetails\(simData\.stock_info\);', '', content)

# 2. Remove setAssetDetails(null) in Markowitz
content = re.sub(r'setAssetDetails\(null\);', '', content)

# 3. Remove the old infoResp fetching logic in C# block
old_fetch_logic = r"""        // Спробуємо отримати AssetDetails з Python бекенду
        try {
          const infoResp = await fetch\(`http://127.0.0.1:8000/api/info/\$\{ticker\}`\);
          if \(infoResp.ok\) {
            const infoData = await infoResp.json\(\);
            setAssetDetails\(infoData\);
          } else {
            setAssetDetails\(null\);
          }
        } catch \(infoErr\) {
          console.warn\("Не вдалося завантажити AssetDetails", infoErr\);
          setAssetDetails\(null\);
        }"""
content = re.sub(old_fetch_logic, '', content)

# 4. Insert new fetching logic right before "} catch (err) {" at the end of runSimulation try block
# We need to find the try-catch block for runSimulation.
# The end of the try block looks like:
#         } catch (mlErr) {
#           console.warn("ML бекенд недоступний", mlErr);
#           setLstmForecast(null);
#         }
#       }
#     } catch (err) {

new_fetch_logic = """        } catch (mlErr) {
          console.warn("ML бекенд недоступний", mlErr);
          setLstmForecast(null);
        }
      }

      // --- FETCH ASSET DETAILS FOR ALL TICKERS ---
      try {
        const tickersToFetch = ticker.split(',').map(t => t.trim()).filter(t => t);
        const detailsList = [];
        for (const t of tickersToFetch) {
          try {
            const r = await fetch(`http://127.0.0.1:8000/api/info/${t}`);
            if (r.ok) {
              const data = await r.json();
              detailsList.push({ ticker: t, data: data });
            }
          } catch(e) {
            console.warn(`Не вдалося завантажити інфо для ${t}`);
          }
        }
        setAssetDetails(detailsList.length > 0 ? detailsList : null);
      } catch (e) {
        console.error("Помилка завантаження деталей", e);
      }

    } catch (err) {"""
content = content.replace("""        } catch (mlErr) {
          console.warn("ML бекенд недоступний", mlErr);
          setLstmForecast(null);
        }
      }
    } catch (err) {""", new_fetch_logic)


# 5. Update the UI rendering of AssetDetails
old_ui = """        {!isChartExpanded && algorithm !== 'markowitz' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px', marginBottom: '20px' }}>
            <AssetDetails details={assetDetails} />"""

new_ui = """        {!isChartExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px', marginBottom: '20px' }}>
            {assetDetails && assetDetails.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {assetDetails.map((item, idx) => (
                  <div key={idx}>
                    <h4 style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Деталі: {item.ticker}
                    </h4>
                    <AssetDetails details={item.data} />
                  </div>
                ))}
              </div>
            )}"""
content = content.replace(old_ui, new_ui)


with open('src/pages/Dashboard.jsx', 'w') as f:
    f.write(content)

