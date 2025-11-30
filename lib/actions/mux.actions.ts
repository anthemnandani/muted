'use server';

import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export const createMuxUploadUrl = async (passthrough: string) => {
  try {
    const upload = await mux.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policies: ['public'],
        encoding_tier: 'smart',
        passthrough,
      },
    });

    return {
      success: true,
      url: upload.url,
      uploadId: upload.id,
    };
  } catch (error) {
    console.error('Mux Action Error:', error);
    return { success: false, error: 'Failed to initialize upload' };
  }
};
