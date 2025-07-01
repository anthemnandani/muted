import { X } from 'lucide-react';

const MessageRequestAlert = ({
  setShowRequestLimitAlert,
}: {
  setShowRequestLimitAlert: (value: boolean) => void;
}) => {
  return (
    <div className='bg-orange-500/10 border border-orange-500/20 py-4 px-3'>
      <div className='flex items-center gap-3 w-full'>
        <div className='flex-shrink-0'>
          <div className='size-4 rounded-full bg-orange-500 flex-center'>
            <span className='text-white/90 text-xs font-bold'>!</span>
          </div>
        </div>
        <p className='text-orange-400 font-medium text-sm flex-1'>
          You can't send more than 1 message until the user accepts your
          request.
        </p>
        <button
          type='button'
          title='Close'
          onClick={() => setShowRequestLimitAlert(false)}
          className='flex-shrink-0 text-orange-400 hover:text-orange-300 transition-colors p-1 ml-2'
        >
          <X className='size-4' />
        </button>
      </div>
    </div>
  );
};

export default MessageRequestAlert;
