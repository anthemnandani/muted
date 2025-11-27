import {
  createBunnyVideoEntry,
  uploadImageToBunny,
} from '@/lib/actions/bunny.actions';
import * as tus from 'tus-js-client';

export const useBunnyUpload = () => {
  const uploadToStorage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadImageToBunny(formData);

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Image upload failed');
      }

      return result.url;
    } catch (error) {
      throw error;
    }
  };

  const uploadToStream = async (
    file: File,
    options?: {
      onProgress?: (progress: number) => void;
      signal?: AbortSignal;
    }
  ) => {
    return new Promise<{
      fileUrl: string;
      thumbnailUrl: string;
      videoId: string;
    }>((resolve, reject) => {
      createBunnyVideoEntry(file.name)
        .then((authData) => {
          if (!authData.success || !authData.videoId) {
            reject(new Error(authData.error));
            return;
          }

          const upload = new tus.Upload(file, {
            endpoint: 'https://video.bunnycdn.com/tusupload',
            retryDelays: [0, 3000, 5000, 10000, 20000],
            headers: {
              AuthorizationSignature: authData.signature!,
              AuthorizationExpire: authData.expirationTime?.toString()!,
              VideoId: authData.videoId,
              LibraryId: authData.libraryId!,
            },
            metadata: {
              filetype: file.type,
              title: file.name,
            },
            onError: (error) => {
              reject(error);
            },
            onProgress: (bytesUploaded, bytesTotal) => {
              const percent = Math.round((bytesUploaded / bytesTotal) * 100);
              if (options?.onProgress) options.onProgress(percent);
            },
            onSuccess: () => {
              resolve({
                fileUrl: `https://${process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME}/${authData.videoId}/playlist.m3u8`,
                thumbnailUrl: `https://${process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME}/${authData.videoId}/thumbnail.jpg`,
                videoId: authData.videoId,
              });
            },
          });

          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              upload.abort();
              reject(new Error('Upload cancelled by user'));
            });
          }

          upload.start();
        })
        .catch(reject);
    });
  };

  return { uploadToStorage, uploadToStream };
};
