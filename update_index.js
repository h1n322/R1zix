const fs = require('fs');
const path = 'riskmate-mobile/app/(tabs)/index.tsx';
let content = fs.readFileSync(path, 'utf8');

const fetchLogic = `  const [marketData, setMarketData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('https://rizix-api.onrender.com/api/market-overview')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((item, index) => ({
          id: String(index),
          symbol: item.ticker,
          price: item.price,
          change: item.change,
          isUp: item.isUp
        }));
        setMarketData(formatted);
      })
      .catch(err => console.error("Error fetching market data:", err))
      .finally(() => setIsLoading(false));
  }, []);
`;

content = content.replace(
  /const MARKET_DATA = \[[\s\S]*?\];/m,
  ''
);

content = content.replace(
  /export default function ExploreScreen\(\) \{/m,
  "export default function ExploreScreen() {\n" + fetchLogic
);

content = content.replace(
  /data=\{MARKET_DATA\}/g,
  "data={marketData}"
);

fs.writeFileSync(path, content, 'utf8');
