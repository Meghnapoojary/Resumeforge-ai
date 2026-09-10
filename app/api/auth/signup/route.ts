import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are all required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name, email: email.toLowerCase(), passwordHash });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("signup route error:", err);
    return NextResponse.json({ error: "Couldn't create your account. Try again." }, { status: 500 });
  }
}
