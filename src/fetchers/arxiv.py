import arxiv
from datetime import datetime, timedelta

def fetch_arxiv_papers(max_results=100, days_back=1):
    """Fetch recent papers from arXiv"""
    papers = []
    
    # Search in CS.AI, CS.LG, CS.CL categories
    categories = ["cs.AI", "cs.LG", "cs.CL", "cs.CV"]
    
    for category in categories:
        search = arxiv.Search(
            query=f"cat:{category}",
            max_results=max_results // len(categories),
            sort_by=arxiv.SortCriterion.SubmittedDate
        )
        
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        for result in search.results():
            if result.published.replace(tzinfo=None) < cutoff_date:
                continue
                
            papers.append({
                "title": result.title,
                "authors": [author.name for author in result.authors],
                "abstract": result.summary,
                "url": result.entry_id,
                "pdf_url": result.pdf_url,
                "published": result.published.isoformat(),
                "source": "arXiv",
                "categories": result.categories
            })
    
    return papers
