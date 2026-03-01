import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import { getUuid } from '@/shared/lib/hash';
import { addPost, NewPost, PostStatus, PostType } from '@/shared/models/post';
import { getUserInfo } from '@/shared/models/user';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function DocAddPage({
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

  const t = await getTranslations('admin.docs');

  const crumbs: Crumb[] = [
    { title: t('add.crumbs.admin'), url: '/admin' },
    { title: t('add.crumbs.docs'), url: '/admin/docs' },
    { title: t('add.crumbs.add'), is_active: true },
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
    passby: {},
    data: {},
    submit: {
      button: { title: t('add.buttons.submit') },
      handler: async (data) => {
        'use server';

        const user = await getUserInfo();
        if (!user) throw new Error('no auth');

        const slug = data.get('slug') as string;
        const title = data.get('title') as string;
        const description = data.get('description') as string;
        const content = data.get('content') as string;

        if (!slug?.trim() || !title?.trim()) {
          throw new Error('slug and title are required');
        }

        const newDoc: NewPost = {
          id: getUuid(),
          userId: user.id,
          slug: slug.trim().toLowerCase(),
          type: PostType.DOC,
          title: title.trim(),
          description: description?.trim() || '',
          content: content?.trim() || '',
          status: PostStatus.PUBLISHED,
        };

        const result = await addPost(newDoc);
        if (!result) throw new Error('add doc failed');

        return {
          status: 'success',
          message: 'doc added',
          redirect_url: '/admin/docs',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('add.title')} />
        <FormCard form={form} className="md:max-w-2xl" />
      </Main>
    </>
  );
}
