'use client';

import CarouselNavigation from '@/components/shared/CarouselNavigation';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import MediaLayer from './MediaLayer';

const MainPreview = ({ editPostId }: { editPostId: string | null }) => {
  const { currentMediaIndex, setCurrentMediaIndex, step } = usePostDialog();
  const { mediaFiles, updateMediaFile } = useFileStore();

  if (!mediaFiles?.length) return null;
  const isPostStep = step === 'post';

  return (
    <div className='relative flex-center size-[500px] bg-black/5 overflow-hidden rounded-lg'>
      {mediaFiles.map((file, index) => (
        <MediaLayer
          key={file.id}
          file={file}
          isActive={index === currentMediaIndex}
          isPostStep={isPostStep}
          updateMediaFile={updateMediaFile}
        />
      ))}

      <CarouselNavigation
        selectedIndex={currentMediaIndex}
        totalCount={mediaFiles?.length || 0}
        onPrev={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
        onNext={() =>
          setCurrentMediaIndex(
            Math.min(mediaFiles.length - 1, currentMediaIndex + 1)
          )
        }
      />
    </div>
  );
};

export default MainPreview;
