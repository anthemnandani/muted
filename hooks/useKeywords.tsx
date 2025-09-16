import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useKeywords = () => {
  const utils = api.useUtils();
  const { data, isLoading, hasNextPage, fetchNextPage } =
    api.keyword.getKeywords.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
      }
    );

  const { mutate: deleteKeyword, isLoading: isDeleting } =
    api.keyword.deleteKeyword.useMutation({
      onMutate: async (deletedKeyword) => {
        await utils.keyword.getKeywords.cancel();
        const previousKeywords = utils.keyword.getKeywords.getInfiniteData();
        utils.keyword.getKeywords.setInfiniteData({}, (oldData) => {
          if (!oldData) {
            return { pages: [], pageParams: [] };
          }
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.filter(
                (item) => item.id !== deletedKeyword.keywordId
              ),
              totalCount: page.totalCount - 1,
            })),
          };
        });

        return { previousKeywords };
      },
      onError: (_, __, context) => {
        toast.error('Failed to delete keyword.');
        if (context?.previousKeywords) {
          utils.keyword.getKeywords.setInfiniteData(
            {},
            context.previousKeywords
          );
        }
      },
      onSuccess: () => {
        toast.success('Keyword has been deleted.');
      },
      onSettled: () => {
        utils.keyword.getKeywords.invalidate();
      },
    });

  const handleDelete = (keywordId: string) => {
    deleteKeyword({ keywordId });
  };

  const filteredKeywords = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages?.[0]?.totalCount ?? 0;

  return {
    isLoading,
    hasNextPage,
    fetchNextPage,
    handleDelete,
    isDeleting,
    filteredKeywords,
    totalCount,
  };
};

export default useKeywords;
