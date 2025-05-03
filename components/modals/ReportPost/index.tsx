'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReportNavigation } from '@/hooks/useReportNavigation';
import { REPORT_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useReportStore } from '@/store/reportStore';
import { api } from '@/trpc/react';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';
import ReportCategoriesList from './ReportCategoriesList';
import ReportConfirmation from './ReportConfirmation';
import ReportDetails from './ReportDetails';
import ReportHeader from './ReportHeader';

const ReportPost = () => {
  const {
    isOpen,
    setOpen,
    categoryId,
    subcategoryId,
    detailId,
    currentView,
    reset,
    reason,
    currentPostId,
    additionalInfo,
  } = useReportStore();

  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    getCurrentCategoryLabel,
    getPoints,
    goBack,
    handleCategorySelect,
    handleSubcategorySelect,
    handleDetailSelect,
    shouldShowAdditionalForm,
  } = useReportNavigation();

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      reset();
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  const { mutate: createReport } = api.post.createReportPost.useMutation({
    onSuccess: () => {
      setLoading(false);
      setOpen(false);
      setTimeout(() => {
        setShowConfirmation(true);
      }, 100);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit report');
      setLoading(false);
    },
  });

  const handleSubmitReport = () => {
    setLoading(true);
    createReport({
      postId: currentPostId!,
      categoryId: categoryId!,
      subCategoryId: subcategoryId || undefined,
      detailId: detailId || undefined,
      reason: reason || getCurrentCategoryLabel(),
      additionalInfo: additionalInfo || undefined,
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'categories':
        return (
          <ReportCategoriesList
            title='Please select a scenario'
            items={Object.values(REPORT_CATEGORIES)}
            onSelect={handleCategorySelect}
          />
        );
      case 'level1':
        if (!categoryId) return null;
        const category = Object.values(REPORT_CATEGORIES).find(
          (c) => c.id === categoryId
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
        const parentCategory = Object.values(REPORT_CATEGORIES).find(
          (c) => c.id === categoryId
        );
        if (!parentCategory || !parentCategory.children) return null;

        const subcategory = parentCategory.children.find(
          (sc) => sc.id === subcategoryId
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
          />
        );
      default:
        return (
          <ReportCategoriesList
            title='Please select a scenario'
            items={Object.values(REPORT_CATEGORIES)}
            onSelect={handleCategorySelect}
          />
        );
    }
  };

  return (
    <Fragment>
      <Dialog
        open={isOpen && !showConfirmation}
        onOpenChange={handleOpenChange}
        modal={true}
      >
        <DialogContent
          className={cn(
            'p-0 border-none bg-[#121212] text-white/90 overflow-hidden rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.12)] flex flex-col',
            '!max-w-2xl h-[60vh]'
          )}
        >
          <ReportHeader
            currentView={currentView}
            goBack={goBack}
            handleOpenChange={handleOpenChange}
          />
          <ScrollArea className='flex-1 w-full'>
            <div className='min-h-[calc(60vh-64px)]'>{renderContent()}</div>
          </ScrollArea>

          {currentView === 'details' && (
            <div className='absolute bottom-0 left-0 right-0 px-5 py-6 bg-[#121212] border-t border-border-light'>
              <div className='w-full flex justify-end'>
                <Button
                  className='bg-primary-red hover:bg-primary-red/90 text-white px-4 py-2 rounded-md border-none text-base'
                  onClick={handleSubmitReport}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
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
          <ReportConfirmation onClose={handleConfirmationClose} />
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default ReportPost;
