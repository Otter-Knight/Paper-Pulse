# 📚 PaperPulse

Your personal AI research paper recommendation system. Automatically fetches, filters, and summarizes papers from arXiv and OpenReview daily.

## Features

- 🤖 LLM-powered relevance scoring
- 📝 Automatic summaries (quick + detailed)
- 🎨 Clean, responsive UI with dark mode
- ⚡ Zero-cost hosting on GitHub Pages
- 🔄 Automated daily updates via GitHub Actions

## Setup

### 1. Clone and Configure

```bash
git clone https://github.com/yourusername/PaperPulse.git
cd PaperPulse
```

### 2. Customize Research Interests

Edit `src/config.py` to set your keywords and research areas.

### 3. Add OpenAI API Key

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret

- Name: `OPENAI_API_KEY`
- Value: Your OpenAI API key

### 4. Enable GitHub Pages

Settings → Pages → Source: Deploy from a branch → Branch: `gh-pages` → Save

### 5. Run First Update

Go to Actions tab → Daily Paper Update → Run workflow

## Local Development

```bash
pip install -r requirements.txt
export OPENAI_API_KEY="your-key"
python main.py
python scripts/generate_site.py
```

Open `docs/index.html` in your browser.

## Cost Optimization

- Keyword prefiltering reduces LLM API calls
- Uses `gpt-4o-mini` by default (cheap)
- Processes ~10-30 papers/day = ~$0.10-0.30/day

## Customization

- **Change LLM provider**: Modify `OPENAI_BASE_URL` in config
- **Adjust threshold**: Change `RELEVANCE_THRESHOLD` (0-10 scale)
- **Add sources**: Extend fetchers in `src/fetchers/`

## License

MIT
