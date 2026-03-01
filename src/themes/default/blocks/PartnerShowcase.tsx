'use client'
import { motion } from 'framer-motion';

interface PartnerShowcaseProps {
  locale: string;
}

export function PartnerShowcases({ locale }: PartnerShowcaseProps) {
  const partners = [
    { name: 'ANTHROPIC', type: 'text', className: 'text-xl md:text-2xl font-bold text-white tracking-wide' },
    { name: 'OpenAI', type: 'text', className: 'text-xl md:text-2xl font-semibold text-white' },
    { name: 'Meta', type: 'image', src: '/logo/meta.svg', className: 'w-8 h-8 md:w-10 md:h-10 brightness-0 invert' },
    { name: 'Google', type: 'text', className: 'text-xl md:text-2xl font-medium text-white' },
    { name: 'X', type: 'image', src: '/logo/x.svg', className: 'w-6 h-6 md:w-6 md:h-6 brightness-0 invert' },
    // { name: 'GitLab', type: 'image', src: '/logo/gitlab.svg', className: 'w-6 h-6 md:w-6 md:h-6 brightness-0 invert' },
    { name: 'supabase', type: 'text', className: 'text-xl md:text-2xl font-medium text-white lowercase' },
    { name: 'AWS', type: 'image', src: '/logo/aws.svg', className: 'w-8 h-8 md:w-10 md:h-10 brightness-0 invert' },
    { name: 'LinkedIn', type: 'image', src: '/logo/linkedin.svg', className: 'w-8 h-8 md:w-10 md:h-10 brightness-0 invert' },
    { name: 'NVIDIA', type: 'image', src: '/logo/nvidia.svg', className: 'w-8 h-8 md:w-10 md:h-10 brightness-0 invert' },
    { name: 'Nike', type: 'image', src: '/logo_white/nike.png', className: 'max-w-8 max-h-8 md:max-w-10 md:max-h-10 w-auto h-auto brightness-0 invert object-contain' },
    { name: 'Mercedes-Benz', type: 'image', src: '/logo_white/mercedes-benz.png', className: 'max-w-8 max-h-8 md:max-w-10 md:max-h-10 w-auto h-auto brightness-0 invert object-contain' },
    { name: 'P&G', type: 'image', src: '/logo_white/p-g-logo-rgb.png', className: 'max-w-8 max-h-8 md:max-w-10 md:max-h-10 w-auto h-auto brightness-0 invert object-contain' },
    { name: 'Coca-Cola', type: 'image', src: '/logo_white/coke-company-logo-black.png', className: 'max-w-8 max-h-8 md:max-w-10 md:max-h-10 w-auto h-auto brightness-0 invert object-contain' }
  ];

  return (
    <section className="py-12 bg-black overflow-hidden relative mb-4">
      <div className="container mx-auto px-4">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-block px-6 py-2 bg-black rounded-full border border-gray-700 shadow-sm">
            <span className="text-sm font-medium text-gray-300">
              {locale === 'en' ? 'Trusted by 1000+ AI Companies around the world' : '全球1000+AI公司信任'}
            </span>
          </div>
        </motion.div>

        {/* 渐变遮罩效果 */}
        <div className="absolute left-0 top-[50%] bottom-0 w-16 z-10 bg-gradient-to-r from-black to-transparent h-20 transform -translate-y-1/2"></div>
        <div className="absolute right-0 top-[50%] bottom-0 w-16 z-10 bg-gradient-to-l from-black to-transparent h-20 transform -translate-y-1/2"></div>

        {/* 滚动容器 */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative overflow-hidden w-full"
        >
          <div className="flex animate-marquee">
            {/* 第一组 */}
            <div className="flex items-center gap-16 opacity-60 whitespace-nowrap min-w-max">
              {partners.map((partner, index) => (
                <div key={`first-${index}`} className="flex-shrink-0 flex items-center justify-center h-8 md:h-10">
                  {partner.type === 'text' ? (
                    <span className={partner.className}>{partner.name}</span>
                  ) : (
                    <img src={partner.src} className={partner.className} alt={partner.name} />
                  )}
                  {partner.name === 'GitLab' && (
                    <span className="text-xl md:text-2xl font-medium text-white ml-1"> GitLab</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* 第二组 - 重复，用于无缝循环 */}
            <div className="flex items-center gap-16 opacity-60 whitespace-nowrap min-w-max ml-16">
              {partners.map((partner, index) => (
                <div key={`second-${index}`} className="flex-shrink-0 flex items-center justify-center h-8 md:h-10">
                  {partner.type === 'text' ? (
                    <span className={partner.className}>{partner.name}</span>
                  ) : (
                    <img src={partner.src} className={partner.className} alt={partner.name} />
                  )}
                  {partner.name === 'GitLab' && (
                    <span className="text-xl md:text-2xl font-medium text-white ml-1"> GitLab</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 