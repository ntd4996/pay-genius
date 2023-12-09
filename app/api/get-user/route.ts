import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await db.connect();
    const { rows } =
      await client.sql`SELECT * FROM "public"."users" ORDER BY "id" LIMIT 300 OFFSET 0;`;
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
