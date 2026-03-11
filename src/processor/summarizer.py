from openai import OpenAI
from src.config import OPENAI_API_KEY, OPENAI_BASE_URL, MODEL_NAME

client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)

def generate_quick_summary(paper):
    """Generate 3-sentence quick summary"""
    prompt = f"""Summarize this paper in exactly 3 sentences. Be concise and technical.

Title: {paper['title']}
Abstract: {paper['abstract']}

Format: Three clear sentences."""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=200
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating summary: {e}"

def generate_detailed_summary(paper):
    """Generate detailed summary"""
    prompt = f"""Provide a detailed technical summary of this paper covering:
1. Main contribution
2. Methodology
3. Key results
4. Significance

Title: {paper['title']}
Abstract: {paper['abstract']}

Keep it under 200 words."""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=400
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating detailed summary: {e}"

def enrich_papers(papers):
    """Add summaries to papers"""
    for paper in papers:
        print(f"Summarizing: {paper['title'][:50]}...")
        paper['quick_summary'] = generate_quick_summary(paper)
        paper['detailed_summary'] = generate_detailed_summary(paper)
    
    return papers
