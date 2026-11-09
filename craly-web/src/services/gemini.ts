import { ChatMessage } from '@/types';
import { cralyApi } from './api';
import { BRAND } from '@/config/brand';

let cachedApiKey: string | null = null;
let cachedModel: string = 'gemini-1.5-flash';
let cachedInstruction: string =
  `You are ${BRAND.assistantName}, the intelligence core of ${BRAND.name} (AI Utility Recommendation & Automated Workflows).
You help users explore, benchmark, compare, and build automated workflows with AI tools.

GENERATIVE UI CAPABILITY:
When recommending tools, comparing options, or proposing automated pipelines, you can output interactive Generative UI widgets by including structured code fences:

1. To output interactive tool cards:
\`\`\`gen-ui:tool-recommendation
{
  "tools": [
    {
      "id": "tool_id",
      "name": "Tool Name",
      "tagline": "Brief 1-sentence value proposition",
      "category": "Category",
      "pricing": "Free | Freemium | Paid",
      "rating": 4.9,
      "websiteUrl": "https://...",
      "features": ["Key Feature 1", "Key Feature 2"]
    }
  ]
}
\`\`\`

2. To output a side-by-side comparison table:
\`\`\`gen-ui:compare
{
  "title": "Tool A vs Tool B Comparison",
  "tools": [
    { "name": "Tool A", "pricing": "Freemium", "category": "Video", "bestFor": "Cinematic realism" },
    { "name": "Tool B", "pricing": "Paid", "category": "Video", "bestFor": "Fast social shorts" }
  ]
}
\`\`\`

3. To output a multi-step automation workflow:
\`\`\`gen-ui:workflow
{
  "title": "Pipeline Name",
  "description": "Short explanation",
  "steps": [
    { "step": 1, "title": "Stage Title", "tool": "Tool Name", "duration": "1m", "description": "What to do" }
  ]
}
\`\`\`

4. At the end of responses, always offer 2-4 interactive next-step chips:
\`\`\`gen-ui:action-chips
{
  "heading": "Explore Next:",
  "chips": ["Next Action 1", "Compare Pricing", "Show Step-by-Step Guide"]
}
\`\`\`

Format your general explanations using clean markdown.`;

export async function initAiConfig() {
  if (typeof window === 'undefined') return;
  try {
    const remote = await cralyApi.getAiModelConfig();
    if (remote) {
      if (remote.apiKey) cachedApiKey = remote.apiKey;
      if (remote.modelName) cachedModel = remote.modelName;
      if (remote.systemInstruction) {
        cachedInstruction = `${remote.systemInstruction}\n\n${cachedInstruction}`;
      }
    }
  } catch (err) {
    console.warn('Unable to load remote AI model configuration:', err);
  }
}

export async function generateAiResponse(messages: ChatMessage[]): Promise<string> {
  if (!cachedApiKey) {
    await initAiConfig();
  }

  // Format history for Gemini API
  const contents = messages.map((m) => {
    const parts: any[] = [];
    if (m.base64Data && m.mediaType) {
      parts.push({
        inlineData: {
          mimeType: m.mediaType,
          data: m.base64Data,
        },
      });
    }
    if (m.text) {
      parts.push({ text: m.text });
    }
    return {
      role: m.role === 'user' ? 'user' : 'model',
      parts,
    };
  });

  if (cachedApiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${cachedModel}:generateContent?key=${cachedApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: cachedInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.75,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const candidate = json.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.error('Gemini direct API call error:', err);
    }
  }

  // Dynamic Contextual Generative UI Fallback
  const lastUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';

  if (lastUserMsg.includes('compare') || lastUserMsg.includes('vs') || lastUserMsg.includes('difference')) {
    return `### Comparison Breakdown: AIVA vs Suno AI

Both **AIVA** and **Suno** represent cutting-edge generative audio, but they serve distinctly different creative workflows.

\`\`\`gen-ui:compare
{
  "title": "AIVA vs Suno AI Audio Benchmark",
  "tools": [
    {
      "name": "AIVA",
      "pricing": "Freemium",
      "category": "Music & Orchestral",
      "bestFor": "Cinematic soundtracks, game scoring, MIDI stems"
    },
    {
      "name": "Suno AI",
      "pricing": "Freemium",
      "category": "Generative Songwriting",
      "bestFor": "Full songs with hyper-realistic human vocals & lyrics"
    }
  ]
}
\`\`\`

#### Key Takeaway:
- Use **AIVA** if you are a filmmaker or game developer needing control over chord progressions, instrument sections, and MIDI export.
- Use **Suno AI** if you need radio-ready tracks, pop songs, jingles, and full vocal performances from a simple text prompt.

\`\`\`gen-ui:action-chips
{
  "heading": "Explore Further:",
  "chips": [
    "Compare Pricing Tiers",
    "Show Top Music Workflows",
    "Find Video Generation Tools"
  ]
}
\`\`\``;
  }

  if (lastUserMsg.includes('video') || lastUserMsg.includes('animation') || lastUserMsg.includes('motion')) {
    return `### Top AI Video Generation Utilities

Generative video has leapt forward with photorealistic camera motion and multi-subject consistency. Here are the leading tools verified in our catalog:

\`\`\`gen-ui:tool-recommendation
{
  "tools": [
    {
      "id": "runway_gen3",
      "name": "Runway Gen-3 Alpha",
      "tagline": "Industry standard for cinematic motion and realistic physics.",
      "category": "Video & VFX",
      "pricing": "Freemium",
      "rating": 4.9,
      "websiteUrl": "https://runwayml.com",
      "features": ["Camera Motion Control", "Keyframe-to-Video", "High-Resolution Upscaling"]
    },
    {
      "id": "kling_ai",
      "name": "Kling AI",
      "tagline": "Superior prompt adherence with 1080p 30fps fluid human motion.",
      "category": "Video & Animation",
      "pricing": "Freemium",
      "rating": 4.8,
      "websiteUrl": "https://klingai.com",
      "features": ["Photorealistic Face Rendering", "Extended 10-second clips", "Multi-angle camera"]
    }
  ]
}
\`\`\`

\`\`\`gen-ui:workflow
{
  "title": "Faceless YouTube Video Production",
  "description": "Generate an entire automated documentary clip in 3 quick stages",
  "steps": [
    { "step": 1, "title": "Script & Voiceover", "tool": "ElevenLabs", "duration": "45s", "description": "Generate voice synthesis with emotion and pacing." },
    { "step": 2, "title": "B-Roll Video Synthesis", "tool": "Runway Gen-3", "duration": "2m", "description": "Generate dynamic cutaways from prompt text." },
    { "step": 3, "title": "Auto-Captions & Sound FX", "tool": "CapCut AI", "duration": "1m", "description": "Auto-sync kinetic subtitles and ambient audio." }
  ]
}
\`\`\`

\`\`\`gen-ui:action-chips
{
  "heading": "Recommended Next Steps:",
  "chips": [
    "Compare Runway vs Kling",
    "Show AI Voice Generators",
    "Build Full Video Workflow"
  ]
}
\`\`\``;
  }

  if (lastUserMsg.includes('music') || lastUserMsg.includes('audio') || lastUserMsg.includes('song')) {
    return `### Recommended AI Music & Soundtrack Utilities

Here are the highest-rated music generation tools currently indexed:

\`\`\`gen-ui:tool-recommendation
{
  "tools": [
    {
      "id": "aiva",
      "name": "AIVA",
      "tagline": "The AI composer that creates original & personalized soundtracks.",
      "category": "Music & Audio",
      "pricing": "Freemium",
      "rating": 4.9,
      "websiteUrl": "https://www.aiva.ai",
      "features": ["250+ musical styles", "MIDI export & DAW integration", "Commercial copyright ownership"]
    },
    {
      "id": "suno_ai",
      "name": "Suno AI",
      "tagline": "Make any song you can imagine with authentic vocals and instrumentals.",
      "category": "Audio Generation",
      "pricing": "Freemium",
      "rating": 4.8,
      "websiteUrl": "https://suno.com",
      "features": ["Full vocal songs", "Genre fusion", "Custom lyrics input"]
    }
  ]
}
\`\`\`

\`\`\`gen-ui:action-chips
{
  "heading": "Next Actions:",
  "chips": [
    "Compare AIVA vs Suno",
    "Show Speech-to-Text Tools",
    "Find Royalty-Free Audio"
  ]
}
\`\`\``;
  }

  if (lastUserMsg.includes('code') || lastUserMsg.includes('developer') || lastUserMsg.includes('programming')) {
    return `### Recommended AI Developer Utilities

Here are the top-rated AI code assistants for building full-stack applications:

\`\`\`gen-ui:tool-recommendation
{
  "tools": [
    {
      "id": "cursor_ai",
      "name": "Cursor",
      "tagline": "The AI-first Code Editor built for pairing with frontier LLMs.",
      "category": "Coding & Tech",
      "pricing": "Freemium",
      "rating": 4.9,
      "websiteUrl": "https://cursor.com",
      "features": ["Full Codebase Indexing", "Multi-file Edits", "Terminal Command Synthesis"]
    },
    {
      "id": "v0_dev",
      "name": "v0 by Vercel",
      "tagline": "Generative UI system for React, Next.js, and Tailwind CSS components.",
      "category": "Web Development",
      "pricing": "Freemium",
      "rating": 4.8,
      "websiteUrl": "https://v0.dev",
      "features": ["Instant Component Preview", "Copy-paste React JSX", "Design System Adherence"]
    }
  ]
}
\`\`\`

\`\`\`gen-ui:action-chips
{
  "heading": "Explore Coding AI:",
  "chips": [
    "Compare Cursor vs GitHub Copilot",
    "Show Database & Backend Tools",
    "Automate Testing with AI"
  ]
}
\`\`\``;
  }

  // General assistant introduction with interactive widgets
  return `Welcome to **${BRAND.assistantName}**! I am your AI assistant for discovering, comparing, and connecting utilities and automation pipelines.

\`\`\`gen-ui:tool-recommendation
{
  "tools": [
    {
      "id": "aiva",
      "name": "AIVA",
      "tagline": "AI composer for original soundtrack generation and cinematic scoring.",
      "category": "Music & Audio",
      "pricing": "Freemium",
      "rating": 4.9,
      "websiteUrl": "https://www.aiva.ai",
      "features": ["MIDI download", "250+ preset styles", "Commercial rights"]
    },
    {
      "id": "adcreative_ai",
      "name": "AdCreative.ai",
      "tagline": "Generate high-converting ad creatives and banners using machine learning.",
      "category": "Marketing & Ads",
      "pricing": "Paid",
      "rating": 4.7,
      "websiteUrl": "https://adcreative.ai",
      "features": ["Score predictions", "Multi-platform formats", "Text generator"]
    }
  ]
}
\`\`\`

\`\`\`gen-ui:action-chips
{
  "heading": "What would you like to explore?",
  "chips": [
    "Compare AIVA vs AdCreative.ai",
    "Show Top AI Video Generators",
    "Find Best AI Coding Tools",
    "Build Faceless Video Workflow"
  ]
}
\`\`\``;
}
