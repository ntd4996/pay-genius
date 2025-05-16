import { connect } from '@/utils/config/dbConfig';
import Bill from '@/utils/models/bill';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

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

export async function GET(req: NextRequest) {
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

    // Aggregate to get users with unpaid bills
    const pipeline = [
      { $match: { status: 'unSuccess' } },
      { $unwind: '$listTransferPerson' },
      { $match: { 'listTransferPerson.checked': false } },
      {
        $group: {
          _id: '$listTransferPerson.mention',
          name: { $first: '$listTransferPerson.name' },
          totalUnpaidBills: { $sum: 1 },
        },
      },
      { $sort: { totalUnpaidBills: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          mention: '$_id',
          name: 1,
          totalUnpaidBills: 1,
        },
      },
    ] as mongoose.PipelineStage[];

    // Count total users with unpaid bills
    const countPipeline = [
      { $match: { status: 'unSuccess' } },
      { $unwind: '$listTransferPerson' },
      { $match: { 'listTransferPerson.checked': false } },
      { $group: { _id: '$listTransferPerson.mention' } },
      { $count: 'total' },
    ] as mongoose.PipelineStage[];

    const [users, countResult] = await Promise.all([
      Bill.aggregate(pipeline),
      Bill.aggregate(countPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return NextResponse.json(
      {
        message: 'Users found',
        success: true,
        total,
        users,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
