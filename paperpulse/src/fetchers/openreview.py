import requests
from datetime import datetime, timedelta

def fetch_openreview_papers(venues, days_back=7):
    """Fetch recent papers from OpenReview"""
    papers = []
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    for venue in venues:
        try:
            url = f"https://api.openreview.net/notes?invitation={venue}/-/Submission&details=replyCount"
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code != 200:
                continue
                
            notes = response.json().get('notes', [])
            cutoff_date = datetime.now() - timedelta(days=days_back)
            
            for note in notes:
                pub_date = datetime.fromtimestamp(note['cdate'] / 1000)
                
                if pub_date < cutoff_date:
                    continue
                content = note.get('content', {})
                papers.append({
                    "title": content.get('title', 'No Title'),
                    "authors": content.get('authors', []),
                    "abstract": content.get('abstract', ''),
                    "url": f"https://openreview.net/forum?id={note['id']}",
                    "pdf_url": f"https://openreview.net/pdf?id={note['id']}",
                    "published": pub_date.isoformat(),
                    "source": "OpenReview",
                    "venue": venue
                })
        except Exception as e:
            print(f"Error fetching from {venue}: {e}")
            continue
    
    return papers
