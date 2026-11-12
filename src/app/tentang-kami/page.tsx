'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Phone,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  Ruler,
  Check
} from 'lucide-react';
import { COMPANY_INFO } from '@/data/content';
import { usePageContent } from '@/lib/useDynamicData';
import { SubheaderBanner } from '@/components/SubheaderBanner';
import { BounceHeading } from '@/components/BounceHeading';

const WORKSHOP_IMAGES = [
  "/assets/images/asset_12_tentang-kami-1.jpg",
  "/assets/images/asset_12_subheader-oke.jpg",
  "/assets/images/asset_24_Bengkel-Las-Stainless-Steel-Te.jpg",
  "/assets/images/asset_24_Jasa-pembuatan-kanopi-70x42.jpg"
];

export default function AboutPage() {
  const { content } = usePageContent('tentang-kami', {
    hero_title: 'Tentang Bengkel Las Putra Iing Jaya Stainless & Besi Bandung Barat',
    hero_subtitle: 'Penyedia jasa pengerjaan logam berkualitas di Kabupaten Bandung Barat. Spesialis stainless steel dan besi untuk kanopi, pagar otomatis, railing, dan tangga putar bergaransi resmi.',
    story_image: WORKSHOP_IMAGES[0],
    story_image_2: WORKSHOP_IMAGES[1],
    story_image_3: WORKSHOP_IMAGES[2],
    story_image_4: WORKSHOP_IMAGES[3],
    story_p1: 'Bengkel Las Putra Iing Jaya Stainless & Besi adalah penyedia jasa pengerjaan logam berkualitas yang berlokasi di Padalarang, Kabupaten Bandung Barat. Kami spesialis dalam pengerjaan stainless steel dan besi untuk berbagai kebutuhan arsitektur dan konstruksi perumahan maupun komersial di kawasan Bandung Barat, Cimahi, dan sekitarnya.',
    story_p2: 'Mulai dari pembuatan kanopi modern, pagar manual & otomatis, railing balkon kaca/stainless, hingga tangga putar spiral, kami selalu memastikan setiap sambungan las rapi, kokoh, dan tahan terhadap iklim sejuk dan kelembaban udara Bandung Barat.'
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Subheader Banner Full-Width */}
      <SubheaderBanner breadcrumb="home // tentang kami" pageKey="tentang-kami" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-16">
        {/* Header Breadcrumb */}
        <div className="border-b border-sky-100 pb-8 text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-sky-600 font-bold bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
            Home // Tentang Kami
          </span>
          <div className="pt-2">
            <BounceHeading
              text={content.hero_title || 'Tentang Bengkel Las Putra Iing Jaya Bandung Barat'}
              highlightWords={['Putra', 'Iing', 'Jaya', 'Bandung', 'Barat']}
              shimmerColor="blue"
              className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
              as="h1"
            />
          </div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {content.hero_subtitle}
          </p>
        </div>

      {/* Main Story & Image Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {content.story_title || 'Keahlian Logam Bertahun-Tahun di Bandung Barat'}
          </h2>

          <p>
            {content.story_p1}
          </p>

          <p>
            {content.story_p2}
          </p>

          <div className="space-y-3 pt-2">
            {[
              content.features_item_1 || "Bahan Stainless Steel Grade 304 Asli (Anti Karat Abadi)",
              content.features_item_2 || "Besi Hollow Galvanis Berkualitas Standar SNI",
              content.features_item_3 || "Sistem Pengelasan TIG Gas Argon untuk Sambungan Halus & Kuat",
              content.features_item_4 || "Finishing Cat Duco / Powder Coating Tahan Gores & Cuaca",
              content.features_item_5 || "Garansi Resmi Kebocoran & Sambungan Las Tertulis"
            ].map((text, i) => (
              <div key={i} className="flex items-center space-x-3 text-slate-900 font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <a
              href={COMPANY_INFO.waLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-200 transition"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>{content.btn_contact_text || 'Hubungi Workshop Kami'}</span>
            </a>

            <Link
              href="/layanan"
              className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-sm border border-sky-100 transition"
            >
              <span>{content.btn_services_text || 'Lihat Semua Layanan'}</span>
              <ArrowRight className="w-4 h-4 text-sky-600" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              content.story_image || WORKSHOP_IMAGES[0],
              content.story_image_2 || WORKSHOP_IMAGES[1],
              content.story_image_3 || WORKSHOP_IMAGES[2],
              content.story_image_4 || WORKSHOP_IMAGES[3],
            ].map((img, idx) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 aspect-[4/3] group relative"
              >
                <img
                  src={img}
                  alt={`Dokumentasi Workshop ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
