import pandas as pd
import json
from pathlib import Path

def convert_json_to_excel(input_json_path, output_excel_path):
    # Read the JSON file
    with open(input_json_path, 'r') as f:
        data = json.load(f)
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Function to safely extract sentiment values
    def get_sentiment_label(x):
        if isinstance(x, dict):
            return x.get('label', '')
        return ''
    
    def get_sentiment_score(x):
        if isinstance(x, dict):
            return x.get('score', 0.0)
        return float(x) if isinstance(x, (int, float)) else 0.0
    
    # Flatten the sentiment dictionary into separate columns
    df['sentiment_label'] = df['sentiment'].apply(get_sentiment_label)
    df['sentiment_score'] = df['sentiment'].apply(get_sentiment_score)
    
    # Add numeric sentiment column
    sentiment_map = {
        'positive': 1,
        'neutral': 0,
        'negative': -1
    }
    df['sentiment_numeric'] = df['sentiment_label'].map(sentiment_map).fillna(0)
    
    # Drop the original sentiment column
    df = df.drop('sentiment', axis=1)
    
    # Write to Excel
    df.to_excel(output_excel_path, index=False)
    print(f"Successfully converted {input_json_path} to {output_excel_path}")

if __name__ == "__main__":
    # Get the current script's directory
    current_dir = Path(__file__).parent
    
    # Define input and output paths relative to the script location
    input_file = current_dir / "samples" / "comments_with_sentiment.json"
    output_file = current_dir / "samples" / "comments_with_sentiment.xlsx"
    
    # Convert the file
    convert_json_to_excel(str(input_file), str(output_file)) 