import Loader from '@/components/shared/Loader';
import { RichTextEditorProps } from '@/lib/types';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
  loading: () => <Loader className='h-[400px]' />,
});

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const config = useMemo(
    () => ({
      readonly: false,
      theme: 'dark',
      minHeight: 400,
      width: '100%',
      showCharsCounter: false,
      showWordsCounter: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      hidePoweredByJodit: true,
      statusbar: false,
      defaultActionOnPaste: 'insert_clear_html' as const,
      style: {
        background: '#09090b',
      },
      events: {
        afterInit: (instance: any) => {
          instance.setEditorValue(content);
        },
      },
    }),
    [],
  );

  return (
    <JoditEditor
      value={content}
      config={config}
      onBlur={(newContent) => onChange(newContent)}
      onChange={() => {}}
    />
  );
};

export default RichTextEditor;
