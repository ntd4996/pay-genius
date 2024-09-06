import { connect } from '@/utils/config/dbConfig';
import Bill from '@/utils/models/bill';
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
      status,
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
      status,
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

    const search = request.nextUrl.searchParams.get('search') || '';
    const searchCondition = search
      ? { nameBill: { $regex: search, $options: 'i' } }
      : {};

    const statusFilter = new Set(request.nextUrl.searchParams.getAll('status'));
    const statusCondition =
      statusFilter.size > 0
        ? { status: { $in: Array.from(statusFilter) } }
        : {};
    const listBills = await Bill.find({
      createBy: token.email,
      ...searchCondition,
      ...statusCondition,
    })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const totalBills = await Bill.countDocuments({
      createBy: token.email,
    });

    const allBills = await Bill.find({ createBy: token.email });

    let totalChecked = 0;
    let totalUnChecked = 0;

    allBills.forEach((bill) => {
      const isSuccess = bill.listTransferPerson.every(
        (person: any) => person.checked
      );
      if (isSuccess) {
        totalChecked += 1;
      } else {
        totalUnChecked += 1;
      }
    });

    const extractUsername = (
      email: string | null | undefined
    ): string | null => {
      if (!email) return null;
      const atIndex = email.indexOf('@');
      return atIndex !== -1 ? email.substring(0, atIndex) : null;
    };

    const username = extractUsername(token.email);
    let listMentionBillsUnSuccess = [] as any[];

    if (username) {
      const regex = new RegExp(`^@${username}`, 'i');

      const listMentionBills = await Bill.find({
        'listTransferPerson.mention': { $regex: regex },
        status: 'unSuccess',
      });

      listMentionBillsUnSuccess = listMentionBills.flatMap((bill) =>
        bill.listTransferPerson
          .filter(
            (person: any) => regex.test(person.mention) && !person.checked
          )
          .map((person: any) => ({
            id: bill._id,
            nameBill: bill.nameBill,
            moneyAfterReduction: person.moneyAfterReduction,
          }))
      );
    }

    return NextResponse.json(
      {
        message: 'List bills',
        success: true,
        bills: listBills,
        totalBills,
        totalChecked,
        totalUnChecked,
        listMentionBills: listMentionBillsUnSuccess,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
