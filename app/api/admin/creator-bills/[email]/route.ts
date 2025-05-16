import { connect } from '@/utils/config/dbConfig';
import Bill from '@/utils/models/bill';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Middleware kiểm tra quyền admin
async function checkAdminPermission() {
  const session = await getServerSession();
  if (!session) return false;

  // Danh sách email của admin
  const adminEmails = ['ntd4996@gmail.com'];

  // Kiểm tra nếu email người dùng nằm trong danh sách admin
  if (!adminEmails.includes(session.user?.email || '')) {
    return false;
  }

  return true;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    // Get page and limit parameters from URL
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Decode email from URL
    const email = decodeURIComponent(params.email);
    console.log('Debug - creator email:', email);

    // Find bills created by this user
    const total = await Bill.countDocuments({ createBy: email });
    console.log('Debug - total bills created:', total);

    const creatorBills = await Bill.find({ createBy: email })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log('Debug - bills in current page:', creatorBills.length);

    // Process and format the results
    const bills = creatorBills.map((bill) => {
      // Calculate total amount and number of participants
      const totalAmount = bill.listTransferPerson.reduce(
        (total: number, person: any) => {
          return (
            total +
            Object.entries(person).reduce(
              (personTotal: number, [key, value]) => {
                if (key.startsWith('value-') && !isNaN(Number(value))) {
                  return personTotal + Number(value);
                }
                return personTotal;
              },
              person.moneyAfterReduction || 0
            )
          );
        },
        0
      );

      return {
        id: bill._id,
        nameBill: bill.nameBill,
        bank: bill.bank,
        accountNumber: bill.accountNumber,
        name: bill.name,
        totalAmount: totalAmount,
        status: bill.status,
        createdAt: bill.createdAt,
        participants: bill.listTransferPerson.length,
      };
    });

    return NextResponse.json(
      {
        message: 'Creator bills found',
        success: true,
        total,
        bills,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/admin/creator-bills/[email]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
