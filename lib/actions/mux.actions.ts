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
        playback_policies: ['signed'],
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

export const createPlaybackTokens = async (playbackId: string) => {
  try {
    const signingKeyId = process.env.MUX_SIGNING_KEY_ID!;
    const base64PrivateKey = process.env.MUX_PRIVATE_KEY!;

    const privateKeyBuffer = Buffer.from(base64PrivateKey, 'base64');
    const privateKey = privateKeyBuffer.toString('utf8');

    const baseOptions = {
      keyId: signingKeyId,
      keySecret: privateKey,
      expiration: '24h',
    };

    const videoToken = await mux.jwt.signPlaybackId(playbackId, {
      ...baseOptions,
      type: 'video',
      params: {
        playback_restriction_id: process.env.MUX_PLAYBACK_RESTRICTION_ID!,
      },
    });

    const thumbnailToken = await mux.jwt.signPlaybackId(playbackId, {
      ...baseOptions,
      type: 'thumbnail',
      params: {
        playback_restriction_id: process.env.MUX_PLAYBACK_RESTRICTION_ID!,
      },
    });

    return {
      success: true,
      videoToken,
      thumbnailToken,
    };
  } catch (error) {
    console.error('Token Generation Error:', error);
    return { success: false, error: 'Failed to sign' };
  }
};
