import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/server/db';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { otp } = await req.json();
    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return new NextResponse('Invalid OTP format.', { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse('User not found.', { status: 404 });
    }

    const isOtpValid = user.deletionOtp === otp;
    const isOtpExpired = user.deletionOtpExpiresAt
      ? new Date() > user.deletionOtpExpiresAt
      : true;

    if (isOtpExpired) {
      return new NextResponse(
        'This confirmation code has expired. Please request a new one.',
        { status: 400 }
      );
    }

    if (!isOtpValid) {
      return new NextResponse(
        'The confirmation code is incorrect. Please try again.',
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: userId },
      data: {
        deactivated: true,
        deactivatedAt: new Date(),
        deletionOtp: null,
        deletionOtpExpiresAt: null,
      },
    });

    return NextResponse.json(
      { message: 'Your account has been successfully deactivated.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[USER_DELETE_VERIFY_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
