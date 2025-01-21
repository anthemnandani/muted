import { uploadToBunnyStorage } from '@/lib/bunny';

export const useBunnyUpload = () => {
  const upload = async (file: File) => {
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

  return { upload };
};
