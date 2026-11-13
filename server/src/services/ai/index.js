/**
 * Unified AI Service for ENT 3805: Designing Corporate-Startup Synergies
 * BML Munjal University (Hero Group Initiative) | School of Engineering & Technology
 * Faculty Lead: Prof. Kulbir Lamba (kulbir.lamba@bmu.edu.in)
 * 
 * Embedded with official ENT 3805 Course Handout literature, frameworks & session roadmap:
 * 1. Chesbrough, H. W. (2003): Open Innovation - The new imperative for creating and profiting from technology
 * 2. Yoon, E., & Hughes, S. (HBR 2016): Big Companies Should Collaborate with Startups (Innovation Asymmetry, Organ Rejection, Missionary vs Mercenary)
 * 3. Weiblen & Chesbrough (CMR 2015): 4 Engagement Typologies (CVC, Corporate Incubation, Outside-In Startup Programs, Inside-Out Platform Programs)
 * 4. BioNTech + Pfizer (Covid-19 mRNA tech agility + enterprise manufacturing scale & distribution)
 * 5. Carlsberg and the Green Fiber Bottle (Sustainability Through Open Innovation Consortium)
 * 6. Maruti Suzuki Incubation Program for Startups & Global Capability Centers (GCCs) in India
 * 7. Csik & Torres Junior (J Int Entrep 2024): Emergent Way - Corporate-Startup Synergies
 * 8. World Economic Forum (2018): Collaboration between Start-ups and Corporates - Mutual Understanding
 * 9. Dizdarevic, van de Vrande & Jansen (2023): When Opposites Attract - Review & Synthesis
 * 10. Gutmann & Lang (IEEE 2022): Unlocking the Magic of Corporate-Startup Collaboration
 * 11. Ecosystem Platforms: TCS Co-Innovation Network (COIN) & HCL Technologies Ecosystem Innovation Platform
 * 12. Burns (2020): Corporate Entrepreneurship and Innovation
 */

export const MODEL_METADATA = {
  name: "gemini-1.5-flash",
  version: "v1beta-2026",
  provider: "Google"
};

const COURSE_PEDAGOGICAL_CONTEXT = `
COURSE: ENT 3805 - Designing Corporate-Startup Synergies (BML Munjal University)
INSTRUCTOR: Prof. Kulbir Lamba (kulbir.lamba@bmu.edu.in)
COURSE OUTCOMES (COs):
- CO1 (BL-2 Comprehension): Understand and analyze key concepts and frameworks for corporate-startup collaboration.
- CO2 (BL-4 Analysis): Analyze challenges and success factors in corporate-startup partnerships using real-world cases.
- CO3 (BL-6 Creation): Design a practical blueprint for an effective corporate-startup partnership for different contexts of innovation.

CORE THEORETICAL FRAMEWORKS & CASES:
1. Core Innovation Asymmetry & The Paradox:
   - Paradox: Corporates possess capital, global procurement, manufacturing scale, and distribution channels, but suffer from bureaucratic inertia, risk aversion, and internal "organ rejection." Startups possess rapid zero-to-one exploration agility and excel at validating latent market demand (58% of tech ventures pinpoint real market pain points), but face capital starvation and lack scaling muscle.
   - Foundation Example: BioNTech providing pioneering mRNA tech agility while Pfizer brought clinical trial mastery, global cold-chain logistics, and massive manufacturing scale during Covid-19.

2. Open Innovation Matrix (Chesbrough, 2003; Classroom Slides):
   - Outside-In: Sourcing external startup solutions, patents, and POCs into the corporate funnel to drastically compress R&D cycle times and development spend (e.g., P&G Connect + Develop, Lego Ideas).
   - Inside-Out: Commercializing and out-licensing underutilized internal corporate IP, spin-offs, and platforms into the wider ecosystem (e.g., Philips HealthTech IP licensing, ISRO Space Tech Transfer).

3. Weiblen & Chesbrough (CMR 2015) 4 Engagement Typologies:
   - Corporate Venture Capital (CVC) [Equity, Outside-In]: Minority equity stakes for strategic market intelligence and future optionality (e.g., Intel Capital, Google Ventures/Nest).
   - Corporate Incubation [Equity, Inside-Out]: Nurturing internal non-core inventions into venture spin-offs (e.g., Xerox PARC, Bosch Startup Platform).
   - Outside-In Startup Programs [Non-Equity]: Rapid 12-week challenge pilots, sandboxes, and venture clienting (e.g., AT&T Foundry, Siemens TTB).
   - Inside-Out Platform Programs [Non-Equity]: Opening corporate developer APIs/platforms to third-party ventures (e.g., SAP Startup Focus on HANA, Microsoft BizSpark, PayPal Blueprint).

4. Mindset & Cultural Alignment (Yoon & Hughes, HBR 2016):
   - Missionary vs. Mercenary: Missionary alignment preserves founder purpose and cultural autonomy (e.g., Boulder Brands / Udi's gluten-free, ConAgra / Healthy Choice); mercenary alignment treats startups as disposable vendor contracts.
   - Preventing "Organ Rejection": Establishing organizational shock absorbers (e.g. specialized liaison officers, innovation hubs) to protect early ventures from standard corporate procurement and legal delays.

5. Real-World Case Studies (ENT 3805 Syllabus):
   - Carlsberg Green Fiber Bottle: Open innovation consortium uniting corporate brand owner, packaging startup (Paboco / ecoXpac), and materials scientists for sustainable packaging.
   - Maruti Suzuki Incubation Program for Startups (MISA) & Indian GCCs: How automotive leaders leverage India's deep-tech startup ecosystem for manufacturing automation, logistics, and connected vehicles.
   - TCS Co-Innovation Network (COIN) & HCL Technologies Ecosystem Platform: Enterprise platform models integrating startups, universities, venture funds, and enterprise clients.
   - Goal Alignment & KPIs: Reconciling startup equity upside and speed with corporate quarterly EBITDA and compliance metrics ("Is CVC Right for Your Startup?").
   - Post-Pilot Sustainability: Sustaining momentum after the initial excitement ("After the Honeymoon Ends: Making Corporate-Startup Relationships Work").
`;

const REFLECTION_PROMPT = `${COURSE_PEDAGOGICAL_CONTEXT}

You are the ENT 3805 Corporate-Startup AI Tutor.
Your task is to analyze the student's class discussion notes and synthesize an academically rigorous session reflection.

STRICT INSTRUCTIONS:
1. Anchor your synthesis in the provided student notes while interpreting them through the course frameworks above (e.g., Outside-In vs Inside-Out, Yoon & Hughes POC vs Scale, Weiblen & Chesbrough 4 models).
2. "keyPoints": Produce 3-5 concise, impactful bullet points capturing the core takeaways from the class discussion.
3. "openQuestion": Formulate exactly ONE single, intellectually stimulating question that remained unresolved or represents an implementation tradeoff. Do NOT answer the question.

Return strictly valid JSON:
{
  "keyPoints": ["point 1", "point 2", "point 3"],
  "openQuestion": "Single unresolved strategic or implementation tradeoff question?"
}`;

const NEWS_PROMPT = `${COURSE_PEDAGOGICAL_CONTEXT}

You are the ENT 3805 Fortnightly Corporate-Startup News Summarizer.
Your task is to analyze the provided source announcement/post and extract the strategic collaboration dynamics.

STRICT INSTRUCTIONS:
1. Synthesize ONLY from the provided source text. Never invent facts.
2. Link the partnership directly to corporate-startup synergy concepts (e.g., Weiblen & Chesbrough's 4 models, POC speed vs corporate distribution scale, CVC strategic learning, or platform expansion).
3. Produce:
   - "headline": Concise factual headline.
   - "company": Established corporate partner.
   - "startupPartner": Emerging venture involved.
   - "summary": 2-3 sentence factual summary from the source text.
   - "whyItMatters": 2 sentences explaining why this matters specifically for corporate-startup collaboration, using course concepts (POC validation, Outside-In tech transfer, CVC learning, avoiding organ rejection).
   - "collaborationType": Select best match from ["Corporate Venture Capital", "Accelerator / Incubator", "Co-Innovation Lab", "Strategic Alliance", "Startup Acquisition", "Global Capability Center", "Commercial Pilot / POC", "Technology Integration", "Outside-In Program", "Inside-Out Platform Program"].

Return strictly valid JSON matching those keys.`;

export const callAI = async (taskType, sourceText, metadata = {}) => {
  if (!sourceText || sourceText.trim().length < 15) {
    throw new Error("Source text is too short. Please provide meaningful text (at least 15 characters).");
  }

  const systemInstruction = taskType === "CLASS_REFLECTION" ? REFLECTION_PROMPT : NEWS_PROMPT;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let rawOutput = null;
  let activeModel = MODEL_METADATA.name;
  let activeVersion = MODEL_METADATA.version;

  // 1. Primary: Gemini API
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
                  { text: systemInstruction },
                  { text: `STUDENT SOURCE INPUT:\n${sourceText}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.15,
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
        activeModel = "gemini-1.5-flash";
        activeVersion = "v1beta-2026";
      } else {
        console.warn(`[AI Service] Gemini HTTP ${response.status}`);
      }
    } catch (err) {
      console.warn("[AI Service] Gemini call failed:", err.message);
    }
  }

  // 2. Secondary: OpenAI API fallback
  if (!rawOutput && openaiKey) {
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
            { role: "system", content: systemInstruction },
            { role: "user", content: `STUDENT SOURCE INPUT:\n${sourceText}` }
          ],
          temperature: 0.15
        })
      });

      if (response.ok) {
        const data = await response.json();
        rawOutput = data.choices?.[0]?.message?.content;
        activeModel = "gpt-3.5-turbo";
        activeVersion = "0125";
      }
    } catch (err) {
      console.warn("[AI Service] OpenAI fallback failed:", err.message);
    }
  }

  // 3. Deterministic Local Source-Text Extractor (Context-Aware)
  if (!rawOutput) {
    activeModel = "course-grounded-extractor";
    activeVersion = "v1.0-ent3805";
    if (taskType === "CLASS_REFLECTION") {
      return {
        success: true,
        modelName: activeModel,
        modelVersion: activeVersion,
        sourceText,
        result: extractReflectionFromSource(sourceText, metadata.sessionTitle)
      };
    } else {
      return {
        success: true,
        modelName: activeModel,
        modelVersion: activeVersion,
        sourceText,
        result: extractNewsFromSource(sourceText, metadata)
      };
    }
  }

  try {
    const cleaned = rawOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      modelName: activeModel,
      modelVersion: activeVersion,
      sourceText,
      result: parsed
    };
  } catch (parseError) {
    return {
      success: true,
      modelName: "course-grounded-fallback",
      modelVersion: "v1.0-ent3805",
      sourceText,
      result: taskType === "CLASS_REFLECTION" 
        ? extractReflectionFromSource(sourceText, metadata.sessionTitle)
        : extractNewsFromSource(sourceText, metadata)
    };
  }
};

function extractReflectionFromSource(text, sessionTitle) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const sentences = text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|").map(s => s.trim()).filter(s => s.length > 15);
  
  const keyPoints = [];
  for (const line of lines) {
    if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*") || /^\d+\./.test(line)) {
      const cleaned = line.replace(/^[-•*\d.]\s*/, "").trim();
      if (cleaned.length > 8 && !cleaned.endsWith("?")) {
        keyPoints.push(cleaned);
      }
    }
  }

  if (keyPoints.length < 2) {
    for (const s of sentences) {
      if (!s.endsWith("?") && s.length > 20 && keyPoints.length < 4) {
        if (!keyPoints.includes(s)) keyPoints.push(s);
      }
    }
  }

  if (keyPoints.length === 0) {
    keyPoints.push(text.slice(0, 120).trim() + "...");
  }

  // Find question or formulate grounded in course syllabus
  const questionMatches = text.match(/([^.?!]*\?)/g);
  let openQuestion = "";
  if (questionMatches && questionMatches.length > 0) {
    openQuestion = questionMatches[questionMatches.length - 1].trim();
  } else {
    openQuestion = `How can corporate sponsors evaluate pilot traction regarding ${sessionTitle || "this topic"} without causing startup organ rejection?`;
  }

  return {
    keyPoints: keyPoints.slice(0, 5),
    openQuestion
  };
}

function extractNewsFromSource(text, meta) {
  const sentences = text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|").map(s => s.trim()).filter(Boolean);
  return {
    headline: meta.headline || sentences[0]?.slice(0, 90) || "Corporate-Startup Synergy Update",
    company: meta.company || "Corporate Partner",
    startupPartner: meta.startupPartner || "Emerging Venture",
    summary: sentences.slice(0, 3).join(" "),
    whyItMatters: "Illustrates Outside-In open innovation by leveraging startup agility for rapid POC validation while utilizing corporate distribution scale.",
    collaborationType: meta.collaborationType || "Commercial Pilot / POC"
  };
}
