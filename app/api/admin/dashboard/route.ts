import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Bill from '@/utils/models/bill';
import { connect } from '@/utils/config/dbConfig';

interface TransferPerson {
  checked: boolean;
  mention?: string;
}

interface BillDocument {
  _id: string;
  createBy?: string;
  createdAt: Date;
  listTransferPerson?: TransferPerson[];
}

// Middleware kiểm tra quyền admin
async function checkAdminPermission() {
  const session = await getServerSession();
  if (!session || session.user?.email !== 'ntd4996@gmail.com') {
    return false;
  }
  return true;
}

// GET /api/admin/dashboard
export async function GET() {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connect();

    // Lấy tất cả hóa đơn
    const allBills = await Bill.find({});

    // Tính toán các thống kê cơ bản
    const totalBills = allBills.length;
    let totalPaidBills = 0;
    let totalUnpaidBills = 0;

    // Map để theo dõi số lượng hóa đơn của mỗi người dùng
    const userBillsMap = new Map();
    const userUnpaidBillsMap = new Map();
    const userNamesMap = new Map();
    const userCreatedBillsMap = new Map();

    // Map để theo dõi số lượng hóa đơn theo tháng
    const monthlyBillsMap = new Map();

    allBills.forEach((bill: BillDocument) => {
      // Thêm thông tin người tạo vào map
      if (bill.createBy) {
        const userBills = userBillsMap.get(bill.createBy) || 0;
        userBillsMap.set(bill.createBy, userBills + 1);
        userNamesMap.set(bill.createBy, bill.createBy.split('@')[0]); // Lưu tên người dùng

        // Thống kê số lượng hóa đơn đã tạo
        const createdBills = userCreatedBillsMap.get(bill.createBy) || 0;
        userCreatedBillsMap.set(bill.createBy, createdBills + 1);
      }

      // Thống kê theo tháng
      const billDate = new Date(bill.createdAt);
      const monthKey = `${billDate.getFullYear()}-${String(
        billDate.getMonth() + 1
      ).padStart(2, '0')}`;
      const monthData = monthlyBillsMap.get(monthKey) || {
        total: 0,
        paid: 0,
        unpaid: 0,
      };
      monthData.total++;

      // Đếm số hóa đơn đã/chưa thanh toán
      if (bill.listTransferPerson && Array.isArray(bill.listTransferPerson)) {
        bill.listTransferPerson.forEach((person) => {
          if (person.checked) {
            totalPaidBills++;
            monthData.paid++;
          } else {
            totalUnpaidBills++;
            monthData.unpaid++;
            if (person.mention) {
              const userUnpaidBills =
                userUnpaidBillsMap.get(person.mention) || 0;
              userUnpaidBillsMap.set(person.mention, userUnpaidBills + 1);
              userNamesMap.set(person.mention, person.mention.replace('@', ''));
            }
          }
        });
      }

      monthlyBillsMap.set(monthKey, monthData);
    });

    // Chuyển đổi dữ liệu người dùng thành mảng và sắp xếp
    const topUsersByBills = Array.from(userBillsMap.entries())
      .map(([mention, totalBills]) => ({
        mention,
        name: userNamesMap.get(mention),
        totalBills,
      }))
      .sort((a, b) => b.totalBills - a.totalBills)
      .slice(0, 5);

    const topUsersByUnpaidBills = Array.from(userUnpaidBillsMap.entries())
      .map(([mention, totalUnpaidBills]) => ({
        mention,
        name: userNamesMap.get(mention),
        totalUnpaidBills,
      }))
      .sort((a, b) => b.totalUnpaidBills - a.totalUnpaidBills)
      .slice(0, 5);

    // Thêm thống kê người tạo hóa đơn
    const topBillCreators = Array.from(userCreatedBillsMap.entries())
      .map(([email, totalCreated]) => ({
        email,
        name: email.split('@')[0],
        totalCreated,
      }))
      .sort((a, b) => b.totalCreated - a.totalCreated)
      .slice(0, 5);

    // Chuyển đổi dữ liệu theo tháng thành mảng và sắp xếp
    const monthlyBillsData = Array.from(monthlyBillsMap.entries())
      .map(([month, data]) => ({
        month,
        ...data,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      totalBills,
      totalPaidBills,
      totalUnpaidBills,
      topUsersByBills,
      topUsersByUnpaidBills,
      topBillCreators,
      billStatusData: {
        paid: totalPaidBills,
        unpaid: totalUnpaidBills,
      },
      monthlyBillsData,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
