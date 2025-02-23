const ProfileFilters = () => {
  return (
    <div className='p-0.5 mt-0.5 mb-1.5 rounded-md min-h-9 flex items-center bg-white-13 w-fit'>
      <button
        type='button'
        className='rounded-[4px] min-w-12 px-2.5 py-1.5 bg-[#3a3a3a] text-white/90 text-sm'
      >
        Latest
      </button>
      <button
        type='button'
        className='rounded-[4px] min-w-12 px-2.5 py-1.5 text-white/60 text-sm'
      >
        Popular
      </button>
      <button
        type='button'
        className='rounded-[4px] min-w-12 px-2.5 py-1.5 text-white/60 text-sm'
      >
        Oldest
      </button>
    </div>
  );
};

export default ProfileFilters;
