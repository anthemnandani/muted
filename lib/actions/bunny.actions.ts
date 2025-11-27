'use server';

import axios from 'axios';
import crypto from 'crypto';
import https from 'https';

const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;
const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY;
const STORAGE_HOST = process.env.BUNNY_STORAGE_HOSTNAME;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE_NAME;
const STORAGE_KEY = process.env.BUNNY_STORAGE_API_KEY;
const PULL_ZONE = process.env.BUNNY_PULL_ZONE_URL;

const httpsAgent = new https.Agent({ family: 4 });

export const createBunnyVideoEntry = async (title: string) => {
  try {
    const response = await axios.post(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      { title },
      {
        headers: {
          AccessKey: BUNNY_API_KEY,
          'Content-Type': 'application/json',
        },
        httpsAgent,
        timeout: 10000,
      }
    );

    const videoId = response.data.guid;

    const expirationTime = Math.floor(Date.now() / 1000) + 3600;

    const dataToSign = `${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expirationTime}${videoId}`;
    const signature = crypto
      .createHash('sha256')
      .update(dataToSign)
      .digest('hex');

    return {
      success: true,
      videoId,
      expirationTime,
      signature,
      libraryId: BUNNY_LIBRARY_ID,
    };
  } catch (error) {
    console.error('Bunny Server Action Error:', error);
    return { success: false, error: 'Failed to initialize upload' };
  }
};

export const uploadImageToBunny = async (formData: FormData) => {
  const file = formData.get('file') as File;

  if (!file || !STORAGE_HOST || !STORAGE_ZONE || !STORAGE_KEY) {
    return { success: false, error: 'Missing configuration or file' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;

    await axios.put(
      `https://${STORAGE_HOST}/${STORAGE_ZONE}/${fileName}`,
      buffer,
      {
        headers: {
          AccessKey: STORAGE_KEY,
          'Content-Type': file.type,
        },
      }
    );

    return {
      success: true,
      url: `${PULL_ZONE}/${fileName}`,
    };
  } catch (error) {
    console.error('Bunny Image Upload Error:', error);
    return { success: false, error: 'Failed to upload image' };
  }
};
