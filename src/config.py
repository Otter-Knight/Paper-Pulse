import os

# ===== 🎯 个人研究偏好配置 =====
# 你可以根据自己的兴趣修改以下内容

# 主要研究领域（用于 LLM 评分）
RESEARCH_INTERESTS = [
    "large language models",           # 大语言模型
    "multimodal learning",            # 多模态学习
    "computer vision",                # 计算机视觉
    "natural language processing",    # 自然语言处理
    "reinforcement learning",         # 强化学习
    # 👆 添加你感兴趣的研究领域
]

# 关键词过滤（用于初步筛选，节省 API 成本）
KEYWORDS = [
    # AI 基础
    "LLM", "GPT", "transformer", "attention", "BERT", "T5",
    
    # 视觉相关
    "diffusion model", "CLIP", "vision-language", "image generation",
    "object detection", "segmentation", "ViT",
    
    # 训练方法
    "RLHF", "prompt engineering", "few-shot", "in-context learning",
    "fine-tuning", "parameter-efficient",
    
    # 应用领域
    "code generation", "reasoning", "mathematical", "multimodal",
    
    # 👆 添加你关心的技术关键词（不区分大小写）
]

# arXiv 类别过滤
ARXIV_CATEGORIES = [
    "cs.AI",    # Artificial Intelligence
    "cs.LG",    # Machine Learning  
    "cs.CL",    # Computation and Language
    "cs.CV",    # Computer Vision
    # "cs.RO",  # Robotics - 取消注释如果你关心机器人
    # "cs.IR",  # Information Retrieval - 取消注释如果你关心信息检索
    # "stat.ML", # Statistics - Machine Learning
]

# OpenReview 会议列表（当前可用的）
OPENREVIEW_VENUES = [
    "ICLR.cc/2025/Conference",        # ICLR 2025
    "NeurIPS.cc/2024/Conference",     # NeurIPS 2024
    # "ICML.cc/2024/Conference",      # 如需要可添加其他会议
    # "AAAI.cc/2024/Conference",
]

# ===== ⚙️ 系统配置 =====

# LLM API 配置
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini")

# 抓取配置
ARXIV_MAX_RESULTS = 100              # 每个类别最多抓取论文数
OPENREVIEW_DAYS_BACK = 7             # 抓取最近几天的论文
ARXIV_DAYS_BACK = 2                  # 抓取最近几天的论文

# 评分阈值（0-10 分）
RELEVANCE_THRESHOLD = 6.0            # 只推荐评分>=6分的论文

# ===== 📊 用户配置示例 =====
"""
不同研究方向的配置示例：

🔬 计算机视觉研究者：
RESEARCH_INTERESTS = ["computer vision", "image generation", "object detection", "video understanding"]
KEYWORDS = ["CLIP", "diffusion", "ViT", "YOLO", "segmentation", "detection"]
ARXIV_CATEGORIES = ["cs.CV", "cs.AI", "cs.LG"]

🗣️ NLP 研究者：  
RESEARCH_INTERESTS = ["natural language processing", "large language models", "dialogue systems"]
KEYWORDS = ["LLM", "GPT", "BERT", "transformer", "prompt", "reasoning", "dialogue"]
ARXIV_CATEGORIES = ["cs.CL", "cs.AI", "cs.LG"]

🤖 强化学习研究者：
RESEARCH_INTERESTS = ["reinforcement learning", "robotics", "game theory", "multi-agent systems"]
KEYWORDS = ["RL", "Q-learning", "policy gradient", "actor-critic", "MCTS", "robotics"]
ARXIV_CATEGORIES = ["cs.AI", "cs.LG", "cs.RO"]

💼 AI 应用研究者：
RESEARCH_INTERESTS = ["AI applications", "industry AI", "recommender systems", "AI safety"]
KEYWORDS = ["recommendation", "production", "deployment", "safety", "alignment", "federated"]
ARXIV_CATEGORIES = ["cs.AI", "cs.IR", "cs.LG"]
"""
