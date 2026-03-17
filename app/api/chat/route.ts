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
    } = body;

    if (!question && !isSummaryRequest) {
      return new Response("Question is required", { status: 400 });
    }

    // Build context for the LLM
    const systemPrompt = isSummaryRequest
      ? `You are a research paper summarizer. Given the title and abstract of a research paper, provide a comprehensive summary that includes:
1. Main contribution/key insight
2. Methodology overview
3. Key findings or results
4. Potential applications or impact

Be concise but informative. Use bullet points for clarity.`
      : `You are a helpful research paper assistant. You have access to the following paper:
Title: ${paperTitle}
Abstract: ${paperAbstract}

Answer the user's question about this paper. Be accurate, helpful, and reference specific details from the paper when possible. If you don't know something, say so.`;

    const userPrompt = isSummaryRequest
      ? `Please summarize the following paper:

Title: ${paperTitle}

Abstract: ${paperAbstract}`
      : question;

    if (USE_MOCK_DATA || !process.env.OPENAI_API_KEY) {
      // Return mock response in mock mode (with Markdown formatting)
      const mockResponse = isSummaryRequest
        ? `## Summary

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
This work could influence future research directions in the field and has practical applications in various domains.`
        : `Based on the paper "${paperTitle}", here's what I can tell you:

The paper presents an interesting approach to the problem. The abstract describes methodology that combines established techniques with novel improvements.

For more specific details about the methodology, results, or conclusions, you might want to:
- Read the full paper (PDF available)
- Check the source for additional experiments
- Ask about a specific aspect you're interested in`;

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
