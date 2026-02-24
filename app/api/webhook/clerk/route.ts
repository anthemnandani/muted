import { headers } from 'next/headers';
import { Webhook, WebhookRequiredHeaders } from 'svix';

import { IncomingHttpHeaders } from 'http';

import { getFullName } from '@/lib/utils';
import { db } from '@/server/db';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

type EventType = 'user.created' | 'user.deleted';

type Event = {
  // data: Record<string, string | number | Record<string, string>[]>;
  data: any;
  object: 'event';
  type: EventType;
};

export const POST = async (request: Request) => {
  const payload = await request.json();
  const header = headers();

  const heads = {
    'svix-id': header.get('svix-id'),
    'svix-timestamp': header.get('svix-timestamp'),
    'svix-signature': header.get('svix-signature'),
  };

  const wh = new Webhook(process.env.NEXT_CLERK_WEBHOOK_SECRET || '');

  let evnt: Event | null = null;

  try {
    evnt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders,
    ) as Event;
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 400 });
  }

  const eventType: EventType = evnt?.type!;

  if (eventType === 'user.created') {
    try {
      const {
        id,
        first_name,
        last_name,
        image_url,
        username,
        email_addresses,
      } = evnt?.data;

      console.log(evnt?.data);
      const fullName = getFullName(first_name, last_name);
      const email = email_addresses[0].email_address;
      const client = await clerkClient();

      await db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            id,
            fullName,
            username,
            email,
            image: image_url,
          },
        });

        await tx.collection.create({
          data: {
            name: 'All Posts',
            userId: user.id,
            isDefault: true,
            privacy: 'PRIVATE',
          },
        });
      });

      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          role: 'USER',
        },
      });

      return NextResponse.json(
        { message: 'User and default collection created successfully' },
        { status: 201 },
      );
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 },
      );
    }
  }

  if (eventType === 'user.deleted') {
    try {
      const { id } = evnt?.data;

      console.log(evnt?.data);
      await db.user.delete({
        where: { id },
      });
      return NextResponse.json(
        { message: 'User deleted successfully' },
        { status: 200 },
      );
    } catch (error) {
      console.log(error);

      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { message: 'Unsupported event type' },
    { status: 400 },
  );
};
