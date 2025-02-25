import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Account from '@/utils/models/account';
import { connect } from '@/utils/config/dbConfig';

// Middleware kiểm tra quyền admin
async function checkAdminPermission() {
  const session = await getServerSession();
  if (!session || session.user?.email !== 'ntd4996@gmail.com') {
    return false;
  }
  return true;
}

// GET /api/admin/accounts
export async function GET() {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connect();
    const accounts = await Account.find({}).sort({ createdAt: -1 });
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/accounts
export async function POST(request: Request) {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, accountNumber, codeBank, mention, idMattermost } = body;

    await connect();
    const account = new Account({
      name,
      accountNumber,
      codeBank,
      mention: mention || '',
      idMattermost: idMattermost || '',
      updateAt: new Date(),
    });
    
    const savedAccount = await account.save();
    console.log('Created account:', savedAccount);
    return NextResponse.json(savedAccount);
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
