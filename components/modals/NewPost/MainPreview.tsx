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
    // ❌ size-[500px] — hardcoded, mobile pe overflow
    // ✅ w-full aspect-square — fluid width, square ratio maintain
    <div className='relative flex-center w-full aspect-square bg-black/5 overflow-hidden rounded-lg'>
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