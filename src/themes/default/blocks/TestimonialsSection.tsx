'use client';

import React from 'react';
import Image from 'next/image';
// 按需导入图标 - 优化移动端bundle大小
import { Star } from 'lucide-react';

interface TestimonialsSectionProps {
  locale: string;
  indexText?: any;
  commonText?: any;
}

export default function TestimonialsSection({
  locale,
  indexText,
  commonText,
}: TestimonialsSectionProps) {
  // 从 indexText 或 commonText 获取用户评价数据
  const testimonialsData =
    indexText?.testimonials || commonText?.testimonials || [];

  // 转换数据格式：将翻译文件中的格式转换为组件需要的格式
  const transformedTestimonials = testimonialsData.map((item: any) => {
    // 如果头像路径是 /imgs/avatars/，转换为 /testimonials/
    let avatarPath = item.image?.src || item.avatar?.src || item.avatar || '';
    if (avatarPath.startsWith('/imgs/avatars/')) {
      // 提取文件名，如 /imgs/avatars/1.png -> user1.webp
      const fileName = avatarPath.split('/').pop()?.replace('.png', '') || '';
      avatarPath = `/testimonials/user${fileName}.webp`;
    }
    return {
      name: item.name || '',
      role: item.role || '',
      company: item.company || '',
      avatar: avatarPath,
      content: item.quote || item.content || '',
      rating: item.rating || 5,
    };
  });

  // 用户评价数据，使用 AIShawn 的真实评价
  const testimonials =
    transformedTestimonials.length > 0
      ? transformedTestimonials
      : [
          {
            name: 'Zoe',
            role: 'Freelance Artist',
            company: '',
            avatar: '/testimonials/user1.webp',
            content:
              "I can imagine so many use cases for AIShawn's features plus I really love how the UI seems artistic. Definitely one of the most promising companies I've seen!",
            rating: 5,
          },
          {
            name: 'Abdur Rahman',
            role: 'E-commerce Owner',
            company: '',
            avatar: '/testimonials/user2.webp',
            content:
              'The vision of this product is attractive, and I got many ideas and insights from here! I think this is the value of your product.',
            rating: 5,
          },
          {
            name: 'Adarsh',
            role: 'Growth-Driven SaaS Marketer',
            company: '',
            avatar: '/testimonials/user3.webp',
            content:
              "As a fellow marketer, I understand the struggle of creating ads that effectively resonate with our target audience. I can't wait to give it a try and see how the AI-generated ads perform. All the best!",
            rating: 5,
          },
          {
            name: 'Sherry',
            role: 'Amazon E-commerce Owner',
            company: '',
            avatar: '/testimonials/user4.webp',
            content:
              'I specifically liked how easy to use the tool was, the fast turnaround, and generative AI!',
            rating: 5,
          },
          {
            name: 'Jade',
            role: 'Product Manager',
            company: '',
            avatar: '/testimonials/user5.webp',
            content:
              'One of the things I love most about this software is its ability to analyze large amounts of data and provide insightful metrics.',
            rating: 5,
          },
          {
            name: 'Zack',
            role: 'marketer',
            company: '',
            avatar: '/testimonials/user6.webp',
            content:
              'I think AIShawn is an excellent solution for marketers looking to streamline their ad creation process and gain insights into their campaign performance. Keep up the good work!',
            rating: 5,
          },
          {
            name: 'Kanstantsin',
            role: 'Founder',
            company: '',
            avatar: '/testimonials/user7.webp',
            content: 'This app really makes my life easier. Thank you!',
            rating: 5,
          },
          {
            name: 'Alexey',
            role: 'Software Engineer',
            company: '',
            avatar: '/testimonials/user8.webp',
            content:
              "I'm really inspired by AIShawn Life's product and it's one of the most promising companies I've seen!",
            rating: 5,
          },
          {
            name: 'Vaibhav',
            role: 'Founder',
            company: '',
            avatar: '/testimonials/user9.webp',
            content:
              'As a fellow startup founder, I know how important it is to get the most out of your ad spend. AIShawn seems like the perfect solution to help with that!',
            rating: 5,
          },
          {
            name: 'Jack',
            role: 'Marketer',
            company: '',
            avatar: '/testimonials/user1.webp',
            content:
              'AIShawn completely transformed our ad strategy—what used to take hours now takes minutes, and the results speak for themselves with higher engagement and better ROI!',
            rating: 5,
          },
          {
            name: 'Matt',
            role: 'Designer',
            company: '',
            avatar: '/testimonials/user2.webp',
            content:
              'AIShawn has made designing high-performing ads effortless—its intuitive tools let me focus on creativity while ensuring every ad is optimized for engagement and conversions.',
            rating: 5,
          },
        ];

  return (
    <section className="py-2 sm:py-2 lg:py-2">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-3xl lg:text-4xl">
            {indexText?.testimonialsTitle ||
              commonText?.testimonialsTitle ||
              'Loved by world-class Marketers'}
          </h2>
          <p className="mx-auto max-w-3xl px-2 text-base text-white sm:text-lg lg:text-xl">
            {indexText?.testimonialsDescription ||
              commonText?.testimonialsDescription ||
              "Don't just take our word for it—see what our clients think."}
          </p>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 sm:mt-6 sm:w-20 lg:w-24"></div>
        </div>

        <div className="relative overflow-hidden">
          {/* 滚动容器 - 使用 CSS 动画实现连续滚动 */}
          <div className="group animate-marquee flex [--duration:60s] [--gap:1.5rem] hover:[animation-play-state:paused]">
            {/* 第一组评价卡片 */}
            <div className="flex min-w-max flex-shrink-0 gap-6 sm:gap-8">
              {testimonials.map((testimonial: any, index: number) => (
                <div
                  key={`first-${index}`}
                  className="relative flex flex-shrink-0 flex-col rounded-2xl border border-slate-700/40 bg-slate-800/50 px-4 pt-4 pb-3 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/10 sm:px-6 sm:pt-6 sm:pb-4"
                  style={{ minWidth: '400px', width: '400px', height: '240px' }}
                >
                  {/* 评分 - 右上角 */}
                  <div className="absolute top-8 right-4 flex items-center sm:top-10 sm:right-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-current text-yellow-400 sm:h-4 sm:w-4"
                      />
                    ))}
                  </div>

                  {/* 用户信息 */}
                  <div className="flex flex-col space-y-2 pr-12 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:pr-16">
                    <div className="flex w-full min-w-0 items-center space-x-3">
                      <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white sm:h-12 sm:w-12 sm:text-lg">
                        {testimonial.avatar ? (
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={48}
                            height={48}
                            className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
                            loading="lazy"
                            quality={75}
                          />
                        ) : (
                          <span>
                            {testimonial.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="truncate text-sm font-semibold text-white sm:text-base">
                          {testimonial.name}
                        </div>
                        <div className="truncate text-xs break-words text-white sm:text-sm">
                          {testimonial.role}
                          {testimonial.company
                            ? ` at ${testimonial.company}`
                            : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 内容 */}
                  <p className="overflow-wrap-anywhere mt-3 mb-0 flex-1 text-sm leading-normal break-words text-white italic sm:mt-4 sm:text-base">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            {/* 第二组评价卡片 - 重复，用于无缝循环 */}
            <div className="ml-6 flex min-w-max flex-shrink-0 gap-6 sm:ml-8 sm:gap-8">
              {testimonials.map((testimonial: any, index: number) => (
                <div
                  key={`second-${index}`}
                  className="relative flex flex-shrink-0 flex-col rounded-2xl border border-slate-700/40 bg-slate-800/50 px-4 pt-4 pb-3 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/10 sm:px-6 sm:pt-6 sm:pb-4"
                  style={{ minWidth: '400px', width: '400px', height: '240px' }}
                >
                  {/* 评分 - 右上角 */}
                  <div className="absolute top-8 right-4 flex items-center sm:top-10 sm:right-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-current text-yellow-400 sm:h-4 sm:w-4"
                      />
                    ))}
                  </div>

                  {/* 用户信息 */}
                  <div className="flex flex-col space-y-2 pr-12 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:pr-16">
                    <div className="flex w-full min-w-0 items-center space-x-3">
                      <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white sm:h-12 sm:w-12 sm:text-lg">
                        {testimonial.avatar ? (
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={48}
                            height={48}
                            className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
                            loading="lazy"
                            quality={75}
                          />
                        ) : (
                          <span>
                            {testimonial.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="truncate text-sm font-semibold text-white sm:text-base">
                          {testimonial.name}
                        </div>
                        <div className="truncate text-xs break-words text-white sm:text-sm">
                          {testimonial.role}
                          {testimonial.company
                            ? ` at ${testimonial.company}`
                            : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 内容 */}
                  <p className="overflow-wrap-anywhere mt-3 mb-0 flex-1 text-sm leading-normal break-words text-white italic sm:mt-4 sm:text-base">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
