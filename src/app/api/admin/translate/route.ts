import { NextRequest, NextResponse } from "next/server";

// Free translation using MyMemory API (no API key needed)
async function translateText(text: string, from: string, to: string): Promise<string> {
  try {
    // Split long text into chunks (MyMemory limit ~500 chars)
    const chunks = splitText(text, 450);
    const translatedChunks = [];

    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${from}|${to}`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        translatedChunks.push(data.responseData.translatedText);
      } else {
        translatedChunks.push(chunk); // fallback: return original
      }
    }

    return translatedChunks.join(" ");
  } catch (e) {
    console.error("[Translate Error]", e);
    return text; // fallback: return original
  }
}

function splitText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    // Find a good split point (end of sentence or paragraph)
    let splitAt = remaining.lastIndexOf("</p>", maxLen);
    if (splitAt === -1 || splitAt < maxLen * 0.3) {
      splitAt = remaining.lastIndexOf(". ", maxLen);
    }
    if (splitAt === -1 || splitAt < maxLen * 0.3) {
      splitAt = maxLen;
    } else {
      splitAt += 4; // include </p> or ". "
    }

    chunks.push(remaining.substring(0, splitAt));
    remaining = remaining.substring(splitAt).trimStart();
  }

  return chunks;
}

// POST - Translate text
export async function POST(req: NextRequest) {
  try {
    const { text, from = "id", to = "en" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const translated = await translateText(text, from, to);

    return NextResponse.json({
      original: text,
      translated,
      from,
      to,
    });
  } catch (e) {
    console.error("[API Translate]", e);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
