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

    // Aggregate to get top bill creators
    const pipeline = [
      {
        $group: {
          _id: '$createBy',
          name: { $first: '$creatorName' },
          totalCreated: { $sum: 1 },
        },
      },
      {
        $sort: { totalCreated: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          email: '$_id',
          name: 1,
          totalCreated: 1,
        },
      },
    ] as mongoose.PipelineStage[];

    // Count total unique creators
    const countPipeline = [
      {
        $group: {
          _id: '$createBy',
        },
      },
      {
        $count: 'total',
      },
    ] as mongoose.PipelineStage[];

    const [creators, countResult] = await Promise.all([
      Bill.aggregate(pipeline),
      Bill.aggregate(countPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return NextResponse.json(
      {
        message: 'Bill creators found',
        success: true,
        total,
        creators,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/admin/top-bill-creators:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
