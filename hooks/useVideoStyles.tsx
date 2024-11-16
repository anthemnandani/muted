const useVideoStyles = (
  aspectRatio?: string,
  originalDimensions?: { width: number; height: number }
) => {
  const MIN_RATIO = 0.8;
  const MAX_RATIO = 16 / 9;
  const CONTAINER_RATIO = 4 / 5;
  const is916 = aspectRatio === '9:16';

  let targetRatio = 16 / 9;
  let containerStyle = {};
  let videoStyle = {};

  if (is916) {
    containerStyle = { aspectRatio: CONTAINER_RATIO };
    videoStyle = {
      height: '100%',
      aspectRatio: '9/16',
      width: 'auto',
    };
  } else {
    if (aspectRatio === '16:9') targetRatio = 16 / 9;
    else if (aspectRatio === '4:5') targetRatio = 4 / 5;
    else if (originalDimensions) {
      const originalRatio =
        originalDimensions.width / originalDimensions.height;
      if (originalRatio < MIN_RATIO && originalRatio !== 9 / 16)
        targetRatio = 4 / 5;
      else if (originalRatio > MAX_RATIO) targetRatio = 16 / 9;
      else targetRatio = originalRatio;
    }

    containerStyle = { aspectRatio: targetRatio };
    videoStyle = {
      height: '100%',
      width: '100%',
      objectFit: 'cover',
    };
  }

  return { containerStyle, videoStyle, is916 };
};

export default useVideoStyles;
