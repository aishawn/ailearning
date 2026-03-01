'use client'

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/core/i18n/navigation";
import { useAppContext } from "@/shared/contexts/app";
import { Footer as FooterType } from "@/shared/types/blocks/landing";

// 与 Header 保持一致的多语言图标
const GlobalIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="64 64 896 896" 
    focusable="false" 
    data-icon="global" 
    width="1em" 
    height="1em" 
    fill="currentColor" 
    aria-hidden="true"
    className={className}
  >
    <path d="M854.4 800.9c.2-.3.5-.6.7-.9C920.6 722.1 960 621.7 960 512s-39.4-210.1-104.8-288c-.2-.3-.5-.5-.7-.8-1.1-1.3-2.1-2.5-3.2-3.7-.4-.5-.8-.9-1.2-1.4l-4.1-4.7-.1-.1c-1.5-1.7-3.1-3.4-4.6-5.1l-.1-.1c-3.2-3.4-6.4-6.8-9.7-10.1l-.1-.1-4.8-4.8-.3-.3c-1.5-1.5-3-2.9-4.5-4.3-.5-.5-1-1-1.6-1.5-1-1-2-1.9-3-2.8-.3-.3-.7-.6-1-1C736.4 109.2 629.5 64 512 64s-224.4 45.2-304.3 119.2c-.3.3-.7.6-1 1-1 .9-2 1.9-3 2.9-.5.5-1 1-1.6 1.5-1.5 1.4-3 2.9-4.5 4.3l-.3.3-4.8 4.8-.1.1c-3.3 3.3-6.5 6.7-9.7 10.1l-.1.1c-1.6 1.7-3.1 3.4-4.6 5.1l-.1.1c-1.4 1.5-2.8 3.1-4.1 4.7-.4.5-.8.9-1.2 1.4-1.1 1.2-2.1 2.5-3.2 3.7-.2.3-.5.5-.7.8C103.4 301.9 64 402.3 64 512s39.4 210.1 104.8 288c.2.3.5.6.7.9l3.1 3.7c.4.5.8.9 1.2 1.4l4.1 4.7c0 .1.1.1.1.2 1.5 1.7 3 3.4 4.6 5l.1.1c3.2 3.4 6.4 6.8 9.6 10.1l.1.1c1.6 1.6 3.1 3.2 4.7 4.7l.3.3c3.3 3.3 6.7 6.5 10.1 9.6 80.1 74 187 119.2 304.5 119.2s224.4-45.2 304.3-119.2a300 300 0 0010-9.6l.3-.3c1.6-1.6 3.2-3.1 4.7-4.7l.1-.1c3.3-3.3 6.5-6.7 9.6-10.1l.1-.1c1.5-1.7 3.1-3.3 4.6-5 0-.1.1-.1.1-.2 1.4-1.5 2.8-3.1 4.1-4.7.4-.5.8-.9 1.2-1.4a99 99 0 003.3-3.7zm4.1-142.6c-13.8 32.6-32 62.8-54.2 90.2a444.07 444.07 0 00-81.5-55.9c11.6-46.9 18.8-98.4 20.7-152.6H887c-3 40.9-12.6 80.6-28.5 118.3zM887 484H743.5c-1.9-54.2-9.1-105.7-20.7-152.6 29.3-15.6 56.6-34.4 81.5-55.9A373.86 373.86 0 01887 484zM658.3 165.5c39.7 16.8 75.8 40 107.6 69.2a394.72 394.72 0 01-59.4 41.8c-15.7-45-35.8-84.1-59.2-115.4 3.7 1.4 7.4 2.9 11 4.4zm-90.6 700.6c-9.2 7.2-18.4 12.7-27.7 16.4V697a389.1 389.1 0 01115.7 26.2c-8.3 24.6-17.9 47.3-29 67.8-17.4 32.4-37.8 58.3-59 75.1zm59-633.1c11 20.6 20.7 43.3 29 67.8A389.1 389.1 0 01540 327V141.6c9.2 3.7 18.5 9.1 27.7 16.4 21.2 16.7 41.6 42.6 59 75zM540 640.9V540h147.5c-1.6 44.2-7.1 87.1-16.3 127.8l-.3 1.2A445.02 445.02 0 00540 640.9zm0-156.9V383.1c45.8-2.8 89.8-12.5 130.9-28.1l.3 1.2c9.2 40.7 14.7 83.5 16.3 127.8H540zm-56 56v100.9c-45.8 2.8-89.8 12.5-130.9 28.1l-.3-1.2c-9.2-40.7-14.7-83.5-16.3-127.8H484zm-147.5-56c1.6-44.2 7.1-87.1 16.3-127.8l.3-1.2c41.1 15.6 85 25.3 130.9 28.1V484H336.5zM484 697v185.4c-9.2-3.7-18.5-9.1-27.7-16.4-21.2-16.7-41.7-42.7-59.1-75.1-11-20.6-20.7-43.3-29-67.8 37.2-14.6 75.9-23.3 115.8-26.1zm0-370a389.1 389.1 0 01-115.7-26.2c8.3-24.6 17.9-47.3 29-67.8 17.4-32.4 37.8-58.4 59.1-75.1 9.2-7.2 18.4-12.7 27.7-16.4V327zM365.7 165.5c3.7-1.5 7.3-3 11-4.4-23.4 31.3-43.5 70.4-59.2 115.4-21-12-40.9-26-59.4-41.8 31.8-29.2 67.9-52.4 107.6-69.2zM165.5 365.7c13.8-32.6 32-62.8 54.2-90.2 24.9 21.5 52.2 40.3 81.5 55.9-11.6 46.9-18.8 98.4-20.7 152.6H137c3-40.9 12.6-80.6 28.5-118.3zM137 540h143.5c1.9 54.2 9.1 105.7 20.7 152.6a444.07 444.07 0 00-81.5 55.9A373.86 373.86 0 01137 540zm228.7 318.5c-39.7-16.8-75.8-40-107.6-69.2 18.5-15.8 38.4-29.7 59.4-41.8 15.7 45 35.8 84.1 59.2 115.4-3.7-1.4-7.4-2.9-11-4.4zm292.6 0c-3.7 1.5-7.3 3-11 4.4 23.4-31.3 43.5-70.4 59.2-115.4 21 12 40.9 26 59.4 41.8a373.81 373.81 0 01-107.6 69.2z"></path>
  </svg>
);

export function Footer({ footer }: { footer: FooterType }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppContext();
  const menuTextT = useTranslations('landing.footer');
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const languageDropdownRef = useRef<HTMLDivElement | null>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const languageOptions = useMemo(() => [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' }
  ], []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLanguageDropdown && languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
      }
    };
  }, [showLanguageDropdown]);

  const handleLanguageSwitch = (targetLocale: string) => {
    setShowLoadingModal(true);

    safetyTimerRef.current = setTimeout(() => {
      setShowLoadingModal(false);
      safetyTimerRef.current = null;
    }, 3000);

    try {
      router.push(pathname, { locale: targetLocale });
    } catch (error) {
      console.error('Footer language switch failed:', error);
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
      setShowLoadingModal(false);
    }

    setShowLanguageDropdown(false);
  };

  const renderLanguageButton = () => {
    const currentLanguage = languageOptions.find((lang) => lang.code === locale) || languageOptions[0];

    return (
      <div className="relative language-dropdown" ref={languageDropdownRef}>
        <button
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          className="group flex items-center gap-2 px-3 py-1.5 text-xs text-gray-200 hover:text-white border border-gray-600/60 bg-gray-900/60 hover:bg-gray-800/80 rounded-full transition-all duration-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
          aria-label="Change language"
        >
          <GlobalIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-medium">{currentLanguage?.nativeName || currentLanguage?.name}</span>
          <svg
            className="h-4 w-4 text-gray-300 group-hover:text-white transition-colors"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
          </svg>
        </button>

        {showLanguageDropdown && (
          <div className="absolute bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-600/50 rounded-2xl shadow-2xl z-50 overflow-hidden min-w-[160px] animate-in fade-in-0 zoom-in-95 duration-200 right-0 top-full mt-3">
            {languageOptions.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSwitch(lang.code)}
                className={`w-full flex items-center px-4 py-3.5 text-sm hover:bg-gray-700/80 transition-all duration-200 ${
                  locale === lang.code ? 'bg-gray-700 text-white border-l-2 border-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <span className="flex-1 text-left font-medium">{lang.nativeName}</span>
                {locale === lang.code && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const manageSubscribe = async () => {
    if (!user?.id) {
      return
    }
    const user_id = user.id;
    const requestData = {
      user_id: user_id
    }
    setShowLoadingModal(true);
    const responseData = await fetch(`/api/stripe/create-portal-link`, {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    const result = await responseData.json();
    setShowLoadingModal(false);
    if (result.url) {
      window.location.href = result.url;
    }
  }

  return (
    <footer aria-labelledby="footer-heading" className="bg-black text-white py-12 border-t border-white/20">
      <div id="footer-heading" className="sr-only">Footer</div>
      <div className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="mb-8 md:mb-0 md:max-w-lg lg:max-w-xl">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center group">
                <img
                  className="h-7 transition-transform duration-300 group-hover:scale-110"
                  src="/favicon.svg"
                  alt={process.env.NEXT_PUBLIC_DOMAIN_NAME}
                  width="28"
                  height="28"
                />
                <span className="ml-3 text-lg font-bold text-white transition-colors duration-300 group-hover:text-blue-200">
                  OnlyFAI
                </span>
              </Link>
              {renderLanguageButton()}
            </div>
            <p className="text-gray-400 mt-4 max-w-md">
              {menuTextT('description') || footer?.description || "AI-powered creative tools"}
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://www.linkedin.com/company/onlyfai-ai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="https://x.com/shawnloveAI" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">X</span>
                <svg fill="currentColor" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0.254 0.25 500 451.95400000000006"><path d="M394.033.25h76.67L303.202 191.693l197.052 260.511h-154.29L225.118 294.205 86.844 452.204H10.127l179.16-204.77L.254.25H158.46l109.234 144.417zm-26.908 406.063h42.483L135.377 43.73h-45.59z"/></svg>
              </a>


              <a href="https://discord.gg/6TXsZBee8V" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Discord</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.369A19.791 19.791 0 0016.885 3.1a.077.077 0 00-.082.038c-.357.63-.755 1.453-1.037 2.104a18.524 18.524 0 00-5.49 0 12.76 12.76 0 00-1.05-2.104.077.077 0 00-.082-.038c-1.432.327-2.813.812-4.115 1.469a.07.07 0 00-.032.027C.533 9.045-.32 13.579.099 18.057a.082.082 0 00.031.056c1.733 1.277 3.415 2.052 5.077 2.568a.077.077 0 00.084-.027c.391-.537.739-1.1 1.032-1.684a.076.076 0 00-.041-.104c-.552-.21-1.077-.467-1.588-.765a.077.077 0 01-.008-.127c.107-.08.214-.163.316-.246a.074.074 0 01.077-.01c3.304 1.515 6.872 1.515 10.146 0a.073.073 0 01.078.009c.102.083.209.166.316.246a.077.077 0 01-.006.127 12.298 12.298 0 01-1.589.765.076.076 0 00-.04.105c.294.584.641 1.147 1.032 1.684a.076.076 0 00.084.028c1.663-.516 3.345-1.291 5.078-2.568a.077.077 0 00.03-.055c.5-5.177-.838-9.673-3.548-13.661a.061.061 0 00-.03-.028zM8.02 15.331c-1.004 0-1.823-.92-1.823-2.049 0-1.13.807-2.05 1.823-2.05 1.025 0 1.833.92 1.823 2.05 0 1.13-.807 2.049-1.823 2.049zm7.974 0c-1.004 0-1.823-.92-1.823-2.049 0-1.13.807-2.05 1.823-2.05 1.025 0 1.833.92 1.823 2.05 0 1.13-.798 2.049-1.823 2.049z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61573655860111" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"/>
                </svg>
              </a>



              
            </div>
            

            {/* <button
              onClick={handleCTAClick || (() => {})}
              className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              <span className="flex items-center gap-2">
                <span>
                  {indexText?.ctaButtonText || finalCommonText?.ctaButtonText || 'Try For Free'}
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button> */}




            {/* Featured Badge */}
            {/* <div className="mt-6">


              <a href="https://launchigniter.com/product/ai-kissing-video-generator-romantic-private-anonymous?ref=badge-ai-kissing-video-generator-romantic-private-anonymous" target="_blank">
                <img src="https://launchigniter.com/api/badge/ai-kissing-video-generator-romantic-private-anonymous?theme=light" alt="Featured on LaunchIgniter" width="212" height="55"
                onError={(e) => { e.currentTarget.parentElement?.style.setProperty('display', 'none'); }}
                />
              </a>


              <a href="https://fazier.com/launches/onlyfai.com" target="_blank"><img src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light" width="120" height="54" alt="Fazier badge"
              onError={(e) => { e.currentTarget.parentElement?.style.setProperty('display', 'none'); }}
              /></a>

            </div> */}
            
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            <div className="min-w-[160px]">
              <h3 className="text-lg font-semibold mb-4">
                {menuTextT('resources') || "Resources"}
              </h3>
              <ul role="list" className="space-y-3">
                {process.env.NEXT_PUBLIC_CHECK_AVAILABLE_TIME != '0' && (
                  <li>
                    <Link
                      href="/pricing"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {menuTextT('pricing') || "Pricing"}
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/article"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {menuTextT('article') || "Article"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {menuTextT('contactUs') || "Feedback"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/aboutus"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {menuTextT('about') || "About Us"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {menuTextT('refundPolicy') || "Refund Policy"}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="min-w-[160px]">
              <h3 className="text-lg font-semibold mb-4">
                {menuTextT('aiFeatures') || "AI Features"}
              </h3>
              <ul role="list" className="space-y-3">
                <li>
                  <Link
                    href="/ai-clothes"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {menuTextT('aiClothes') || "AI Clothes"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai-body"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {menuTextT('aiBody') || "AI Body"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai-pose"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {menuTextT('aiPose') || "AI Pose"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai-dance"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {menuTextT('aiDance') || "AI Dance"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai-place"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {menuTextT('aiPlace') || "AI Place"}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="min-w-[160px]">
              <h3 className="text-lg font-semibold mb-4">
                {menuTextT('products') || "Products"}
              </h3>
              <ul role="list" className="space-y-3">
                <li>
                  <Link
                    href="https://dang.ai/"
                    target="_blank"
                    rel="nofollow"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    duang.ai
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.aitoolgo.com"
                    target="_blank"
                    rel="nofollow"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    AiToolGo
                  </Link>
                </li>
                
                {/* <li>
                  <Link  
                    href="https://www.toolpilot.ai/"
                    target="_blank"
                    rel="nofollow"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    toolpilot
                  </Link>
                </li>
 
                <li>
                  <Link  
                    href="https://startupfa.me/"
                    target="_blank"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    startupfa
                  </Link>
                </li>
                <li>
                  <Link  
                    href="https://AIToolly.com/"
                    target="_blank"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="AIToolly AI Tools Directory"
                  >
                    AIToolly
                  </Link>
                </li> */}

                {/* <li>
                  <Link
                    href="https://aistage.net"
                    target="_blank"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="AIStage"
                  >
                    AIStage
                  </Link>
                </li> */}

              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col-reverse flex-wrap items-center justify-center lg:justify-between text-center lg:text-left mx-4 lg:mx-0 mt-10 lg:mt-40 px-6 lg:pl-8 lg:pr-2 py-6 lg:py-2 rounded-2xl lg:rounded-full overflow-hidden lg:flex-row gap-6 lg:gap-6 bg-gray-800/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 lg:gap-6 text-white/60 text-base font-normal lg:flex-row w-full lg:w-auto">
            <span>{menuTextT('copyright') || footer?.copyright || "Copyright © onlyfai.com"}</span>
            <div className="flex items-center justify-center lg:justify-start gap-6 w-full lg:w-auto">
              <Link 
                href="/privacy-policy"
                className="group"
              >
                <span className="relative">
                  {menuTextT('privacyPolicy') || "Privacy Policy"}
                  <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-white transition-[width] duration-300 ease-in-out group-hover:w-full"></span>
                </span>
              </Link>
              <div className="w-px h-[15px] bg-white/20"></div>
              <Link 
                href="/terms-of-service"
                className="group"
              >
                <span className="relative">
                  {menuTextT('termsOfService') || "Terms of Service"}
                  <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-white transition-[width] duration-300 ease-in-out group-hover:w-full"></span>
                </span>
              </Link>
            </div>
          </div>
          <a 
            href={`mailto:${menuTextT('support') || "support@onlyfai.com"}`}
            className="flex w-full sm:w-auto items-center justify-center sm:justify-start group/email"
          >
            <div className="flex w-full sm:w-auto gap-2 items-center justify-center border border-solid border-white/20 bg-white/20 overflow-hidden rounded-[100px] px-4 sm:px-[30px] py-3 sm:py-0 h-auto sm:h-[56px] transition-all duration-300 group-hover/email:border-white/30 group-hover/email:bg-white/25">
              <span className="text-xl sm:text-2xl">👋</span>
              <span className="text-sm sm:text-base text-white/90 text-center font-medium transition-colors duration-300 group-hover/email:text-white break-all">
                {menuTextT('support') || "support@onlyfai.com"}
              </span>
            </div>
          </a>
        </div>
      </div>
      {process.env.NEXT_PUBLIC_GOOGLE_TAG_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_TAG_ID} />
      )}
    </footer>



  )
}
