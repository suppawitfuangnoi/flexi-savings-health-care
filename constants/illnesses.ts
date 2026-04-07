/**
 * constants/illnesses.ts
 * Static data tables for the Flexi health scenario builder.
 * Illness lists, hospital tiers, and their display styles.
 * Exact port of FlexiCalculatorModal.tsx illness/hospital data.
 */
import type { Illness, Hospital } from '~/types'

// ─── SVG icon path snippets (24×24 viewBox, stroke-based) ────────────────────

export const IC = {
  ACTIVITY: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
  THERMO:   `<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>`,
  ZAP:      `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  DROP:     `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>`,
  VIRUS:    `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>`,
  WIND:     `<path d="M9.59 4.59A2 2 0 1 1 11 8H2"/><path d="M10.59 19.41A2 2 0 1 0 14 16H2"/><path d="M15.73 3.73A2.5 2.5 0 1 1 19.5 12H2"/>`,
  HAND:     `<path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>`,
  SPINE:    `<path d="M12 2v20"/><path d="M8 6h8"/><path d="M7 10h10"/><path d="M8 14h8"/><path d="M9 18h6"/>`,
  BONE:     `<path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5l7-7z"/>`,
  LUNGS:    `<path d="M12 5v7"/><path d="M7 17.17V11a5 5 0 0 1 5-5 5 5 0 0 1 5 5v6.17"/><path d="M7 17.17A4 4 0 0 1 3 13V9a2 2 0 0 1 2-2h2"/><path d="M17 17.17A4 4 0 0 0 21 13V9a2 2 0 0 0-2-2h-2"/>`,
  ALERT:    `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  EYE:      `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
  HEART:    `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
  BRAIN:    `<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>`,
  RIBBON:   `<path d="M12 22l-4-4h8l-4 4z"/><path d="M12 11l-4-4 4-4 4 4-4 4z"/><path d="M12 11v3"/>`,
  SCISSORS: `<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>`,
  KIDNEY:   `<path d="M9 3a4 4 0 0 0-4 4c0 2.5 1.5 5.5 3 8s2 4 2 6a2 2 0 0 0 4 0c0-2 .5-3.5 2-6s3-5.5 3-8a4 4 0 0 0-4-4c-1.5 0-2.8.8-3.5 2A3.9 3.9 0 0 0 9 3z"/>`,
  EDIT:     `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`,
  RASH:     `<circle cx="12" cy="12" r="10"/><path d="M8 9h.01M12 7h.01M16 9h.01M8 15h.01M12 17h.01M16 15h.01M10 12h.01M14 12h.01"/>`,
  DIZZY:    `<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/><path d="M9 9h.01M15 15h.01"/>`,
  EAR:      `<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 0 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 0 4 0"/>`,
} as const

// ─── General illness list (38 named + กำหนดเอง = 39 total) ───────────────────

export const ILLNESSES: Illness[] = [
  // ── OPD / Minor ──────────────────────────────────────────────────────────────
  { name: 'โรคลมพิษ',                 en: 'Hives / Urticaria',       min: 300,     max: 5_000,     popular: true,  icon: IC.RASH     },
  { name: 'บ้านหมุน / เวียนศีรษะ',    en: 'Vertigo / Dizziness',     min: 500,     max: 8_000,                     icon: IC.DIZZY    },
  { name: 'ปวดท้องประจำเดือน',         en: 'Menstrual Pain',          min: 200,     max: 3_000,     popular: true,  icon: IC.ZAP      },
  { name: 'ท้องเสีย / อาหารเป็นพิษ',  en: 'Diarrhea / Food Poison',  min: 500,     max: 6_000,     popular: true,  icon: IC.DROP     },
  { name: 'ท้องเสียจากเชื้อไวรัส',     en: 'Viral Gastroenteritis',   min: 500,     max: 15_000,    popular: true,  icon: IC.VIRUS    },
  { name: 'ไมเกรน / ปวดหัว',          en: 'Migraine / Headache',     min: 500,     max: 8_000,     popular: true,  icon: IC.ZAP      },
  { name: 'ไข้หวัดใหญ่',              en: 'Influenza',               min: 300,     max: 4_000,     popular: true,  icon: IC.THERMO   },
  { name: 'RSV',                       en: 'RSV Infection',           min: 800,     max: 30_000,    popular: true,  icon: IC.WIND     },
  { name: 'Mycoplasma',                en: 'Mycoplasma Pneumonia',    min: 1_000,   max: 40_000,    popular: true,  icon: IC.VIRUS    },
  { name: 'มือเท้าปาก',                en: 'Hand Foot Mouth',         min: 500,     max: 25_000,    popular: true,  icon: IC.HAND     },
  { name: 'ปวดหลัง',                   en: 'Back Pain',               min: 1_000,   max: 15_000,    popular: true,  icon: IC.SPINE    },
  { name: 'ทอนซิลอักเสบ',              en: 'Tonsillitis',             min: 800,     max: 10_000,                    icon: IC.THERMO   },
  { name: 'กระเพาะอาหารอักเสบ',        en: 'Gastritis',               min: 1_000,   max: 15_000,                    icon: IC.DROP     },
  { name: 'กรดไหลย้อน',                en: 'GERD',                    min: 1_000,   max: 12_000,                    icon: IC.ACTIVITY },
  { name: 'ไซนัสอักเสบ',               en: 'Sinusitis',               min: 800,     max: 12_000,                    icon: IC.WIND     },
  { name: 'ติดเชื้อทางเดินปัสสาวะ',    en: 'UTI',                     min: 1_000,   max: 12_000,                    icon: IC.KIDNEY   },
  // ── IPD / Surgery ────────────────────────────────────────────────────────────
  { name: 'ไข้เลือดออก',              en: 'Dengue Fever',            min: 15_000,  max: 150_000,   popular: true,  icon: IC.DROP     },
  { name: 'ไส้ติ่งอักเสบ',            en: 'Appendicitis',            min: 30_000,  max: 150_000,   popular: true,  icon: IC.ALERT    },
  { name: 'กระดูกหัก',                en: 'Bone Fracture',           min: 20_000,  max: 80_000,    popular: true,  icon: IC.BONE     },
  { name: 'ปอดอักเสบ',                en: 'Pneumonia',               min: 20_000,  max: 80_000,                    icon: IC.LUNGS    },
  { name: 'ผ่าตัดคลอด',               en: 'C-Section',               min: 50_000,  max: 120_000,                   icon: IC.SCISSORS },
  { name: 'อุบัติเหตุ (รพ.)',          en: 'Accident (IPD)',          min: 30_000,  max: 200_000,   popular: true,  icon: IC.ALERT    },
  { name: 'เบาหวาน (นอนรพ.)',         en: 'Diabetes Admit',          min: 15_000,  max: 60_000,                    icon: IC.ACTIVITY },
  { name: 'ต้อกระจก',                 en: 'Cataract',                min: 30_000,  max: 80_000,                    icon: IC.EYE      },
  { name: 'นิ่วในไตและท่อไต',         en: 'Kidney Stones',           min: 30_000,  max: 250_000,                   icon: IC.KIDNEY   },
  { name: 'ต่อมลูกหมากโต',            en: 'BPH',                     min: 30_000,  max: 300_000,                   icon: IC.KIDNEY   },
  { name: 'หมอนรองกระดูกสันหลัง',     en: 'Disc Herniation',         min: 60_000,  max: 550_000,                   icon: IC.SPINE    },
  { name: 'นิ่วในถุงน้ำดี',            en: 'Gallstones',              min: 30_000,  max: 250_000,                   icon: IC.DROP     },
  { name: 'ข้อเสื่อม (เข่า/สะโพก)',   en: 'Joint Degeneration',      min: 100_000, max: 700_000,                   icon: IC.BONE     },
  // ── Critical / Cancer ────────────────────────────────────────────────────────
  { name: 'โรคหัวใจ / บายพาส',        en: 'Heart / Bypass',          min: 200_000, max: 800_000,                   icon: IC.HEART    },
  { name: 'หัวใจและหลอดเลือดสมอง',    en: 'Cardiac / Stroke',        min: 100_000, max: 1_500_000,                 icon: IC.BRAIN    },
  { name: 'ไตวาย (ล้างไต)',            en: 'Kidney Failure',          min: 100_000, max: 500_000,                   icon: IC.KIDNEY   },
  { name: 'มะเร็ง (เคมีบำบัด)',        en: 'Cancer Chemo',            min: 300_000, max: 1_500_000,                 icon: IC.RIBBON   },
  { name: 'มะเร็งตับ',                 en: 'Liver Cancer',            min: 150_000, max: 2_500_000,                 icon: IC.RIBBON   },
  { name: 'มะเร็งเต้านม',              en: 'Breast Cancer',           min: 150_000, max: 2_000_000,                 icon: IC.RIBBON   },
  { name: 'มะเร็งลำไส้ใหญ่และไส้ตรง', en: 'Colorectal Cancer',       min: 150_000, max: 2_000_000,                 icon: IC.RIBBON   },
  { name: 'มะเร็งปอด',                 en: 'Lung Cancer',             min: 200_000, max: 3_000_000,                 icon: IC.LUNGS    },
  // ── Custom ───────────────────────────────────────────────────────────────────
  { name: 'กำหนดเอง',                  en: 'Custom',                  min: 0,       max: 0,                         icon: IC.EDIT     },
]

// ─── Children illness list (19 named + กำหนดเอง = 20 total) ──────────────────

export const CHILDREN_ILLNESSES: Illness[] = [
  // ── OPD / Minor ──────────────────────────────────────────────────────────────
  { name: 'RSV',                       en: 'RSV Infection',           min: 800,    max: 30_000,   popular: true,  icon: IC.WIND   },
  { name: 'มือเท้าปาก',                en: 'Hand Foot Mouth',         min: 500,    max: 25_000,   popular: true,  icon: IC.HAND   },
  { name: 'Mycoplasma',                en: 'Mycoplasma Pneumonia',    min: 1_000,  max: 40_000,   popular: true,  icon: IC.VIRUS  },
  { name: 'ไข้หวัดใหญ่',              en: 'Influenza',               min: 300,    max: 4_000,    popular: true,  icon: IC.THERMO },
  { name: 'ท้องเสียจากเชื้อไวรัส',     en: 'Viral Gastroenteritis',   min: 500,    max: 15_000,   popular: true,  icon: IC.VIRUS  },
  { name: 'โรตาไวรัส',                 en: 'Rotavirus',               min: 500,    max: 20_000,   popular: true,  icon: IC.VIRUS  },
  { name: 'ทอนซิลอักเสบ',              en: 'Tonsillitis',             min: 800,    max: 10_000,   popular: true,  icon: IC.THERMO },
  { name: 'หูชั้นกลางอักเสบ',          en: 'Otitis Media',            min: 500,    max: 8_000,    popular: true,  icon: IC.EAR    },
  { name: 'ไซนัสอักเสบ',               en: 'Sinusitis',               min: 800,    max: 12_000,                   icon: IC.WIND   },
  { name: 'โรคลมพิษ',                  en: 'Hives / Urticaria',       min: 300,    max: 5_000,    popular: true,  icon: IC.RASH   },
  { name: 'ท้องเสีย / อาหารเป็นพิษ',  en: 'Diarrhea / Food Poison',  min: 500,    max: 6_000,    popular: true,  icon: IC.DROP   },
  // ── IPD ──────────────────────────────────────────────────────────────────────
  { name: 'อีสุกอีใส',                 en: 'Chickenpox',              min: 2_000,  max: 25_000,   popular: true,  icon: IC.RASH   },
  { name: 'ไข้เลือดออก',              en: 'Dengue Fever',            min: 15_000, max: 150_000,  popular: true,  icon: IC.DROP   },
  { name: 'ปอดอักเสบ',                en: 'Pneumonia',               min: 20_000, max: 80_000,   popular: true,  icon: IC.LUNGS  },
  { name: 'ไส้ติ่งอักเสบ',            en: 'Appendicitis',            min: 30_000, max: 150_000,                  icon: IC.ALERT  },
  { name: 'กระดูกหัก',                en: 'Bone Fracture',           min: 20_000, max: 80_000,   popular: true,  icon: IC.BONE   },
  { name: 'สมองอักเสบ',               en: 'Encephalitis',            min: 50_000, max: 300_000,                  icon: IC.BRAIN  },
  { name: 'หัด',                       en: 'Measles',                 min: 5_000,  max: 40_000,                   icon: IC.THERMO },
  { name: 'คางทูม',                    en: 'Mumps',                   min: 2_000,  max: 20_000,                   icon: IC.THERMO },
  // ── Custom ───────────────────────────────────────────────────────────────────
  { name: 'กำหนดเอง',                  en: 'Custom',                  min: 0,      max: 0,                        icon: IC.EDIT   },
]

// ─── Hospital tiers (6 hospitals — index 3 = Phyathai, matches default) ───────

export const HOSPITALS: Hospital[] = [
  { name: 'Bumrungrad International', short: 'Bumrungrad', tier: 'premium', pct: 0.92 },
  { name: 'Bangkok Hospital (BDMS)',  short: 'BDMS',       tier: 'premium', pct: 0.80 },
  { name: 'Samitivej Hospital',       short: 'Samitivej',  tier: 'upper',   pct: 0.65 },
  { name: 'Phyathai Hospital',        short: 'Phyathai',   tier: 'mid',     pct: 0.50 },
  { name: 'Paolo Memorial Hospital',  short: 'Paolo',      tier: 'mid',     pct: 0.38 },
  { name: 'Rajavithi Hospital',       short: 'Rajavithi',  tier: 'mid',     pct: 0.25 },
]

export const TIER_STYLE: Record<Hospital['tier'], { bg: string; color: string; label: string }> = {
  premium: { bg: '#FFF3E0', color: '#E67E22', label: 'Premium' },
  upper:   { bg: '#EBF0FA', color: '#2E5AAC', label: 'Upper'   },
  mid:     { bg: '#F5F5F5', color: '#666666', label: 'Mid'     },
}
