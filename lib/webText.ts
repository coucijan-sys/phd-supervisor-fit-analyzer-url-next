const USER_AGENT =
  "Mozilla/5.0 (compatible; PhD Supervisor Fit Analyzer; +https://vercel.app)";

export type PageFetchResult = {
  url: string;
  ok: boolean;
  status?: number;
  title?: string;
  text?: string;
  error?: string;
};

export async function fetchReadablePage(url: string): Promise<PageFetchResult> {
  try {
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return { url, ok: false, error: "Only http and https URLs are supported." };
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      next: { revalidate: 0 }
    });

    const raw = await response.text();
    if (!response.ok) {
      return {
        url: parsedUrl.toString(),
        ok: false,
        status: response.status,
        error: `Request failed with status ${response.status}.`,
        text: normalizeWhitespace(stripHtml(raw)).slice(0, 4000)
      };
    }

    const title = extractTitle(raw);
    const text = normalizeWhitespace(stripHtml(raw)).slice(0, 30000);

    return {
      url: parsedUrl.toString(),
      ok: true,
      status: response.status,
      title,
      text
    };
  } catch (error) {
    return {
      url,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown fetch error."
    };
  }
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1]).trim() : undefined;
}

function stripHtml(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|tr|h[1-6]|section|article|header|footer)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  );
}

function normalizeWhitespace(value: string) {
  return value
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}
