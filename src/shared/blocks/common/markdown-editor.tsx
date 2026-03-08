'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
// @ts-ignore
import { OverType } from 'overtype';

async function uploadImageFile(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append('files', file);
  const res = await fetch('/api/storage/upload-image', { method: 'POST', body: formData });
  const json = await res.json();
  if (json?.code === 0 && json?.data?.urls?.length) return json.data.urls[0];
  return null;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeight = 400,
  showToolbar,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  showToolbar?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<OverType>(null);
  // Keep a ref to the latest onChange so paste handler is always up-to-date
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    const [instance] = OverType.init(ref.current, {
      value,
      onChange,
      placeholder,
      minHeight,
      showToolbar,
    });
    editorRef.current = instance;

    return () => editorRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Handle image paste / drop on the wrapper div
  const handlePasteOrDrop = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (!imageFiles.length) return;

      for (const file of imageFiles) {
        const url = await uploadImageFile(file);
        if (!url) {
          toast.error('图片上传失败');
          continue;
        }
        const markdown = `\n![](${url})\n`;
        // Insert at end of current value via onChange
        const current = editorRef.current?.getValue() ?? '';
        const next = current + markdown;
        editorRef.current?.setValue(next);
        onChangeRef.current(next);
        toast.success('图片已插入');
      }
    },
    []
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      const files = e.clipboardData?.files;
      if (files?.length && Array.from(files).some((f) => f.type.startsWith('image/'))) {
        e.preventDefault();
        await handlePasteOrDrop(files);
      }
    },
    [handlePasteOrDrop]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      const files = e.dataTransfer?.files;
      if (files?.length && Array.from(files).some((f) => f.type.startsWith('image/'))) {
        e.preventDefault();
        await handlePasteOrDrop(files);
      }
    },
    [handlePasteOrDrop]
  );

  return (
    <div
      className="overflow-hidden rounded-md border"
      ref={ref}
      style={{ height: '400px' }}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    />
  );
}
