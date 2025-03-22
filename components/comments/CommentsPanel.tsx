'use client';

import React from 'react';
import { X } from 'lucide-react';

interface CommentsProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentsPanel: React.FC<CommentsProps> = ({
  postId,
  isOpen,
  onClose,
}) => {
  // Format number helper
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Header with improved spacing */}
      <div className='flex justify-between items-center px-6 py-4 border-b border-gray-800'>
        <h2 className='text-xl font-semibold text-white'>Comments</h2>
        <span className='text-gray-400 text-sm'>
          {formatNumber(6000)} comments
        </span>
        <button
          className='rounded-full p-2 hover:bg-gray-800 text-white'
          onClick={onClose}
        >
          <X className='h-5 w-5' />
        </button>
      </div>

      {/* Comments list with improved spacing */}
      <div className='flex-1 overflow-y-auto'>
        <div className='px-6'>
          {/* Comment 1 - Pinned */}
          <div className='py-5 border-b border-gray-800'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0'>
                <div className='w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg'>
                  B
                </div>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='font-medium text-white'>@BaxosWolves</span>
                  <span className='text-xs text-gray-400'>1 month ago</span>
                  <span className='text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full'>
                    Pinned
                  </span>
                </div>
                <p className='mt-1 text-white text-base'>Kid gohan when?</p>
                <div className='flex items-center mt-3 gap-6'>
                  <div className='flex items-center gap-1.5'>
                    <button className='flex items-center text-gray-400'>
                      <svg
                        className='w-5 h-5'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M8 10V20M8 10L4 9.99998V20L8 20M8 10L13.1956 3.93847C13.6886 3.3633 14.4642 3.11604 15.1992 3.29977L15.2467 3.31166C16.5885 3.64711 17.1929 5.21057 16.4258 6.36135L14 9.99998H18.5604C19.8225 9.99998 20.7691 11.1547 20.5216 12.3922L19.3216 18.3922C19.1346 19.3271 18.3138 20 17.3604 20L8 20'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      <span className='ml-1'>22.0K</span>
                    </button>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <button className='flex items-center text-gray-400'>
                      <svg
                        className='w-5 h-5'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M12 20.5L12 14.5M12 14.5C8.68629 14.5 6 11.8137 6 8.5C6 5.18629 8.68629 2.5 12 2.5C15.3137 2.5 18 5.18629 18 8.5C18 11.8137 15.3137 14.5 12 14.5ZM4.5 21.5L4.51465 21.4969M19.5 21.5L19.5146 21.4969'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      <span className='ml-1'>124 replies</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment 2 */}
          <div className='py-5 border-b border-gray-800'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0'>
                <div className='w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg'>
                  J
                </div>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-white'>@jsoe81657</span>
                  <span className='text-xs text-gray-400'>1 month ago</span>
                </div>
                <p className='mt-1 text-white text-base'>
                  The grandson needs to be named Gohan
                </p>
                <div className='flex items-center mt-3 gap-6'>
                  <div className='flex items-center gap-1.5'>
                    <button className='flex items-center text-gray-400'>
                      <svg
                        className='w-5 h-5'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M8 10V20M8 10L4 9.99998V20L8 20M8 10L13.1956 3.93847C13.6886 3.3633 14.4642 3.11604 15.1992 3.29977L15.2467 3.31166C16.5885 3.64711 17.1929 5.21057 16.4258 6.36135L14 9.99998H18.5604C19.8225 9.99998 20.7691 11.1547 20.5216 12.3922L19.3216 18.3922C19.1346 19.3271 18.3138 20 17.3604 20L8 20'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      <span className='ml-1'>16.0K</span>
                    </button>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <button className='flex items-center text-gray-400'>
                      <svg
                        className='w-5 h-5'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M12 20.5L12 14.5M12 14.5C8.68629 14.5 6 11.8137 6 8.5C6 5.18629 8.68629 2.5 12 2.5C15.3137 2.5 18 5.18629 18 8.5C18 11.8137 15.3137 14.5 12 14.5ZM4.5 21.5L4.51465 21.4969M19.5 21.5L19.5146 21.4969'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      <span className='ml-1'>154 replies</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment 3 */}
          <div className='py-5 border-b border-gray-800'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0'>
                <div className='w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg'>
                  K
                </div>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-white'>@Kadz</span>
                  <span className='text-xs text-gray-400'>1 month ago</span>
                </div>
                <p className='mt-1 text-white text-base'>
                  Welcome to Earth, Goku Sanchez 👽 🤘
                </p>
                <div className='flex items-center mt-3 gap-6'>
                  <div className='flex items-center gap-1.5'>
                    <button className='flex items-center text-gray-400'>
                      <svg
                        className='w-5 h-5'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M8 10V20M8 10L4 9.99998V20L8 20M8 10L13.1956 3.93847C13.6886 3.3633 14.4642 3.11604 15.1992 3.29977L15.2467 3.31166C16.5885 3.64711 17.1929 5.21057 16.4258 6.36135L14 9.99998H18.5604C19.8225 9.99998 20.7691 11.1547 20.5216 12.3922L19.3216 18.3922C19.1346 19.3271 18.3138 20 17.3604 20L8 20'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      <span className='ml-1'>41.0K</span>
                    </button>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <button className='flex items-center text-gray-400'>
                      <svg
                        className='w-5 h-5'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M12 20.5L12 14.5M12 14.5C8.68629 14.5 6 11.8137 6 8.5C6 5.18629 8.68629 2.5 12 2.5C15.3137 2.5 18 5.18629 18 8.5C18 11.8137 15.3137 14.5 12 14.5ZM4.5 21.5L4.51465 21.4969M19.5 21.5L19.5146 21.4969'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      <span className='ml-1'>338 replies</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment 4 */}
          <div className='py-5 border-b border-gray-800'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0'>
                <div className='w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg'>
                  R
                </div>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-white'>@RoAm3584</span>
                  <span className='text-xs text-gray-400'>4 days ago</span>
                </div>
                <p className='mt-1 text-white text-base'>
                  This is gonna be legendary 😂
                </p>
                <div className='flex items-center mt-3'>
                  <button className='flex items-center text-gray-400'>
                    <svg
                      className='w-5 h-5'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M8 10V20M8 10L4 9.99998V20L8 20M8 10L13.1956 3.93847C13.6886 3.3633 14.4642 3.11604 15.1992 3.29977L15.2467 3.31166C16.5885 3.64711 17.1929 5.21057 16.4258 6.36135L14 9.99998H18.5604C19.8225 9.99998 20.7691 11.1547 20.5216 12.3922L19.3216 18.3922C19.1346 19.3271 18.3138 20 17.3604 20L8 20'
                        stroke='currentColor'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <span className='ml-1'>5.0K</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comment 5 */}
          <div className='py-5 border-b border-gray-800'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0'>
                <div className='w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg'>
                  D
                </div>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-white'>@dbzfan</span>
                  <span className='text-xs text-gray-400'>2 weeks ago</span>
                </div>
                <p className='mt-1 text-white text-base'>
                  I hope he gets the 1 mil!
                </p>
                <div className='flex items-center mt-3'>
                  <button className='flex items-center text-gray-400'>
                    <svg
                      className='w-5 h-5'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M8 10V20M8 10L4 9.99998V20L8 20M8 10L13.1956 3.93847C13.6886 3.3633 14.4642 3.11604 15.1992 3.29977L15.2467 3.31166C16.5885 3.64711 17.1929 5.21057 16.4258 6.36135L14 9.99998H18.5604C19.8225 9.99998 20.7691 11.1547 20.5216 12.3922L19.3216 18.3922C19.1346 19.3271 18.3138 20 17.3604 20L8 20'
                        stroke='currentColor'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <span className='ml-1'>8.5K</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment input with improved styling */}
      <div className='p-6 border-t border-gray-800 mt-auto bg-black'>
        <div className='flex items-center gap-4'>
          <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold'>
            U
          </div>
          <div className='flex-1 bg-gray-800 rounded-full px-5 py-3 text-gray-400'>
            Add a comment...
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsPanel;
