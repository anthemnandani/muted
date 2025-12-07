import { uploadImageToBunny } from '@/lib/actions/bunny.actions';

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

  return { uploadToStorage };
};
