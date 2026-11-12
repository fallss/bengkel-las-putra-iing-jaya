'use client';

import React from 'react';
import { usePageContent } from '@/lib/useDynamicData';
import { RunningTickerStrip } from '@/components/RunningTickerStrip';

interface SubheaderBannerProps {
  breadcrumb?: string;
  bannerImage?: string;
  pageKey?: string;
}

export function SubheaderBanner({
  breadcrumb = 'home // profil',
  bannerImage,
  pageKey,
}: SubheaderBannerProps) {
  const { content: pageContent } = usePageContent(pageKey || '', {});
  const activeImage =
    bannerImage || pageContent?.banner_image || '/assets/images/asset_12_subheader-oke.jpg';

  return (
    <div className="w-full">
      {/* Subheader Banner Image */}
      <div className="relative w-full aspect-[21/5.2] sm:aspect-[21/4.75] min-h-[88px] sm:min-h-[130px] lg:min-h-[160px] bg-slate-950 overflow-hidden shadow-sm">
        <img
          src={activeImage}
          alt="Bengkel Las Besi Bandung Barat Subheader"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Subheader Breadcrumb & Running Text Ticker */}
      <RunningTickerStrip breadcrumb={breadcrumb} />
    </div>
  );
}
