# Clause AI 🤖

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Stack-Next.js%2016-black.svg" alt="Stack">
</p>

<p align="center">
  An advanced AI compliance and finance analyst system with multi-agent orchestration, real-time data visualization, and multiple LLM provider support.
</p>

---

## ✨ Features

### 🤖 Multi-Agent Orchestration
- **ClauseCore** - Central orchestrator that manages task decomposition, agent routing, and output aggregation
- **10+ Specialized Agents**:
  - Finance Agent - Compliance and financial analysis
  - Data Analyst Agent - Data trends and anomaly detection
  - Web Search Agent - Real-time data fetching from web APIs
  - Visualization Controller - Chart and graph generation
  - UI Rendering Agent - HTML visualization
  - Policy Drafter - Policy document generation
  - System Evolution Agent - Performance optimization
  - And more...

### 📊 Real-Time Data Visualization
- Automatic data fetching from World Bank API
- Gold prices, GDP, Inflation, Stock indices
- Interactive charts using `clause:viz` format
- Line, Bar, Pie, and KPI visualizations
- Canvas-based multi-agent output display

### 🔐 Authentication
- **Supabase Auth** - Magic link and OAuth
- **GitHub OAuth** - Direct GitHub login
- Google OAuth integration
- Secure session management

### 🧠 Multiple LLM Providers (with automatic fallback)
1. **NVIDIA** - Free endpoint models
2. **OpenRouter** - Multiple free models
3. **GitHub Models** - Free via GitHub OAuth
4. **Groq** - Free tier inference

### 🎨 UI/UX
- Extreme dark theme (black/grey/off-white/cream)
- Rich elegant fonts
- Responsive design
- Real-time chat interface

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+ (for Python server)
- Supabase account (for auth & database)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mohitsharma-2007/-Clause.git
cd Clause

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

### Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# LLM Providers (at least one required)
NVIDIA_API_KEY=your_nvidia_key
OPENROUTER_API_KEY=your_openrouter_key
GROQ_API_KEY=your_groq_key
GITHUB_MODELS_TOKEN=your_github_token

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
```

### Running the Application

```bash
# Start both frontend and Python server (Windows)
start_servers.bat

# Or start manually
npm run dev          # Frontend (Next.js)
python server/app.py # Backend (Python)
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📖 Usage

### Chat with Clause
1. Sign in using email (magic link), Google, or GitHub
2. Select an agent from the dropdown (default: Finance Agent)
3. Ask questions about:
   - Financial compliance (AML, KYC, SOX, etc.)
   - Data visualization requests
   - Policy drafting
   - Real-time data (gold prices, GDP, inflation)

### Example Queries

```text
"Visualize the Gold Price change in India from Covid till Now"
"What are the AML requirements for banking transactions?"
"Analyze the GDP growth trend of India over the last 10 years"
"Create a policy for KYC compliance"
```

### Visualization Format

When Clause generates visualizations, it uses this format:

```clause:viz
{ "type": "line", "title": "Gold Price in India", "x": "Year", "y": "INR", "data": [...] }
```

---

## 🏗️ Architecture

```
Clause/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── auth/          # OAuth routes
│   │   ├── chat/          # Chat API
│   │   └── ...
│   ├── dashboard/         # Main dashboard
│   └── login/             # Authentication
├── lib/ai/
│   ├── providers.ts       # LLM provider integration
│   ├── agents.ts          # Agent definitions
│   └── embeddings.ts      # RAG embeddings
├── src/
│   ├── agents/             # Agent implementations
│   ├── core/              # ClauseCore orchestrator
│   ├── visualization/     # Visualization engine
│   └── ...
├── server/
│   └── app.py             # Python server
└── assets/
    └── styles/            # CSS themes
```

---

## 🔧 Configuration

### Supported LLM Models

| Provider | Model | Status |
|----------|-------|--------|
| NVIDIA | meta/llama-3.1-70b-instruct | ✅ Primary |
| OpenRouter | meta-llama/llama-3.1-70b-instruct | ✅ Fallback |
| GitHub | Llama-3.1-70B-Instruct | ✅ Fallback |
| Groq | llama-3.1-70b-versatile | ✅ Fallback |

### Data Sources

- **World Bank API** - GDP, Inflation, Gold Prices
- **DuckDuckGo** - Web search
- **Public APIs** - Free API directory

---

## 📝 API Keys Setup

### Get NVIDIA API Key
1. Visit [NVIDIA NGC](https://org.ngc.nvidia.com/)
2. Create account and get free API key

### Get OpenRouter Key
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up and get free credits

### Get Groq Key
1. Visit [Groq Console](https://console.groq.com/)
2. Create API key (free tier available)

### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create OAuth App
3. Set callback URL to `/api/auth/github/callback`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend-as-a-Service
- [World Bank API](https://data.worldbank.org/) - Open data
- [NVIDIA](https://www.nvidia.com/) - Free inference endpoints
- [OpenRouter](https://openrouter.ai/) - Multi-provider LLM gateway

---

<p align="center">Built with ❤️ using Next.js, TypeScript, and Python</p>