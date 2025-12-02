'use client';

import { MuxPlayerRef, ProfileVideoPlayerProps } from '@/lib/types';
import { getVideoThumbnailUrl } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import { useEffect, useMemo, useRef } from 'react';

export const ProfileVideoPlayer: React.FC<ProfileVideoPlayerProps> = ({
  playbackId,
  videoToken,
  thumbnailToken,
  onPlayerReady,
}) => {
  const playerRef = useRef<MuxPlayerRef>(null);

  useEffect(() => {
    if (playerRef.current && onPlayerReady) {
      onPlayerReady(playerRef.current);
    }
  }, [onPlayerReady]);

  const securePoster = useMemo(() => {
    if (playbackId && thumbnailToken) {
      return getVideoThumbnailUrl(playbackId, thumbnailToken);
    }
    return undefined;
  }, [playbackId, thumbnailToken]);

  return (
    <div className='w-full h-full bg-black'>
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        tokens={{
          playback: videoToken,
          thumbnail: thumbnailToken,
        }}
        poster={securePoster}
        streamType='on-demand'
        muted
        loop
        preload='auto'
        style={{
          height: '100%',
          width: '100%',
          aspectRatio: 3 / 4,
          objectFit: 'cover',
          '--media-object-fit': 'cover',
          '--controls': 'none',
        }}
      />
    </div>
  );
};
