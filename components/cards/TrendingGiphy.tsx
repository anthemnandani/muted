'use client';

import useAddGif from '@/store/addGif';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { IGif } from '@giphy/js-types';
import { Grid } from '@giphy/react-components';
import React from 'react';

interface TrendingGiphyProps {
  onGifSelect: (gif: IGif) => void;
  loader: React.ElementType;
  gridWidth: number;
}

const TrendingGiphy = ({
  onGifSelect,
  loader,
  gridWidth,
}: TrendingGiphyProps) => {
  const giphy = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY!);
  const { setOpenGifPicker } = useAddGif();
  return (
    <Grid
      width={gridWidth}
      columns={2}
      gutter={10}
      fetchGifs={(offset: number) =>
        giphy.trending({
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

export default TrendingGiphy;
