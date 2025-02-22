import { uploadToBunnyStorage, uploadToBunnyStream } from '@/lib/bunny';

export const useBunnyUpload = () => {
  const uploadToStorage = async (file: File) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      const url = await uploadToBunnyStorage(buffer, fileName, file.type);
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const uploadToStream = async (file: File) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      const { fileUrl, thumbnailUrl } = await uploadToBunnyStream(
        buffer,
        fileName
      );
      return { fileUrl, thumbnailUrl };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  return { uploadToStorage, uploadToStream };
};
