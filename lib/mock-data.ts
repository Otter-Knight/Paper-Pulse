// Mock data for Paper Pulse when USE_MOCK_DATA=true

export interface MockPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  source: "arxiv" | "openreview";
  sourceUrl: string;
  pdfUrl: string;
  tags: string[];
  highlights: string[];
  publishedAt: string;
  createdAt: string;
  venue?: string; // Added: conference or journal name like CVPR, NeurIPS, IEEE, etc.
}

// Common AI/ML venues
export const VENUES = [
  { id: "cvpr", name: "CVPR", category: "Computer Vision" },
  { id: "iccv", name: "ICCV", category: "Computer Vision" },
  { id: "eccv", name: "ECCV", category: "Computer Vision" },
  { id: "neurips", name: "NeurIPS", category: "Machine Learning" },
  { id: "iclr", name: "ICLR", category: "Machine Learning" },
  { id: "icml", name: "ICML", category: "Machine Learning" },
  { id: "aaai", name: "AAAI", category: "AI" },
  { id: "ijcai", name: "IJCAI", category: "AI" },
  { id: "acl", name: "ACL", category: "NLP" },
  { id: "emnlp", name: "EMNLP", category: "NLP" },
  { id: "naacl", name: "NAACL", category: "NLP" },
  { id: "arxiv", name: "arXiv", category: "Preprint" },
  { id: "openreview", name: "OpenReview", category: "Preprint" },
  { id: "ieee", name: "IEEE", category: "Journal" },
  { id: "nature", name: "Nature", category: "Journal" },
  { id: "science", name: "Science", category: "Journal" },
];

export const mockPapers: MockPaper[] = [
  {
    id: "1",
    title: "Transformer Language Models: A Comprehensive Survey",
    authors: ["John Smith", "Jane Doe", "Alice Johnson"],
    abstract: "This paper presents a comprehensive survey of transformer-based language models, covering architecture innovations, training methodologies, and emerging applications. We analyze the evolution from BERT to GPT variants, examining key improvements in attention mechanisms, positional encodings, and scaling laws. Our survey includes a detailed comparison of open-source and commercial models, evaluating their performance across various NLP benchmarks.",
    source: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2401.12345",
    pdfUrl: "https://arxiv.org/pdf/2401.12345.pdf",
    tags: ["NLP", "Transformers", "Language Models", "Survey"],
    highlights: [
      "Comprehensive analysis of transformer architectures from 2017-2024",
      "Detailed comparison of 50+ language models across benchmarks",
      "New taxonomy for categorizing transformer variants",
    ],
    publishedAt: "2024-01-15T12:00:00Z",
    createdAt: "2024-01-15T14:00:00Z",
    venue: "NeurIPS",
  },
  {
    id: "2",
    title: "Efficient Attention Mechanisms for Long-Context Processing",
    authors: ["Wei Zhang", "Sarah Chen", "Michael Park"],
    abstract: "We propose a novel attention mechanism that enables efficient processing of long sequences up to 100k tokens. Our method, called Sparse Linear Attention (SLA), combines the benefits of sparse attention patterns with linear complexity computation. Experimental results show 3x speedup over standard attention while maintaining comparable accuracy on language understanding tasks.",
    source: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2401.12346",
    pdfUrl: "https://arxiv.org/pdf/2401.12346.pdf",
    tags: ["Deep Learning", "Attention", "Efficiency", "Long Sequences"],
    highlights: [
      "Novel Sparse Linear Attention with O(n) complexity",
      "Successfully processes 100k token sequences",
      "3x speedup with minimal accuracy loss",
    ],
    publishedAt: "2024-01-14T12:00:00Z",
    createdAt: "2024-01-14T14:00:00Z",
    venue: "ICML",
  },
  {
    id: "3",
    title: "Reinforcement Learning from Human Feedback: Methods and Benchmarks",
    authors: ["Emma Wilson", "David Lee", "Lisa Brown"],
    abstract: "Reinforcement Learning from Human Feedback (RLHF) has become a key technique for aligning large language models with human preferences. This paper presents a systematic study of RLHF methods, including Proximal Policy Optimization (PPO) and Direct Preference Optimization (DPO). We introduce a new benchmark, RLHF-Bench, for evaluating alignment quality across multiple dimensions.",
    source: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2401.12347",
    pdfUrl: "https://arxiv.org/pdf/2401.12347.pdf",
    tags: ["RLHF", "Alignment", "LLM", "Benchmark"],
    highlights: [
      "Comprehensive study of PPO and DPO methods",
      "New RLHF-Bench with 10k human preference comparisons",
      "Analysis of reward model training dynamics",
    ],
    publishedAt: "2024-01-13T12:00:00Z",
    createdAt: "2024-01-13T14:00:00Z",
    venue: "NeurIPS",
  },
  {
    id: "4",
    title: "Multimodal Learning with Vision and Language: A Unified Framework",
    authors: ["Alex Turner", "Maria Garcia", "James Kim"],
    abstract: "We present UniVL, a unified framework for multimodal learning that seamlessly integrates visual and linguistic representations. Our approach enables joint reasoning across images and text without requiring task-specific adapters. UniVL achieves state-of-the-art results on VQA, COCO captioning, and visual reasoning benchmarks.",
    source: "openreview",
    sourceUrl: "https://openreview.net/forum?id=abc123",
    pdfUrl: "https://openreview.net/pdf?id=abc123",
    tags: ["Multimodal", "Vision", "Language", "Unified Model"],
    highlights: [
      "Unified architecture for vision-language tasks",
      "No task-specific adapters required",
      "State-of-the-art on VQA and COCO benchmarks",
    ],
    publishedAt: "2024-01-12T12:00:00Z",
    createdAt: "2024-01-12T14:00:00Z",
    venue: "CVPR",
  },
  {
    id: "5",
    title: "Causal Inference in Large Language Models",
    authors: ["Robert Chen", "Anna Martinez", "Tom Anderson"],
    abstract: "Despite their impressive capabilities, LLMs often lack true causal understanding. This paper investigates causal reasoning in LLMs through a series of controlled experiments. We propose Causal-Bench, a comprehensive benchmark for evaluating causal reasoning abilities, and introduce CaLM, a fine-tuning approach that improves causal inference.",
    source: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2401.12348",
    pdfUrl: "https://arxiv.org/pdf/2401.12348.pdf",
    tags: ["Causality", "LLM", "Reasoning", "Benchmark"],
    highlights: [
      "Novel Causal-Bench with 500+ causal reasoning tasks",
      "Analysis of 10+ LLMs' causal reasoning abilities",
      "CaLM approach improves causal inference by 25%",
    ],
    publishedAt: "2024-01-11T12:00:00Z",
    createdAt: "2024-01-11T14:00:00Z",
    venue: "ACL",
  },
  {
    id: "6",
    title: "Federated Learning for Privacy-Preserving NLP",
    authors: ["Kevin White", "Jennifer Liu", "Brian Taylor"],
    abstract: "Federated learning offers a promising approach for training NLP models while preserving user privacy. We present FedNLP, a framework for federated training of language models across distributed devices. Our experiments show that FedNLP achieves 95% of centralized model performance while keeping raw text data on-device.",
    source: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2401.12349",
    pdfUrl: "https://arxiv.org/pdf/2401.12349.pdf",
    tags: ["Federated Learning", "Privacy", "NLP", "Distributed"],
    highlights: [
      "FedNLP framework for federated language modeling",
      "95% of centralized performance with full privacy",
      "Efficient communication compression techniques",
    ],
    publishedAt: "2024-01-10T12:00:00Z",
    createdAt: "2024-01-10T14:00:00Z",
    venue: "EMNLP",
  },
  {
    id: "7",
    title: "Neural Architecture Search for Efficient Transformers",
    authors: ["Chris Wong", "Rachel Green", "Steven Blue"],
    abstract: "We introduce NAS-Transformer, an automated method for discovering efficient transformer architectures. Using evolutionary search combined with hardware-aware loss, NAS-Transformer finds variants that outperform manually designed models on both accuracy and efficiency. The discovered architectures show 40% reduction in compute for similar accuracy.",
    source: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2401.12350",
    pdfUrl: "https://arxiv.org/pdf/2401.12350.pdf",
    tags: ["Neural Architecture Search", "Transformers", "Efficiency", "AutoML"],
    highlights: [
      "Automated discovery of efficient transformer variants",
      "40% compute reduction with no accuracy loss",
      "Hardware-aware search with latency modeling",
    ],
    publishedAt: "2024-01-09T12:00:00Z",
    createdAt: "2024-01-09T14:00:00Z",
    venue: "ICLR",
  },
  {
    id: "8",
    title: "Chain-of-Thought Prompting: A Study of Best Practices",
    authors: ["Diana Foster", "Paul Harris", "Nina Patel"],
    abstract: "Chain-of-Thought (CoT) prompting has emerged as a powerful technique for eliciting reasoning in LLMs. This paper presents an empirical study of CoT prompting across different model scales and task domains. We identify key factors that influence CoT effectiveness and propose CoT+, an enhanced prompting strategy.",
    source: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2401.12351",
    pdfUrl: "https://arxiv.org/pdf/2401.12351.pdf",
    tags: ["Prompting", "Reasoning", "LLM", "Chain-of-Thought"],
    highlights: [
      "Empirical study across 15 LLMs and 50 tasks",
      "CoT+ improves reasoning by 15% on average",
      "Analysis of optimal CoT exemplars selection",
    ],
    publishedAt: "2024-01-08T12:00:00Z",
    createdAt: "2024-01-08T14:00:00Z",
    venue: "AAAI",
  },
];

export const mockUserPreferences = {
  keywords: ["transformers", "language models", "attention"],
  authors: ["John Smith", "Wei Zhang"],
  categories: ["NLP", "Deep Learning"],
};

export function getMockPapersByDate(date: Date): MockPaper[] {
  const dateStr = date.toISOString().split("T")[0];
  const requestedDate = new Date(dateStr);

  // First try exact match or within 7 days
  let papers = mockPapers.filter((paper) => {
    const paperDate = new Date(paper.publishedAt);
    const diffDays = Math.abs(paperDate.getTime() - requestedDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  });

  // If no papers found, return recent papers (within 90 days)
  if (papers.length === 0) {
    papers = mockPapers.filter((paper) => {
      const paperDate = new Date(paper.publishedAt);
      const diffDays = Math.abs(paperDate.getTime() - requestedDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 90;
    });
  }

  // If still no papers, return all mock papers
  if (papers.length === 0) {
    papers = mockPapers;
  }

  return papers;
}

// Get all available papers for the feed (not filtered by date)
export function getAllPapers(): MockPaper[] {
  return mockPapers;
}

export function getMockPaperById(id: string): MockPaper | undefined {
  return mockPapers.find((paper) => paper.id === id);
}

export function getPersonalizedPapers(keywords: string[], authors: string[], categories: string[], venues: string[] = []): MockPaper[] {
  return mockPapers.filter((paper) => {
    const matchesKeyword = keywords.length === 0 || keywords.some(
      (kw) =>
        paper.title.toLowerCase().includes(kw.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(kw.toLowerCase()) ||
        paper.tags.some((tag) => tag.toLowerCase().includes(kw.toLowerCase()))
    );
    const matchesAuthor = authors.length === 0 || authors.some(
      (author) =>
        paper.authors.some((a) => a.toLowerCase().includes(author.toLowerCase()))
    );
    const matchesCategory = categories.length === 0 || categories.some(
      (cat) =>
        paper.tags.some((tag) => tag.toLowerCase().includes(cat.toLowerCase()))
    );
    // Filter by venue if specified
    const matchesVenue = venues.length === 0 || (paper.venue && venues.some(v =>
      paper.venue?.toLowerCase().includes(v.toLowerCase())
    ));

    return matchesKeyword && matchesAuthor && matchesCategory && matchesVenue;
  });
}
