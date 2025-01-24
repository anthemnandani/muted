import axios from 'axios';

export const bunnyConfig = {
  storageHost: process.env.NEXT_PUBLIC_BUNNY_STORAGE_HOSTNAME!,
  storageZoneName: process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE_NAME!,
  storageApiKey: process.env.NEXT_PUBLIC_BUNNY_STORAGE_API_KEY!,
  pullZoneUrl: process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE_URL!,
  streamLibraryId: process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID!,
  streamApiKey: process.env.NEXT_PUBLIC_BUNNY_STREAM_API_KEY!,
};

export async function uploadToBunnyStorage(
  file: Buffer,
  fileName: string,
  contentType: string
) {
  try {
    await axios.put(
      `https://${bunnyConfig.storageHost}/${bunnyConfig.storageZoneName}/${fileName}`,
      file,
      {
        headers: {
          'Content-Type': contentType,
          AccessKey: bunnyConfig.storageApiKey,
        },
      }
    );

    return `${bunnyConfig.pullZoneUrl}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to Bunny.net:', error);
    throw error;
  }
}

export async function uploadToBunnyStream(file: Buffer, fileName: string) {
  try {
    // Step 1: Create the video
    const createResponse = await axios.post(
      `https://video.bunnycdn.com/library/${bunnyConfig.streamLibraryId}/videos`,
      { title: fileName },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          AccessKey: bunnyConfig.streamApiKey,
        },
      }
    );

    const videoId = createResponse.data.guid;

    // Step 2: Upload the video
    await axios.put(
      `https://video.bunnycdn.com/library/${bunnyConfig.streamLibraryId}/videos/${videoId}`,
      file,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'video/mp4',
          AccessKey: bunnyConfig.streamApiKey,
        },
      }
    );

    // Step 3: Get video details including thumbnail
    const videoDetails = await axios.get(
      `https://video.bunnycdn.com/library/${bunnyConfig.streamLibraryId}/videos/${videoId}`,
      {
        headers: {
          Accept: 'application/json',
          AccessKey: bunnyConfig.streamApiKey,
        },
      }
    );

    // Wait for video to be encoded
    let retries = 0;
    while (retries < 10) {
      if (videoDetails.data.status === 'encoded') {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries++;
    }

    return {
      videoId,
      thumbnailUrl: videoDetails.data.thumbnailUrl,
      streamUrl: `https://iframe.mediadelivery.net/embed/${bunnyConfig.streamLibraryId}/${videoId}`,
    };
  } catch (error) {
    console.error('Error uploading to Bunny Stream:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
    }
    throw error;
  }
}
