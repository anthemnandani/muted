import { uploadToBunnyStorage, uploadToBunnyStream } from '@/lib/bunny';

export const useBunnyUpload = () => {
  const uploadToStorage = async (file: File) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      const url = await uploadToBunnyStorage(buffer, fileName, file.type);
      return { url };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const uploadToStream = async (file: File) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      const { videoId, thumbnailUrl, streamUrl } = await uploadToBunnyStream(
        buffer,
        fileName
      );
      return { videoId, thumbnailUrl, streamUrl };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  return { uploadToStorage, uploadToStream };
};
