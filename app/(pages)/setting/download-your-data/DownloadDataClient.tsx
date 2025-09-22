'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettingRefs } from '@/hooks/useSettingRefs';
import { DownloadableData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import Image from 'next/image';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';
import SettingsLayout from '../components/SettingsLayout';

const customDataOptions = Object.values(DownloadableData);

const DownloadDataClient = () => {
  const sectionRefs = useSettingRefs();
  const [dataFormat, setDataFormat] = useState<'json' | 'txt'>('txt');
  const [selectedDataOption, setSelectedDataOption] = useState('all');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const { mutate: downloadData, isLoading } =
    api.post.downloadUserData.useMutation({
      onSuccess: (data) => {
        const link = document.createElement('a');
        link.href = `data:application/zip;base64,${data.zipData}`;
        link.download = `Muted_Data_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      onError: () => {
        toast.error(
          'An error occurred while preparing your data. Please try again.'
        );
      },
    });

  const handleDownloadClick = () => {
    let selectedOptions: DownloadableData[] = [];

    if (selectedDataOption === 'all') {
      selectedOptions = customDataOptions;
    } else {
      selectedOptions = Object.keys(checkedItems).filter(
        (key) => checkedItems[key]
      ) as DownloadableData[];
    }

    if (selectedOptions.length === 0) {
      toast.warning('Please select at least one data category to download.');
      return;
    }

    downloadData({ options: selectedOptions, format: dataFormat });
  };

  const handleCheckboxChange = (option: string, isChecked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [option]: isChecked }));
  };

  const selectedCount = Object.values(checkedItems).filter(Boolean).length;
  const allSelected = selectedCount === customDataOptions.length;

  const handleSelectAll = () => {
    const newCheckedState: Record<string, boolean> = {};
    if (!allSelected) {
      customDataOptions.forEach((option) => {
        newCheckedState[option] = true;
      });
    }
    setCheckedItems(newCheckedState);
  };

  return (
    <SettingsLayout sectionRefs={sectionRefs}>
      <div className='flex flex-col max-w-[680px] w-full px-2 h-full max-h-[90vh] mx-auto'>
        <div className='flex flex-col text-2xl leading-8 font-bold text-white/90'>
          Download Muted data
          <span className='text-[15px] leading-[1.3em] font-normal mt-2'>
            You can download a copy of your data at any time to back up your
            account or export it to other services.
          </span>
        </div>
        <div className='text-[17px] leading-[1.3em] font-medium mt-4'>
          Select file format
        </div>
        <div className='max-h-[80vh] flex flex-col overflow-y-auto'>
          <div className='bg-[#242424] p-4 rounded-lg mt-4'>
            <RadioGroup
              value={dataFormat}
              onValueChange={(value: 'json' | 'txt') => setDataFormat(value)}
            >
              <div className='flex-between'>
                <span className='text-base'>TXT</span>
                <RadioGroupItem value='txt' />
              </div>
              <span className='text-sm text-white/60'>
                Easy-to-read text file
              </span>
              <div className='flex-between mt-6'>
                <span className='text-base'>JSON</span>
                <RadioGroupItem value='json' />
              </div>
              <span className='text-sm text-white/60'>
                Allows other services to import your file
              </span>
            </RadioGroup>
          </div>
          <div className='text-[17px] leading-[1.3em] font-medium mt-4'>
            Select data to download
          </div>
          <div className='text-sm text-white/60 mt-2'>
            Choose which apps and data you want to include in your file.
          </div>
          <div className='bg-[#242424] p-4 rounded-lg mt-3'>
            <RadioGroup
              value={selectedDataOption}
              onValueChange={setSelectedDataOption}
            >
              <div className='flex-between'>
                <span className='text-base'>All available data</span>
                <RadioGroupItem value='all' />
              </div>
              <span className='text-sm text-white/60'>
                Download all available data associated with the Muted apps you
                use.
              </span>
              <div className='flex-between mt-6'>
                <span className='text-base'>Custom</span>
                <RadioGroupItem value='custom' />
              </div>
              <span className='text-sm text-white/60'>
                Choose which apps and data you want to include in your file.
              </span>
            </RadioGroup>
            {selectedDataOption === 'custom' && (
              <Fragment>
                <div className='mt-3 custom-separator' />
                <div className='flex-between mt-4'>
                  <div className='flex items-center'>
                    <Image
                      src={`/assets/muted-logo-white.svg`}
                      alt='Logo'
                      width={20}
                      height={20}
                      className='object-contain'
                    />
                    <span className='text-base font-medium mx-1'>Muted</span>
                    <span className='text-sm text-white/60 ml-1 mt-0.5'>
                      {selectedCount}/{customDataOptions.length} selected
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={handleSelectAll}
                    className='text-base text-primary-blue font-medium hover:text-primary-blue/90 h-10'
                  >
                    Select all
                  </button>
                </div>

                {customDataOptions.map((option, index) => (
                  <div key={option} className='flex flex-col'>
                    <div
                      className={cn(
                        'flex-between pl-1',
                        index !== 0 ? 'mt-6' : 'mt-4'
                      )}
                    >
                      <label
                        htmlFor={option}
                        className='text-base text-white/90'
                      >
                        {option}
                      </label>
                      <Checkbox
                        id={option}
                        checked={!!checkedItems[option]}
                        onCheckedChange={(checked) => {
                          handleCheckboxChange(option, checked as boolean);
                        }}
                        className={cn(
                          'size-5 rounded-[4px] border-2 border-white/20 data-[state=checked]:text-white',
                          'focus-visible:ring-offset-0 focus-visible:ring-0'
                        )}
                      />
                    </div>
                  </div>
                ))}
              </Fragment>
            )}
          </div>
        </div>
        <Button
          variant='ghost'
          className={cn(
            'min-w-[124px] w-full bg-primary-blue text-white hover:bg-primary-blue/90 hover:text-white/90',
            'text-base !h-12 px-6 rounded-lg inline-flex-center mt-6'
          )}
          onClick={handleDownloadClick}
          disabled={isLoading}
        >
          <div className='flex-center w-full overflow-hidden'>
            <div className='relative truncate'>
              {isLoading ? 'Downloading data...' : 'Download data'}
            </div>
          </div>
        </Button>
      </div>
    </SettingsLayout>
  );
};

export default DownloadDataClient;
