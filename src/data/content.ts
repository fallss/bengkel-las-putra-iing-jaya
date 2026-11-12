export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  tagline: string;
  desc: string;
  specs: string[];
  materials: string[];
  priceRange: string;
  image: string;
  features: string[];
}

export interface GalleryPhoto {
  id: number;
  title: string;
  category: 'kanopi' | 'pagar' | 'railing' | 'tangga' | 'teralis' | 'konstruksi';
  categoryLabel: string;
  src: string;
  location: string;
}

export interface ArticleItem {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  author: string;
  image: string;
  excerpt: string;
  content: string[];
  tags: string[];
}

export interface TestimonialItem {
  name: string;
  role: string;
  location: string;
  rating: number;
  comment: string;
  project: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const COMPANY_INFO = {
  name: "Bengkel Las Besi Bandung Barat",
  fullName: "Bengkel Las Putra Iing Jaya Stainless & Besi Bandung Barat",
  phone: "+62 812-2345-9728",
  phoneFormatted: "+62 812-2345-9728",
  waNumber: "6281223459728",
  waLink: "https://api.whatsapp.com/send?phone=6281223459728",
  address: "Kp Warung Domba, RT.1/RW.7, Mandalamukti, Kec. Cikalong Wetan, Kabupaten Bandung Barat, Jawa Barat 40556",
  shortAddress: "Cikalong Wetan, Bandung Barat, Jawa Barat",
  hours: "Senin - Sabtu: 08.00 - 17.00 WIB",
  email: "kontak@bengkellasbandungbarat.com",
  mapsUrl: "https://maps.app.goo.gl/M7jDaaeUEJhcJMUz5",
  serviceArea: "Area: Bandung Barat, Jabodetabek & Siap Kirim / Pasang Seluruh Indonesia",
  stats: [
    { value: "1.550+", label: "Proyek Selesai", desc: "Perumahan, ruko, & kantor" },
    { value: "99%", label: "Kepuasan Klien", desc: "Rating bintang 5 di Bandung Barat" },
    { value: "15+", label: "Tahun Jam Terbang", desc: "Berpengalaman melayani Bandung Barat" },
    { value: "100%", label: "Garansi Resmi", desc: "Tertulis anti bocor & las" },
  ]
};

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: "kanopi-minimalis",
    title: "Kanopi Minimalis & Modern",
    category: "Kanopi",
    tagline: "Pelindung Carport & Teras Elegan Tahan Segala Cuaca",
    desc: "Pembuatan atap kanopi carport premium dengan pilihan material atap terbaik seperti Alderon Twinwall berongga anti-panas, Spandek Pasir kedap suara hujan, Kaca Tempered mewah, Solarflat jernih, hingga Polycarbonate UV Protection.",
    specs: [
      "Rangka Besi Hollow Galvanis SNI tebal 1.4mm - 2.0mm",
      "Pengecatan 3 Lapis: Primer Epoxy + Cat Warna Duco Tahan Karat",
      "Talang air terintegrasi anti bocor & pembuangan rapi",
      "Garansi struktur & anti-bocor hingga 12 bulan"
    ],
    materials: ["Alderon Twinwall / RS", "Kaca Tempered 8mm-10mm", "Spandek Pasir", "Solarflat Polycarbonate"],
    priceRange: "Mulai Rp 350.000 / m²",
    image: "/assets/images/asset_24_Jasa-pembuatan-kanopi.jpg",
    features: ["Peredam Panas & Suara", "Struktur Kokoh Tahan Angin", "Pilihan Warna Cat Custom", "Desain Cantilever / Tiang V"]
  },
  {
    id: "pintu-pagar-modern",
    title: "Pintu Pagar Otomatis & Manual",
    category: "Pagar",
    tagline: "Keamanan Maksimal Hunian dengan Sentuhan Arsitektur Modern",
    desc: "Fabrikasi pagar besi tempa, minimalis modern, kombinasi Woodplank GRC serat kayu anti-rayap, plat perforated, hingga motif Laser Cutting presisi. Melayani integrasi motor autogate sliding/swing remote control pintar.",
    specs: [
      "Bahan Besi Hollow Galvanis Tebal / Plat Besi Cutting Presisi",
      "Rel Bawah & Roda Stainless SUS 304 anti-macet seumur hidup",
      "Pilihan Motor Otomatis Italia / Taiwan bergaransi 1 tahun",
      "Finishing Cat Powder Coating atau Duco anti gores"
    ],
    materials: ["Plat Laser Cutting", "Woodplank GRC", "Stainless Steel 304", "Galvanized Steel"],
    priceRange: "Mulai Rp 450.000 / m²",
    image: "/assets/images/asset_24_Bengkel-Pintu-Pagar-Otomatis.jpg",
    features: ["Sistem Autogate Remote", "Anti Karat Cuaca Tropis", "Kunci Ganda Pengaman", "Desain Custom Elegan"]
  },
  {
    id: "railing-tangga-stainless",
    title: "Railing Tangga & Balkon Stainless 304",
    category: "Railing",
    tagline: "Sentuhan Mewah, Kuat & Bebas Korosi Selamanya",
    desc: "Pengaman tangga indoor dan balkon teras lantai atas dengan Stainless Steel Grade SUS 304 asli standar industri makanan & arsitektur. Dapat dipadukan dengan panel kaca tempered transparan untuk tampilan hunian modern kontemporer.",
    specs: [
      "Pipa Stainless Steel SUS 304 Asli (Uji Magnet 100% Non-Magnetik)",
      "Finishing Mirror Polish (Kilap Cermin) atau Hairline (Doff)",
      "Sambungan Las Gas Argon tanpa noda hitam & digosok halus",
      "Kombinasi Kaca Tempered 8mm / 10mm dengan fitting stainless"
    ],
    materials: ["SUS 304 Hairline / Mirror", "Kaca Tempered Glass", "Kabel Sling Stainless", "Handrail Kayu Kamper/Jati"],
    priceRange: "Mulai Rp 650.000 / m¹",
    image: "/assets/images/asset_24_Bengkel-Las-Stainless-Steel-Te.jpg",
    features: ["100% Anti Karat", "Sambungan Argon Rapi", "Pegangan Ergonomis", "Tampilan Bersih & Mewah"]
  },
  {
    id: "tangga-putar-spiral",
    title: "Tangga Putar & Tangga Spiral",
    category: "Tangga",
    tagline: "Solusi Cerdas Hemat Ruang dengan Struktur Sangat Kokoh",
    desc: "Tangga putar spiral untuk akses ke lantai 2, mezanin, atau dak toren air tanpa memakan banyak tempat. Didesain dengan presisi sudut putar yang nyaman dilangkahi serta pijakan plat bordes anti-selip.",
    specs: [
      "Tiang Utama Pipa Baja Tebal SCH 40 diameter 3-4 inch",
      "Anak Tangga Plat Bordes Bertekstur timbul anti-slip",
      "Handrail melingkar presisi dengan pengaman kisi-kisi rapat",
      "Pengecatan dasar tahan karat khusus area outdoor"
    ],
    materials: ["Pipa Baja Heavy Duty", "Plat Bordes Anti Slip", "Besi Hollow Pengaman", "Baut Dynabolt Fischer Kuat"],
    priceRange: "Mulai Rp 1.600.000 / m¹ tinggi",
    image: "/assets/images/asset_12_3-600x450.jpg",
    features: ["Hemat Luas Ruangan", "Daya Beban s/d 300kg", "Pijakan Aman Anti-Slip", "Bentuk Estetik Unik"]
  },
  {
    id: "konstruksi-baja-wf",
    title: "Konstruksi Baja WF & Rangka Atap",
    category: "Konstruksi",
    tagline: "Konstruksi Berat untuk Gudang, Ruko, & Mezanin Berstandar Sipil",
    desc: "Pengerjaan struktur baja Wide Flange (WF) dan rangka atap baja ringan zincalume dengan kalkulasi beban struktural akurat oleh tim ahli berpengalaman, memastikan ketahanan gempa dan keamanan jangka panjang.",
    specs: [
      "Baja WF Standar Krakatau Steel / Gunung Garuda bersertifikat SNI",
      "Koneksi Baut Baja HTB Grade 8.8 & Pengelasan Penuh (Full Penetration)",
      "Lapisan Zinkromate / Epoxy Primer anti korosi menyeluruh",
      "Gambar kerja teknis & supervisi pengerjaan di lapangan"
    ],
    materials: ["Baja WF 150 - 300 SNI", "Plat Simpul Tebal", "Kanal C Baja Ringan Zincalume", "Baut HTB Mutu Tinggi"],
    priceRange: "Konsultasi & Hitung RAB",
    image: "/assets/images/asset_30_12-600x450.jpg",
    features: ["Perhitungan Tahan Gempa", "Bahan Bersertifikat SNI", "Cepat & Presisi", "Pengerjaan Skala Besar"]
  },
  {
    id: "teralis-pengaman",
    title: "Teralis Jendela & Pintu Kasa Nyamuk",
    category: "Teralis",
    tagline: "Proteksi Rumah dari Bahaya Tanpa Mengorbankan Estetika",
    desc: "Teralis pengaman untuk jendela dan pintu masuk dengan motif minimalis garis lurus, pola geometris kekinian, atau kombinasi kasa baja anti nyamuk yang menjaga sirkulasi udara tetap segar sekaligus aman.",
    specs: [
      "Besi Nako / Kotak Solid padat 10mm - 12mm",
      "Pemasangan sekrup fischer tanam dalam kusen anti-congkel",
      "Kawat baja kasa nyamuk tahan robek & mudah dibersihkan",
      "Kunci slot grendel tanam ganda"
    ],
    materials: ["Besi Nako Padat", "Plat Strip", "Kasa Nyamuk Baja", "Finishing Duco Halus"],
    priceRange: "Mulai Rp 220.000 / titik",
    image: "/assets/images/asset_30_6-600x450.jpg",
    features: ["Anti Congkel", "Ventilasi Maksimal", "Model Kekinian", "Kunci Ganda"]
  }
];

export const GALLERY_ITEMS: GalleryPhoto[] = [
  { id: 1, title: "Kanopi Alderon Carport Rumah", category: "kanopi", categoryLabel: "Kanopi", src: "/assets/images/asset_24_Jasa-pembuatan-kanopi.jpg", location: "Padalarang, Bandung Barat" },
  { id: 2, title: "Pagar Sliding Laser Cutting Modern", category: "pagar", categoryLabel: "Pagar", src: "/assets/images/asset_24_Bengkel-Pintu-Pagar-Otomatis.jpg", location: "Ngamprah, Bandung Barat" },
  { id: 3, title: "Railing Tangga Stainless 304 Mewah", category: "railing", categoryLabel: "Railing", src: "/assets/images/asset_24_Bengkel-Las-Stainless-Steel-Te.jpg", location: "Lembang, Bandung Barat" },
  { id: 4, title: "Tangga Putar Outdoor Akses Dak", category: "tangga", categoryLabel: "Tangga", src: "/assets/images/asset_12_3-600x450.jpg", location: "Parongpong, Bandung Barat" },
  { id: 5, title: "Kanopi Kaca Tempered Rumah Tinggal", category: "kanopi", categoryLabel: "Kanopi", src: "/assets/images/asset_6_7-600x450.jpg", location: "Kotabaru Parahyangan, Bandung Barat" },
  { id: 6, title: "Pagar Minimalis Woodplank GRC", category: "pagar", categoryLabel: "Pagar", src: "/assets/images/asset_6_2-600x450.jpg", location: "Batujajar, Bandung Barat" },
  { id: 7, title: "Struktur Mezanin Rangka Baja WF", category: "konstruksi", categoryLabel: "Konstruksi", src: "/assets/images/asset_30_12-600x450.jpg", location: "Cimareme, Bandung Barat" },
  { id: 8, title: "Railing Balkon Stainless & Kaca", category: "railing", categoryLabel: "Railing", src: "/assets/images/asset_42_Galeri-15-768x1024-459x555.jpg", location: "Cisarua, Bandung Barat" },
  { id: 9, title: "Pagar Gerbang Dorong Dua Arah", category: "pagar", categoryLabel: "Pagar", src: "/assets/images/asset_42_Galeri-14-768x1024-459x555.jpg", location: "Cililin, Bandung Barat" },
  { id: 10, title: "Kanopi Spandek Pasir Rangka Dobel", category: "kanopi", categoryLabel: "Kanopi", src: "/assets/images/asset_42_Galeri-13-768x1024-459x555.jpg", location: "Cipatat, Bandung Barat" },
  { id: 11, title: "Teralis Jendela Kotak Minimalis", category: "teralis", categoryLabel: "Teralis", src: "/assets/images/asset_48_Galeri-10-768x1024-459x555.jpg", location: "Cihampelas, Bandung Barat" },
  { id: 12, title: "Tangga Spiral Mezanin Kamar", category: "tangga", categoryLabel: "Tangga", src: "/assets/images/asset_48_Galeri-9-768x1024-459x555.jpg", location: "Lembang, Bandung Barat" },
  { id: 13, title: "Pintu Kawat Nyamuk Teralis Baja", category: "teralis", categoryLabel: "Teralis", src: "/assets/images/asset_48_Galeri-8-768x1024-459x555.jpg", location: "Padalarang, Bandung Barat" },
  { id: 14, title: "Kanopi Polycarbonate UV Protection", category: "kanopi", categoryLabel: "Kanopi", src: "/assets/images/asset_52_Galeri-4-768x1024-459x555.jpg", location: "Ngamprah, Bandung Barat" },
  { id: 15, title: "Pagar Lipat 4 Daun Minimalis", category: "pagar", categoryLabel: "Pagar", src: "/assets/images/asset_52_Galeri-3-768x1024-459x555.jpg", location: "Batujajar, Bandung Barat" },
  { id: 16, title: "Railing Void Tangga Melengkung", category: "railing", categoryLabel: "Railing", src: "/assets/images/asset_52_Galeri-2-768x1024-459x555.jpg", location: "Kotabaru Parahyangan, Bandung Barat" }
];

export const ARTICLES_DATA: ArticleItem[] = [
  {
    slug: "bengkel-las-stainless-steel-bandung-barat-terpercaya",
    title: "Bengkel Las Stainless Steel Terdekat di Bandung Barat: Tips Memilih Bahan SUS 304 Asli",
    date: "10 November 2024",
    readTime: "4 Menit Baca",
    author: "Tim Ahli Las Putra Iing Jaya",
    image: "/assets/images/asset_24_Bengkel-Las-Stainless-Steel-Te.jpg",
    excerpt: "Panduan lengkap mengenali perbedaan Stainless Steel SUS 304 vs SUS 201 agar railing dan pagar Anda tidak berkarat terkena cuaca dingin & hujan asam Bandung Barat.",
    tags: ["Stainless 304", "Railing Tangga", "Tips Material"],
    content: [
      "Banyak pemilik rumah di Bandung Barat mengeluhkan railing tangga atau pagar stainless mereka mulai timbul bercak karat setelah beberapa bulan pemasangan. Penyebab utamanya adalah penggunaan material Stainless Steel SUS 201 yang memiliki kadar nikel rendah sehingga tidak tahan terhadap perubahan cuaca ekstrem dan kelembaban tinggi di wilayah pegunungan Bandung Barat.",
      "Di Bengkel Las Putra Iing Jaya Bandung Barat, kami selalu mewajibkan penggunaan pipa Stainless Steel SUS 304 asli standar food grade dan arsitektural. Ciri utama SUS 304 adalah sifat non-magnetik (tidak menempel magnet) dan kandungan nikel minimal 8% yang memberikan ketahanan anti-korosi abadi seumur hidup.",
      "Selain material, teknik pengelasan sangat menentukan. Kami menggunakan pengelasan TIG Gas Argon murni untuk menghasilkan sambungan yang menyatu sempurna tanpa pori-pori mikroskopis yang bisa menjadi celah karat.",
      "Konsultasikan kebutuhan railing atau pagar stainless Anda bersama tim kami untuk mendapatkan kepastian bahan bersertifikat dan garansi tertulis."
    ]
  },
  {
    slug: "panduan-memilih-atap-kanopi-bandung-barat",
    title: "Jasa Pembuatan Kanopi Bandung Barat: Perbandingan Alderon, Kaca Tempered, & Spandek Pasir",
    date: "05 November 2024",
    readTime: "5 Menit Baca",
    author: "Tim Desain Eksterior",
    image: "/assets/images/asset_24_Jasa-pembuatan-kanopi.jpg",
    excerpt: "Simak kelebihan, kekurangan, dan estimasi biaya berbagai jenis atap kanopi carport untuk iklim sejuk dan curah hujan Bandung Barat.",
    tags: ["Kanopi Carport", "Atap Alderon", "Kaca Tempered"],
    content: [
      "Kanopi carport kini menjadi elemen fasad utama yang langsung dilihat saat tamu mengunjungi rumah Anda. Memilih material atap yang salah bisa membuat area teras bising saat hujan deras atau bocor.",
      "1. Atap Alderon Twinwall: Pilihan favorit keluarga Bandung Barat. Memiliki rongga udara yang efektif meredam panas dan tidak berisik saat hujan lebat. Tahan lama hingga belasan tahun tanpa pecah.",
      "2. Atap Kaca Tempered: Pilihan terbaik untuk villa di Lembang atau perumahan Kotabaru Parahyangan. Memberikan pencahayaan alami maksimal tanpa membuat rumah terkesan sempit. Dilengkapi film anti-UV.",
      "3. Atap Spandek Pasir: Solusi ekonomis yang efisien. Lapisan butiran pasir membantu memecah tetesan air hujan sehingga kebisingan jauh lebih berkurang dibandingkan spandek polos biasa.",
      "Di Bengkel Las Besi Bandung Barat, rangka kanopi selalu menggunakan besi hollow galvanis tebal yang dicat dasar epoxy primer dua komponen agar terbebas dari ancaman karat rangka."
    ]
  },
  {
    slug: "keunggulan-pagar-otomatis-sliding-remote-bandung-barat",
    title: "Bengkel Pintu Pagar Otomatis Modern Bandung Barat & Cimahi: Praktis & Aman",
    date: "28 Oktober 2024",
    readTime: "3 Menit Baca",
    author: "Spesialis Otomasi Gerbang",
    image: "/assets/images/asset_24_Bengkel-Pintu-Pagar-Otomatis.jpg",
    excerpt: "Mengapa sistem pintu pagar otomatis autogate kini menjadi standar baru keamanan rumah modern di area Bandung Barat?",
    tags: ["Pagar Otomatis", "Sliding Gate", "Smart Home"],
    content: [
      "Kepraktisan membuka pintu pagar dari dalam mobil saat hujan lebat tanpa perlu turun basah kuyup adalah alasan utama pemilik hunian memasang sistem gerbang otomatis (Autogate Sliding / Swing).",
      "Sistem gerbang otomatis modern dilengkapi dengan safety photocell sensor yang otomatis menghentikan gerakan motor apabila ada anak kecil, hewan peliharaan, atau kendaraan yang melintas di tengah pintu gerbang.",
      "Bagi Anda yang sudah memiliki pagar besi eksisting, kami juga melayani upgrade pemasangan motor rel sliding otomatis tanpa perlu merombak pagar lama.",
      "Hubungi Bengkel Las Putra Iing Jaya untuk survey kelayakan rel dan penawaran paket mesin autogate bergaransi resmi."
    ]
  }
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    name: "Ir. H. Dedi Kusnadi",
    role: "Pemilik Rumah Pribadi",
    location: "Kotabaru Parahyangan, Padalarang",
    rating: 5,
    comment: "Pengerjaan kanopi kaca tempered dan pagar laser cutting di rumah saya sangat presisi. Sambungan las halus, timnya sopan, datang survey tepat waktu, dan selesai sebelum deadline.",
    project: "Kanopi Kaca Tempered 10mm & Pagar Cutting"
  },
  {
    name: "Ibu Sinta Nurhaliza",
    role: "Owner Villa & Cafe",
    location: "Lembang, Bandung Barat",
    rating: 5,
    comment: "Pesan railing tangga stainless 304 dan tangga putar ke mezanin villa di Lembang. Hasilnya estetik banget, kokoh dinaiki tamu setiap hari, dan harganya sangat rasional dibanding bengkel lain di Bandung Barat.",
    project: "Railing Stainless & Tangga Putar Industrial"
  },
  {
    name: "Bpk. Rahmat Hidayat",
    role: "Kontraktor Perumahan",
    location: "Ngamprah, Bandung Barat",
    rating: 5,
    comment: "Sudah langganan untuk subkon besi di beberapa unit perumahan kami di Bandung Barat. Kualitas besi selalu jujur tebalnya sesuai spek SPK, tidak pernah dimainkan. Garansi dan after sales nya sangat bertanggung jawab.",
    project: "Kanopi Alderon & Pagar Minimalis 6 Unit"
  }
];

export const FAQS_DATA: FAQItem[] = [
  {
    question: "Apakah ada biaya untuk survey lokasi ke rumah di area Bandung Barat?",
    answer: "Survey lokasi, pengukuran akurat, dan konsultasi desain di seluruh wilayah Kabupaten Bandung Barat (Padalarang, Ngamprah, Lembang, Batujajar, Parongpong, dll.) serta Cimahi adalah 100% GRATIS tanpa kewajiban pemesanan langsung."
  },
  {
    question: "Bagaimana sistem garansi pengerjaan di Bengkel Las Putra Iing Jaya?",
    answer: "Kami memberikan garansi resmi tertulis selama 6 hingga 12 bulan untuk sambungan las struktur dan anti-kebocoran atap kanopi. Jika terjadi rembes atau kendala, tim kami akan datang langsung melakukan perbaikan gratis."
  },
  {
    question: "Apakah ketebalan besi dan keaslian stainless dijamin?",
    answer: "Sangat dijamin. Kami memberikan garansi bahan 100% asli sesuai SPK kesepakatan (Besi Hollow Galvanis SNI bukan pipa banci tipis, serta Stainless Steel SUS 304 non-magnetik anti-karat). Anda bebas memeriksa bahan sebelum kami pasang."
  },
  {
    question: "Berapa lama estimasi waktu pengerjaan proyek?",
    answer: "Untuk kanopi atau pagar standar rata-rata memakan waktu 4 - 7 hari kerja fabrikasi di workshop kami, kemudian perakitan dan pemasangan di lokasi biasanya hanya memakan waktu 1 hari sehingga tidak mengganggu aktivitas keluarga."
  },
  {
    question: "Bagaimana skema pembayaran dan tahapan pengerjaan?",
    answer: "Setelah survey dan RAB disetujui, pembayaran dibagi menjadi DP (Uang Muka) untuk pengadaan material sebesar 40-50%, termin saat bahan siap dipasang, dan pelunasan 100% setelah pengerjaan selesai serta Anda puas dengan hasilnya."
  }
];
