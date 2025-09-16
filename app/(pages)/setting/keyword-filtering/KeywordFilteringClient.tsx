'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import useKeywords from '@/hooks/useKeywords';
import { useSettingRefs } from '@/hooks/useSettingRefs';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import AddKeyword from '../components/AddKeyword';
import { KeywordList } from '../components/KeywordList';
import SettingsLayout from '../components/SettingsLayout';
import type { FilteredKeyword } from '@prisma/client';

const KeywordFilteringClient = () => {
  const sectionRefs = useSettingRefs();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<FilteredKeyword | null>(
    null
  );
  const {
    isLoading,
    hasNextPage,
    fetchNextPage,
    handleDelete,
    isDeleting,
    filteredKeywords,
    totalCount,
  } = useKeywords();

  const handleEditClick = (keyword: FilteredKeyword) => {
    setEditingKeyword(keyword);
    setShowAddForm(true);
  };

  const handleAddClick = () => {
    setEditingKeyword(null);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingKeyword(null);
  };

  return (
    <SettingsLayout sectionRefs={sectionRefs} isLoading={isLoading}>
      {showAddForm ? (
        <AddKeyword
          keywordToEdit={editingKeyword}
          onSaveSuccess={handleCloseForm}
          onCancel={handleCloseForm}
        />
      ) : (
        <div className='flex flex-col max-w-[680px] w-full p-5 bg-[#242424] h-full max-h-[90vh]'>
          <h2 className='text-2xl font-bold text-white/90 antialiased mb-5'>
            Filter keywords
          </h2>
          <p className='text-sm text-white/90 mb-5'>
            When you filter a keyword, you won’t see posts in your selected
            feeds that contain that word in any titles, descriptions, or
            stickers. Certain keywords can’t be filtered.
          </p>
          <Button
            variant='ghost'
            className={cn(
              'min-w-[180px] w-fit bg-primary-blue text-white hover:bg-primary-blue/90 hover:text-white/90',
              'text-base !h-12 px-6 rounded-lg inline-flex items-center justify-center'
            )}
            onClick={handleAddClick}
          >
            <Icons.plus className='size-[19px]' />
            <div className='truncate ml-[5.5px]'>Add keyword</div>
          </Button>
          {totalCount > 0 && (
            <KeywordList
              keywords={filteredKeywords}
              totalCount={totalCount}
              fetchNextPage={fetchNextPage}
              hasNextPage={!!hasNextPage}
              onDelete={handleDelete}
              isDeleting={isDeleting}
              onEdit={handleEditClick}
            />
          )}
        </div>
      )}
    </SettingsLayout>
  );
};

export default KeywordFilteringClient;
