import { Icons } from '../icons';

const CreateThread = () => {
  return (
    <div className='relative sm:hidden w-15 h-12 flex-center rounded-xl hover:bg-primary transition-colors duration-150'>
      <Icons.create className='h-6 w-6 transition-colors duration-150 text-secondary' />
    </div>
  );
};

export default CreateThread;
