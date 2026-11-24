
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.NYRA_API_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${backendUrl}/trends`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Backend request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Could not connect to NYRA PLUS backend" },
      { status: 502 }
    );
  }
}
