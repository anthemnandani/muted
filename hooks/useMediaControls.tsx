import React from 'react';

const useMediaControls = () => {
  const [showControls, setShowControls] = React.useState(false);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout>();

  const showControlsTemporarily = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  React.useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return {
    showControls,
    setShowControls,
    controlsTimeoutRef,
    showControlsTemporarily,
  };
};

export default useMediaControls;
