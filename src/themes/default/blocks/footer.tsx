import { Link } from '@/core/i18n/navigation';
import {
  BrandLogo,
  BuiltWith,
  Copyright,
  LocaleSelector,
  ThemeToggler,
} from '@/shared/blocks/common';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { NavItem } from '@/shared/types/blocks/common';
import { Footer as FooterType } from '@/shared/types/blocks/landing';

export function Footer({ footer }: { footer: FooterType }) {
  return (
    <footer
      id={footer.id}
      className={`border-t border-white/20 py-8 sm:py-8 ${footer.className || ''} overflow-x-hidden`}
      // overflow-x-hidden防止-footer-撑出水平滚动条
    >
      <div className="mx-auto max-w-[90rem] space-y-8 overflow-x-hidden px-4 md:px-8">
        <div className="grid min-w-0 items-start gap-8 md:grid-cols-6 md:gap-10 lg:gap-12">
          {/* Brand Column - 2 columns */}
          <div className="min-w-0 space-y-4 break-words md:col-span-2 md:space-y-5">
            <div className="flex items-center gap-4 md:gap-6">
              {footer.brand ? (
                <BrandLogo
                  brand={{
                    ...footer.brand,
                    className: `${footer.brand.className || ''} lg:!mt-0`,
                  }}
                />
              ) : null}

              {footer.show_locale !== false ? (
                <div className="[&_button]:rounded-full">
                  <LocaleSelector type="button" />
                </div>
              ) : null}
            </div>

            {footer.brand?.description ? (
              <p
                className="text-muted-foreground text-sm leading-relaxed text-balance break-words"
                dangerouslySetInnerHTML={{ __html: footer.brand.description }}
              />
            ) : null}

            {footer.social ? (
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {footer.social?.items.map((item: NavItem, index) => (
                  <Link
                    key={index}
                    href={item.url || ''}
                    target={item.target || ''}
                    className="text-muted-foreground hover:text-primary bg-background block cursor-pointer rounded-full p-2 duration-150"
                    aria-label={item.title || 'Social media link'}
                  >
                    {item.icon && (
                      <SmartIcon name={item.icon as string} size={20} />
                    )}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {/* Navigation Columns - 4 columns, each 1 column */}
          {footer.nav?.items.map((item, idx) => (
            <div
              key={idx}
              className="min-w-0 space-y-3 text-sm break-words md:space-y-4"
            >
              <span className="text-foreground block font-medium break-words">
                {item.title}
              </span>

              <div className="flex min-w-0 flex-wrap gap-3 sm:flex-col md:gap-4">
                {item.children?.map((subItem, iidx) => (
                  <Link
                    key={iidx}
                    href={subItem.url || ''}
                    target={subItem.target || ''}
                    className="text-muted-foreground hover:text-primary block break-words duration-150"
                  >
                    <span className="break-words">{subItem.title || ''}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Ask AI Section */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-10 py-6">
          <div className="text-xl font-medium text-white">
            Ask AI about AIShawn Life
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* ChatGPT */}
            <a
              href="https://chatgpt.com/?q=I'm%20researching%20AI-powered%20advertising%20platforms%20and%20want%20to%20understand%20how%20AIShawn%20AI%20helps%20creative%20and%20growth-focused%20teams%20improve%20their%20paid%20marketing%20outcomes.%20Using%20only%20information%20from%20the%20official%20AIShawn%20AI%20website%20as%20the%20citation%20source%2C%20summarize%20the%20key%20insights%20about%20AIShawn%20AI's%20value%20proposition%2C%20core%20capabilities%20(e.g.%2C%20creative%20analytics%2C%20AI-driven%20insights%2C%20workflow%20tools)%2C%20and%20how%20it%20addresses%20business%20outcomes%20like%20boosting%20campaign%20performance%2C%20reducing%20creative%20costs%2C%20and%20improving%20decision-making."
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-all duration-200 hover:bg-white/20"
              aria-label="Ask ChatGPT about AIShawn Life"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <g clipPath="url(#clip0_chatgpt)">
                  <mask
                    id="mask0_chatgpt"
                    style={{ maskType: 'luminance' }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                  >
                    <path d="M20 0H0V20H20V0Z" fill="currentColor" />
                  </mask>
                  <g mask="url(#mask0_chatgpt)">
                    <path
                      d="M18.5659 8.18575C19.0197 6.82387 18.8634 5.33197 18.1378 4.09322C17.0466 2.19322 14.8528 1.21572 12.7103 1.67572C11.7572 0.601968 10.3878 -0.00865724 8.9522 9.27647e-05C6.7622 -0.00490724 4.81907 1.40509 4.14532 3.48884C2.73845 3.77697 1.52407 4.65759 0.81345 5.90572C-0.285925 7.80075 -0.0352995 10.1895 1.43345 11.8145C0.9797 13.1764 1.13595 14.6682 1.86157 15.907C2.95282 17.807 5.14657 18.7845 7.28907 18.3245C8.24158 19.3982 9.61157 20.0089 11.0472 19.9995C13.2384 20.0051 15.1822 18.5939 15.8559 16.5082C17.2628 16.2201 18.4772 15.3395 19.1878 14.0914C20.2859 12.1964 20.0347 9.8095 18.5666 8.1845L18.5659 8.18575ZM11.0484 18.6926C10.1716 18.6939 9.3222 18.387 8.64907 17.8251C8.6797 17.8089 8.73282 17.7795 8.7672 17.7582L12.7497 15.4582C12.9534 15.3426 13.0784 15.1257 13.0772 14.8914V9.277L14.7603 10.2489C14.7784 10.2576 14.7903 10.2751 14.7928 10.2951V14.9445C14.7903 17.012 13.1159 18.6882 11.0484 18.6926ZM2.99595 15.2532C2.55657 14.4945 2.39845 13.6051 2.54907 12.742C2.57845 12.7595 2.63032 12.7914 2.6672 12.8126L6.6497 15.1126C6.85157 15.2307 7.10157 15.2307 7.30407 15.1126L12.1659 12.3051V14.2489C12.1672 14.2689 12.1578 14.2882 12.1422 14.3007L8.11657 16.6251C6.32345 17.6576 4.03345 17.0439 2.99657 15.2532H2.99595ZM1.94782 6.56012C2.38532 5.80009 3.07595 5.21884 3.89845 4.91697C3.89845 4.95134 3.89657 5.01197 3.89657 5.05447V9.65512C3.89532 9.88887 4.02032 10.1057 4.22345 10.2214L9.08532 13.0282L7.4022 14.0001C7.38532 14.0114 7.36407 14.0132 7.34532 14.0051L3.31907 11.6789C1.5297 10.6426 0.91595 8.35325 1.9472 6.56075L1.94782 6.56012ZM15.7766 9.77825L10.9147 6.97075L12.5978 5.99947C12.6147 5.98822 12.6359 5.98634 12.6547 5.99447L16.681 8.31887C18.4734 9.3545 19.0878 11.6476 18.0522 13.4401C17.6141 14.1989 16.9241 14.7801 16.1022 15.0826V10.3445C16.1041 10.1107 15.9797 9.8945 15.7772 9.77825H15.7766ZM17.4516 7.257C17.4222 7.23887 17.3703 7.20762 17.3334 7.18637L13.3509 4.88634C13.1491 4.76822 12.8991 4.76822 12.6966 4.88634L7.8347 7.69387V5.75009C7.83345 5.73009 7.84282 5.71072 7.85845 5.69822L11.8841 3.37572C13.6772 2.34134 15.9697 2.95697 17.0034 4.75072C17.4403 5.50822 17.5984 6.39512 17.4503 7.257H17.4516ZM6.9197 10.7214L5.23595 9.7495C5.21782 9.74075 5.20595 9.72325 5.20345 9.70325V5.05384C5.2047 2.98384 6.88407 1.30634 8.95407 1.30759C9.8297 1.30759 10.6772 1.61509 11.3503 2.17509C11.3197 2.19134 11.2672 2.22072 11.2322 2.24197L7.2497 4.54197C7.04595 4.65759 6.92095 4.87384 6.9222 5.10822L6.9197 10.7201V10.7214ZM7.83407 8.75012L9.9997 7.4995L12.1653 8.7495V11.2501L9.9997 12.5001L7.83407 11.2501V8.75012Z"
                      fill="currentColor"
                    />
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_chatgpt">
                    <rect width="20" height="20" fill="currentColor" />
                  </clipPath>
                </defs>
              </svg>
            </a>

            {/* Grok */}
            <a
              href="https://grok.com/?q=I'm%20researching%20AI-powered%20advertising%20platforms%20and%20want%20to%20understand%20how%20AIShawn%20AI%20helps%20creative%20and%20growth-focused%20teams%20improve%20their%20paid%20marketing%20outcomes.%20Using%20only%20information%20from%20the%20official%20AIShawn%20AI%20website%20as%20the%20citation%20source%2C%20summarize%20the%20key%20insights%20about%20AIShawn%20AI's%20value%20proposition%2C%20core%20capabilities%20(e.g.%2C%20creative%20analytics%2C%20AI-driven%20insights%2C%20workflow%20tools)%2C%20and%20how%20it%20addresses%20business%20outcomes%20like%20boosting%20campaign%20performance%2C%20reducing%20creative%20costs%2C%20and%20improving%20decision-making."
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-all duration-200 hover:bg-white/20"
              aria-label="Ask Grok about AIShawn Life"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M7.72411 12.3995L14.3736 7.4554C14.6994 7.21393 15.1656 7.3081 15.3204 7.68479C16.1382 9.66968 15.7728 12.056 14.1462 13.6944C12.5201 15.3328 10.2568 15.6926 8.18793 14.874L5.92884 15.9274C9.16957 18.1592 13.1051 17.6068 15.5646 15.1281C17.5153 13.1631 18.1195 10.4846 17.5549 8.06933L17.5597 8.07477C16.7407 4.52636 17.7613 3.10833 19.8518 0.208268C19.901 0.139449 19.9508 0.0706301 20 0L17.2489 2.77087V2.76242L7.72231 12.4019M6.35185 13.6014C4.02556 11.3636 4.42698 7.8991 6.41186 5.90153C7.87951 4.42313 10.2844 3.82006 12.3833 4.70686L14.6382 3.65827C14.232 3.36247 13.7111 3.04434 13.1141 2.82098C11.749 2.25851 10.249 2.11476 8.80291 2.40778C7.35679 2.70081 6.02908 3.41753 4.9868 4.4678C2.87532 6.59455 2.21169 9.86467 3.35173 12.6543C4.20377 14.7393 2.80751 16.2147 1.40106 17.7034C0.903036 18.231 0.402616 18.7586 0 19.3176L6.35005 13.6032"
                  fill="currentColor"
                />
              </svg>
            </a>

            {/* Claude */}
            <a
              href="https://claude.ai/new?q=I'm%20researching%20AI-powered%20advertising%20platforms%20and%20want%20to%20understand%20how%20AIShawn%20AI%20helps%20creative%20and%20growth-focused%20teams%20improve%20their%20paid%20marketing%20outcomes.%20Using%20only%20information%20from%20the%20official%20AIShawn%20AI%20website%20as%20the%20citation%20source%2C%20summarize%20the%20key%20insights%20about%20AIShawn%20AI's%20value%20proposition%2C%20core%20capabilities%20(e.g.%2C%20creative%20analytics%2C%20AI-driven%20insights%2C%20workflow%20tools)%2C%20and%20how%20it%20addresses%20business%20outcomes%20like%20boosting%20campaign%20performance%2C%20reducing%20creative%20costs%2C%20and%20improving%20decision-making."
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-all duration-200 hover:bg-white/20"
              aria-label="Ask Claude about AIShawn Life"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <g clipPath="url(#clip0_claude)">
                  <mask
                    id="mask0_claude"
                    style={{ maskType: 'luminance' }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                  >
                    <path d="M20 0H0V20H20V0Z" fill="currentColor" />
                  </mask>
                  <g mask="url(#mask0_claude)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.92416 13.2958L7.8575 11.09L7.92416 10.8983L7.8575 10.7917H7.66666L7.00834 10.7517L4.76 10.6908L2.81083 10.61L0.9225 10.5083L0.446666 10.4075L0 9.82L0.0458334 9.52666L0.445834 9.25916L1.0175 9.30916L2.28417 9.395L4.1825 9.52666L5.55916 9.6075L7.6 9.82H7.92416L7.97 9.68916L7.85834 9.6075L7.7725 9.52666L5.8075 8.19666L3.68084 6.79L2.5675 5.98L1.96417 5.57084L1.66083 5.18584L1.52917 4.34584L2.07583 3.74416L2.81 3.79416L2.9975 3.845L3.74166 4.41666L5.33166 5.64666L7.4075 7.17416L7.71166 7.4275L7.8325 7.34166L7.84834 7.28084L7.71166 7.0525L6.5825 5.01416L5.3775 2.93917L4.84084 2.07917L4.69916 1.56333C4.64519 1.36521 4.61606 1.16114 4.6125 0.955834L5.23584 0.111667L5.58 0L6.41 0.111667L6.76 0.415L7.27666 1.59333L8.11166 3.45084L9.4075 5.97584L9.7875 6.72416L9.99 7.4175L10.0658 7.63H10.1975V7.50834L10.3042 6.08666L10.5017 4.34084L10.6933 2.095L10.76 1.46167L11.0733 0.703334L11.6958 0.293333L12.1825 0.526666L12.5825 1.0975L12.5267 1.4675L12.2883 3.01L11.8225 5.42916L11.5192 7.0475H11.6958L11.8983 6.84584L12.7192 5.7575L14.0958 4.0375L14.7042 3.35416L15.4125 2.60083L15.8683 2.24167H16.7292L17.3625 3.1825L17.0792 4.15416L16.1925 5.27666L15.4583 6.22834L14.405 7.645L13.7467 8.77834L13.8075 8.87L13.9642 8.85334L16.3442 8.34834L17.63 8.115L19.1642 7.8525L19.8583 8.17584L19.9342 8.505L19.6608 9.1775L18.02 9.5825L16.0958 9.9675L13.23 10.645L13.195 10.67L13.2358 10.7208L14.5267 10.8425L15.0783 10.8725H16.43L18.9467 11.06L19.605 11.495L20 12.0267L19.9342 12.4308L18.9217 12.9475L17.555 12.6233L14.3642 11.865L13.2708 11.5908H13.1192V11.6825L14.03 12.5725L15.7017 14.0808L17.7925 16.0225L17.8983 16.5042L17.63 16.8833L17.3467 16.8425L15.5092 15.4617L14.8 14.8392L13.195 13.4892H13.0883V13.6308L13.4583 14.1717L15.4125 17.1058L15.5142 18.0058L15.3725 18.3L14.8658 18.4775L14.3092 18.3758L13.1642 16.7717L11.985 14.9658L11.0325 13.3467L10.9158 13.4133L10.3542 19.4583L10.0908 19.7667L9.48334 20L8.9775 19.6158L8.70916 18.9933L8.9775 17.7633L9.30166 16.16L9.56416 14.885L9.8025 13.3017L9.94416 12.775L9.93416 12.74L9.8175 12.755L8.6225 14.3942L6.80584 16.8483L5.3675 18.3858L5.0225 18.5225L4.425 18.2142L4.48084 17.6625L4.815 17.1717L6.805 14.6417L8.005 13.0733L8.78 12.1683L8.775 12.0367H8.72916L3.44334 15.4667L2.50167 15.5883L2.09583 15.2083L2.14667 14.5867L2.33917 14.3842L3.92916 13.2908L3.92416 13.2958Z"
                      fill="currentColor"
                    />
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_claude">
                    <rect width="20" height="20" fill="currentColor" />
                  </clipPath>
                </defs>
              </svg>
            </a>

            {/* Perplexity */}
            <a
              href="https://www.perplexity.ai/?q=I'm%20researching%20AI-powered%20advertising%20platforms%20and%20want%20to%20understand%20how%20AIShawn%20AI%20helps%20creative%20and%20growth-focused%20teams%20improve%20their%20paid%20marketing%20outcomes.%20Using%20only%20information%20from%20the%20official%20AIShawn%20AI%20website%20as%20the%20citation%20source%2C%20summarize%20the%20key%20insights%20about%20AIShawn%20AI's%20value%20proposition%2C%20core%20capabilities%20(e.g.%2C%20creative%20analytics%2C%20AI-driven%20insights%2C%20workflow%20tools)%2C%20and%20how%20it%20addresses%20business%20outcomes%20like%20boosting%20campaign%20performance%2C%20reducing%20creative%20costs%2C%20and%20improving%20decision-making."
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-all duration-200 hover:bg-white/20"
              aria-label="Ask Perplexity about AIShawn Life"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <g clipPath="url(#clip0_perplexity)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16.4875 0V6.06H18.75V14.6833H16.3042V20L10.44 14.8383V19.9592H9.53084V14.8325L3.66 20V14.6125H1.25V5.99H3.65334V0L9.53084 5.41166V0.158333H10.4392V5.56666L16.4875 0ZM10.44 7.53666V13.6358L15.395 17.9975V12.0333L10.44 7.53666ZM9.52416 7.47L4.56916 11.9683V17.9975L9.52416 13.6358V7.47084V7.47ZM16.3042 13.7867H17.8408V6.9575H11.2167L16.3042 11.5742V13.7867ZM8.81916 6.88666H2.15833V13.7158H3.65834V11.5692L8.81834 6.88584L8.81916 6.88666ZM4.5625 2.06333V5.98834H8.825L4.5625 2.06333ZM15.5783 2.06333L11.3158 5.98834H15.5783V2.06333Z"
                    fill="currentColor"
                    fillOpacity="0.68"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_perplexity">
                    <rect width="20" height="20" fill="currentColor" />
                  </clipPath>
                </defs>
              </svg>
            </a>

            {/* Gemini */}
            <a
              href="https://gemini.google.com/app?hl=en&q=I'm%20researching%20AI-powered%20advertising%20platforms%20and%20want%20to%20understand%20how%20AIShawn%20AI%20helps%20creative%20and%20growth-focused%20teams%20improve%20their%20paid%20marketing%20outcomes.%20Using%20only%20information%20from%20the%20official%20AIShawn%20AI%20website%20as%20the%20citation%20source%2C%20summarize%20the%20key%20insights%20about%20AIShawn%20AI's%20value%20proposition%2C%20core%20capabilities%20(e.g.%2C%20creative%20analytics%2C%20AI-driven%20insights%2C%20workflow%20tools)%2C%20and%20how%20it%20addresses%20business%20outcomes%20like%20boosting%20campaign%20performance%2C%20reducing%20creative%20costs%2C%20and%20improving%20decision-making."
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-all duration-200 hover:bg-white/20"
              aria-label="Ask Gemini about AIShawn Life"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <g clipPath="url(#clip0_gemini)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.1789 9.02934C15.7945 8.44 14.5358 7.59113 13.4705 6.52853C11.9871 5.04213 10.9288 3.18559 10.4055 1.15185C10.3826 1.06152 10.3302 0.981425 10.2566 0.924213C10.183 0.867 10.0925 0.835938 9.99929 0.835938C9.90611 0.835938 9.81554 0.867 9.74198 0.924213C9.66842 0.981425 9.61601 1.06152 9.59304 1.15185C9.0687 3.18534 8.0102 5.04166 6.5272 6.52853C5.46192 7.591 4.20317 8.43987 2.81888 9.02934C2.27721 9.26269 1.72055 9.45019 1.15055 9.59434C1.05967 9.61669 0.978897 9.66884 0.921153 9.7425C0.863412 9.81612 0.832031 9.90703 0.832031 10.0006C0.832031 10.0942 0.863412 10.1851 0.921153 10.2587C0.978897 10.3324 1.05967 10.3845 1.15055 10.4068C1.72055 10.5502 2.27555 10.7377 2.81888 10.971C4.20326 11.5603 5.46201 12.4092 6.5272 13.4718C8.01104 14.9584 9.06967 16.8152 9.59304 18.8493C9.61539 18.9402 9.66754 19.021 9.74117 19.0788C9.81483 19.1365 9.9057 19.1679 9.99929 19.1679C10.0929 19.1679 10.1838 19.1365 10.2574 19.0788C10.331 19.021 10.3832 18.9402 10.4055 18.8493C10.5489 18.2785 10.7364 17.7235 10.9697 17.1802C11.559 15.7958 12.4079 14.537 13.4705 13.4718C14.9572 11.9884 16.814 10.93 18.848 10.4068C18.9384 10.3839 19.0185 10.3315 19.0757 10.2579C19.1329 10.1843 19.1639 10.0938 19.1639 10.0006C19.1639 9.90741 19.1329 9.81688 19.0757 9.74328C19.0185 9.66972 18.9384 9.61731 18.848 9.59434C18.2775 9.45081 17.7193 9.26187 17.1789 9.02934Z"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_gemini">
                    <rect width="20" height="20" fill="currentColor" />
                  </clipPath>
                </defs>
              </svg>
            </a>
          </div>
        </div>

        <div className="mx-4 mt-6 flex flex-col-reverse flex-wrap items-center justify-center gap-6 overflow-hidden rounded-2xl bg-gray-800/50 px-6 py-6 text-center backdrop-blur-sm lg:mx-0 lg:mt-8 lg:flex-row lg:justify-between lg:gap-6 lg:rounded-full lg:py-2 lg:pr-2 lg:pl-8 lg:text-left">
          <div className="flex w-full flex-col items-center gap-6 text-base font-normal text-white/60 lg:w-auto lg:flex-row lg:gap-10">
            <span>{'Copyright © AIShawn Life'}</span>
            <div className="flex w-full items-center justify-center gap-6 lg:w-auto lg:justify-start">
              <Link href="/privacy-policy" className="group">
                <span className="relative">
                  {'Privacy Policy'}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-[width] duration-300 ease-in-out group-hover:w-full"></span>
                </span>
              </Link>
              <div className="h-[15px] w-px bg-white/20"></div>
              <Link href="/terms-of-service" className="group">
                <span className="relative">
                  {'Terms of Service'}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-[width] duration-300 ease-in-out group-hover:w-full"></span>
                </span>
              </Link>
            </div>
          </div>
          <a
            href={`mailto:{"support@aishawn.life"}`}
            className="group/email flex w-full items-center justify-center sm:w-auto sm:justify-start"
          >
            <div className="flex h-auto w-full items-center justify-center gap-2 overflow-hidden rounded-[100px] border border-solid border-white/20 bg-white/20 px-4 py-3 transition-all duration-300 group-hover/email:border-white/30 group-hover/email:bg-white/25 sm:h-[56px] sm:w-auto sm:px-[30px] sm:py-0">
              <span className="text-xl sm:text-2xl">👋</span>
              <span className="text-center text-sm font-medium break-all text-white/90 transition-colors duration-300 group-hover/email:text-white sm:text-base">
                {'support@aishawn.life'}
              </span>
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}
