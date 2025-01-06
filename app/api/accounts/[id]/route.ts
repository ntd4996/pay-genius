import { connect } from '@/utils/config/dbConfig';
import Account from '@/utils/models/account';
import { NextResponse } from 'next/server';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connect();
    const { id } = params;
    const { name, accountNumber, codeBank, idMattermost } = await req.json();

    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      {
        name,
        accountNumber,
        codeBank,
        idMattermost,
        updateAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json({ account: updatedAccount }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connect();
    const { id } = params;
    await Account.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Account deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
