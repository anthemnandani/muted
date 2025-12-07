import { uploadImageToBunny } from '@/lib/actions/bunny.actions';
import { createMuxUploadUrl } from '@/lib/actions/mux.actions';
import * as UpChunk from '@mux/upchunk';

export const useMuxUpload = () => {
  const uploadToStorage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadImageToBunny(formData);
    if (!result.success || !result.url) throw new Error(result.error);
    return result.url;
  };

  const prepareMuxUpload = async (passthrough: string) => {
    const { success, url, uploadId, error } = await createMuxUploadUrl(
      passthrough
    );
    if (!success || !url || !uploadId) {
      throw new Error(error || 'Failed to get upload URL');
    }
    return { url, uploadId };
  };

  const startMuxUpload = (
    file: File,
    uploadUrl: string,
    onProgress?: (percent: number) => void,
    onUploadStart?: (upload: UpChunk.UpChunk) => void
  ) => {
    return new Promise<void>((resolve, reject) => {
      const upload = UpChunk.createUpload({
        endpoint: uploadUrl,
        file,
        chunkSize: 5120,
      });

      if (onUploadStart) {
        onUploadStart(upload);
      }

      upload.on('error', (err) => reject(err.detail));

      upload.on('progress', (p) => {
        onProgress?.(Math.floor(p.detail));
      });
      upload.on('success', () => resolve());
    });
  };

  return { uploadToStorage, prepareMuxUpload, startMuxUpload };
};
