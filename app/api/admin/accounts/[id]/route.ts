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

// PUT /api/admin/accounts/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { name, accountNumber, codeBank, mention, idMattermost } = body;
    console.log('Updating account with data:', {
      name,
      accountNumber,
      codeBank,
      mention,
      idMattermost,
    });

    await connect();

    const updateData = {
      name,
      accountNumber,
      codeBank,
      mention: mention || '',
      idMattermost: idMattermost || '',
      updateAt: new Date(),
    };

    const account = await Account.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    console.log('Updated account:', account);
    return NextResponse.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/accounts/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    await connect();

    const account = await Account.findByIdAndDelete(id);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
