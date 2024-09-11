import axios from '@/app/libs/axios';
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

    const { id, message } = await request.json();

    await connect();
    const response = await axios.post(
      `${process.env.URL_API_MATTERMOST}posts`,
      {
        channel_id: process.env.ID_CHANNEL_MATTERMOST,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN_BOT_MATTERMOST}`,
        },
      }
    );

    const bill = await Bill.findByIdAndUpdate(
      id,
      {
        idPost: response.data.id,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: 'Bill created successfully',
        success: true,
        bill,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, message } = await request.json();

    const bill = await Bill.findById(id);
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    await connect();
    await axios.put(
      `${process.env.URL_API_MATTERMOST}posts/${bill.idPost}`,
      {
        id: bill.idPost,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN_BOT_MATTERMOST}`,
        },
      }
    );

    return NextResponse.json(
      {
        message: 'Bill updated successfully',
        success: true,
        bill,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
