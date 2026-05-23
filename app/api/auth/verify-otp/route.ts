import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mobile = String(body?.mobile || "").replace(/\D/g, "");
    const otp = String(body?.otp || "").trim();
    const accountType = body?.accountType;

    if (mobile.length !== 10) {
      return NextResponse.json(
        { message: "Invalid mobile number." },
        { status: 400 }
      );
    }

    if (accountType !== "personal" && accountType !== "partner") {
      return NextResponse.json(
        { message: "Invalid account type." },
        { status: 400 }
      );
    }

    if (otp !== "11111") {
      return NextResponse.json(
        { message: "Invalid OTP. Use 11111 for testing." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: `tpl_${accountType}_${mobile}`,
        mobile,
        accountType,
        fullName: "",
        email: "",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong while verifying OTP." },
      { status: 500 }
    );
  }
}