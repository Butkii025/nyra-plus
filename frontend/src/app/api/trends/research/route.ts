
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NYRA_API_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/research/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(180000),
    });

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          status: "error",
          message: "Backend returned a non-JSON response.",
          backend_status: response.status,
          response_preview: responseText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("NYRA Research API error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Unable to connect to the research backend.",
        details:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
