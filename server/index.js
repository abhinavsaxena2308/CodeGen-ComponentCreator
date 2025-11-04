const fs = require('fs');
const path = require('path');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // allow all origins for dev; tighten in production
app.use(express.json({ limit: '1mb' }));

// basic rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
});
app.use(limiter);

// instantiate Gemini client if key provided
let model = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('Gemini client initialized');
  } catch (e) {
    console.warn('Failed to initialize Gemini client:', e.message || e);
  }
}

// in-memory cache for generated items
const cache = new Map();
// simple persistent history file
const DATA_DIR = path.join(__dirname, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'generated_history.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// load existing history (best-effort)
let history = [];
try {
  if (fs.existsSync(HISTORY_FILE)) {
    const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
    history = JSON.parse(raw) || [];
    history.forEach(item => cache.set(item.id, item));
  }
} catch (e) {
  console.warn('Could not load history file:', e.message || e);
}

// utility to persist history
function persistHistory() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to persist history:', e.message || e);
  }
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// create an iframe-friendly preview for React or raw HTML/JS/CSS
function buildPreviewHtml(code, language) {
  const lang = (language || '').toLowerCase();
  
  // Handle all HTML-related languages
  if (lang === 'html' || lang === 'html/css' || lang === 'plain' || 
      lang === 'js' || lang === 'javascript' || lang === 'html+css' || 
      lang === 'html+tailwind') {
    // For HTML-related content, we want to show it directly
    if (lang === 'html' || lang.startsWith('html')) {
      // If it's already a complete HTML document, return as-is
      if (code.trim().startsWith('<!DOCTYPE') || code.trim().startsWith('<html')) {
        return code;
      }
      // Otherwise wrap it in a basic HTML structure
      const escaped = code.replace(/<\/script>/gi, '<\\/script>');
      return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body>${escaped}</body></html>`;
    } else {
      // For plain, js, javascript, return a wrapped HTML page
      const escaped = code.replace(/<\/script>/gi, '<\\/script>');
      return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body>${escaped}</body></html>`;
    }
  }

  if (lang === 'react' || lang === 'reactjs' || lang === 'react.jsx' || lang === 'reacttsx') {
    // basic React sandbox using unpkg + Babel (client-side transform)
    // Note: This is a lightweight approach for quick previews; for production use a proper bundler sandbox.
    let cleaned = code;
    // convert `export default` to a renderable const (best-effort)
    cleaned = cleaned.replace(/export\s+default/gi, 'const Component =');
    
    // For React, we only need to include the code once in the script tag
    const script = `
      ${cleaned}
      try {
        const mount = document.getElementById('root');
        if (typeof Component !== 'undefined') {
          ReactDOM.createRoot(mount).render(React.createElement(Component));
        } else if (typeof App !== 'undefined') {
          ReactDOM.createRoot(mount).render(React.createElement(App));
        } else {
          // attempt to render default export fallback if file used export = ...
          console.warn('No Component or App export found. Render output may be empty.');
        }
      } catch (e) {
        const pre = document.createElement('pre');
        pre.style.color = 'red';
        pre.textContent = 'Runtime error:\\n' + e.toString();
        document.body.appendChild(pre);
        console.error(e);
      }
    `;
    
    // escape closing script tags in cleaned content
    const safeScript = script.replace(/<\/script>/gi, '<\\/script>');
    
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>html,body,#root{height:100%;margin:0;padding:0}</style>
  <!-- React 18 -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${safeScript}
  </script>
</body>
</html>`;
  }

  // Handle Vue.js
  if (lang === 'vue') {
    // Simple Vue preview using CDN
    const escaped = code.replace(/<\/script>/gi, '<\\/script>');
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Vue Preview</title>
  <!-- Vue 3 -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
  <div id="app"></div>
  <script>
    ${escaped}
  </script>
</body>
</html>`;
  }

  // Handle CSS
  if (lang === 'css') {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    ${code}
  </style>
</head>
<body>
  <div class="preview-container">
    <h1>CSS Preview</h1>
    <p>Below is a sample element to demonstrate your CSS:</p>
    <div class="sample-element">Sample Element</div>
  </div>
</body>
</html>`;
  }

  // Handle JavaScript
  if (lang === 'javascript' || lang === 'js') {
    const escaped = code.replace(/<\/script>/gi, '<\\/script>');
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body>
  <script>
    ${escaped}
  </script>
</body>
</html>`;
  }

  // Handle TypeScript
  if (lang === 'typescript' || lang === 'ts') {
    // For TypeScript, we show it as code since browser can't execute it directly
    const escaped = String(code).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
    pre { margin: 0; }
  </style>
</head>
<body>
  <h2>TypeScript Code Preview</h2>
  <pre>${escaped}</pre>
</body>
</html>`;
  }

  // Handle Python, Java and other backend languages
  if (lang === 'python' || lang === 'java') {
    const escaped = String(code).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
    pre { margin: 0; }
  </style>
</head>
<body>
  <h2>${language} Code Preview</h2>
  <pre>${escaped}</pre>
  <p style="margin-top: 20px; color: #999;">Note: This is backend code that cannot be executed in the browser.</p>
</body>
</html>`;
  }

  // fallback: return the code included in a preformatted HTML
  const escaped = String(code).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!doctype html><html><body><pre>${escaped}</pre></body></html>`;
}

// POST /generate
app.post('/generate', async (req, res) => {
  try {
    const { prompt, language } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' });
    }
    const lang = (language || 'plain').toLowerCase();

    // Build Gemini prompt
    const modelPrompt = `Generate ${lang} code for the following prompt: ${prompt}
Include a full component or page implementation with minimal external dependencies.
Return code only, and if appropriate include any CSS.`;

    let codeOutput = '';
    if (!model) {
      // local fallback: echo the prompt in a code block
      codeOutput = `/* Gemini client not configured. Fallback output. Prompt: */\n/* ${prompt} */\n\n<div>Preview not available - GEMINI_API_KEY not set on server.</div>`;
    } else {
      // call Gemini
      try {
        const result = await model.generateContent([modelPrompt]);
        // Prefer result.response.text() when available
        if (result && result.response && typeof result.response.text === 'function') {
          codeOutput = await result.response.text();
        } else if (result && result.candidates && result.candidates.length) {
          // best-effort fallback depending on client response shape
          codeOutput = result.candidates[0].content || JSON.stringify(result, null, 2);
        } else {
          codeOutput = JSON.stringify(result, null, 2);
        }
      } catch (gErr) {
        console.error('Gemini generate error:', gErr);
        return res.status(502).json({ error: 'AI generation failed', details: String(gErr) });
      }
    }

    // Strip markdown code fences if present
    codeOutput = codeOutput.replace(/```[a-zA-Z]*\n?/g, '').trim();

    // Build preview HTML
    const previewHtml = buildPreviewHtml(codeOutput, lang);

    // cache & persist
    const id = makeId();
    const item = {
      id,
      prompt,
      language: lang,
      code: codeOutput,
      preview: previewHtml,
      timestamp: new Date().toISOString(),
    };
    cache.set(id, item);
    history.unshift({ id: item.id, prompt: item.prompt, language: item.language, timestamp: item.timestamp });
    // keep history bounded
    if (history.length > 200) history = history.slice(0, 200);
    persistHistory();

    // also write a temp file for the preview (optional)
    try {
      const previewPath = path.join(DATA_DIR, `${id}.html`);
      fs.writeFileSync(previewPath, previewHtml, 'utf8');
    } catch (e) {
      // non-fatal
      console.warn('Could not write preview html file:', e.message || e);
    }

    return res.json({
      id: item.id,
      code: item.code,
      preview: item.preview, // iframe-friendly full html string
      language: item.language,
    });
  } catch (err) {
    console.error('Server error /generate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /preview/:id -> serves preview HTML (Content-Type: text/html)
app.get('/preview/:id', (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).send('Missing id');
  const cached = cache.get(id);
  if (cached && cached.preview) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(cached.preview);
  }
  // try loading from disk
  const diskPath = path.join(DATA_DIR, `${id}.html`);
  if (fs.existsSync(diskPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(fs.readFileSync(diskPath, 'utf8'));
  }
  return res.status(404).json({ error: 'Preview not found' });
});

// GET /history -> returns simple list of past prompts
app.get('/history', (req, res) => {
  res.json(history);
});

// GET /languages -> supported languages/frameworks
app.get('/languages', (req, res) => {
  res.json([
    'react', 'vue', 'html', 'css', 'javascript', 'typescript', 'python', 'java'
  ]);
});

// basic health
app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`CodeGen backend listening on http://localhost:${PORT}`);
});
