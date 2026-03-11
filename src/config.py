import os

# Research interests and keywords
RESEARCH_INTERESTS = [
    "large language models",
    "multimodal learning",
    "reinforcement learning",
    "computer vision",
    "natural language processing"
]

KEYWORDS = [
    "LLM", "GPT", "transformer", "attention mechanism",
    "diffusion model", "CLIP", "vision-language",
    "RLHF", "prompt engineering", "few-shot learning"
]

# LLM API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini")

# Fetching Configuration
ARXIV_MAX_RESULTS = 100
OPENREVIEW_VENUES = ["ICLR.cc/2026/Conference", "NeurIPS.cc/2025/Conference"]

# Scoring threshold
RELEVANCE_THRESHOLD = 6.0  # 0-10 scale
