# PhD Supervisor Fit Analyzer

PhD Supervisor Fit Analyzer is a Next.js web app for doctoral applicants who want a structured supervisor screening report from an advisor name and profile URL.

The app fetches public text from the advisor profile page, sends it to the OpenAI API with a strict evidence-aware prompt, and returns a Chinese Markdown report covering research fit, methods, publications, academic network, risks, and application strategy.

## Features

- Academic dashboard style interface
- Advisor name and profile URL input
- Built-in applicant research profile focused on AI and society, digital labour, platform capitalism, algorithmic management, urban space, time-space compression, and social integration
- Optional notes field for programme, funding, or country-specific context
- Next.js API route for server-side page fetching and OpenAI analysis
- Chinese Markdown report rendering with tables
- Copy Markdown button
- Download Markdown button
- Ready for Vercel deployment

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- OpenAI API
- React Markdown
- remark-gfm
- Vercel-compatible API route

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Add your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `OPENAI_MODEL` | No | Defaults to `gpt-4.1` if omitted |

## How The Analysis Works

1. The user enters an advisor name and advisor profile URL.
2. The API route fetches readable text from the public profile page.
3. The app combines the fetched text with the applicant research profile and optional notes.
4. The OpenAI prompt asks for a Chinese Markdown report using the required scoring system.
5. The model is instructed not to fabricate advisor information, papers, funding, PhD availability, or student outcomes.
6. If public information is missing, the report must state “公开信息不足” or “未找到明确证据”.

## Scoring System

| Dimension | Max |
| --- | ---: |
| A. Research Topic Fit | 35 |
| B. Methodological Fit | 20 |
| C. Academic Status & Network | 15 |
| D. Research Group & Outputs | 15 |
| E. Expandability | 15 |
| Total | 100 |

Recommendation levels:

- S: 85-100, 高度匹配，优先套磁
- A: 75-84, 很值得申请
- B: 60-74, 有交叉点，可作为备选
- C: 45-59, 相关性一般，谨慎考虑
- D: 0-44, 不建议重点投入

## Important Accuracy Notes

This app only uses the advisor URL supplied by the user. Many academic profile pages are incomplete, blocked, or dynamically rendered. The report is designed to be cautious:

- It must not invent publications, funding, students, or PhD recruitment status.
- Missing information should be marked as unavailable instead of treated as negative evidence.
- Publication classification should be based on visible titles, abstracts, keywords, or journal themes.
- Users should manually verify supervisor availability, programme fit, and funding before contacting a supervisor.

## Vercel Deployment

1. Push this project to GitHub.
2. Create a new Vercel project from the repository.
3. Add environment variables in Vercel:
   - `OPENAI_API_KEY`
   - Optional: `OPENAI_MODEL`
4. Deploy.

The API route uses the Node.js runtime and is configured with a 60-second maximum duration:

```ts
export const runtime = "nodejs";
export const maxDuration = 60;
```

If reports are timing out, consider using a faster model, shortening the fetched page text, or moving deeper publication crawling to a background job.

## Project Structure

```text
app/
  api/analyze/route.ts     Server-side analysis endpoint
  globals.css              Tailwind base styles
  layout.tsx               Root layout and metadata
  page.tsx                 Main dashboard UI
lib/
  defaultApplicantProfile.ts
  prompts.ts               Report prompt template
  webText.ts               Public profile page fetcher and HTML text extraction
.env.example
README.md
```

## Limitations

- The first version fetches only the supplied advisor profile URL.
- It does not browse Google Scholar, Scopus, university search pages, or personal publication pages unless those are included in the supplied profile page text.
- Some sites block server-side fetching; in that case, the report will transparently note that public information is insufficient.
