import { connect } from '@/utils/config/dbConfig';
import User from '@/utils/models/auth';
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
    const ifUserExists = await User.findOne({ email: token.email });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        success: true,
        user: ifUserExists,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
