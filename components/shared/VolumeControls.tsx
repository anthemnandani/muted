'use client';

import { VolumeControlsProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useVideoPlayer from '@/store/videoPlayer';
import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';

const VolumeControls: React.FC<VolumeControlsProps> = ({
  player,
  showControls,
  isVertical,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const { isMuted, setIsMuted } = useVideoPlayer();
  const [volume, setVolume] = useState(1);

  const handleVolumeChange = (newVolume: number) => {
    if (!player) return;

    setVolume(newVolume);
    player.volume = newVolume;

    if (newVolume === 0) {
      player.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      player.muted = false;
      setIsMuted(false);
    }
  };

  useEffect(() => {
    if (player) {
      setVolume(player.volume);
    }
  }, [player]);

  if (!player) return null;

  return (
    <div
      className={cn(
        'flex items-center transition-opacity duration-200 relative z-50',
        showControls ? 'opacity-100' : 'opacity-0',
        isVertical ? 'flex-col-reverse absolute bottom-2 right-2' : 'flex-row'
      )}
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
      onTouchStart={(e) => {
        e.stopPropagation();
        setShowVolumeSlider(true);
      }}
    >
      <button
        className={cn(
          isVertical
            ? 'post-detail-btn group'
            : 'text-white drop-shadow-lg focus:outline-none focus-visible:outline-none select-none p-2'
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
      >
        {isMuted ? (
          <VolumeX
            className={cn(
              'size-6 stroke-[2.5px]',
              isVertical && 'group-hover:opacity-50'
            )}
          />
        ) : (
          <Volume2
            className={cn(
              'size-6 stroke-[2.5px]',
              isVertical && 'group-hover:opacity-50'
            )}
          />
        )}
      </button>

      <div
        className={cn(
          'bg-white/10 hover:bg-white/5 rounded-full flex-center drop-shadow-lg backdrop-blur-sm transition-all duration-200',
          showVolumeSlider
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none',

          isVertical ? 'h-28 w-8 mb-2 flex-col' : 'h-8 w-24 ml-2 px-2'
        )}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <input
          aria-label='Volume'
          type='range'
          min='0'
          max='1'
          step='0.1'
          value={isMuted ? 0 : volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className={cn(
            'bg-white/50 rounded-full cursor-pointer appearance-none',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:!bg-white',
            '[&::-webkit-slider-thumb]:!rounded-full [&::-webkit-slider-thumb]:!size-4',
            '[&::-webkit-slider-thumb]:!-mt-1 [&::-webkit-slider-runnable-track]:!h-full',
            '[&::-moz-range-track]:!h-full [&::-moz-range-track]:!bg-white/50 [&::-moz-range-track]:!rounded-full',
            '[&::-moz-range-thumb]:!bg-white [&::-moz-range-thumb]:!rounded-full',
            '[&::-moz-range-thumb]:!size-4 [&::-moz-range-thumb]:border-none',
            isVertical
              ? 'h-2 w-24 -rotate-90 origin-center my-auto'
              : 'w-full h-2'
          )}
        />
      </div>
    </div>
  );
};

export default VolumeControls;
