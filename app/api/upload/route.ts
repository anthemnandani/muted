import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { uploadToBunnyStorage } from '@/lib/bunny';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${userId}/${Date.now()}-${file.name}`;

    // Handle different file types
    // if (file.type.startsWith('video/')) {
    //   const videoId = await uploadToBunnyStream(buffer, fileName);
    //   return NextResponse.json({ videoId });
    // } else {
    const url = await uploadToBunnyStorage(buffer, fileName, file.type);
    return NextResponse.json({ url });
    // }
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
