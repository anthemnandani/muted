// import usePostDialog from '@/store/postDialog';
// import { api } from '@/trpc/react';
// import { useEffect, useState } from 'react';
// import { useDebounce } from 'use-debounce';

// const useLinkPreview = () => {
//   const { postData, setPostData } = usePostDialog();
//   const [urlToFetch, setUrlToFetch] = useState<string | null>(null);

//   const [debouncedUrl] = useDebounce(urlToFetch, 750);

//   const { data, isFetching } = api.post.getLinkInfo.useQuery(
//     { url: debouncedUrl! },
//     {
//       enabled: !!debouncedUrl,
//       retry: false,
//       refetchOnWindowFocus: false,
//     }
//   );

//   useEffect(() => {
//     const urlRegex =
//       /((?:https?:\/\/)?(?:www\.)?[^\s]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
//     const matches = postData.threadText.match(urlRegex);

//     const lastUrl = matches ? matches[matches.length - 1] : null;

//     setUrlToFetch(lastUrl);
//   }, [postData.threadText]);

//   useEffect(() => {
//     if (data) {
//       setPostData({ ...postData, linkPreview: data });
//     } else if (debouncedUrl && !isFetching) {
//       setPostData({ ...postData, linkPreview: null });
//     }
//   }, [data, debouncedUrl, isFetching]);

//   const isLinkPreviewLoading = !!debouncedUrl && isFetching;

//   return { isLinkPreviewLoading };
// };

// export default useLinkPreview;
