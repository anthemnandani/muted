'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import useReport from '@/hooks/useReport';
import { useReportNavigation } from '@/hooks/useReportNavigation';
import {
  REPORT_POST_CATEGORIES,
  REPORT_USER_CATEGORIES,
} from '@/lib/constants';
import { type ReportCategories } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useReportStore } from '@/store/reportStore';
import { Fragment, useEffect, useState } from 'react';
import ReportCategoriesList from './ReportCategoriesList';
import ReportConfirmation from './ReportConfirmation';
import ReportDetails from './ReportDetails';
import ReportHeader from './ReportHeader';

const Report = () => {
  const {
    isOpen,
    setOpen,
    categoryId,
    subcategoryId,
    currentView,
    reset,
    currentUserId,
  } = useReportStore();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reportCategories, setReportCategories] = useState<ReportCategories>(
    REPORT_POST_CATEGORIES,
  );

  useEffect(() => {
    if (currentUserId) {
      setReportCategories(REPORT_USER_CATEGORIES);
    }
  }, [currentUserId]);

  const {
    getCurrentCategoryLabel,
    getPoints,
    goBack,
    handleCategorySelect,
    handleSubcategorySelect,
    handleDetailSelect,
    shouldShowAdditionalForm,
    shouldShowUserSearch,
    shouldEnableSubmit,
  } = useReportNavigation({ reportCategories });

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        reset();
      }, 100);
    }
  }, [isOpen]);

  const renderContent = () => {
    switch (currentView) {
      case 'categories':
        return (
          <ReportCategoriesList
            title='Please select a scenario'
            items={Object.values(reportCategories)}
            onSelect={handleCategorySelect}
          />
        );
      case 'level1':
        if (!categoryId) return null;
        const category = Object.values(reportCategories).find(
          (c) => c.id === categoryId,
        );
        if (!category || !category.children) return null;

        return (
          <ReportCategoriesList
            title='Please select a scenario'
            items={category.children}
            onSelect={handleSubcategorySelect}
          />
        );
      case 'level2':
        if (!categoryId || !subcategoryId) return null;
        const parentCategory = Object.values(reportCategories).find(
          (c) => c.id === categoryId,
        );
        if (!parentCategory || !parentCategory.children) return null;

        const subcategory = parentCategory.children.find(
          (sc) => sc.id === subcategoryId,
        );
        if (!subcategory || !subcategory.children) return null;

        return (
          <ReportCategoriesList
            title='Please select a scenario'
            items={subcategory.children}
            onSelect={handleDetailSelect}
          />
        );
      case 'details':
        return (
          <ReportDetails
            categoryLabel={getCurrentCategoryLabel()}
            points={getPoints()}
            showAdditionalForm={shouldShowAdditionalForm()}
            showUserSearch={shouldShowUserSearch()}
            isUserReport={!!currentUserId}
          />
        );
      default:
        return (
          <ReportCategoriesList
            title='Please select a scenario'
            items={Object.values(reportCategories)}
            onSelect={handleCategorySelect}
          />
        );
    }
  };

  const { handleSubmitReport } = useReport({
    getCurrentCategoryLabel,
    setShowConfirmation,
  });

  return (
    <Fragment>
      <Dialog
        open={isOpen && !showConfirmation}
        onOpenChange={setOpen}
        modal={true}
      >
        <DialogContent
          className={cn(
            'p-0 border-none bg-[#121212] text-white/90 overflow-hidden rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.12)] flex flex-col',
            '!max-w-2xl h-[70vh]',
          )}
        >
          <ReportHeader
            currentView={currentView}
            goBack={goBack}
            handleOpenChange={setOpen}
          />
          <ScrollArea className='flex-1 w-full'>
            <div className='max-h-[70vh]'>{renderContent()}</div>
          </ScrollArea>

          {currentView === 'details' && (
            <div className='absolute bottom-0 left-0 right-0 px-5 py-6 bg-[#121212] border-t border-border-light'>
              <div className='w-full flex justify-end'>
                <Button
                  className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md border-none text-base'
                  onClick={handleSubmitReport}
                  disabled={!shouldEnableSubmit()}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        modal={true}
      >
        <DialogContent className='p-0 border-none bg-[#121212] text-white/90 overflow-hidden rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.12)] !max-w-md'>
          <ReportConfirmation onClose={() => setShowConfirmation(false)} />
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default Report;
