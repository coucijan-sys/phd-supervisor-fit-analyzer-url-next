import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildSupervisorAnalysisPrompt } from "@/lib/prompts";
import { fetchReadablePage } from "@/lib/webText";

export const runtime = "nodejs";
export const maxDuration = 60;

type AnalyzeRequestBody = {
  advisorName?: string;
  advisorUrl?: string;
  applicantProfile?: string;
  optionalNotes?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody;
    const advisorName = body.advisorName?.trim();
    const advisorUrl = body.advisorUrl?.trim();

    if (!advisorName || !advisorUrl) {
      return NextResponse.json(
        { error: "Advisor Name and Advisor Profile URL are required." },
        { status: 400 }
      );
    }

    try {
      new URL(advisorUrl);
    } catch {
      return NextResponse.json(
        { error: "Advisor Profile URL must be a valid URL." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY. Add it to your environment variables." },
        { status: 500 }
      );
    }

    const page = await fetchReadablePage(advisorUrl);
    const prompt = buildSupervisorAnalysisPrompt({
      advisorName,
      advisorUrl,
      applicantProfile: body.applicantProfile,
      optionalNotes: body.optionalNotes,
      page
    });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You produce rigorous, evidence-aware PhD supervisor screening reports in Chinese Markdown. Never fabricate unverifiable facts."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const report = completion.choices[0]?.message?.content?.trim();

    if (!report) {
      return NextResponse.json(
        { error: "The model returned an empty report. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      report,
      source: {
        url: page.url,
        ok: page.ok,
        status: page.status,
        title: page.title,
        error: page.error
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while analyzing supervisor."
      },
      { status: 500 }
    );
  }
}
