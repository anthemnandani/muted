import { REPORT_CATEGORIES } from '@/lib/constants';
import { useReportStore } from '@/store/reportStore';

export const useReportNavigation = () => {
  const {
    categoryId,
    setCategoryId,
    subcategoryId,
    setSubcategoryId,
    detailId,
    setDetailId,
    currentView,
    setCurrentView,
    setReason,
    targetUserId,
  } = useReportStore();

  const hasChildren = (category: any) => {
    return category && category.children && category.children.length > 0;
  };

  const getCurrentCategoryLabel = () => {
    if (detailId && subcategoryId && categoryId) {
      const category = Object.values(REPORT_CATEGORIES).find(
        (c) => c.id === categoryId
      );
      if (!category || !category.children) return '';

      const subcategory = category.children.find(
        (sc) => sc.id === subcategoryId
      );
      if (!subcategory || !subcategory.children) return '';

      const detail = subcategory.children.find((d) => d.id === detailId);
      return detail?.label || '';
    }

    if (subcategoryId && categoryId) {
      const category = Object.values(REPORT_CATEGORIES).find(
        (c) => c.id === categoryId
      );
      if (!category || !category.children) return '';

      const subcategory = category.children.find(
        (sc) => sc.id === subcategoryId
      );
      return subcategory?.label || '';
    }

    if (categoryId) {
      const category = Object.values(REPORT_CATEGORIES).find(
        (c) => c.id === categoryId
      );
      return category?.label || '';
    }

    return '';
  };

  const getPoints = () => {
    if (!categoryId) return [];

    const category = Object.values(REPORT_CATEGORIES).find(
      (c) => c.id === categoryId
    );
    if (!category) return [];

    if (!subcategoryId) return category.points || [];

    if (!category.children) return category.points || [];

    const subcategory = category.children.find((sc) => sc.id === subcategoryId);
    if (!subcategory) return category.points || [];

    if (!detailId) return subcategory.points || [];

    if (!subcategory.children) return subcategory.points || [];

    const detail = subcategory.children.find((d) => d.id === detailId);
    if (!detail) return subcategory.points || [];

    return detail.points || [];
  };

  const goBack = () => {
    if (currentView === 'level1') {
      setCategoryId(null);
      setCurrentView('categories');
    } else if (currentView === 'level2') {
      setSubcategoryId(null);
      setCurrentView('level1');
    } else if (currentView === 'details') {
      if (detailId) {
        setDetailId(null);
        setCurrentView('level2');
      } else if (subcategoryId) {
        setSubcategoryId(null);
        setCurrentView('level1');
      } else {
        setCategoryId(null);
        setCurrentView('categories');
      }
    }
  };

  const handleCategorySelect = (category: any) => {
    setCategoryId(category.id);

    if (hasChildren(category)) {
      setCurrentView('level1');
    } else {
      setReason(category.label);
      setCurrentView('details');
    }
  };

  const handleSubcategorySelect = (subcategory: any) => {
    setSubcategoryId(subcategory.id);

    const category = Object.values(REPORT_CATEGORIES).find(
      (c) => c.id === categoryId
    );
    if (!category) return;

    if (hasChildren(subcategory)) {
      setCurrentView('level2');
    } else {
      const pathLabel = `${category.label} > ${subcategory.label}`;
      setReason(pathLabel);
      setCurrentView('details');
    }
  };

  const handleDetailSelect = (detail: any) => {
    setDetailId(detail.id);

    const category = Object.values(REPORT_CATEGORIES).find(
      (c) => c.id === categoryId
    );
    if (!category || !category.children) return;

    const subcategory = category.children.find((sc) => sc.id === subcategoryId);
    if (!subcategory) return;

    const pathLabel = `${category.label} > ${subcategory.label} > ${detail.label}`;
    setReason(pathLabel);
    setCurrentView('details');
  };

  const shouldShowAdditionalForm = () => {
    if (!categoryId) return false;

    const category = Object.values(REPORT_CATEGORIES).find(
      (c) => c.id === categoryId
    );
    if (!category) return false;

    if (category.showAdditionalForm && !subcategoryId) return true;

    if (!subcategoryId || !category.children) return false;

    const subcategory = category.children.find((sc) => sc.id === subcategoryId);
    if (!subcategory) return false;

    if (subcategory.showAdditionalForm && !detailId) return true;

    if (!detailId || !subcategory.children) return false;

    const detail = subcategory.children.find((d) => d.id === detailId);
    if (!detail) return false;

    return detail.showAdditionalForm || false;
  };

  const shouldShowUserSearch = () => {
    if (!categoryId) return false;

    const category = Object.values(REPORT_CATEGORIES).find(
      (c) => c.id === categoryId
    );
    if (!category) return false;

    if (category.showUserSearch && !subcategoryId) return true;

    if (!subcategoryId || !category.children) return false;

    const subcategory = category.children.find((sc) => sc.id === subcategoryId);
    if (!subcategory) return false;

    if (subcategory.showUserSearch && !detailId) return true;

    if (!detailId || !subcategory.children) return false;

    const detail = subcategory.children.find((d) => d.id === detailId);
    if (!detail) return false;

    return detail.showUserSearch || false;
  };

  const shouldEnableSubmit = (): boolean => {
    if (shouldShowUserSearch()) {
      return Boolean(targetUserId);
    }

    return true;
  };

  return {
    getCurrentCategoryLabel,
    getPoints,
    goBack,
    handleCategorySelect,
    handleSubcategorySelect,
    shouldShowAdditionalForm,
    shouldShowUserSearch,
    handleDetailSelect,
    shouldEnableSubmit,
  };
};
