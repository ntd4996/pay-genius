import { connect } from '@/utils/config/dbConfig';
import Bill from '@/utils/models/bill';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Middleware kiểm tra quyền admin
async function checkAdminPermission() {
  const session = await getServerSession();
  console.log('Debug - session:', session?.user?.email);

  if (!session) {
    console.log('Debug - No session found');
    return false;
  }

  // Danh sách email của admin
  const adminEmails = ['ntd4996@gmail.com'];

  // Kiểm tra nếu email người dùng nằm trong danh sách admin
  if (!adminEmails.includes(session.user?.email || '')) {
    console.log('Debug - Not admin email:', session.user?.email);
    return false;
  }

  console.log('Debug - Admin access granted');
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

    // Lấy tham số page và limit từ URL
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Decode username từ URL
    const username = decodeURIComponent(params.username);

    console.log('Debug - username:', username);

    // Tìm các hóa đơn chưa thanh toán của người dùng không sử dụng regex
    const listMentionBills = await Bill.find({
      status: 'unSuccess',
    }).sort({ createdAt: -1 });

    console.log('Debug - total bills:', listMentionBills.length);

    // Lọc và xử lý dữ liệu thủ công để đảm bảo chính xác
    const filteredBills = listMentionBills.filter((bill) => {
      return bill.listTransferPerson.some((person: any) => {
        // Kiểm tra xem mention có bắt đầu bằng @username
        if (!person.mention) return false;

        const mentions = person.mention.split(/[\s,]+/);
        const usernameWithAt = `@${username}`;

        // Kiểm tra các tên đề cập có trùng với username không
        return mentions.some((m: string) => {
          // Check if mention starts with our username (before any space or colon)
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

    // Áp dụng phân trang sau khi đã lọc
    const paginatedBills = filteredBills.slice(skip, skip + limit);

    // Xử lý và format dữ liệu trả về
    const bills = paginatedBills.flatMap((bill) =>
      bill.listTransferPerson
        .filter((person: any) => {
          if (!person.mention) return false;

          const mentions = person.mention.split(/[\s,]+/);
          const usernameWithAt = `@${username}`;

          // Kiểm tra và chỉ lấy các người dùng chưa thanh toán
          return (
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
            }) && !person.checked
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

    console.log('Debug - returning bills:', bills.length);

    return NextResponse.json(
      {
        message: 'Bills found',
        success: true,
        total: filteredBills.length,
        bills,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/admin/unpaid-bills/[username]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
