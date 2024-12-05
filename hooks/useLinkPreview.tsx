import type { LinkPreview, ThreadData } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function useLinkPreview(
  text: string,
  setThreadData: React.Dispatch<React.SetStateAction<ThreadData>>
) {
  const [isLinkPreviewLoading, setIsLinkPreviewLoading] = useState(false);
  const [lastFetchedUrl, setLastFetchedUrl] = useState<string | null>(null);
  const cache: Record<string, LinkPreview | null> = {};

  useEffect(() => {
    const urlRegex =
      /((?:https?:\/\/)?(?:www\.)?[^\s]+\.[a-z]+(?:\/[^\s]*)?)\s/i;
    const matches = text.match(urlRegex);
    const url = matches?.[1];

    if (!url) {
      setThreadData((prev) => ({ ...prev, linkPreview: null }));
      setLastFetchedUrl(null);
      return;
    }

    const fullUrl = url.startsWith('http') ? url : `https://${url}`;

    if (fullUrl === lastFetchedUrl) {
      return;
    }

    const fetchLinkPreview = async () => {
      setIsLinkPreviewLoading(true);
      try {
        if (cache[fullUrl]) {
          setThreadData((prev) => ({
            ...prev,
            linkPreview: cache[fullUrl],
          }));
          return;
        }

        const response = await fetch('/api/link-preview', {
          method: 'POST',
          body: JSON.stringify({ url: fullUrl }),
        });

        if (!response.ok) {
          setThreadData((prev) => ({ ...prev, linkPreview: null }));
          return;
        }

        const data = await response.json();

        if (data && (data.title || data.description || data.image)) {
          setThreadData((prev) => ({ ...prev, linkPreview: data }));
          cache[fullUrl] = data;
          setLastFetchedUrl(fullUrl);
        } else {
          setThreadData((prev) => ({ ...prev, linkPreview: null }));
        }
      } catch (error) {
        console.error('Error fetching link preview:', error);
        setThreadData((prev) => ({ ...prev, linkPreview: null }));
      } finally {
        setIsLinkPreviewLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchLinkPreview();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [text, lastFetchedUrl]);

  return { isLinkPreviewLoading };
}
