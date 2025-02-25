import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Account from '@/utils/models/account';
import Bill from '@/utils/models/bill';
import { connect } from '@/utils/config/dbConfig';
import mongoose from 'mongoose';
import axios from '@/app/libs/axios';

// Tăng giới hạn listeners để tránh warning
mongoose.connection.setMaxListeners(20);

// Middleware kiểm tra quyền admin
async function checkAdminPermission() {
  const session = await getServerSession();
  if (!session || session.user?.email !== 'ntd4996@gmail.com') {
    return false;
  }
  return true;
}

// Hàm trích xuất mention từ chuỗi (lấy phần sau @ và trước khoảng trắng)
function extractMention(mentionString: string | null | undefined): string {
  if (!mentionString) return '';
  const match = mentionString.match(/@(\S+)/);
  return match ? match[1] : '';
}

// Hàm format số tiền theo định dạng VND
function formatCurrency(amount: number | string) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numAmount);
}

// Hàm gửi tin nhắn đến Mattermost
async function sendMattermostMessage(userId: string, message: string) {
  try {
    // Gửi tin nhắn trực tiếp đến user
    const response = await axios.post(
      `${process.env.URL_API_MATTERMOST}posts`,
      {
        channel_id: userId,
        message: message,
        props: {
          disable_mention_notifications: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN_BOT_MATTERMOST}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending Mattermost message:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error sending message to Mattermost');
  }
}

// Hàm chuyển đổi email thành mention
function emailToMention(email: string): string {
  return '@' + email.split('@')[0];
}

// Hàm tạo nội dung tin nhắn
function createReminderMessage(
  accountName: string,
  unpaidBills: any[],
  totalUnpaid: number
) {
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `### 🔔 Thông báo từ QR-Payshare
  
Xin chào **${accountName}**,

Đây là tin nhắn tự động từ hệ thống QR-Payshare. Chúng tôi nhận thấy bạn có **${
    unpaidBills.length
  } hóa đơn** chưa thanh toán.

#### 📝 Chi tiết các hóa đơn:

| Mã HĐ | Tên hóa đơn | Số tiền gốc | Sau giảm giá | Người tạo | Links |
|:---:|:---|---:|---:|:---:|:---|
${unpaidBills
  .map(
    (bill) =>
      `| #${bill.uid} | ${bill.nameBill} | ${formatCurrency(
        bill.amount
      )} | ${formatCurrency(bill.moneyAfterReduction)} | ${emailToMention(
        bill.createBy
      )} | [Mattermost](https://mattermost.demetio.com/demetio/pl/${
        bill.idPost
      }) • [QR-Payshare](https://qr-payshare.datnt.dev/split-the-bill/${
        bill.billId
      }) |`
  )
  .join('\n')}

#### 💰 Tổng số tiền cần thanh toán: **${formatCurrency(totalUnpaid)}**

Vui lòng thanh toán các hóa đơn trên để đảm bảo quyền lợi của bạn và những người khác.
Nếu bạn đã thanh toán, vui lòng liên hệ tới người tạo đơn và bỏ qua tin nhắn này.
Nếu bạn muốn thanh toán nhiều hơn 1 lần thì cứ tự nhiên :yaotea: 

🔍 Xem tất cả hóa đơn chưa thanh toán của bạn tại: [https://qr-payshare.datnt.dev/unpaid](https://qr-payshare.datnt.dev/unpaid)

---
*Tin nhắn được gửi tự động vào ${currentDate}*
*Đây là tin nhắn tự động, vui lòng không trả lời trực tiếp.*`;
}

interface TransferPerson {
  discountAmount: number;
  amount: string;
  moneyAfterReduction: number;
  checked: boolean;
  mention: string;
}

interface BillWithTransfers {
  _id: string;
  uid: number;
  nameBill: string;
  listTransferPerson: TransferPerson[];
  createdAt: Date;
  idPost?: string;
  createBy: string;
}

// GET /api/admin/accounts/remind
export async function GET() {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Đảm bảo kết nối MongoDB được đóng đúng cách
    if (mongoose.connection.readyState === 0) {
      await connect();
    }

    // Lấy tất cả tài khoản có mention và idMattermost
    const accounts = await Account.find({
      mention: { $ne: '' },
      idMattermost: { $ne: '' },
    });

    const debtData = [];
    const messageResults = [];

    // Lấy tất cả hóa đơn
    const allBills = await Bill.find({}).sort({ createdAt: -1 });

    for (const account of accounts) {
      try {
        // Lấy phần mention chính của account (không bao gồm emoji)
        const accountMention = extractMention(account.mention);
        if (!accountMention) continue;

        const unpaidBills: Array<{
          billId: string;
          uid: number;
          nameBill: string;
          amount: string;
          moneyAfterReduction: number;
          createdAt: Date;
          mention: string;
          idPost?: string;
          createBy: string;
        }> = [];

        // Kiểm tra từng hóa đơn
        allBills.forEach((bill: BillWithTransfers) => {
          if (!bill.listTransferPerson) return;

          // Tìm trong listTransferPerson những người chưa thanh toán (checked: false)
          bill.listTransferPerson.forEach((person) => {
            if (!person || !person.mention) return;

            const personMention = extractMention(person.mention);
            if (personMention === accountMention && person.checked === false) {
              try {
                unpaidBills.push({
                  billId: bill._id,
                  uid: bill.uid,
                  nameBill: bill.nameBill,
                  amount: person.amount,
                  moneyAfterReduction: person.moneyAfterReduction,
                  createdAt: bill.createdAt,
                  mention: person.mention,
                  idPost: bill.idPost || '',
                  createBy: bill.createBy,
                });
              } catch (error) {
                console.error(`Error processing bill ${bill.uid}:`, error);
              }
            }
          });
        });

        if (unpaidBills.length > 0) {
          // Tính tổng số tiền chưa thanh toán (sử dụng moneyAfterReduction)
          const totalUnpaid = unpaidBills.reduce(
            (sum, bill) => sum + bill.moneyAfterReduction,
            0
          );

          const accountData = {
            name: account.name,
            mention: account.mention,
            idMattermost: account.idMattermost,
            unpaidBills: unpaidBills.map((bill) => ({
              billId: bill.billId,
              uid: bill.uid,
              nameBill: bill.nameBill,
              amount: bill.amount,
              moneyAfterReduction: bill.moneyAfterReduction,
              formattedAmount: formatCurrency(bill.amount),
              formattedMoneyAfterReduction: formatCurrency(
                bill.moneyAfterReduction
              ),
              createdAt: bill.createdAt,
              originalMention: bill.mention,
              idPost: bill.idPost,
              createBy: bill.createBy,
            })),
            totalUnpaid: totalUnpaid,
            formattedTotalUnpaid: formatCurrency(totalUnpaid),
          };

          debtData.push(accountData);

          // Tạo và gửi tin nhắn
          try {
            const message = createReminderMessage(
              account.name,
              unpaidBills,
              totalUnpaid
            );
            await sendMattermostMessage(account.idMattermost, message);
            messageResults.push({
              userId: account.idMattermost,
              status: 'success',
              message: 'Reminder sent successfully',
            });
          } catch (error) {
            console.error(`Error sending reminder to ${account.name}:`, error);
            messageResults.push({
              userId: account.idMattermost,
              status: 'error',
              message:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred',
            });
          }
        }
      } catch (error) {
        console.error(`Error processing account ${account.name}:`, error);
      }
    }

    return NextResponse.json({
      debtData,
      messageResults,
    });
  } catch (error) {
    console.error('Error checking debts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    // Không đóng kết nối ở đây vì Next.js sẽ tái sử dụng kết nối
  }
}
