import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import { getPosts, getPostsCount, Post, PostType } from '@/shared/models/post';
import { Button, Crumb } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

export default async function DocsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.DOCS_READ,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 30;

  const t = await getTranslations('admin.docs');

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.docs'), is_active: true },
  ];

  const total = await getPostsCount({ type: PostType.DOC });
  const docs = await getPosts({ type: PostType.DOC, page, limit });

  const table: Table = {
    columns: [
      { name: 'slug', title: t('fields.slug') },
      { name: 'title', title: t('fields.title') },
      { name: 'description', title: t('fields.description') },
      { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
      {
        name: 'action',
        title: '',
        type: 'dropdown',
        callback: (item: Post) => {
          return [
            {
              name: 'edit',
              title: t('list.buttons.edit'),
              icon: 'RiEditLine',
              url: `/admin/docs/${item.id}/edit`,
            },
            {
              name: 'view',
              title: t('list.buttons.view'),
              icon: 'RiEyeLine',
              url: `/docs/${item.slug}`,
              target: '_blank',
            },
          ];
        },
      },
    ],
    data: docs,
    pagination: { total, page, limit },
  };

  const actions: Button[] = [
    {
      id: 'add',
      title: t('list.buttons.add'),
      icon: 'RiAddLine',
      url: '/admin/docs/add',
    },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('list.title')} actions={actions} />
        <TableCard table={table} />
      </Main>
    </>
  );
}
