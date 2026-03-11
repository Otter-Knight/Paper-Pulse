import json
import os
from datetime import datetime
from src.fetchers.arxiv import fetch_arxiv_papers
from src.fetchers.openreview import fetch_openreview_papers
from src.processor.filter import filter_papers
from src.processor.summarizer import enrich_papers
from src.config import ARXIV_MAX_RESULTS, OPENREVIEW_VENUES, RELEVANCE_THRESHOLD

def main():
    print("🚀 PaperPulse - Starting daily update...")
    
    # Fetch papers
    print("\n📥 Fetching papers from arXiv...")
    arxiv_papers = fetch_arxiv_papers(max_results=ARXIV_MAX_RESULTS)
    print(f"Found {len(arxiv_papers)} arXiv papers")
    
    print("\n📥 Fetching papers from OpenReview...")
    openreview_papers = fetch_openreview_papers(venues=OPENREVIEW_VENUES)
    print(f"Found {len(openreview_papers)} OpenReview papers")
    
    all_papers = arxiv_papers + openreview_papers
    print(f"\n📊 Total papers: {len(all_papers)}")
    
    # Filter papers
    print("\n🔍 Filtering papers by relevance...")
    filtered_papers = filter_papers(all_papers, threshold=RELEVANCE_THRESHOLD)
    print(f"Filtered to {len(filtered_papers)} relevant papers")
    
    # Enrich with summaries
    print("\n✨ Generating summaries...")
    enriched_papers = enrich_papers(filtered_papers)
    
    # Save results
    os.makedirs('data', exist_ok=True)
    output = {
        'generated_at': datetime.now().isoformat(),
        'total_papers': len(all_papers),
        'filtered_papers': len(enriched_papers),
        'papers': enriched_papers
    }
    
    with open('data/papers.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Done! Saved {len(enriched_papers)} papers to data/papers.json")

if __name__ == "__main__":
    main()
