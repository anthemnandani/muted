'use client';

import RichTextEditor from '@/app/(admin)/components/RichTextEditor';
import { Icons } from '@/components/icons';
import Loader from '@/components/shared/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/trpc/react';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const PageEditorClient = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = api.useUtils();

  const urlTitle = searchParams.get('title') || '';

  const [title, setTitle] = useState(urlTitle);
  const [content, setContent] = useState('');

  const { data: pageData, isLoading } = api.page.getPage.useQuery(
    {
      slug,
    },
    {
      retry: false,
      cacheTime: 10 * 60 * 1000,
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: savePage, isPending } = api.admin.upsertPage.useMutation({
    onSuccess: () => {
      toast.success('Page saved successfully!');
      router.push('/admin/pages');
    },
    onError: () => {
      toast.error('Something went wrong! Please try again later.');
    },
    onSettled: async () => {
      await utils.page.getAllPages.invalidate();
      await utils.page.getPage.invalidate();
    },
  });

  useEffect(() => {
    if (pageData) {
      setTitle(pageData.title);
      setContent(pageData.content);
    }
  }, [pageData, slug]);

  useEffect(() => {
    () => {
      setTitle('');
      setContent('');
    };
  }, []);

  if (isLoading) return <Loader />;

  const pageTitle = pageData ? 'Editing:' : 'Creating:';

  return (
    <div className='p-8 space-y-8'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>
            {`${pageTitle} /${slug}`}
          </h1>
        </div>

        <div className='flex items-center gap-4'>
          <Link
            href={`/pages/${slug}`}
            target='_blank'
            className='flex items-center gap-2 text-sm text-primary-blue hover:text-primary-blue/90 transition-colors px-3 py-2 rounded-md hover:bg-primary-blue/10'
          >
            <ExternalLink className='size-4' />
            View Live
          </Link>

          <Button
            onClick={() => savePage({ title, content, slug })}
            disabled={isPending}
            className='min-w-[160px]'
          >
            {isPending ? (
              <>
                <Icons.spinner className='size-4 mr-2 animate-spin' /> Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      <div className='space-y-6'>
        <div>
          <Label className='block text-white/70 mb-2.5'>Page Title</Label>
          <Input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full h-14 border border-white/10 rounded-md text-white focus-visible:ring-0 focus-visible:outline-none transition-colors'
            placeholder='e.g., Privacy Policy'
          />
        </div>

        <div>
          <Label className='block text-white/70 mb-2.5'>Page Content</Label>
          {(content || !pageData) && (
            <RichTextEditor content={content} onChange={setContent} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PageEditorClient;
