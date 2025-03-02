import { PostNavigatorContext } from '@/contexts/PostNavigatorContext';
import { useContext } from 'react';

const usePostNavigator = () => {
  const context = useContext(PostNavigatorContext);
  if (context === undefined) {
    throw new Error(
      'usePostNavigator must be used within a PostNavigatorProvider'
    );
  }
  return context;
};

export default usePostNavigator;
