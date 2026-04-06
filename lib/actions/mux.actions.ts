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

const getSigningOptions = () => {
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID!;
  const base64PrivateKey = process.env.MUX_PRIVATE_KEY!;
  const playbackRestrictionId = process.env.MUX_PLAYBACK_RESTRICTION_ID!;

  if (!signingKeyId || !base64PrivateKey) {
    throw new Error('Missing MUX signing keys in environment variables');
  }

  const privateKeyBuffer = Buffer.from(base64PrivateKey, 'base64');
  const privateKey = privateKeyBuffer.toString('utf8');

  return {
    keyId: signingKeyId,
    keySecret: privateKey,
    expiration: '24h',
    playbackRestrictionId,
  };
};

const signToken = async (playbackId: string, type: 'video' | 'thumbnail') => {
  const { playbackRestrictionId, ...baseOptions } = getSigningOptions();

  return await mux.jwt.signPlaybackId(playbackId, {
    ...baseOptions,
    type,
    params: {
      playback_restriction_id: playbackRestrictionId,
    },
  });
};

export const createPlaybackTokens = async (playbackId: string) => {
  try {
    const [videoToken, thumbnailToken] = await Promise.all([
      signToken(playbackId, 'video'),
      signToken(playbackId, 'thumbnail'),
    ]);

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

export const createVideoToken = async (playbackId: string) => {
  try {
    const videoToken = await signToken(playbackId, 'video');
    return {
      success: true,
      videoToken,
    };
  } catch (error) {
    console.error('Video Token Generation Error:', error);
    return { success: false, error: 'Failed to sign' };
  }
};

export const createThumbnailToken = async (playbackId: string) => {
  try {
    const thumbnailToken = await signToken(playbackId, 'thumbnail');
    return {
      success: true,
      thumbnailToken,
    };
  } catch (error) {
    console.error('Thumbnail Token Generation Error:', error);
    return { success: false, error: 'Failed to sign' };
  }
};

// REPLACE karo arrow function ko:
async function signThumbnailForPreview(playbackId: string): Promise<string> {
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID!;
  const base64PrivateKey = process.env.MUX_PRIVATE_KEY!;

  const privateKey = Buffer.from(base64PrivateKey, 'base64').toString('utf8');

  return await mux.jwt.signPlaybackId(playbackId, {
    keyId: signingKeyId,
    keySecret: privateKey,
    expiration: '24h',
    type: 'thumbnail',
  });
}

export const createThumbnailTokenForPreview = async (playbackId: string) => {
  try {
    const thumbnailToken = await signThumbnailForPreview(playbackId);
    return { success: true, thumbnailToken };
  } catch (error) {
    console.error('Preview Thumbnail Token Error:', error);
    return { success: false, error: 'Failed to sign' };
  }
};