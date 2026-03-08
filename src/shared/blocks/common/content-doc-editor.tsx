'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  getContentDocContent,
  getContentDocList,
  setContentDocContent,
} from '@/app/actions/content-docs';
import { Button } from '@/shared/components/ui/button';

import '@uiw/react-md-editor/markdown-editor-dark.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append('files', file);
  const res = await fetch('/api/storage/upload-image', { method: 'POST', body: formData });
  const json = await res.json();
  if (json?.code === 0 && json?.data?.urls?.length) return json.data.urls[0];
  return null;
}

export function ContentDocEditor() {
  const { resolvedTheme } = useTheme();
  const [list, setList] = useState<{ path: string; label: string }[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const colorMode = resolvedTheme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    getContentDocList().then(setList);
  }, []);

  useEffect(() => {
    if (!currentPath) {
      setContent('');
      setDirty(false);
      return;
    }
    setLoading(true);
    getContentDocContent(currentPath)
      .then(({ content: c, error }) => {
        if (error) toast.error(error);
        setContent(c);
        setDirty(false);
      })
      .finally(() => setLoading(false));
  }, [currentPath]);

  const handleSave = useCallback(async () => {
    if (!currentPath || !dirty) return;
    setSaving(true);
    const { ok, error } = await setContentDocContent(currentPath, content);
    setSaving(false);
    if (ok) {
      setDirty(false);
      toast.success('已保存');
    } else {
      toast.error(error || '保存失败');
    }
  }, [currentPath, content, dirty]);

  const insertImageMarkdown = useCallback((url: string, alt = '') => {
    const markdown = `\n![${alt}](${url})\n`;
    setContent((prev) => prev + markdown);
    setDirty(true);
  }, []);

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files?.length === 1 && files[0].type.startsWith('image/')) {
        e.preventDefault();
        const url = await uploadImage(files[0]);
        if (url) insertImageMarkdown(url);
        else toast.error('图片上传失败');
      }
    },
    [insertImageMarkdown]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (!files?.length) return;
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const url = await uploadImage(file);
        if (url) insertImageMarkdown(url);
        else toast.error('图片上传失败');
      }
    },
    [insertImageMarkdown]
  );

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleInsertImageClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadImage(file);
      if (url) insertImageMarkdown(url, file.name);
      else toast.error('图片上传失败');
    };
    input.click();
  }, [insertImageMarkdown]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">选择文档：</label>
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={currentPath}
          onChange={(e) => setCurrentPath(e.target.value)}
          disabled={loading}
        >
          <option value="">-- 选择 content/docs 下的 .md/.mdx 文件 --</option>
          {list.map(({ path: p, label }) => (
            <option key={p} value={p}>
              {label}
            </option>
          ))}
        </select>
        {currentPath && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleInsertImageClick}
              disabled={loading}
            >
              插入图片
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saving}
            >
              {saving ? '保存中…' : '保存'}
            </Button>
            {dirty && <span className="text-sm text-amber-600">未保存</span>}
          </>
        )}
      </div>

      {loading && <div className="text-sm text-muted-foreground">加载中…</div>}

      {currentPath && !loading && (
        <div
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          data-color-mode={colorMode}
          className="[&_.w-md-editor]:min-h-[480px]"
        >
          <MDEditor
            value={content}
            onChange={(v) => {
              setContent(v ?? '');
              setDirty(true);
            }}
            height={480}
            visibleDragbar={false}
            preview="live"
          />
        </div>
      )}

      {!currentPath && !loading && list.length === 0 && (
        <p className="text-sm text-muted-foreground">未找到 content/docs 下的 .md/.mdx 文件。</p>
      )}
    </div>
  );
}
