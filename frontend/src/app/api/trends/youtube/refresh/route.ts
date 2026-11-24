
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const backendUrl =
      process.env.NYRA_API_URL || "http://127.0.0.1:8000";

    const response = await fetch(
      `${backendUrl}/youtube/refresh`,
      {
        method: "POST",
        cache: "no-store",
      }
    );

    const data = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: data || "YouTube refresh failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to NYRA PLUS backend" },
      { status: 502 }
    );
  }
}
