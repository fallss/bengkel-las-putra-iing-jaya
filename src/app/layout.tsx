import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LayoutClientWrapper } from '@/components/LayoutClientWrapper';
import { COMPANY_INFO } from '@/data/content';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bengkellasbandungbarat.com'),
  title: 'Bengkel Las Besi Bandung Barat – Layanan Pengerjaan Stainless dan Besi Terbaik',
  description: 'Bengkel Las Putra Iing Jaya Bandung Barat melayani pembuatan kanopi alderon, pagar modern & otomatis, railing tangga stainless SUS 304, tangga spiral, dan konstruksi baja WF bergaransi resmi.',
  keywords: [
    'bengkel las bandung barat',
    'bengkel las padalarang',
    'bengkel las ngamprah',
    'bengkel las lembang',
    'bengkel las batujajar',
    'bengkel las cimahi',
    'kanopi minimalis bandung barat',
    'kanopi alderon bandung barat',
    'pagar otomatis bandung barat',
    'railing tangga stainless bandung barat',
    'tangga putar bandung barat',
    'harga kanopi per meter bandung barat',
    'bengkel las putra iing jaya'
  ],
  authors: [{ name: COMPANY_INFO.name }],
  openGraph: {
    title: 'Bengkel Las Besi Bandung Barat – Layanan Pengerjaan Stainless & Besi Terbaik',
    description: 'Penyedia jasa fabrikasi logam berkualitas di Bandung Barat. Spesialis kanopi, pagar, railing stainless 304, dan tangga spiral. Survey & konsultasi gratis!',
    url: 'https://www.bengkellasbandungbarat.com/',
    siteName: COMPANY_INFO.name,
    images: [
      {
        url: '/assets/images/asset_6_LOGO-BENGKEL-LAS.png',
        width: 600,
        height: 600,
        alt: COMPANY_INFO.name,
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: COMPANY_INFO.fullName,
    alternateName: COMPANY_INFO.name,
    image: 'https://www.bengkellasbandungbarat.com/assets/images/asset_6_LOGO-BENGKEL-LAS.png',
    '@id': 'https://www.bengkellasbandungbarat.com',
    url: 'https://www.bengkellasbandungbarat.com',
    telephone: '+6281223459728',
    priceRange: 'Rp 250.000 - Rp 2.500.000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Raya Padalarang - Purwakarta, Kertajaya, Kec. Padalarang',
      addressLocality: 'Bandung Barat',
      addressRegion: 'Jawa Barat',
      postalCode: '40553',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -6.837,
      longitude: 107.478,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '17:00',
      },
    ],
  };

  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/assets/images/asset_6_LOGO-BENGKEL-LAS.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-white text-[#28231d]">
        <LayoutClientWrapper>{children}</LayoutClientWrapper>
      </body>
    </html>
  );
}
