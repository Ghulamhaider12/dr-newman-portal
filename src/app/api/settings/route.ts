import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { SETTING_KEYS, type SettingKey } from "@/lib/settings";

/** Admin: update one or more site settings. */
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const updates = Object.entries(body).filter(([key]) =>
    SETTING_KEYS.includes(key as SettingKey)
  ) as [SettingKey, string][];

  await prisma.$transaction(
    updates.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value ?? "") },
        create: { key, value: String(value ?? "") },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
