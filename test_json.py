import pandas as pd
import io

df = pd.DataFrame({"Close": [1.0, 2.0]}, index=pd.to_datetime(["2020-01-01", "2020-01-02"]))
json_str = df.to_json(orient="split", date_format="iso")
df_loaded = pd.read_json(io.StringIO(json_str), orient="split")

for date, row in df_loaded.iterrows():
    print(type(date))
    try:
        date.isoformat()
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
