import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const preview = {
      url,
      title:
        $('meta[property="og:title"]').attr('content') || $('title').text(),
      description:
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
    };

    return NextResponse.json(preview);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch link preview' },
      { status: 500 }
    );
  }
}
