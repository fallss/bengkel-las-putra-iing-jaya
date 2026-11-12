export interface ExternalModuleLink {
  label: string;
  href: string;
  badge: string;
  description: string;
}

export interface PageSectionSchema {
  id: string;
  step: number;
  title: string;
  positionLabel: string;
  description: string;
  keys: string[];
  secondaryKeys?: string[];
  secondaryTitle?: string;
  note?: string;
  externalModule?: ExternalModuleLink;
  layoutHint?: 'default' | 'stats-grid' | 'advantage-grid' | 'about-gallery';
}

export const PAGE_SECTION_SCHEMAS: Record<string, PageSectionSchema[]> = {
  home: [
    {
      id: 'home-hero',
      step: 1,
      title: 'Slider Carousel Utama (Hero)',
      positionLabel: 'Posisi #1 • Paling Atas Halaman',
      description:
        'Banner gambar slider fullscreen tepat di bawah header menu. Urutan slide #1, #2, dst tampil bergantian otomatis di web.',
      keys: ['hero_slides'],
      secondaryKeys: ['hero_headline', 'hero_subheadline'],
      secondaryTitle: 'Teks Cadangan / Metadata SEO Hero (Opsional)',
      note: 'Slider utama menggunakan gambar pada daftar Slide di atas. Dua teks cadangan ini bersifat opsional/SEO jika slide belum tersedia.',
    },
    {
      id: 'home-intro',
      step: 2,
      title: 'Headline Intro & Ajakan Konsultasi',
      positionLabel: 'Posisi #2 • Tepat di Bawah Carousel',
      description:
        'Bagian pengenalan pertama di bawah slider: badge biru atas, nomor WhatsApp besar, judul utama H2, deskripsi, serta 2 tombol aksi.',
      keys: [
        'about_intro_badge',
        'about_intro_phone',
        'about_intro_title',
        'about_intro_desc',
        'about_intro_wa_btn',
        'about_intro_btn',
      ],
    },
    {
      id: 'home-split-banner',
      step: 3,
      title: 'Banner Belah (Split Banner)',
      positionLabel: 'Posisi #3 • Kiri Foto & Judul, Kanan Kotak Biru',
      description:
        'Sisi kiri menampilkan gambar latar gelap beserta judul, subjudul, dan tombol konsultasi; sisi kanan menampilkan kotak biru dengan paragraf putih.',
      keys: [
        'banner_split_image',
        'banner_split_title',
        'banner_split_subtitle',
        'banner_split_btn',
        'banner_split_desc',
      ],
    },
    {
      id: 'home-services',
      step: 4,
      title: 'Header Katalog Layanan Fabrikasi (9 Card)',
      positionLabel: 'Posisi #4 • Judul Seksi Katalog Layanan',
      description:
        'Badge dan judul di atas grid 9 kartu layanan unggulan halaman Beranda.',
      keys: ['services_badge', 'services_title'],
      externalModule: {
        label: 'Buka Kelola Layanan',
        href: '/admin/services',
        badge: 'Sinkron Otomatis 9 Card',
        description:
          'Gambar, judul, deskripsi, detail layanan, dan tombol WhatsApp untuk 9 card di Beranda diambil otomatis dari data terbaru di Kelola Layanan.',
      },
    },
    {
      id: 'home-subheader',
      step: 5,
      title: 'Banner Subheader Tengah & Ticker Berjalan',
      positionLabel: 'Posisi #5 • Banner Panorama Lebar di Tengah',
      description:
        'Gambar banner panorama horizontal yang diikuti bar running text (marquee) dan tombol WhatsApp di bawahnya.',
      keys: ['subheader_banner_image'],
      note: 'Teks running marquee tepat di bawah banner ini dikelola melalui tab "Header, Ticker & Footer" bagian Ticker Berjalan.',
    },
    {
      id: 'home-about',
      step: 6,
      title: 'Tentang Kami (Seksi Profil Beranda)',
      positionLabel: 'Posisi #6 • Kiri Teks Profil, Kanan Foto Workshop',
      description:
        'Profil singkat bengkel di halaman depan lengkap dengan badge, judul, 2 paragraf penjelasan, tombol Semua Layanan, dan foto di sebelah kanan.',
      keys: [
        'about_section_image',
        'about_section_badge',
        'about_section_title',
        'about_section_p1',
        'about_section_p2',
        'about_section_btn',
      ],
    },
    {
      id: 'home-stats',
      step: 7,
      title: 'Bar Statistik Workshop & Foto Pengelasan',
      positionLabel: 'Posisi #7 • Kiri Tab & 4 Angka Statistik, Kanan Foto',
      description:
        'Tab vertikal Konsultasi, 4 angka pencapaian bengkel, dan foto pengelasan di sisi kanan. Di bawah bagian ini tampil Kalkulator Estimasi Biaya.',
      keys: [
        'welder_stats_image',
        'stat_tab_text',
        'stat_val_1',
        'stat_lbl_1',
        'stat_val_2',
        'stat_lbl_2',
        'stat_val_3',
        'stat_lbl_3',
        'stat_val_4',
        'stat_lbl_4',
      ],
      layoutHint: 'stats-grid',
      note: 'Tepat di bawah seksi statistik ini, website menampilkan Kalkulator Estimasi Biaya interaktif secara otomatis.',
    },
    {
      id: 'home-gallery',
      step: 8,
      title: 'Portofolio Proyek & Galeri (8 Foto Terbaru)',
      positionLabel: 'Posisi #8 • Judul Galeri & 8 Kartu Foto',
      description:
        'Judul utama, subjudul biru, paragraf deskripsi, dan teks tombol menuju halaman Galeri lengkap.',
      keys: ['gallery_title', 'gallery_subtitle', 'gallery_desc', 'gallery_btn'],
      externalModule: {
        label: 'Buka Kelola Foto & Galeri',
        href: '/admin/photos',
        badge: 'Sinkron Otomatis 8 Foto',
        description:
          '8 kartu foto proyek di bawah bagian ini otomatis menampilkan 8 foto terbaru dari menu Kelola Foto & Galeri.',
      },
    },
    {
      id: 'home-advantages',
      step: 9,
      title: 'Mengapa Memilih Kami (4 Kartu Keunggulan)',
      positionLabel: 'Posisi #9 • Header Keunggulan & 4 Card 01–04',
      description:
        'Judul bagian keunggulan layanan beserta 4 kartu alasan memilih bengkel (Material, Pengalaman, Harga, Konsultasi).',
      keys: [
        'advantages_badge',
        'advantages_title',
        'advantages_desc',
        'adv_title_1',
        'adv_desc_1',
        'adv_title_2',
        'adv_desc_2',
        'adv_title_3',
        'adv_desc_3',
        'adv_title_4',
        'adv_desc_4',
      ],
      layoutHint: 'advantage-grid',
    },
    {
      id: 'home-cta',
      step: 10,
      title: 'Banner Call-to-Action (CTA Parallax)',
      positionLabel: 'Posisi #10 • Banner Gelap Sebelum Artikel',
      description:
        'Foto background full-width dengan efek parallax, judul utama berwarna emas, teks ajakan, dan tombol Hubungi Kami.',
      keys: ['cta_bg_image', 'cta_headline', 'cta_desc', 'cta_btn_text'],
    },
    {
      id: 'home-articles',
      step: 11,
      title: 'Informasi & Edukasi Terbaru (Artikel)',
      positionLabel: 'Posisi #11 • Bagian Paling Bawah Sebelum Footer',
      description:
        'Judul dan deskripsi di atas daftar artikel terbaru halaman Beranda (maksimal 6 artikel per halaman dengan navigasi angka).',
      keys: ['articles_section_title', 'articles_section_desc'],
      externalModule: {
        label: 'Buka Kelola Artikel',
        href: '/admin/articles',
        badge: 'Maks. 6 Card / Halaman',
        description:
          'Isi artikel, foto thumbnail, dan kategori/tag artikel dikelola di menu Kelola Artikel.',
      },
    },
  ],

  'tentang-kami': [
    {
      id: 'about-banner',
      step: 1,
      title: 'Subheader Banner Atas',
      positionLabel: 'Posisi #1 • Paling Atas Halaman',
      description:
        'Banner panorama horizontal beserta breadcrumb "home // tentang kami" di bagian paling atas halaman.',
      keys: ['banner_image'],
    },
    {
      id: 'about-header',
      step: 2,
      title: 'Header & Judul Halaman Tentang Kami',
      positionLabel: 'Posisi #2 • Judul Besar & Pengantar Halaman',
      description: 'Judul H1 halaman dan subjudul pengantar di bawah banner atas.',
      keys: ['hero_title', 'hero_subtitle'],
    },
    {
      id: 'about-story',
      step: 3,
      title: 'Profil Workshop, Poin Keunggulan & 4 Foto Workshop',
      positionLabel: 'Posisi #3 • Konten Utama Kiri & Grid 4 Foto Kanan',
      description:
        '4 foto dokumentasi workshop (grid 2x2 di sebelah kanan), judul kisah workshop, 2 paragraf profil, 5 poin keunggulan workshop, serta label 2 tombol aksi.',
      keys: [
        'story_image',
        'story_image_2',
        'story_image_3',
        'story_image_4',
        'story_title',
        'story_p1',
        'story_p2',
        'features_item_1',
        'features_item_2',
        'features_item_3',
        'features_item_4',
        'features_item_5',
        'btn_contact_text',
        'btn_services_text',
      ],
      layoutHint: 'about-gallery',
    },
  ],

  layanan: [
    {
      id: 'layanan-banner',
      step: 1,
      title: 'Subheader Banner Atas',
      positionLabel: 'Posisi #1 • Paling Atas Halaman',
      description:
        'Banner panorama horizontal beserta breadcrumb "home // layanan" di bagian atas halaman Layanan.',
      keys: ['banner_image'],
    },
    {
      id: 'layanan-header',
      step: 2,
      title: 'Header Halaman & Katalog Kartu Layanan',
      positionLabel: 'Posisi #2 • Judul Halaman & Daftar Layanan',
      description:
        'Judul utama dan subjudul pengantar sebelum filter kategori serta grid kartu layanan (maksimal 6 card per halaman).',
      keys: ['hero_title', 'hero_subtitle'],
      externalModule: {
        label: 'Buka Kelola Layanan',
        href: '/admin/services',
        badge: 'Maks. 6 Card / Halaman',
        description:
          'Tambah, edit, hapus kartu layanan dan atur kategori layanan melalui menu Kelola Layanan.',
      },
    },
  ],

  galeri: [
    {
      id: 'galeri-banner',
      step: 1,
      title: 'Subheader Banner Atas',
      positionLabel: 'Posisi #1 • Paling Atas Halaman',
      description:
        'Banner panorama horizontal beserta breadcrumb "home // galeri" di bagian atas halaman Galeri.',
      keys: ['banner_image'],
    },
    {
      id: 'galeri-header',
      step: 2,
      title: 'Header Halaman & Foto Portofolio Proyek',
      positionLabel: 'Posisi #2 • Judul Halaman & Grid Galeri',
      description:
        'Judul utama dan keterangan pengantar di atas tab filter kategori dan grid foto dokumentasi proyek.',
      keys: ['hero_title', 'hero_subtitle'],
      externalModule: {
        label: 'Buka Kelola Foto & Galeri',
        href: '/admin/photos',
        badge: 'Portofolio Proyek',
        description:
          'Upload foto proyek baru, ubah judul/lokasi, dan kelola kategori galeri melalui menu Kelola Foto & Galeri.',
      },
    },
  ],

  artikel: [
    {
      id: 'artikel-banner',
      step: 1,
      title: 'Subheader Banner Atas',
      positionLabel: 'Posisi #1 • Paling Atas Halaman',
      description:
        'Banner panorama horizontal beserta breadcrumb "home // artikel" di bagian atas halaman Artikel.',
      keys: ['banner_image'],
    },
    {
      id: 'artikel-header',
      step: 2,
      title: 'Header & Judul Halaman Artikel',
      positionLabel: 'Posisi #2 • Judul Besar Sebelum Daftar Artikel',
      description:
        'Judul utama H1 dan subjudul pengantar sebelum grid artikel edukasi (maksimal 6 artikel per halaman).',
      keys: ['hero_title', 'hero_subtitle'],
    },
  ],

  kontak: [
    {
      id: 'kontak-banner',
      step: 1,
      title: 'Subheader Banner Atas',
      positionLabel: 'Posisi #1 • Paling Atas Halaman',
      description:
        'Banner panorama horizontal beserta breadcrumb "home // kontak" di bagian atas halaman Kontak.',
      keys: ['banner_image'],
    },
    {
      id: 'kontak-header',
      step: 2,
      title: 'Header & Judul Halaman Kontak',
      positionLabel: 'Posisi #2 • Judul Utama Halaman',
      description:
        'Judul utama H1 dan deskripsi ajakan survey/konsultasi gratis di bagian atas.',
      keys: ['hero_title', 'hero_subtitle'],
    },
    {
      id: 'kontak-body',
      step: 3,
      title: 'Kartu Informasi Workshop & Formulir Konsultasi',
      positionLabel: 'Posisi #3 • Kolom Info Kiri & Form WhatsApp Kanan',
      description:
        'Isi kotak informasi gelap di sebelah kiri (judul, deskripsi, alamat, jam buka) serta judul formulir kirim pesan di sebelah kanan.',
      keys: [
        'info_title',
        'info_desc',
        'info_address_val',
        'info_hours_val',
        'form_title',
      ],
      secondaryKeys: ['workshop_image'],
      secondaryTitle: 'Media Cadangan Workshop (Opsional)',
      note: 'Tampilan kontak saat ini menampilkan peta/tombol Google Maps, alamat, jam buka, dan form WhatsApp.',
      externalModule: {
        label: 'Buka Kontak & Sosmed',
        href: '/admin/settings',
        badge: 'Nomor WA, Email & Sosmed',
        description:
          'Nomor WhatsApp aktif, email resmi, link Google Maps, serta link Instagram, Facebook, dan YouTube dikelola di menu Kontak & Sosmed.',
      },
    },
  ],

  global: [
    {
      id: 'global-header',
      step: 1,
      title: 'Header & Topbar Website',
      positionLabel: 'Posisi #1 • Bagian Paling Atas Semua Halaman',
      description:
        'Teks tagline sebelah kiri topbar, nomor telepon tampilan, link "Portal Masuk", dan teks tombol "Masuk" pada menu navigasi.',
      keys: ['topbar_tagline', 'topbar_phone', 'topbar_login_text', 'nav_login_text'],
      externalModule: {
        label: 'Buka Kontak & Sosmed',
        href: '/admin/settings',
        badge: 'Link Instagram, Facebook & YouTube',
        description:
          'Link ikon Instagram, Facebook, YouTube, serta nomor telepon/WhatsApp utama topbar diatur melalui menu Kontak & Sosmed.',
      },
    },
    {
      id: 'global-ticker',
      step: 2,
      title: 'Ticker Berjalan (Running Text Marquee)',
      positionLabel: 'Posisi #2 • Strip Running Text di Bawah Banner',
      description:
        'Teks berjalan otomatis di bawah subheader banner halaman Beranda dan sub-halaman lainnya beserta label tombol kanan.',
      keys: ['ticker_text_1', 'ticker_text_2', 'ticker_phone', 'ticker_btn_label'],
    },
    {
      id: 'global-footer',
      step: 3,
      title: 'Footer Website',
      positionLabel: 'Posisi #3 • Bagian Paling Bawah Semua Halaman',
      description:
        'Tagline, deskripsi profil singkat di sisi kiri footer, serta teks hak cipta (copyright) di bagian paling bawah website.',
      keys: ['footer_tagline', 'footer_desc', 'footer_copyright'],
    },
  ],
};

export interface OrderedSectionGroup<T extends { section_key: string }> {
  schema: PageSectionSchema;
  items: T[];
  secondaryItems: T[];
}

export function groupContentsByWebsiteOrder<T extends { section_key: string }>(
  pageKey: string,
  items: T[]
): {
  sections: OrderedSectionGroup<T>[];
  customItems: T[];
} {
  const byKey = new Map<string, T>();
  for (const item of items) {
    byKey.set(item.section_key, item);
  }

  const schemas = PAGE_SECTION_SCHEMAS[pageKey] || [];
  const usedKeys = new Set<string>();

  const sections: OrderedSectionGroup<T>[] = schemas.map((schema) => {
    const primary: T[] = [];
    for (const k of schema.keys) {
      const found = byKey.get(k);
      if (found) {
        primary.push(found);
        usedKeys.add(k);
      }
    }

    const secondary: T[] = [];
    for (const k of schema.secondaryKeys || []) {
      const found = byKey.get(k);
      if (found) {
        secondary.push(found);
        usedKeys.add(k);
      }
    }

    return { schema, items: primary, secondaryItems: secondary };
  });

  const customItems = items.filter((item) => !usedKeys.has(item.section_key));

  return { sections, customItems };
}

