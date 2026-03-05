import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const PagesForm = () => {
  const [title, setTitle] = useState('');
  const router = useRouter();

  const handleCreateNewPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    router.push(
      `/admin/pages/${formattedSlug}?title=${encodeURIComponent(title)}`,
    );
  };
  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
      <div>
        <h1 className='text-2xl font-bold text-white'>Pages Manager</h1>
        <p className='text-white/60 text-sm mt-1'>
          Manage static content like Terms and Privacy Policies.
        </p>
      </div>

      <form
        onSubmit={handleCreateNewPage}
        className='flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10'
      >
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='e.g. Cookie Policy'
          className='bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none px-2 w-48'
        />
        <Button type='submit' size='sm' className='gap-2'>
          <Plus className='size-4' /> Create
        </Button>
      </form>
    </div>
  );
};

export default PagesForm;
