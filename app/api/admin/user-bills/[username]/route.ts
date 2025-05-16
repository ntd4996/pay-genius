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
  { params }: { params: { username: string } }
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

    // Decode username from URL
    const username = decodeURIComponent(params.username);
    console.log('Debug - username:', username);

    // Find all bills that mention this username (doesn't use regex)
    const allBills = await Bill.find({}).sort({ createdAt: -1 });

    console.log('Debug - total bills found:', allBills.length);

    // Filter bills manually to ensure accurate matches
    const filteredBills = allBills.filter((bill) => {
      return bill.listTransferPerson.some((person: any) => {
        if (!person.mention) return false;

        const mentions = person.mention.split(/[\s,]+/);
        const usernameWithAt = `@${username}`;

        return mentions.some((m: string) => {
          const mentionUsername = m
            .toLowerCase()
            .replace('@', '')
            .split(/[\s:]+/)[0];
          const checkUsername = username.toLowerCase();

          return (
            mentionUsername === checkUsername ||
            m.toLowerCase() === usernameWithAt.toLowerCase()
          );
        });
      });
    });

    console.log('Debug - filtered bills:', filteredBills.length);

    // Apply pagination
    const paginatedBills = filteredBills.slice(skip, skip + limit);

    // Process and format the results
    const bills = paginatedBills.map((bill) => {
      const userAmount = bill.listTransferPerson.reduce(
        (total: number, person: any) => {
          if (!person.mention) return total;

          const mentions = person.mention.split(/[\s,]+/);
          const usernameWithAt = `@${username}`;

          if (
            mentions.some((m: string) => {
              const mentionUsername = m
                .toLowerCase()
                .replace('@', '')
                .split(/[\s:]+/)[0];
              const checkUsername = username.toLowerCase();

              return (
                mentionUsername === checkUsername ||
                m.toLowerCase() === usernameWithAt.toLowerCase()
              );
            })
          ) {
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
          }

          return total;
        },
        0
      );

      return {
        id: bill._id,
        nameBill: bill.nameBill,
        bank: bill.bank,
        accountNumber: bill.accountNumber,
        name: bill.name,
        amount: userAmount,
        status: bill.status,
        createdAt: bill.createdAt,
      };
    });

    console.log('Debug - returning bills:', bills.length);

    return NextResponse.json(
      {
        message: 'User bills found',
        success: true,
        total: filteredBills.length,
        bills,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/admin/user-bills/[username]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
