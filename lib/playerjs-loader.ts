let scriptPromise: Promise<void> | null = null;

export const loadPlayerJsScript = () => {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      if ((window as any).playerjs) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = '//assets.mediadelivery.net/playerjs/player-0.1.0.min.js';
      script.async = true;

      script.onload = () => resolve();
      script.onerror = reject;

      document.body.appendChild(script);
    });
  }
  return scriptPromise;
};
