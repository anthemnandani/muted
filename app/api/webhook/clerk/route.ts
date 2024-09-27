/* eslint-disable camelcase */
// Resource: https://clerk.com/docs/users/sync-data-to-your-backend
// Above article shows why we need webhooks i.e., to sync data to our backend

// Resource: https://docs.svix.com/receiving/verifying-payloads/why
// It's a good practice to verify webhooks. Above article shows why we should do it
import { headers } from 'next/headers';
import { Webhook, WebhookRequiredHeaders } from 'svix';

import { IncomingHttpHeaders } from 'http';

import { getFullName } from '@/lib/utils';
import { db } from '@/server/db';
import { NextResponse } from 'next/server';

// Resource: https://clerk.com/docs/integration/webhooks#supported-events
// Above document lists the supported events
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

  // Activitate Webhook in the Clerk Dashboard.
  // After adding the endpoint, you'll see the secret on the right side.
  const wh = new Webhook(process.env.NEXT_CLERK_WEBHOOK_SECRET || '');

  let evnt: Event | null = null;

  try {
    evnt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders
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
      await db.user.upsert({
        where: { id },
        update: {
          fullName,
          username: username ?? email.split('@')[0],
          email,
          image: image_url,
        },
        create: {
          id,
          fullName,
          username: username ?? email.split('@')[0],
          email,
          image: image_url,
        },
      });
      return NextResponse.json(
        { message: 'User created successfully' },
        { status: 201 }
      );
    } catch (error) {
      console.log(error);

      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
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
        { status: 200 }
      );
    } catch (error) {
      console.log(error);

      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { message: 'Unsupported event type' },
    { status: 400 }
  );
};
