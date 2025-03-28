export const trackEvent = (eventName: string, params?: Record<string, string>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

export const trackPageView = (path: string) => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', measurementId, {
      page_path: path
    });
  }
};