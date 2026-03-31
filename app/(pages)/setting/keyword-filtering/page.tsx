import { Metadata } from 'next';
import KeywordFilteringClient from './KeywordFilteringClient';

export const metadata: Metadata = {
  title: 'Keyword Filtering',
  description: 'Configure content filters on Muted.',
};

const KeywordFilteringPage = () => {
  return <KeywordFilteringClient />;
};

export default KeywordFilteringPage;
