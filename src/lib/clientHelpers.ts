import crypto from 'crypto';

export interface ClientDTO {
  id: number;
  name: string;
  phone: string;
  email: string;
  projectName: string;
  projectCategory: string;
  projectStatus: string;
  progressPercentage: number;
  projectEstimate: string;
  location: string;
  notes: string;
  createdAt: string;
}

export interface ProjectStageStep {
  title: string;
  status: 'done' | 'active' | 'pending';
  desc: string;
}

export function normalizePhone(raw: string): string {
  return String(raw || '').replace(/[\s+\-().]/g, '').trim();
}

export function hashClientPassword(password: string): string {
  return crypto.createHash('sha256').update(String(password || '')).digest('hex');
}

export function isSha256Hex(val: string | null | undefined): boolean {
  return typeof val === 'string' && /^[a-f0-9]{64}$/i.test(val);
}

export function verifyClientPassword(
  inputPassword: string | undefined,
  storedPassword: string | null | undefined
): boolean {
  if (!storedPassword) return true;
  const candidate = String(inputPassword ?? '').trim();
  if (isSha256Hex(storedPassword)) {
    if (!candidate) return false;
    return hashClientPassword(candidate) === storedPassword.toLowerCase();
  }
  // Legacy seeded/demo accounts: allow either matching password or quick phone check when password field left empty
  return !candidate || candidate === storedPassword;
}

export function formatClientRow(row: Record<string, any>): ClientDTO {
  return {
    id: Number(row.id),
    name: String(row.name || ''),
    phone: String(row.phone || ''),
    email: String(row.email || ''),
    projectName: String(row.project_name || ''),
    projectCategory: String(row.project_category || ''),
    projectStatus: String(row.project_status || ''),
    progressPercentage: Math.min(100, Math.max(0, Number(row.progress_percentage) || 0)),
    projectEstimate: String(row.project_estimate || ''),
    location: String(row.location || ''),
    notes: String(row.notes || ''),
    createdAt: String(row.created_at || ''),
  };
}

export function buildProjectSteps(progressPercentage: number, location?: string): ProjectStageStep[] {
  const pct = Math.min(100, Math.max(0, Number(progressPercentage) || 0));
  const loc = location || 'Bandung Barat';

  const stageThresholds = [
    {
      title: 'Pendaftaran & Verifikasi Jadwal Survei',
      doneDesc: 'Akun member terverifikasi dan tim survey telah dijadwalkan',
      activeDesc: 'Menunggu konfirmasi jadwal survey pengukuran ke lokasi Anda',
    },
    {
      title: 'Desain & Kesepakatan RAB',
      doneDesc: 'Spesifikasi bahan, ukuran, dan harga disetujui',
      activeDesc: 'Penyusunan detail ukuran, desain, dan penawaran RAB',
    },
    {
      title: 'Fabrikasi & Pengelasan Workshop',
      doneDesc: 'Perakitan rangka & pengecatan anti-karat selesai',
      activeDesc: 'Sedang pengerjaan perakitan & pengelasan di workshop',
    },
    {
      title: 'Pemasangan Lapangan (Instalasi)',
      doneDesc: 'Instalasi & finishing di lokasi telah selesai',
      activeDesc: `Penjadwalan & pemasangan di lokasi (${loc})`,
    },
    {
      title: 'Serah Terima & Garansi Resmi',
      doneDesc: 'Proyek selesai 100% dan bergaransi resmi bengkel',
      activeDesc: 'Pengecekan akhir bersama pemilik rumah',
    },
  ];

  // Active stage index: 0 (<25%), 1 (25-49%), 2 (50-74%), 3 (75-99%), all done if 100%
  const activeIdx =
    pct >= 100 ? 5 : pct >= 75 ? 3 : pct >= 50 ? 2 : pct >= 25 ? 1 : 0;

  return stageThresholds.map((stage, idx) => {
    if (idx < activeIdx) {
      return { title: stage.title, status: 'done', desc: stage.doneDesc };
    }
    if (idx === activeIdx) {
      return { title: stage.title, status: 'active', desc: stage.activeDesc };
    }
    return { title: stage.title, status: 'pending', desc: stage.activeDesc };
  });
}

