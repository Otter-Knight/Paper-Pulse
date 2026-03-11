import re
from openai import OpenAI
from src.config import OPENAI_API_KEY, OPENAI_BASE_URL, MODEL_NAME, KEYWORDS, RESEARCH_INTERESTS

client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)

def keyword_prefilter(paper, keywords):
    """Quick keyword-based filtering"""
    text = f"{paper['title']} {paper['abstract']}".lower()
    return any(kw.lower() in text for kw in keywords)

def llm_score_relevance(paper, interests):
    """Use LLM to score paper relevance"""
    prompt = f"""Rate the relevance of this paper to these research interests: {', '.join(interests)}

Title: {paper['title']}
Abstract: {paper['abstract'][:500]}

Provide a relevance score from 0-10 and brief reasoning (one sentence).
Format: SCORE: X.X | REASON: your reasoning"""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=150
        )
        
        content = response.choices[0].message.content
        score_match = re.search(r'SCORE:\s*(\d+\.?\d*)', content)
        reason_match = re.search(r'REASON:\s*(.+)', content)
        
        score = float(score_match.group(1)) if score_match else 0.0
        reason = reason_match.group(1).strip() if reason_match else "No reason provided"
        
        return score, reason
    except Exception as e:
        print(f"Error scoring paper: {e}")
        return 0.0, "Error in scoring"

def filter_papers(papers, threshold=6.0):
    """Filter papers by relevance"""
    filtered = []
    
    # Prefilter with keywords
    prefiltered = [p for p in papers if keyword_prefilter(p, KEYWORDS)]
    print(f"Prefiltered: {len(prefiltered)}/{len(papers)} papers")
    
    for paper in prefiltered:
        score, reason = llm_score_relevance(paper, RESEARCH_INTERESTS)
        
        if score >= threshold:
            paper['relevance_score'] = score
            paper['relevance_reason'] = reason
            filtered.append(paper)
    
    return sorted(filtered, key=lambda x: x['relevance_score'], reverse=True)
