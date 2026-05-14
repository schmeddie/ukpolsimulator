# Project Westminster — UK Politics Simulator

A Football Manager-style UK political career simulator. Rise from Backbencher to Prime Minister.

## Requirements

- Node.js 18+
- npm 9+

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Other Commands

```bash
npm run build   # Production build
npm start       # Serve production build
npm run lint    # ESLint
```

## AI Features (Optional)

The game works without an API key. To enable dynamic emails, policy analysis, and Dispatch Box debates:

1. Go to **Settings** (bottom of the sidebar)
2. Choose a provider: **OpenAI**, **Anthropic**, or **OpenRouter**
3. Paste your API key
4. Click **Test Connection** to verify
5. Click **Save Key**

Your key is stored in browser `localStorage` only — it never leaves your machine.

| Provider | Recommended model | Get a key |
|---|---|---|
| OpenAI | `gpt-4o-mini` | platform.openai.com |
| Anthropic | `claude-haiku-4-5-20251001` | console.anthropic.com |
| OpenRouter | `openai/gpt-4o-mini` | openrouter.ai |

## Save Files

Progress is auto-saved to `localStorage` under the key `westminster-save`. To start a new game, click **New Game** at the bottom of the sidebar.
