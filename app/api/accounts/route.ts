// create api get list of accounts

import { connect } from '@/utils/config/dbConfig';
import Account from '@/utils/models/account';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  await connect();
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listAccounts = await Account.find({});
    return NextResponse.json(
      {
        message: 'List accounts',
        success: true,
        accounts: listAccounts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { name, accountNumber, codeBank } = await request.json();
  await connect();

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newAccount = new Account({
      name,
      accountNumber,
      codeBank,
    });
    const res = await newAccount.save();
    return NextResponse.json(
      {
        message: 'Account created successfully',
        success: true,
        account: res,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
