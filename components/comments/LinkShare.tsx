import { toast } from 'sonner';

const LinkShare: React.FC<{ url: string }> = ({ url }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className='text-[14px] leading-[18px] flex text-white/75 box-border border border-white/0 overflow-hidden rounded-lg'>
      <p className='text-ellipsis overflow-hidden whitespace-nowrap flex-[1_1_auto] p-[7px_0px_5px_12px] bg-white-12'>
        {url}
      </p>
      <button
        onClick={handleCopy}
        className='border-none bg-white-8 outline-none text-white/90 font-bold flex-[0_0_auto] cursor-pointer p-[7px_18px] hover:bg-white-4 transition-colors duration-200'
      >
        Copy link
      </button>
    </div>
  );
};

export default LinkShare;
