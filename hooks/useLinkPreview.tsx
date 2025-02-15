import type { LinkPreview, PostData } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function useLinkPreview(
  text: string,
  setPostData: React.Dispatch<React.SetStateAction<PostData>>
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
      setPostData((prev) => ({ ...prev, linkPreview: null }));
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
          setPostData((prev) => ({
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
          setPostData((prev) => ({ ...prev, linkPreview: null }));
          return;
        }

        const data = await response.json();

        if (data && (data.title || data.description || data.image)) {
          setPostData((prev) => ({ ...prev, linkPreview: data }));
          cache[fullUrl] = data;
          setLastFetchedUrl(fullUrl);
        } else {
          setPostData((prev) => ({ ...prev, linkPreview: null }));
        }
      } catch (error) {
        console.error('Error fetching link preview:', error);
        setPostData((prev) => ({ ...prev, linkPreview: null }));
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
