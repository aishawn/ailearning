import { setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { ContentDocEditor } from '@/shared/blocks/common/content-doc-editor';

export default async function ContentEditorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.DOCS_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  return (
    <>
      <Header
        crumbs={[
          { title: 'Admin', url: '/admin' },
          { title: 'Content files (MD)', is_active: true },
        ]}
      />
      <Main>
        <MainHeader title="编辑 content/vla 下的 Markdown 文件" />
        <div className="rounded-lg border bg-card p-4">
          <ContentDocEditor />
        </div>
      </Main>
    </>
  );
}
