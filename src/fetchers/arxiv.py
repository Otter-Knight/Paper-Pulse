import arxiv
from datetime import datetime, timedelta

def fetch_arxiv_papers(max_results=100, days_back=2, categories=None):
    """
    从 arXiv 抓取最新论文
    
    Args:
        max_results: 最大抓取数量
        days_back: 抓取最近几天的论文
        categories: 论文类别列表，如果为 None 则使用配置文件中的设置
    """
    papers = []
    
    # 使用配置文件中的类别
    if categories is None:
        categories = ["cs.AI", "cs.LG", "cs.CL", "cs.CV"]  # Default categories
    
    print(f"🔍 Searching in arXiv categories: {', '.join(categories)}")
    
    cutoff_date = datetime.now() - timedelta(days=days_back)
    
    for category in categories:
        try:
            search = arxiv.Search(
                query=f"cat:{category}",
                max_results=max_results // len(categories),
                sort_by=arxiv.SortCriterion.SubmittedDate
            )
            
            category_count = 0
            for result in search.results():
                # 只要最近几天的论文
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
                    "categories": result.categories,
                    "primary_category": result.primary_category
                })
                category_count += 1
            
            print(f"  📄 {category}: {category_count} papers")
            
        except Exception as e:
            print(f"❌ Error fetching from {category}: {e}")
            continue
    
    return papers
