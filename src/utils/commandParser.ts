/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParsedCommand {
  type: 'action' | 'chat';
  action?: 'open_url' | 'search_web' | 'open_calculator' | 'fullscreen' | 'stop_speech' | 'timer';
  url?: string;
  title?: string;
  query?: string;
  seconds?: number;
  displayText?: string;
}

export interface QuickWebsite {
  id: string;
  name: string;
  nameHindi: string;
  url: string;
  icon: string;
  category: 'social' | 'tool' | 'dev' | 'search';
  keywords: string[];
}

export const QUICK_WEBSITES: QuickWebsite[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    nameHindi: 'यूट्यूब',
    url: 'https://www.youtube.com',
    icon: 'youtube',
    category: 'social',
    keywords: ['youtube', 'yt', 'video', 'गाने', 'यूट्यूब', 'विडियो'],
  },
  {
    id: 'google',
    name: 'Google',
    nameHindi: 'गूगल',
    url: 'https://www.google.com',
    icon: 'search',
    category: 'search',
    keywords: ['google', 'गूगल', 'search engine'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    nameHindi: 'जीमेल',
    url: 'https://mail.google.com',
    icon: 'mail',
    category: 'tool',
    keywords: ['gmail', 'mail', 'email', 'जीमेल', 'मेल', 'ईमेल', 'inbox'],
  },
  {
    id: 'github',
    name: 'GitHub',
    nameHindi: 'गिटहब',
    url: 'https://www.github.com',
    icon: 'github',
    category: 'dev',
    keywords: ['github', 'git', 'गिटहब', 'repo', 'code'],
  },
  {
    id: 'maps',
    name: 'Google Maps',
    nameHindi: 'गूगल मैप्स',
    url: 'https://maps.google.com',
    icon: 'map-pin',
    category: 'tool',
    keywords: ['maps', 'map', 'directions', 'रास्ता', 'मैप', 'मैप्स', 'location'],
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    nameHindi: 'विकिपीडिया',
    url: 'https://www.wikipedia.org',
    icon: 'book-open',
    category: 'search',
    keywords: ['wikipedia', 'wiki', 'विकिपीडिया'],
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    nameHindi: 'कैलेंडर',
    url: 'https://calendar.google.com',
    icon: 'calendar',
    category: 'tool',
    keywords: ['calendar', 'कैलेंडर', 'schedule', 'तारीख'],
  },
  {
    id: 'translate',
    name: 'Google Translate',
    nameHindi: 'अनुवाद',
    url: 'https://translate.google.com',
    icon: 'languages',
    category: 'tool',
    keywords: ['translate', 'translation', 'अनुवाद', 'डिक्शनरी'],
  },
];

/**
 * Detects if a text command is a direct browser action (e.g. "open youtube", "gmail kholo", etc.)
 */
export function parseQuickCommand(rawInput: string): ParsedCommand | null {
  if (!rawInput) return null;
  const text = rawInput.trim().toLowerCase();

  // 1. Fullscreen commands
  if (
    text === 'fullscreen' ||
    text === 'toggle fullscreen' ||
    text.includes('full screen') ||
    text.includes('फुल स्क्रीन') ||
    text.includes('स्क्रीन बड़ी करो')
  ) {
    return {
      type: 'action',
      action: 'fullscreen',
      displayText: 'Toggling full screen mode / फुल स्क्रीन मोड',
    };
  }

  // 2. Stop speech
  if (
    text === 'stop' ||
    text === 'stop talking' ||
    text === 'mute' ||
    text === 'chup ho jao' ||
    text === 'चुप हो जाओ' ||
    text === 'बोलना बंद करो' ||
    text === 'ruko'
  ) {
    return {
      type: 'action',
      action: 'stop_speech',
      displayText: 'Audio response stopped / आवाज़ बंद कर दी गई',
    };
  }

  // 3. Calculator
  if (
    text === 'calculator' ||
    text === 'open calculator' ||
    text === 'calculator kholo' ||
    text === 'कैलकुलेटर खोलो' ||
    text.startsWith('calculate ') ||
    text.startsWith('calc ')
  ) {
    return {
      type: 'action',
      action: 'open_calculator',
      title: 'Calculator',
      displayText: 'Opening Calculator / कैलकुलेटर खोल रहे हैं',
    };
  }

  // 4. Timer / Countdown: e.g. "set timer 5 minutes", "5 minute ka timer lagao"
  const timerMatchEn = text.match(/set (?:a )?timer (?:for )?(\d+)\s*(sec|second|min|minute)s?/);
  const timerMatchHi = text.match(/(\d+)\s*(मिनट|सेकंड|min|minute|sec|second)\s*(?:का)?\s*टाइमर/);
  if (timerMatchEn) {
    const amount = parseInt(timerMatchEn[1], 10);
    const unit = timerMatchEn[2];
    const seconds = unit.startsWith('sec') ? amount : amount * 60;
    return {
      type: 'action',
      action: 'timer',
      seconds,
      displayText: `Setting timer for ${amount} ${unit}s / टाइमर सेट किया जा रहा है`,
    };
  }
  if (timerMatchHi) {
    const amount = parseInt(timerMatchHi[1], 10);
    const unit = timerMatchHi[2];
    const isSec = unit.includes('सेकंड') || unit.startsWith('sec');
    const seconds = isSec ? amount : amount * 60;
    return {
      type: 'action',
      action: 'timer',
      seconds,
      displayText: `${amount} ${isSec ? 'सेकंड' : 'मिनट'} का टाइमर सेट किया गया`,
    };
  }

  // 5. YouTube video & music commands
  // Pattern A: "YouTube खोलो और गाना चलाओ" / "YouTube kholo aur gana chalao" / "YouTube kholo aur XYZ chalao"
  const ytOpenAndPlayMatch = text.match(
    /(?:youtube|यूट्यूब)\s+(?:kholo|open\s*karo|खोलो|खोलिए)\s*(?:aur|and|व|तथा|और)?\s*(?:koi\s+|ek\s+|कोई\s+|एक\s+)?(.+?)\s*(?:chalao|bajao|lagao|play\s*karo|चलाओ|बजाओ|लगाओ)/i
  );
  if (ytOpenAndPlayMatch && ytOpenAndPlayMatch[1]) {
    let q = ytOpenAndPlayMatch[1].trim();
    q = q.replace(/^(?:aur|और|and|koi|ek|कोई|एक)\s+/i, '').trim();
    // Normalize generic words like "gana", "gaana", "song", "गाना" to top trending songs
    if (['gana', 'gaana', 'geet', 'song', 'songs', 'music', 'गाना', 'गाने', 'गीत', 'संगीत'].includes(q)) {
      q = 'trending songs';
    }
    return {
      type: 'action',
      action: 'open_url',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      title: q === 'trending songs' ? 'YouTube Trending Songs' : `YouTube: "${q}"`,
      query: q,
      displayText: q === 'trending songs' ? 'YouTube खोला जा रहा है और ट्रेंडिंग गाने चला रहे हैं' : `YouTube खोला जा रहा है और "${q}" खोज रहे हैं`,
    };
  }

  // Pattern B: Direct "गाना चलाओ" / "gana chalao" / "play music on youtube"
  if (
    text === 'gana chalao' ||
    text === 'gaana chalao' ||
    text === 'gana bajao' ||
    text === 'गाना चलाओ' ||
    text === 'गाना बजाओ' ||
    text === 'गाने चलाओ' ||
    text === 'play song' ||
    text === 'play music' ||
    text === 'play songs'
  ) {
    return {
      type: 'action',
      action: 'open_url',
      url: `https://www.youtube.com/results?search_query=trending+songs`,
      title: 'YouTube Music & Songs',
      query: 'trending songs',
      displayText: 'YouTube पर ट्रेंडिंग गाने चला रहे हैं / Playing trending songs on YouTube',
    };
  }

  // Pattern C: "play XYZ on youtube" / "youtube par XYZ chalao"
  const ytPlayMatch = text.match(/(?:play|search)\s+(.+)\s+on\s+youtube/i);
  const ytPlayMatchHi = text.match(
    /(?:youtube|यूट्यूब)\s+(?:par|pe|पर|पे)\s+(.+?)\s*(?:chalao|bajao|lagao|search\s+karo|play\s+karo|चलाओ|बजाओ|लगाओ|खोजो)/i
  );
  if (ytPlayMatch && ytPlayMatch[1]) {
    let q = ytPlayMatch[1].trim();
    if (['gana', 'song', 'music'].includes(q)) q = 'trending songs';
    return {
      type: 'action',
      action: 'open_url',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      title: `YouTube: "${q}"`,
      query: q,
      displayText: `Searching YouTube for "${q}" / यूट्यूब पर "${q}" खोज रहे हैं`,
    };
  }
  if (ytPlayMatchHi && ytPlayMatchHi[1]) {
    let q = ytPlayMatchHi[1].trim();
    if (['gana', 'gaana', 'song', 'गाना', 'गाने'].includes(q)) q = 'trending songs';
    return {
      type: 'action',
      action: 'open_url',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      title: `YouTube: "${q}"`,
      query: q,
      displayText: `यूट्यूब पर "${q}" खोज रहे हैं`,
    };
  }

  // 6. Google Web Search query: "search for XYZ", "google par search karo XYZ", "गूगल पर सर्च करो XYZ"
  const googleSearchMatch = text.match(
    /^(?:google\s+search|search\s+(?:for|on\s+google|google\s+for))\s+(.+)/i
  );
  const googleSearchHi = text.match(
    /(?:google|गूगल)\s+(?:par|pe|पर|पे|में)?\s*(?:search\s+karo|सर्च\s+करो|ढूंढो|खोजो)\s*(.+)/i
  );
  const googleSearchSuffix = text.match(
    /^(.+?)\s+(?:google\s+par\s+search\s+karo|गूगल\s+पर\s+सर्च\s+करो|google\s+search)/i
  );

  if (googleSearchMatch && googleSearchMatch[1]) {
    const q = googleSearchMatch[1].trim();
    if (!['kholo', 'open', 'search'].includes(q)) {
      return {
        type: 'action',
        action: 'open_url',
        url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
        title: `Google Search: "${q}"`,
        query: q,
        displayText: `Searching Google for "${q}" / गूगल पर "${q}" सर्च कर रहे हैं`,
      };
    }
  }
  if (googleSearchHi && googleSearchHi[1]) {
    const q = googleSearchHi[1].trim();
    if (!['kholo', 'open', 'search'].includes(q)) {
      return {
        type: 'action',
        action: 'open_url',
        url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
        title: `Google Search: "${q}"`,
        query: q,
        displayText: `गूगल पर "${q}" सर्च कर रहे हैं`,
      };
    }
  }
  if (googleSearchSuffix && googleSearchSuffix[1]) {
    const q = googleSearchSuffix[1].trim();
    if (!['kholo', 'open', 'search'].includes(q)) {
      return {
        type: 'action',
        action: 'open_url',
        url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
        title: `Google Search: "${q}"`,
        query: q,
        displayText: `गूगल पर "${q}" सर्च कर रहे हैं`,
      };
    }
  }

  // 7. Direct Website Open commands
  for (const site of QUICK_WEBSITES) {
    for (const kw of site.keywords) {
      const patterns = [
        `open ${kw}`,
        `launch ${kw}`,
        `go to ${kw}`,
        `${kw} kholo`,
        `${kw} open karo`,
        `${kw} खोलिए`,
        `${kw} खोलो`,
        kw,
      ];
      if (patterns.includes(text)) {
        return {
          type: 'action',
          action: 'open_url',
          url: site.url,
          title: site.name,
          displayText: `Opening ${site.name} (${site.nameHindi}) / ${site.name} खोला जा रहा है`,
        };
      }
    }
  }

  return null;
}

/**
 * Strips Markdown, code blocks, URLs, and formatting characters so SpeechSynthesis
 * can speak naturally without reading symbols like asterisks, backticks, or bracket links.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  return (
    text
      // Remove code blocks ```...```
      .replace(/```[\s\S]*?```/g, ' [कोड ब्लॉक छोड़ दिया गया] ')
      // Remove inline code `...`
      .replace(/`([^`]+)`/g, '$1')
      // Convert markdown links [Label](url) -> Label
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove bare URLs
      .replace(/https?:\/\/\S+/g, '')
      // Remove headers #, ##, ###
      .replace(/^#{1,6}\s+/gm, '')
      // Remove blockquotes >
      .replace(/^>\s+/gm, '')
      // Remove bold/italic markers (*, _, ~~)
      .replace(/[*_~]{1,3}/g, '')
      // Replace bullet points with brief pauses
      .replace(/^\s*[-*+]\s+/gm, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Checks if a string contains Hindi / Devanagari script characters
 */
export function hasHindiCharacters(text: string): boolean {
  if (!text) return false;
  // Unicode range for Devanagari: \u0900-\u097F
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Determines preferred speech language based on content and preference
 */
export function detectSpeechLanguage(text: string, preferred: 'hi' | 'en' | 'auto'): 'hi-IN' | 'en-US' {
  if (preferred === 'hi') return 'hi-IN';
  if (preferred === 'en') return 'en-US';
  return hasHindiCharacters(text) ? 'hi-IN' : 'en-US';
}
