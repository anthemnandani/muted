// 'use client';

// import { useCallback, useEffect, useMemo, useState } from 'react';
// import Player from 'video.js/dist/types/player';
// import { VideoPlayer } from '../shared/VideoPlayer';
// import useVideoPlayer from '@/store/videoPlayer';

// interface ThreadVideoCardProps {
//   video: string;
//   postId: string;
//   poster?: string;
// }

// const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({
//   video,
//   postId,
//   poster,
// }) => {
//   const [player, setPlayer] = useState<Player | null>(null);
//   const {
//     currentlyPlaying,
//     setCurrentlyPlaying,
//     isMuted,
//     setIsMuted,
//     timestamps,
//     setTimestamp,
//   } = useVideoPlayer();

//   const isSafari = useMemo(() => {
//     if (typeof window === 'undefined') return false;
//     return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
//   }, []);

//   const sourceType = useMemo(() => {
//     if (isSafari) {
//       return 'application/vnd.apple.mpegurl';
//     }
//     return 'application/x-mpegURL';
//   }, [isSafari]);

//   const playerOptions = useMemo(
//     () => ({
//       controls: true,
//       loop: false,
//       muted: true,
//       playsinline: true,
//       preload: 'metadata',
//       autoplay: false,
//       disablePictureInPicture: true,
//       userActions: { hotkeys: false, doubleClick: false },
//       controlBar: {
//         pictureInPictureToggle: false,
//         fullscreenToggle: false,
//         volumePanel: true,
//         progressControl: {
//           seekBar: true,
//         },
//       },
//       sources: [{ src: video, type: sourceType }],
//       html5: {
//         vhs: {
//           overrideNative: !isSafari,
//           withCredentials: false,
//         },
//         nativeTextTracks: isSafari,
//         nativeAudioTracks: isSafari,
//         nativeVideoTracks: isSafari,
//       },
//       hls: {
//         debug: false,
//         enableLowInitialPlaylist: true,
//         manifestLoadingTimeOut: 10000,
//       },
//     }),
//     [video, sourceType, isSafari]
//   );

//   useEffect(() => {
//     if (!player) return;

//     if (currentlyPlaying === postId && player.paused() === true) {
//       player.play();
//     } else if (currentlyPlaying !== postId && player.paused() === false) {
//       player.pause();
//     }
//   }, [currentlyPlaying, player, postId]);

//   useEffect(() => {
//     if (!player) return;

//     const handleVolumeChange = () => {
//       if (player.muted() !== isMuted) {
//         setIsMuted(player.muted() as boolean);
//       }
//     };

//     player.muted(isMuted);
//     player.on('volumechange', handleVolumeChange);

//     return () => {
//       player.off('volumechange', handleVolumeChange);
//     };
//   }, [player, isMuted, setIsMuted]);

//   useEffect(() => {
//     if (player && timestamps[postId]) {
//       player.currentTime(timestamps[postId]);
//     }
//   }, [player, timestamps, postId]);

//   const handleTimeUpdate = useCallback(() => {
//     if (player) {
//       setTimestamp(postId, player.currentTime() as number);
//     }
//   }, [postId, player, setTimestamp]);

//   const handleVideoClick = useCallback(() => {
//     if (!player) return;

//     if (player.paused()) {
//       setCurrentlyPlaying(postId);
//       player.play();
//     } else {
//       player.pause();
//     }
//   }, [player, postId, setCurrentlyPlaying]);

//   return (
//     <div
//       className='relative overflow-hidden rounded-lg size-[300px] cursor-pointer'
//       onClick={handleVideoClick}
//     >
//       <VideoPlayer
//         poster={poster}
//         options={playerOptions}
//         onPlayerReady={(p) => {
//           setPlayer(p);
//         }}
//         onTimeUpdate={handleTimeUpdate}
//         isThread
//       />
//     </div>
//   );
// };

// export default ThreadVideoCard;
