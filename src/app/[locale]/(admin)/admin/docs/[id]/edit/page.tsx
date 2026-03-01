import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Empty } from '@/shared/blocks/common';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import {
  findPost,
  PostStatus,
  PostType,
  updatePost,
  UpdatePost,
} from '@/shared/models/post';
import { getUserInfo } from '@/shared/models/user';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function DocEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.DOCS_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const doc = await findPost({ id });
  if (!doc) {
    return <Empty message="Doc not found" />;
  }

  const t = await getTranslations('admin.docs');

  const crumbs: Crumb[] = [
    { title: t('edit.crumbs.admin'), url: '/admin' },
    { title: t('edit.crumbs.docs'), url: '/admin/docs' },
    { title: t('edit.crumbs.edit'), is_active: true },
  ];

  const form: Form = {
    fields: [
      {
        name: 'slug',
        type: 'text',
        title: t('fields.slug'),
        tip: t('fields.slug_tip'),
        validation: { required: true },
      },
      {
        name: 'title',
        type: 'text',
        title: t('fields.title'),
        validation: { required: true },
      },
      {
        name: 'description',
        type: 'textarea',
        title: t('fields.description'),
      },
      {
        name: 'content',
        type: 'markdown_editor',
        title: t('fields.content'),
      },
    ],
    passby: { doc },
    data: doc,
    submit: {
      button: { title: t('edit.buttons.submit') },
      handler: async (data, passby) => {
        'use server';

        const user = await getUserInfo();
        if (!user) throw new Error('no auth');

        const { doc } = passby;
        if (!doc) throw new Error('doc not found');

        const slug = data.get('slug') as string;
        const title = data.get('title') as string;
        const description = data.get('description') as string;
        const content = data.get('content') as string;

        if (!slug?.trim() || !title?.trim()) {
          throw new Error('slug and title are required');
        }

        const updateData: UpdatePost = {
          slug: slug.trim().toLowerCase(),
          type: PostType.DOC,
          title: title.trim(),
          description: description?.trim() || '',
          content: content?.trim() || '',
          status: PostStatus.PUBLISHED,
        };

        const result = await updatePost(doc.id, updateData);
        if (!result) throw new Error('update doc failed');

        return {
          status: 'success',
          message: 'doc updated',
          redirect_url: '/admin/docs',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('edit.title')} />
        <FormCard form={form} className="md:max-w-2xl" />
      </Main>
    </>
  );
}
