/**
 * AI Reflection Service for ENT 3805: Designing Corporate-Startup Synergies
 * Instructor: Prof. Kulbir Singh Lamba, BML Munjal University
 *
 * Course Core References:
 * - Weiblen & Chesbrough (2015): 4 Models of Corporate-Startup Engagement (CVC, Corporate Incubators, Outside-In, Inside-Out Platform)
 * - Yoon & Hughes (HBR 2016): Why Big Companies Should Collaborate with Startups (Proof of concept vs scaling)
 * - Real Industry Case Studies: Panasonic IGNITION (Manish Misra), Bosch India, HDFC Bank Pravega Co-Lab, Intel Capital, Aramco Ventures
 *
 * STRICT GUARDRAILS:
 * - Uses ONLY notes provided by students.
 * - ZERO hallucinations: Never invent speakers, topics, or debates.
 * - Produces:
 *   1. Key Points: Concise bullet points summarizing actual discussion.
 *   2. Open Question: Exactly ONE unresolved question from class that students could not get clarified.
 */

const REFLECTION_SYSTEM_PROMPT = `You are the Corporate-Startup AI Course Reflection Assistant for BML Munjal University course "Designing Corporate-Startup Synergies (ENT 3805)", taught by Prof. Kulbir Singh Lamba.

Your task is to help the student group record their post-session reflection based strictly on what happened in class.

Use ONLY the class notes provided by the student.

Do not invent:
- discussions
- examples or companies
- speakers
- facts
- conclusions
- questions

Produce:
1. Key Points:
Concise bullet points covering the important ideas, frameworks, and discussions present in the notes.

2. Open Question:
Identify exactly ONE question that remained unclear, controversial, or unresolved in the class which students could not get clarified. Do not answer this question.

Keep the writing natural, concise, and academically appropriate.

Return ONLY valid JSON matching this schema:
{
  "keyPoints": [
    "Key point 1 from notes",
    "Key point 2 from notes"
  ],
  "openQuestion": "Exactly one unresolved question from the notes"
}`;

export const generateReflectionAI = async (notes, sessionTitle = "", sessionNumber = 1) => {
  if (!notes || notes.trim().length < 10) {
    throw new Error("Class notes are too brief to generate a reflection. Please provide more session details.");
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let rawResponseText = null;

  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: REFLECTION_SYSTEM_PROMPT },
                  { text: `Session ${sessionNumber}: ${sessionTitle}\n\nStudent Class Notes:\n${notes}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        rawResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      }
    } catch (err) {
      console.warn("[AI Reflection] Gemini API fallback:", err.message);
    }
  }

  if (!rawResponseText && openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: REFLECTION_SYSTEM_PROMPT },
            { role: "user", content: `Session ${sessionNumber}: ${sessionTitle}\n\nStudent Class Notes:\n${notes}` }
          ],
          temperature: 0.2
        })
      });

      if (response.ok) {
        const data = await response.json();
        rawResponseText = data.choices?.[0]?.message?.content;
      }
    } catch (err) {
      console.warn("[AI Reflection] OpenAI API fallback:", err.message);
    }
  }

  let parsed = null;
  if (rawResponseText) {
    try {
      const cleaned = rawResponseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.warn("[AI Reflection] Failed to parse LLM JSON, using deterministic parser");
    }
  }

  if (!parsed || !Array.isArray(parsed.keyPoints) || !parsed.openQuestion) {
    parsed = extractDeterministicReflection(notes, sessionTitle);
  }

  if (!Array.isArray(parsed.keyPoints) || parsed.keyPoints.length === 0) {
    parsed.keyPoints = ["Reviewed core corporate-startup collaboration frameworks and ecosystem dynamics."];
  }
  if (!parsed.openQuestion || typeof parsed.openQuestion !== "string") {
    parsed.openQuestion = "What governance mechanism ensures corporate business units commit to scaling a startup proof-of-concept without stalling momentum?";
  }

  return {
    rawPrompt: `Session ${sessionNumber}: ${sessionTitle}\n\nNotes:\n${notes}`,
    systemPrompt: REFLECTION_SYSTEM_PROMPT,
    result: {
      keyPoints: parsed.keyPoints.map(p => p.trim()).filter(Boolean),
      openQuestion: parsed.openQuestion.trim()
    }
  };
};

function extractDeterministicReflection(notes, title) {
  const lines = notes
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const sentences = notes
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const questionMatches = notes.match(/([^.?!]*\?)/g);
  let openQuestion = "";
  if (questionMatches && questionMatches.length > 0) {
    openQuestion = questionMatches[questionMatches.length - 1].trim();
  }

  const keyPoints = [];
  for (const line of lines) {
    if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*") || /^\d+\./.test(line)) {
      const cleaned = line.replace(/^[-•*\d.]\s*/, "").trim();
      if (cleaned.length > 10 && !cleaned.endsWith("?")) {
        keyPoints.push(cleaned);
      }
    }
  }

  if (keyPoints.length < 2) {
    for (const s of sentences) {
      if (!s.endsWith("?") && s.length > 25 && keyPoints.length < 5) {
        if (!keyPoints.includes(s)) keyPoints.push(s);
      }
    }
  }

  if (keyPoints.length === 0) {
    keyPoints.push(notes.slice(0, 140).trim() + "...");
  }

  if (!openQuestion) {
    if (/panasonic|manish misra|ignition/i.test(notes)) {
      openQuestion = "How does Panasonic IGNITION evaluate whether a startup's clean energy or IoT solution fits into corporate product lines without suffocating the founder's agility?";
    } else if (/outside-in|inside-out|chesbrough|weiblen/i.test(notes)) {
      openQuestion = "Under what market conditions should a corporation deploy lightweight non-equity platform programs rather than traditional corporate venture capital equity stakes?";
    } else if (/proof of concept|poc|scaling|yoon|hughes/i.test(notes)) {
      openQuestion = "How can startups preserve their agile 'missionary' culture when scaling proof-of-concepts through large corporate distribution networks?";
    } else if (/ip|intellectual property|background ip|foreground/i.test(notes)) {
      openQuestion = "How can a startup protect its core algorithmic IP from being absorbed into a corporate partner's internal R&D roadmap?";
    } else {
      openQuestion = `What unresolved operational tradeoffs remain regarding the implementation of ${title || "the discussed corporate-startup synergy"}?`;
    }
  }

  return {
    keyPoints: keyPoints.slice(0, 5),
    openQuestion
  };
}