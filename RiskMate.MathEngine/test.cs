using System;
using System.Net.Http;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        var client = new HttpClient();
        client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
        long p1 = new DateTimeOffset(DateTime.UtcNow.AddYears(-3)).ToUnixTimeSeconds();
        long p2 = new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds();
        var url = $"https://query1.finance.yahoo.com/v8/finance/chart/KO?interval=1d&period1={p1}&period2={p2}";
        Console.WriteLine(url);
        var res = await client.GetAsync(url);
        Console.WriteLine((int)res.StatusCode);
    }
}
