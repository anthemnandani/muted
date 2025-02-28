import React from 'react';
import CollectionDetails from './CollectionDetails';

const CollectionDetailsPage = ({ params }: { params: { id: string } }) => {
  const id = params.id;

  return <CollectionDetails id={id} />;
};

export default CollectionDetailsPage;
