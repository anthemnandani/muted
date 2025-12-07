'use server';

import axios from 'axios';

const STORAGE_HOST = process.env.BUNNY_STORAGE_HOSTNAME;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE_NAME;
const STORAGE_KEY = process.env.BUNNY_STORAGE_API_KEY;
const PULL_ZONE = process.env.BUNNY_PULL_ZONE_URL;

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
