import { getOTP } from '@/lib/utils';
import { db } from '@/server/db';
import { auth } from '@clerk/nextjs/server';
import { promises as fs } from 'fs';
import handlebars from 'handlebars';
import { NextResponse } from 'next/server';
import path from 'path';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const templatePath = path.join(
      process.cwd(),
      'templates',
      'otpConfirmation.handlebars'
    );
    const emailTemplateSource = await fs.readFile(templatePath, 'utf8');
    const template = handlebars.compile(emailTemplateSource);

    let otpToSend: string;

    if (
      user.deletionOtp &&
      user.deletionOtpExpiresAt &&
      new Date() < user.deletionOtpExpiresAt
    ) {
      otpToSend = user.deletionOtp;
    } else {
      const newOtp = getOTP();
      const otpExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.user.update({
        where: { id: userId },
        data: {
          deletionOtp: newOtp.toString(),
          deletionOtpExpiresAt: otpExpiresAt,
        },
      });
      otpToSend = newOtp.toString();
    }

    const replacements = {
      user_name: user.fullName || user.username,
      verification_code: otpToSend,
      year: new Date().getFullYear(),
    };

    const htmlBody = template(replacements);

    await resend.emails.send({
      from: 'Muted <onboarding@resend.dev>',
      to: user.email,
      subject: 'Confirm Your Account Deletion',
      html: htmlBody,
    });

    return NextResponse.json(
      { message: 'A confirmation code has been sent to your email.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[USER_DELETE_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
