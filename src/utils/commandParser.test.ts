/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseQuickCommand,
  cleanTextForSpeech,
  hasHindiCharacters,
  detectSpeechLanguage,
} from './commandParser.ts';

test('parseQuickCommand detects direct site open commands in English & Hindi', () => {
  const ytEn = parseQuickCommand('open youtube');
  assert.ok(ytEn);
  assert.equal(ytEn?.action, 'open_url');
  assert.equal(ytEn?.url, 'https://www.youtube.com');

  const gmailHi = parseQuickCommand('gmail kholo');
  assert.ok(gmailHi);
  assert.equal(gmailHi?.action, 'open_url');
  assert.equal(gmailHi?.url, 'https://mail.google.com');

  const devanagariYt = parseQuickCommand('यूट्यूब खोलो');
  assert.ok(devanagariYt);
  assert.equal(devanagariYt?.action, 'open_url');
});

test('parseQuickCommand handles YouTube searches with parameters', () => {
  const result = parseQuickCommand('play lofi hip hop on youtube');
  assert.ok(result);
  assert.equal(result?.action, 'open_url');
  assert.ok(result?.url?.includes('lofi%20hip%20hop'));

  // Test YouTube खोलो और गाना चलाओ
  const ytGanaHi = parseQuickCommand('YouTube खोलो और गाना चलाओ');
  assert.ok(ytGanaHi);
  assert.equal(ytGanaHi?.action, 'open_url');
  assert.equal(ytGanaHi?.query, 'trending songs');
  assert.ok(ytGanaHi?.url?.includes('trending%20songs'));

  const ytGanaHinglish = parseQuickCommand('youtube kholo aur gana chalao');
  assert.ok(ytGanaHinglish);
  assert.equal(ytGanaHinglish?.action, 'open_url');
  assert.equal(ytGanaHinglish?.query, 'trending songs');

  const ganaDirect = parseQuickCommand('गाना चलाओ');
  assert.ok(ganaDirect);
  assert.equal(ganaDirect?.action, 'open_url');

  // Test Google search commands
  const gSearch = parseQuickCommand('google par search karo artificial intelligence');
  assert.ok(gSearch);
  assert.equal(gSearch?.action, 'open_url');
  assert.ok(gSearch?.url?.includes('google.com/search?q=artificial%20intelligence'));
});

test('parseQuickCommand detects timer commands', () => {
  const timer5m = parseQuickCommand('set timer for 5 minutes');
  assert.ok(timer5m);
  assert.equal(timer5m?.action, 'timer');
  assert.equal(timer5m?.seconds, 300);

  const timer30s = parseQuickCommand('30 सेकंड का टाइमर');
  assert.ok(timer30s);
  assert.equal(timer30s?.action, 'timer');
  assert.equal(timer30s?.seconds, 30);
});

test('cleanTextForSpeech strips Markdown syntax and code fences', () => {
  const markdown = '# Hello World\nHere is **bold** and `code`.\n```ts\nconsole.log(1);\n```\nCheck [YouTube](https://youtube.com)';
  const cleaned = cleanTextForSpeech(markdown);
  assert.ok(!cleaned.includes('**'));
  assert.ok(!cleaned.includes('#'));
  assert.ok(!cleaned.includes('```'));
  assert.ok(!cleaned.includes('https://youtube.com'));
  assert.ok(cleaned.includes('Hello World'));
  assert.ok(cleaned.includes('YouTube'));
});

test('hasHindiCharacters and detectSpeechLanguage works accurately', () => {
  assert.equal(hasHindiCharacters('नमस्ते विवेक जी'), true);
  assert.equal(hasHindiCharacters('Hello Vivek'), false);

  assert.equal(detectSpeechLanguage('नमस्ते', 'auto'), 'hi-IN');
  assert.equal(detectSpeechLanguage('Hello Vivek', 'auto'), 'en-US');
  assert.equal(detectSpeechLanguage('Hello', 'hi'), 'hi-IN');
});
