import { NextRequest } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { saveChatMessage } from "@/lib/actions";

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true";

// Configure OpenAI client to use SiliconFlow
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paperId,
      paperTitle,
      paperAbstract,
      question,
      history = [],
      isSummaryRequest = false,
      isTranslationRequest = false,
      isOverviewRequest = false,
      isOverviewTranslationRequest = false,
    } = body;

    if (!question && !isSummaryRequest && !isTranslationRequest && !isOverviewRequest && !isOverviewTranslationRequest) {
      return new Response("Question is required", { status: 400 });
    }

    // Build context for the LLM
    let systemPrompt = "";
    let userPrompt = "";

    if (isOverviewTranslationRequest) {
      systemPrompt = `You are a professional academic translator. Translate the following paper overview sections from English to Chinese (Simplified Chinese).

Requirements:
1. Maintain academic tone and accuracy
2. Keep technical terms in English with Chinese explanation in parentheses
3. Use natural Chinese expressions, not word-for-word translation
4. Each section should be translated as a coherent paragraph
5. Use clear labeling for each section`;
      userPrompt = `Translate the following overview sections to Chinese:

${paperAbstract}`;
    } else if (isOverviewRequest) {
      systemPrompt = `You are a research paper analyst. Analyze the following paper abstract and extract exactly four key sections in English:

1. **Motivation** (研究动机): What problem is the paper trying to solve? What is the background?
2. **Method** (研究方法): What approach or technique does the paper propose/use?
3. **Results** (研究结果): What are the key findings or experimental results?
4. **Conclusion** (研究结论): What is the main contribution and impact?

Requirements:
- Write in clear, concise English
- Each section should be 1-3 sentences
- Focus on the most important information
- Use academic but accessible language
- Start each section directly with the content, no bullet points needed`;
      userPrompt = `Analyze this paper:

Title: ${paperTitle}

Abstract: ${paperAbstract}

Provide exactly four sections: Motivation, Method, Results, Conclusion.`;
    } else if (isTranslationRequest) {
      systemPrompt = `You are a professional academic paper translator. Your task is to translate academic paper abstracts from English to Chinese (Simplified Chinese).

Translation Requirements:
1. Maintain the original meaning and academic tone accurately
2. Keep technical terms in English with Chinese translation in parentheses on first occurrence
3. Use natural, fluent Chinese sentence structures - do not translate word by word
4. Ensure the translation reads like native Chinese academic writing
5. Preserve all important technical details, methodologies, and findings
6. Do NOT add any explanations, summaries, or additional content - only translate
7. Do NOT use bullet points unless the original uses bullet points
8. Keep paragraph structure similar to the original`;
      userPrompt = `Translate the following abstract to Chinese (Simplified):

Title: ${paperTitle}

Abstract: ${paperAbstract}`;
    } else if (isSummaryRequest) {
      systemPrompt = `You are a research paper summarizer. Given the title and abstract of a research paper, provide a comprehensive summary that includes:
1. Main contribution/key insight
2. Methodology overview
3. Key findings or results
4. Potential applications or impact

Be concise but informative. Use bullet points for clarity.`;
      userPrompt = `Please summarize the following paper:

Title: ${paperTitle}

Abstract: ${paperAbstract}`;
    } else {
      systemPrompt = `You are a helpful research paper assistant. You have access to the following paper:
Title: ${paperTitle}
Abstract: ${paperAbstract}

Answer the user's question about this paper. Be accurate, helpful, and reference specific details from the paper when possible. If you don't know something, say so.`;
      userPrompt = question;
    }

    if (USE_MOCK_DATA || !process.env.OPENAI_API_KEY) {
      // Return mock response in mock mode (with Markdown formatting)
      let mockResponse = "";

      if (isOverviewTranslationRequest) {
        mockResponse = `动机：该研究旨在解决${paperTitle.split(" ").slice(0, 3).join(" ") || "该领域"}的关键问题。

方法：作者提出了一种创新的方法，结合了深度学习技术和传统机器学习方法。

结果：实验表明，该方法在多个基准数据集上取得了显著的性能提升。

结论：该研究为相关领域提供了新的思路，具有重要的学术价值和实际应用前景。`;
      } else if (isOverviewRequest) {
        mockResponse = `Motivation: This research aims to address key challenges in ${paperTitle.split(" ").slice(0, 3).join(" ") || "the field"} by proposing a novel approach.

Method: The authors introduce an innovative framework combining deep learning techniques with traditional machine learning methods.

Results: Extensive experiments on multiple benchmark datasets demonstrate significant performance improvements over existing approaches.

Conclusion: This work provides new insights for the research community and shows promising potential for real-world applications.`;
      } else if (isTranslationRequest) {
        mockResponse = `本文提出了一种针对${paperTitle.split(" ").slice(0, 3).join(" ") || "研究主题"}的新方法，旨在解决该领域的关键挑战。

作者采用了实验与理论相结合的方法，包括：创新的架构改进、全面的基准评估，以及与现有方法的对比分析。

研究表明，该方法在基准测试上相比基线方法取得了显著提升，主要优势包括：在标准基准测试中表现更优、泛化能力更强、资源利用效率更高。

这项工作有望为该领域的未来研究方向提供参考，并在多个实际应用场景中具有应用价值。`;
      } else if (isSummaryRequest) {
        mockResponse = `## Summary

**Main Contribution**
This paper presents a novel approach to ${paperTitle.split(" ").slice(0, 3).join(" ") || "the research topic"}, addressing key challenges in the field.

**Methodology**
The authors employ a combination of experimental and theoretical approaches, including:

- Novel architectural improvements
- Extensive benchmark evaluations
- Comparative analysis with existing methods

**Key Findings**
The research demonstrates significant improvements over baseline methods, with particular strengths in:

1. Improved performance on standard benchmarks
2. Better generalization capabilities
3. More efficient resource utilization

**Potential Impact**
This work could influence future research directions in the field and has practical applications in various domains.`;
      } else {
        mockResponse = `Based on the paper "${paperTitle}", here's what I can tell you:

The paper presents an interesting approach to the problem. The abstract describes methodology that combines established techniques with novel improvements.

For more specific details about the methodology, results, or conclusions, you might want to:
- Read the full paper (PDF available)
- Check the source for additional experiments
- Ask about a specific aspect you're interested in`;
      }

      // Save the mock messages
      if (paperId && !USE_MOCK_DATA) {
        await saveChatMessage(paperId, "user", userPrompt);
        await saveChatMessage(paperId, "assistant", mockResponse);
      }

      return new Response(mockResponse, {
        headers: {
          "Content-Type": "text/plain",
          "Transfer-Encoding": "chunked",
        },
      });
    }

    // Use SiliconFlow API directly
    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SiliconFlow API error: ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No response generated";

    // Save chat messages to database
    if (paperId) {
      await saveChatMessage(paperId, "user", userPrompt);
      await saveChatMessage(paperId, "assistant", text);
    }

    // Return streaming response
    return new Response(text, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
