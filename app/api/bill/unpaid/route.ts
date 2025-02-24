import { connect } from '@/utils/config/dbConfig';
import Bill from '@/utils/models/bill';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const extractUsername = (email: string | null | undefined): string | null => {
  if (!email) return null;
  const atIndex = email.indexOf('@');
  return atIndex !== -1 ? email.substring(0, atIndex) : null;
};

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    // Lấy tham số page từ URL, mặc định là 1
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10; // Số lượng item trên mỗi trang
    const skip = (page - 1) * limit;

    const username = extractUsername(token.email);
    let bills = [] as any[];
    let total = 0;

    if (username) {
      // Tạo regex chính xác cho username, thêm @ ở đầu và khoảng trắng hoặc dấu phẩy ở cuối
      const regex = new RegExp(`@${username}(?:[\\s,]|$)`, 'i');

      const listMentionBills = await Bill.find({
        'listTransferPerson.mention': { $regex: regex },
        status: 'unSuccess',
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      total = await Bill.countDocuments({
        'listTransferPerson.mention': { $regex: regex },
        status: 'unSuccess',
      });

      bills = listMentionBills.flatMap((bill) =>
        bill.listTransferPerson
          .filter((person: any) => {
            const mentions = person.mention.split(/[\s,]+/);
            return (
              mentions.some(
                (m: any) => m.toLowerCase() === `@${username}`.toLowerCase()
              ) && !person.checked
            );
          })
          .map((person: any) => {
            return {
              id: bill._id,
              nameBill: bill.nameBill,
              bank: bill.bank,
              accountNumber: bill.accountNumber,
              name: bill.name,
              uid: bill.uid,
              moneyAfterReduction: Object.entries(person).reduce(
                (total, [key, value]) => {
                  if (key.startsWith('value-') && !isNaN(Number(value))) {
                    return total + Number(value);
                  }
                  return total;
                },
                person.moneyAfterReduction || 0
              ),
              mention: person.mention,
            };
          })
      );
    }

    return NextResponse.json(
      {
        message: 'Bills found',
        success: true,
        total,
        bills,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
