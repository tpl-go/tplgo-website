import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { message: "Local OTP test route is disabled." },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const mobile = String(body?.mobile || "").replace(/\D/g, "");
    const accountType = body?.accountType;

    if (mobile.length !== 10) {
      return NextResponse.json(
        { message: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (accountType !== "personal" && accountType !== "partner") {
      return NextResponse.json(
        { message: "Invalid account type." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully.",
      devOtp: "11111",
      resendAvailableAt: new Date(Date.now() + 60_000).toISOString(),
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong while sending OTP." },
      { status: 500 }
    );
  }
}
