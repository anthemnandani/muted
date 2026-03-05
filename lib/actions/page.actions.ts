'use server';

import { db } from '@/server/db';

export async function getPublicPage(slug: string) {
  return await db.page.findUnique({
    where: { slug },
  });
}

export async function getAllPublicPages() {
  return await db.page.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      updatedAt: true,
    },
  });
}
