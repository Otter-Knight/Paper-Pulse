import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { saveChatMessage } from "@/lib/actions";

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true";

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

    // Use Vercel AI SDK to generate streaming response
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: [
        ...history.map((msg: { role: string; content: string }) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content: userPrompt },
      ],
    });

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
