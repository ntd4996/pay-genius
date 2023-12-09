import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const request = await req.json();
    const { name, bank, accountNumber } = request;
    const result =
      await sql`INSERT INTO users (name, account_number, code_bank) 
		VALUES (${name}, ${accountNumber}, ${bank});`;

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
