import json
from transformers import pipeline
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv
import gc
from tqdm import tqdm
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def load_comments(file_path='standardized_comments.json'):
    """Load comments from JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        raise
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON in file: {file_path}")
        raise

def analyze_sentiment(texts, sentiment_pipeline):
    """Analyze sentiment for a list of texts"""
    if not texts:
        return []
    
    # Process in smaller batches to avoid memory issues
    batch_size = 8  # Reduced batch size
    results = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        try:
            batch_results = sentiment_pipeline(batch)
            results.extend(batch_results)
        except Exception as e:
            logger.error(f"Error processing batch {i}: {str(e)}")
            # Continue with next batch
            continue
        
        # Force garbage collection after each batch
        gc.collect()
    
    return results

def process_comments_in_chunks(comments, sentiment_pipeline, chunk_size=1000):
    """Process comments in chunks and save results incrementally"""
    logger.info(f"Processing {len(comments)} comments in chunks of {chunk_size}...")
    
    # Create or clear the output file
    output_file = 'sentiment_analysis_results.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('[\n')  # Start JSON array
    
    total_processed = 0
    total_analyzed = 0
    all_sentiments = []
    
    # Process in chunks
    for i in tqdm(range(0, len(comments), chunk_size), desc="Processing chunks"):
        chunk = comments[i:i + chunk_size]
        processed_chunk = []
        
        # Process each comment in the chunk
        for comment in chunk:
            processed_comment = comment.copy()
            
            if 'comment' in comment:
                try:
                    # Analyze sentiment for the comment
                    sentiment = analyze_sentiment([comment['comment']], sentiment_pipeline)[0]
                    processed_comment['sentiment'] = {
                        'label': sentiment['label'],
                        'score': sentiment['score']
                    }
                    all_sentiments.append(sentiment)
                    total_analyzed += 1
                except Exception as e:
                    logger.error(f"Error processing comment: {str(e)}")
                    processed_comment['sentiment'] = {
                        'label': 'ERROR',
                        'score': 0.0
                    }
            
            processed_chunk.append(processed_comment)
            total_processed += 1
        
        # Save chunk results
        try:
            with open(output_file, 'a', encoding='utf-8') as f:
                if i > 0:
                    f.write(',\n')
                json.dump(processed_chunk, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error saving chunk results: {str(e)}")
        
        # Clear memory
        del processed_chunk
        gc.collect()
    
    # Close JSON array
    with open(output_file, 'a', encoding='utf-8') as f:
        f.write('\n]')
    
    # Calculate statistics
    if all_sentiments:
        positive_ratio = sum(1 for s in all_sentiments if s['label'] == 'POSITIVE') / len(all_sentiments)
        negative_ratio = sum(1 for s in all_sentiments if s['label'] == 'NEGATIVE') / len(all_sentiments)
        avg_score = np.mean([s['score'] for s in all_sentiments])
    else:
        positive_ratio = negative_ratio = avg_score = 0.0
    
    return {
        'total_processed': total_processed,
        'total_analyzed': total_analyzed,
        'positive_ratio': positive_ratio,
        'negative_ratio': negative_ratio,
        'avg_score': avg_score
    }

def main():
    try:
        # Load environment variables
        load_dotenv()
        
        # Get Hugging Face token
        hf_token = os.getenv('HUGGINGFACE_TOKEN')
        if not hf_token:
            raise ValueError("HUGGINGFACE_TOKEN not found in environment variables. Please set it in .env file")
        
        # Load the sentiment analysis pipeline
        logger.info("Loading sentiment analysis model...")
        sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            token=hf_token,
            device=-1  # Use CPU
        )
        
        # Load and process comments
        logger.info("Loading comments...")
        comments = load_comments()
        
        # Process comments in chunks and get statistics
        stats = process_comments_in_chunks(comments, sentiment_pipeline)
        
        # Print summary
        logger.info("\nSentiment Analysis Summary:")
        logger.info(f"Total comments processed: {stats['total_processed']}")
        logger.info(f"Comments analyzed: {stats['total_analyzed']}")
        logger.info(f"Comments skipped: {stats['total_processed'] - stats['total_analyzed']}")
        
        logger.info(f"\nOverall Sentiment:")
        logger.info(f"Positive ratio: {stats['positive_ratio']:.2%}")
        logger.info(f"Negative ratio: {stats['negative_ratio']:.2%}")
        logger.info(f"Average sentiment score: {stats['avg_score']:.3f}")
        
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise

if __name__ == "__main__":
    main()
