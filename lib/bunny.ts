import axios from 'axios';

export const bunnyConfig = {
  storageZoneName: process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE_NAME!,
  apiKey: process.env.NEXT_PUBLIC_BUNNY_STORAGE_API_KEY!,
  pullZoneUrl: process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE_URL!,
  //   streamLibraryId: process.env.BUNNY_STREAM_LIBRARY_ID!,
  //   streamApiKey: process.env.BUNNY_STREAM_API_KEY!,
};

export async function uploadToBunnyStorage(
  file: Buffer,
  fileName: string,
  contentType: string
) {
  try {
    await axios.put(
      `https://storage.bunnycdn.com/${bunnyConfig.storageZoneName}/${fileName}`,
      file,
      {
        headers: {
          'Content-Type': contentType,
          AccessKey: bunnyConfig.apiKey,
        },
      }
    );

    return `${bunnyConfig.pullZoneUrl}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to Bunny.net:', error);
    throw error;
  }
}

// export async function uploadToBunnyStream(file: Buffer, title: string) {
//   try {
//     // Step 1: Create the video
//     const createResponse = await axios.post(
//       `https://video.bunnycdn.com/library/${bunnyConfig.streamLibraryId}/videos`,
//       { title },
//       {
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//           'AccessKey': bunnyConfig.streamApiKey,
//         },
//       }
//     );

//     const videoId = createResponse.data.guid;

//     // Step 2: Upload the video
//     await axios.put(
//       `https://video.bunnycdn.com/library/${bunnyConfig.streamLibraryId}/videos/${videoId}`,
//       file,
//       {
//         headers: {
//           'Accept': 'application/json',
//           'AccessKey': bunnyConfig.streamApiKey,
//         },
//       }
//     );

//     return videoId;
//   } catch (error) {
//     console.error('Error uploading to Bunny Stream:', error);
//     throw error;
//   }
// }
