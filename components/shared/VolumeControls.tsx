'use client';

import useVideoPlayer from '@/store/videoPlayer';
import { Volume2, VolumeX } from 'lucide-react';
import React from 'react';
import Player from 'video.js/dist/types/player';

interface VolumeControlsProps {
  player: Player | null;
  showControls: boolean;
}

const VolumeControls: React.FC<VolumeControlsProps> = ({
  player,
  showControls,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);
  const { isMuted, setIsMuted } = useVideoPlayer();
  const [volume, setVolume] = React.useState(1);

  const handleVolumeChange = (newVolume: number) => {
    if (!player) return;

    setVolume(newVolume);
    player.volume(newVolume);

    if (newVolume === 0) {
      player.muted(true);
      setIsMuted(true);
    } else if (isMuted) {
      player.muted(false);
      setIsMuted(false);
    }
  };

  React.useEffect(() => {
    if (player) {
      setVolume(player.volume() as number);
    }
  }, [player]);

  return (
    <div
      className={`flex items-center transition-opacity duration-200 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
      onTouchStart={(e) => {
        e.stopPropagation();
        setShowVolumeSlider(true);
      }}
    >
      <button
        className='text-white drop-shadow-lg focus:outline-none focus-visible:outline-none select-none'
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
      >
        {isMuted ? (
          <VolumeX className='size-6 stroke-[2.5px]' />
        ) : (
          <Volume2 className='size-6 stroke-[2.5px]' />
        )}
      </button>

      <div
        className={`h-6 w-20 bg-black/40 rounded-full px-2 flex items-center drop-shadow-lg backdrop-blur-sm ml-2 transition-opacity duration-200 ${
          showVolumeSlider ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <input
          type='range'
          min='0'
          max='1'
          step='0.1'
          value={isMuted ? 0 : volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className='w-full h-1 bg-white/30 rounded-full'
        />
      </div>
    </div>
  );
};

export default VolumeControls;
