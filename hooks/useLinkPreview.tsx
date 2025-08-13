import { LinkPreview } from '@/lib/types';
import usePostDialog from '@/store/postDialog';
import { useEffect, useState } from 'react';

const useLinkPreview = () => {
  const [isLinkPreviewLoading, setIsLinkPreviewLoading] = useState(false);
  const [lastFetchedUrl, setLastFetchedUrl] = useState<string | null>(null);
  const cache: Record<string, LinkPreview | null> = {};
  const { postData, setPostData } = usePostDialog();

  useEffect(() => {
    const urlRegex =
      /((?:https?:\/\/)?(?:www\.)?[^\s]+\.[a-z]+(?:\/[^\s]*)?)\s/i;
    const matches = postData.threadText.match(urlRegex);
    const url = matches?.[1];

    if (!url) {
      setPostData({ ...postData, linkPreview: null });
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
          setPostData({
            ...postData,
            linkPreview: cache[fullUrl],
          });
          return;
        }

        const response = await fetch('/api/link-preview', {
          method: 'POST',
          body: JSON.stringify({ url: fullUrl }),
        });

        if (!response.ok) {
          setPostData({ ...postData, linkPreview: null });
          return;
        }

        const data = await response.json();

        if (data && (data.title || data.description || data.image)) {
          setPostData({ ...postData, linkPreview: data });
          cache[fullUrl] = data;
          setLastFetchedUrl(fullUrl);
        } else {
          setPostData({ ...postData, linkPreview: null });
        }
      } catch (error) {
        console.error('Error fetching link preview:', error);
        setPostData({ ...postData, linkPreview: null });
      } finally {
        setIsLinkPreviewLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchLinkPreview();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [postData.threadText, lastFetchedUrl]);

  return { isLinkPreviewLoading };
};

export default useLinkPreview;
