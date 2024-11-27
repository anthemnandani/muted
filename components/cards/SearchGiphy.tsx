'use client';

import useWindow from '@/hooks/useWindow';
import useAddGif from '@/store/addGif';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { IGif } from '@giphy/js-types';
import { Grid } from '@giphy/react-components';
import React from 'react';

interface SearchGiphyProps {
  searchTerm: string;
  onGifSelect: (gif: IGif) => void;
  loader: React.ElementType;
}

const SearchGiphy = ({ searchTerm, onGifSelect, loader }: SearchGiphyProps) => {
  const giphy = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY!);

  const { isMobile } = useWindow();
  const { setOpenGifPicker } = useAddGif();
  return (
    <Grid
      width={isMobile ? 364 : 668}
      columns={2}
      gutter={10}
      fetchGifs={(offset: number) =>
        giphy.search(searchTerm, {
          sort: 'relevant',
          lang: 'en',
          offset: offset,
          limit: 10,
        })
      }
      onGifClick={(gif, e) => {
        e.preventDefault();
        onGifSelect(gif);
        setOpenGifPicker(false);
      }}
      borderRadius={8}
      loader={loader}
      noLink
      hideAttribution
      className='[&_img]:cursor-pointer'
    />
  );
};

export default SearchGiphy;
