'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReportNavigation } from '@/hooks/useReportNavigation';
import { REPORT_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useReportStore } from '@/store/reportStore';
import { api } from '@/trpc/react';
import { useState } from 'react';
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
    setCurrentView,
    reset,
    reason,
    currentPostId,
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
  } = useReportNavigation();

  const handleOpenChange = (open: boolean) => {
    if (!open && currentView === 'confirmation') {
      setOpen(false);
      setTimeout(() => {
        reset();
        setShowConfirmation(false);
      }, 300);
    } else {
      setOpen(open);
      if (!open) {
        reset();
        setShowConfirmation(false);
      }
    }
  };

  const { mutate: createReport } = api.post.createReportPost.useMutation({
    onSuccess: () => {
      setCurrentView('confirmation');
      setLoading(false);

      setShowConfirmation(false);
      setTimeout(() => {
        setShowConfirmation(true);
      }, 250);
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
            onSubmit={handleSubmitReport}
            loading={loading}
          />
        );
      case 'confirmation':
        return showConfirmation ? (
          <ReportConfirmation onClose={() => handleOpenChange(false)} />
        ) : null;
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent
        className={cn(
          'p-0 border-none bg-[#121212] text-white/90 overflow-hidden rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.12)]',
          currentView === 'confirmation' ? '!max-w-md' : '!max-w-xl'
        )}
      >
        <ReportHeader
          currentView={currentView}
          goBack={goBack}
          handleOpenChange={handleOpenChange}
        />
        <ScrollArea className='max-h-[70vh] w-full'>
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPost;
