import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, action } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    if (action === "register") {
      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length) return NextResponse.json({ ok: true, message: "User exists" });
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      await db.insert(users).values({
        name: name || email.split("@")[0],
        email,
        passwordHash: password,
        referralCode: code,
      });
      return NextResponse.json({ ok: true });
    } else {
      const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!found.length) return NextResponse.json({ ok: false }, { status: 401 });
      return NextResponse.json({ ok: true, user: found[0] });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
