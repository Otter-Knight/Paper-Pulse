"use client";

import { useState } from "react";
import { Sparkles, X, Check, Plus, Trash2, Edit3, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Preference tag card interface
export interface PreferenceTagCard {
  id: string;
  name: string;
  keywords: string[];
  venues: string[];
  authors: string[];
  createdAt: string;
}

interface PreferenceBuilderProps {
  onGenerate: (description: string) => Promise<PreferenceSuggestion[]>;
  onSaveCard: (card: PreferenceTagCard) => void;
  existingCards: PreferenceTagCard[];
  maxCards?: number;
}

export interface PreferenceSuggestion {
  id: string;
  keyword?: string;
  venue?: string;
  author?: string;
  category: string;
}

// Common AI/ML venues for suggestions
const COMMON_VENUES = [
  { id: "cvpr", name: "CVPR", category: "Computer Vision" },
  { id: "neurips", name: "NeurIPS", category: "Machine Learning" },
  { id: "iclr", name: "ICLR", category: "Machine Learning" },
  { id: "icml", name: "ICML", category: "Machine Learning" },
  { id: "acl", name: "ACL", category: "NLP" },
  { id: "emnlp", name: "EMNLP", category: "NLP" },
  { id: "aaai", name: "AAAI", category: "AI" },
  { id: "arxiv", name: "arXiv", category: "Preprint" },
];

// Common research areas for suggestions
const RESEARCH_AREAS = [
  "Transformers", "LLM", "NLP", "Computer Vision", "Multimodal",
  "Reinforcement Learning", "Deep Learning", "GAN", "Object Detection",
  "Semantic Segmentation", "Speech Recognition", "Machine Translation",
  "Question Answering", "Text Summarization", "Knowledge Graph",
  "Neural Architecture Search", "Federated Learning", "Edge Computing",
];

export function PreferenceBuilder({ onGenerate, onSaveCard, existingCards, maxCards = 10 }: PreferenceBuilderProps) {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<PreferenceSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [cardName, setCardName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    try {
      const result = await onGenerate(description);
      setSuggestions(result);
      setSelectedSuggestions([]);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error generating preferences:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSuggestion = (id: string) => {
    setSelectedSuggestions((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const handleSaveCard = () => {
    if (!cardName.trim() || selectedSuggestions.length === 0) return;

    const selectedItems = suggestions.filter((s) => selectedSuggestions.includes(s.id));

    const newCard: PreferenceTagCard = {
      id: `card_${Date.now()}`,
      name: cardName,
      keywords: selectedItems.filter((s) => s.category === "keyword").map((s) => s.keyword!).filter(Boolean),
      venues: selectedItems.filter((s) => s.category === "venue").map((s) => s.venue || "").filter(Boolean),
      authors: selectedItems.filter((s) => s.category === "author").map((s) => s.author || "").filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    onSaveCard(newCard);
    setCardName("");
    setSelectedSuggestions([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setDescription("");
  };

  const handleDeleteCard = (id: string) => {
    onSaveCard(existingCards.find((c) => c.id === id) as any); // Delete by passing same id
  };

  return (
    <div className="space-y-4">
      {/* Existing Cards */}
      {existingCards.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">已保存的标签卡</h4>
          <div className="flex flex-wrap gap-2">
            {existingCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full text-sm"
              >
                <span className="text-primary font-medium">{card.name}</span>
                <span className="text-muted-foreground text-xs">
                  ({card.keywords.length + card.venues.length} 项)
                </span>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-2">
        <label className="text-sm font-medium">用自然语言描述你的研究兴趣</label>
        <textarea
          className="w-full h-20 p-3 rounded-md border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="例如：我对大型语言模型的训练和推理优化感兴趣，尤其是Transformer架构的效率提升..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim() || existingCards.length >= maxCards}
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating ? "AI 分析中..." : "生成候选词"}
        </Button>
        {existingCards.length >= maxCards && (
          <p className="text-xs text-muted-foreground">已达到最大标签卡数量 ({maxCards})</p>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="text-sm font-medium">AI 推荐的候选词（选择你感兴趣的）</h4>

            {/* Keywords */}
            {suggestions.filter((s) => s.category === "keyword").length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">研究方向</p>
                <div className="flex flex-wrap gap-1">
                  {suggestions
                    .filter((s) => s.category === "keyword")
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => toggleSuggestion(s.id)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          selectedSuggestions.includes(s.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {selectedSuggestions.includes(s.id) && <Check className="h-3 w-3 mr-1" />}
                        {s.keyword}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Venues */}
            {suggestions.filter((s) => s.category === "venue").length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">发表刊物</p>
                <div className="flex flex-wrap gap-1">
                  {suggestions
                    .filter((s) => s.category === "venue")
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => toggleSuggestion(s.id)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          selectedSuggestions.includes(s.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {selectedSuggestions.includes(s.id) && <Check className="h-3 w-3 mr-1" />}
                        {s.venue}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Save Section */}
            {selectedSuggestions.length > 0 && (
              <div className="pt-3 border-t border-border space-y-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-md border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="为这个标签卡起个名字"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowSuggestions(false);
                      setSuggestions([]);
                      setSelectedSuggestions([]);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSaveCard}
                    disabled={!cardName.trim()}
                    size="sm"
                    className="flex-1"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    保存标签卡
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Generate AI suggestions based on user description (mock version)
export async function generatePreferenceSuggestions(description: string): Promise<PreferenceSuggestion[]> {
  const suggestions: PreferenceSuggestion[] = [];
  const descLower = description.toLowerCase();

  // Keywords based on description analysis
  const keywordMap: Record<string, string[]> = {
    "llm": ["Large Language Models", "GPT", "Transformer", "Prompt Engineering"],
    "language": ["NLP", "Text Processing", "Language Models", "Text Generation"],
    "transformer": ["Transformers", "Attention", "Self-Attention", "BERT"],
    "vision": ["Computer Vision", "Image Recognition", "Object Detection", "Multimodal"],
    "reinforcement": ["Reinforcement Learning", "RLHF", "Policy Optimization"],
    "efficient": ["Model Compression", "Pruning", "Quantization", "Distillation"],
    "training": ["Deep Learning", "Optimization", "Fine-tuning", "Continual Learning"],
    "generation": ["GAN", "Diffusion", "Image Generation", "Text-to-Image"],
    "speech": ["Speech Recognition", "ASR", "Voice", "Audio"],
    "knowledge": ["Knowledge Graph", "Information Retrieval", "RAG"],
    "reasoning": ["Chain-of-Thought", "Reasoning", "Logical Inference"],
    "architecture": ["Neural Architecture", "Efficiency", "Model Design"],
  };

  // Find matching keywords
  for (const [key, keywords] of Object.entries(keywordMap)) {
    if (descLower.includes(key)) {
      keywords.forEach((kw, i) => {
        suggestions.push({
          id: `kw_${key}_${i}`,
          keyword: kw,
          category: "keyword",
        });
      });
    }
  }

  // Add some default keywords if none found
  if (suggestions.filter((s) => s.category === "keyword").length === 0) {
    RESEARCH_AREAS.slice(0, 5).forEach((area, i) => {
      suggestions.push({
        id: `kw_default_${i}`,
        keyword: area,
        category: "keyword",
      });
    });
  }

  // Add venue suggestions based on context
  if (descLower.includes("nlp") || descLower.includes("language")) {
    suggestions.push({ id: "venue_acl", venue: "ACL", category: "venue" });
    suggestions.push({ id: "venue_emnlp", venue: "EMNLP", category: "venue" });
  }
  if (descLower.includes("vision") || descLower.includes("image")) {
    suggestions.push({ id: "venue_cvpr", venue: "CVPR", category: "venue" });
    suggestions.push({ id: "venue_iccv", venue: "ICCV", category: "venue" });
  }
  if (descLower.includes("learning") || descLower.includes("model")) {
    suggestions.push({ id: "venue_neurips", venue: "NeurIPS", category: "venue" });
    suggestions.push({ id: "venue_iclr", venue: "ICLR", category: "venue" });
  }

  // Always add arXiv
  suggestions.push({ id: "venue_arxiv", venue: "arXiv", category: "venue" });

  return suggestions.slice(0, 15); // Limit to 15 suggestions
}
