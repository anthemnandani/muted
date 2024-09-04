import { useUploadThing } from '@/lib/uploadthing';
import { isBase64Image } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import { useCallback, useState } from 'react';

const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { files, setFiles } = useFileStore();
  const { startUpload } = useUploadThing('media');

  const uploadProfileImage = useCallback(
    async (profilePic: string) => {
      if (!isBase64Image(profilePic)) return profilePic;

      setIsUploading(true);
      try {
        const imgRes = await startUpload(files);
        return imgRes && imgRes[0]?.fileUrl ? imgRes[0].fileUrl : profilePic;
      } finally {
        setIsUploading(false);
      }
    },
    [files, startUpload]
  );

  return {
    isUploading,
    uploadProfileImage,
    resetFiles: () => setFiles([]),
  };
};

export default useFileUpload;
