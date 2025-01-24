const useVideoStyles = (
  aspectRatio?: string,
  originalDimensions?: { width: number; height: number }
) => {
  const MIN_RATIO = 0.8;
  const MAX_RATIO = 16 / 9;

  let videoStyle: React.CSSProperties = { width: '100%', height: 'auto' };

  if (aspectRatio === '9:16') {
    videoStyle = {
      height: '100%',
      aspectRatio: '9/16',
      width: 'auto',
    };
  } else if (aspectRatio === '16:9') {
    videoStyle = {
      ...videoStyle,
      aspectRatio: '16/9',
    };
  } else if (originalDimensions) {
    const originalRatio = originalDimensions.width / originalDimensions.height;

    if (originalRatio < MIN_RATIO && originalRatio !== 9 / 16) {
      videoStyle = {
        ...videoStyle,
        aspectRatio: '4/5',
      };
    } else if (originalRatio > MAX_RATIO) {
      videoStyle = {
        ...videoStyle,
        aspectRatio: '16/9',
      };
    } else {
      videoStyle = {
        ...videoStyle,
        aspectRatio: `${originalDimensions.width}/${originalDimensions.height}`,
      };
    }
  } else {
    videoStyle = {
      ...videoStyle,
      aspectRatio: '16/9',
    };
  }

  return { videoStyle };
};

export default useVideoStyles;
