/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Initialize server-side Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } else {
    console.warn('GEMINI_API_KEY is not set in environment.');
  }

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
      name: 'VIVEK AI Engine',
    });
  });

  // Streaming chat completion endpoint with SSE & Google Search Grounding
  app.post('/api/chat/stream', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const {
        message,
        history = [],
        language = 'auto',
        searchEnabled = false,
      } = req.body;

      if (!message || typeof message !== 'string') {
        sendEvent({ error: 'Message is required', done: true });
        res.end();
        return;
      }

      if (!ai) {
        sendEvent({
          text: `नमस्ते विवेक जी! मैं VIVEK AI हूँ। (नोट: बैकएंड में GEMINI_API_KEY उपलब्ध नहीं पाई गई। कृपया AI Studio Settings > Secrets पैनल में अपनी API Key जांचें। तब तक मैं आपके ब्राउज़र कमांड्स और लोकल टूल्स को पूरी तरह संचालित कर सकता हूँ!)`,
          done: true,
          sources: [],
        });
        res.end();
        return;
      }

      const systemInstruction = `You are VIVEK AI, a premier AI personal assistant built for Vivek and modern power users.
Your persona is charismatic, highly intelligent, polite, proactive, concise, and quick to respond.
You possess flawless bilingual capabilities in both Hindi (सहज, आदरणीय हिंदी) and English, as well as colloquial Hinglish.
- If the user speaks or writes in Hindi or Hinglish, respond warmly and respectfully in Hindi (use 'आप', 'नमस्ते', 'बिल्कुल').
- If the user communicates in English, respond in articulate, modern English.
- Preferred response style: Direct, crisp, helpful, well-structured with Markdown headings, lists, and code blocks where applicable.
- If the user asks you to open YouTube, play songs, search Google, open Gmail, GitHub, Maps, or other sites, acknowledge the request enthusiastically.
- When Google Search grounding is enabled or when answering recent facts/news, summarize key findings accurately.`;

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history) && history.length > 0) {
        const recentHistory = history.slice(-10);
        for (const item of recentHistory) {
          if (item && item.text) {
            contents.push({
              role: item.role === 'model' ? 'model' : 'user',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const config: any = {
        systemInstruction,
      };

      if (searchEnabled) {
        config.tools = [{ googleSearch: {} }];
      }

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
        config,
      });

      const collectedSources: Array<{ title: string; url: string }> = [];

      for await (const chunk of responseStream) {
        const text = chunk.text || '';
        const groundingChunks =
          chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;

        if (Array.isArray(groundingChunks)) {
          for (const g of groundingChunks) {
            const uri = g.web?.uri;
            if (uri && !collectedSources.some((s) => s.url === uri)) {
              collectedSources.push({
                title: g.web?.title || uri,
                url: uri,
              });
            }
          }
        }

        if (text) {
          sendEvent({ text });
        }
      }

      // Final event with sources
      sendEvent({
        done: true,
        sources: collectedSources,
      });
      res.end();
    } catch (err: any) {
      console.error('Error generating AI streaming response:', err);
      sendEvent({
        error: err?.message || 'Error communicating with AI engine',
        text: ' क्षमा करें विवेक जी, तकनीकी रुकावट आई। कृपया पुनः प्रयास करें।',
        done: true,
      });
      res.end();
    }
  });

  // Chat completion endpoint with Gemini & optional Google Search Grounding (non-streaming fallback)
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const {
        message,
        history = [],
        language = 'auto',
        searchEnabled = false,
      } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      if (!ai) {
        res.json({
          text: `नमस्ते विवेक जी! मैं VIVEK AI हूँ। (नोट: बैकएंड में GEMINI_API_KEY उपलब्ध नहीं पाई गई। कृपया AI Studio Settings > Secrets पैनल में अपनी API Key जांचें। तब तक मैं आपके ब्राउज़र कमांड्स और लोकल टूल्स को पूरी तरह संचालित कर सकता हूँ!)`,
          sources: [],
          languageDetected: language,
        });
        return;
      }

      const systemInstruction = `You are VIVEK AI, a premier AI personal assistant built for Vivek and modern power users.
Your persona is charismatic, highly intelligent, polite, proactive, and concise.
You possess flawless bilingual capabilities in both Hindi (सहज, आदरणीय हिंदी) and English, as well as colloquial Hinglish.
- If the user speaks or writes in Hindi or Hinglish, respond warmly and respectfully in Hindi (use 'आप', 'नमस्ते', 'बिल्कुल').
- If the user communicates in English, respond in articulate, modern English.
- Preferred response style: Direct, helpful, well-structured with Markdown headings, lists, and code blocks where applicable.
- If the user asks you to open YouTube, Google, Gmail, GitHub, Maps, or other sites, acknowledge the request enthusiastically.
- When Google Search grounding is enabled or when answering recent facts/news, summarize key findings accurately.`;

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history) && history.length > 0) {
        const recentHistory = history.slice(-10);
        for (const item of recentHistory) {
          if (item && item.text) {
            contents.push({
              role: item.role === 'model' ? 'model' : 'user',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const config: any = {
        systemInstruction,
      };

      if (searchEnabled) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config,
      });

      const responseText = response.text || 'I am here to assist you, Vivek.';

      const sources: Array<{ title: string; url: string }> = [];
      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      if (Array.isArray(groundingChunks)) {
        for (const chunk of groundingChunks) {
          if (chunk.web?.uri) {
            sources.push({
              title: chunk.web.title || chunk.web.uri,
              url: chunk.web.uri,
            });
          }
        }
      }

      res.json({
        text: responseText,
        sources,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error generating AI response:', err);
      const errorMessage =
        err?.message || 'Error communicating with VIVEK AI intelligence core';
      res.status(500).json({
        error: errorMessage,
        fallbackText:
          'क्षमा करें, मुझे इस समय उत्तर देने में तकनीकी रुकावट आ रही है। कृपया पुनः प्रयास करें। (Sorry, I encountered an issue processing your request. Please try again.)',
      });
    }
  });

  // Mount Vite middlewares in development or serve static assets in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ VIVEK AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
