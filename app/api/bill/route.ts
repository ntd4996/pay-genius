import { connect } from '@/utils/config/dbConfig';
import Bill from '@/utils/models/bill';
import { create } from 'domain';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      bank,
      accountNumber,
      shipping,
      headerTable,
      amountDiscount,
      listTransferPerson,
      nameBill,
    } = await request.json();

    await connect();

    const newBill = new Bill({
      nameBill,
      name,
      bank,
      accountNumber,
      shipping,
      headerTable,
      amountDiscount,
      listTransferPerson,
      createBy: token.email,
    });
    const res = await newBill.save();
    return NextResponse.json(
      {
        message: 'Bill created successfully',
        success: true,
        bill: res,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1') || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const listBills = await Bill.find({ createBy: token.email })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const totalBills = await Bill.countDocuments({ createBy: token.email });

    let totalChecked = 0;
    let totalUnChecked = 0;

    listBills.forEach((bill) => {
      const isSuccess = bill.listTransferPerson.every(
        (person: any) => person.checked
      );
      if (isSuccess) {
        totalChecked += 1;
      } else {
        totalUnChecked += 1;
      }
    });

    return NextResponse.json(
      {
        message: 'List bills',
        success: true,
        bills: listBills,
        totalBills,
        totalChecked,
        totalUnChecked,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
