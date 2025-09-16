'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { AddKeywordProps, type FeedsState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const AddKeyword = ({
  onSaveSuccess,
  onCancel,
  keywordToEdit,
}: AddKeywordProps) => {
  const [keyword, setKeyword] = useState('');
  const [feeds, setFeeds] = useState<FeedsState>({
    forYou: false,
    following: false,
    friends: false,
  });
  const utils = api.useUtils();

  const isEditMode = !!keywordToEdit;

  useEffect(() => {
    if (isEditMode) {
      setKeyword(keywordToEdit.keyword);
      setFeeds({
        forYou: keywordToEdit.feeds.includes('FOR_YOU'),
        following: keywordToEdit.feeds.includes('FOLLOWING'),
        friends: keywordToEdit.feeds.includes('FRIENDS'),
      });
    }
  }, [keywordToEdit, isEditMode]);

  const { mutate: addKeyword, isLoading: isAdding } =
    api.keyword.addKeyword.useMutation({
      onSuccess: () => {
        toast.success('Keyword added successfully!');
        setKeyword('');
        onSaveSuccess();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        utils.keyword.getKeywords.invalidate();
      },
    });

  const { mutate: updateKeyword, isLoading: isUpdating } =
    api.keyword.updateKeyword.useMutation({
      onSuccess: () => {
        toast.success('Keyword updated successfully!');
        onSaveSuccess();
      },
      onError: (error: any) => toast.error(error.message),
      onSettled: () => utils.keyword.getKeywords.invalidate(),
    });

  const handleSave = () => {
    if (isEditMode) {
      updateKeyword({ id: keywordToEdit.id, keyword, feeds });
    } else {
      addKeyword({ keyword, feeds });
    }
  };

  const isProcessing = isAdding || isUpdating;

  const isSaveDisabled = useMemo(() => {
    const isKeywordEmpty = keyword.trim().length === 0;
    const isNoFeedSelected = Object.values(feeds).every((v) => !v);
    return isKeywordEmpty || isNoFeedSelected || isProcessing;
  }, [keyword, feeds, isProcessing]);

  const handleSelectAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const allSelected = Object.values(feeds).every(Boolean);
    setFeeds({
      forYou: !allSelected,
      following: !allSelected,
      friends: !allSelected,
    });
  };

  const handleFeedChange = (feedName: keyof FeedsState) => {
    setFeeds((prevFeeds) => ({
      ...prevFeeds,
      [feedName]: !prevFeeds[feedName],
    }));
  };

  const feedOptions: { id: keyof FeedsState; label: string }[] = [
    { id: 'forYou', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'friends', label: 'Friends' },
  ];

  return (
    <div className='flex flex-col max-w-[680px] w-full p-5 bg-[#242424] h-full max-h-[90vh]'>
      <h2 className='text-2xl font-bold text-white/90 antialiased mb-5'>
        {isEditMode ? 'Edit keyword' : 'Add keyword'}
      </h2>
      <p className='text-sm text-white/90 mb-5'>
        Enter a single word or hashtag to filter from selected feeds. Spelling
        isn't case-sensitive.
      </p>
      <div className='mb-9'>
        <Input
          placeholder='Enter a word or hashtag'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          maxLength={70}
          className={cn(
            'bg-white/10 border-none placeholder-white/20 h-12 text-white',
            'focus-visible:ring-0 focus-visible:ring-offset-0'
          )}
          disabled={isProcessing}
        />
        <p className='text-right text-xs text-gray-400 mt-2'>
          {keyword.length}/70
        </p>
      </div>
      <div>
        <div className='flex-between px-2 mb-2'>
          <h4 className='text-sm font-semibold text-white/40'>Filter from</h4>
          <button
            type='button'
            onClick={handleSelectAll}
            className='text-base text-primary-blue font-medium hover:text-primary-blue/90 h-10'
          >
            Select all
          </button>
        </div>
        <div className='bg-white/10 rounded-md p-4'>
          {feedOptions.map((option, index) => (
            <div
              key={option.id}
              className={cn(
                'flex-between',
                index < feedOptions.length - 1 ? 'mb-6' : ''
              )}
            >
              <label
                htmlFor={option.id}
                className='text-base font-medium text-white/90 cursor-pointer'
              >
                {option.label}
              </label>
              <Checkbox
                id={option.id}
                checked={feeds[option.id]}
                onCheckedChange={() => handleFeedChange(option.id)}
                className={cn(
                  'size-5 rounded-[4px] border-2 border-white/20 data-[state=checked]:text-white',
                  'focus-visible:ring-offset-0 focus-visible:ring-0'
                )}
                disabled={isProcessing}
              />
            </div>
          ))}
        </div>
        <div className='flex items-center mt-6'>
          <div>
            <Button
              onClick={handleSave}
              variant='ghost'
              className={cn(
                'min-w-[180px] w-fit bg-primary-blue text-white hover:bg-primary-blue/90 hover:text-white',
                'text-base !h-12 px-6 rounded-lg inline-flex-center mr-4 disabled:cursor-not-allowed'
              )}
              disabled={isSaveDisabled}
            >
              <div className='overflow-hidden w-full flex-center'>
                {isProcessing ? 'Saving...' : 'Save'}
              </div>
            </Button>
            <Button
              onClick={onCancel}
              disabled={isProcessing}
              variant='ghost'
              className={cn(
                'min-w-[180px] w-fit bg-white-13 text-white hover:bg-white/20 hover:text-white',
                'text-base !h-12 px-6 rounded-lg inline-flex-center disabled:cursor-not-allowed'
              )}
            >
              <div className='overflow-hidden w-full flex-center'>Cancel</div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddKeyword;
