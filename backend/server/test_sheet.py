import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

sheet_id = os.getenv("GOOGLE_SHEET_ID")
sheet_range = os.getenv("GOOGLE_SHEET_RANGE")
sheet_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv"
if sheet_range:
    sheet_url += f"&range={sheet_range}"

print("Connecting to URL:", sheet_url)

try:
    df = pd.read_csv(sheet_url)
    print("\n✅ CONNECTION SUCCESSFUL!")
    print(f"Found {len(df)} rows of job postings.")
    print("\nDetected Column Names:")
    print(list(df.columns))
    print("\nFirst row sample:")
    print(df.iloc[0].to_dict() if len(df) > 0 else "Sheet is completely empty!")
except Exception as e:
    print("\n❌ CONNECTION FAILED!")
    print("Error details:", str(e))
    print("Tip: Make sure your sheet is shared as 'Anyone with the link can view'.")