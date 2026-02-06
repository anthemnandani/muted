import { useThreadStore } from '@/store/threadStore';
import { api } from '@/trpc/react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

const useLinkPreview = () => {
  const { text, setLinkPreview, replyThreadInfo } = useThreadStore();
  const [urlToFetch, setUrlToFetch] = useState<string | null>(null);

  const [debouncedUrl] = useDebounce(urlToFetch, 750);

  const { data, isFetching } = api.post.getLinkInfo.useQuery(
    { url: debouncedUrl! },
    {
      enabled: !!debouncedUrl && !replyThreadInfo,
      retry: false,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    const urlRegex =
      /((?:https?:\/\/)?(?:www\.)?[^\s]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
    const matches = text.match(urlRegex);

    const lastUrl = matches ? matches[matches.length - 1] : null;

    setUrlToFetch(lastUrl);
  }, [text]);

  useEffect(() => {
    if (data) {
      setLinkPreview(data);
    } else if (debouncedUrl && !isFetching) {
      setLinkPreview(null);
    }
  }, [data, debouncedUrl, isFetching]);

  const isLinkPreviewLoading = !!debouncedUrl && isFetching;

  return { isLinkPreviewLoading };
};

export default useLinkPreview;
