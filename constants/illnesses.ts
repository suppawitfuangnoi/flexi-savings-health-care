/**
 * constants/illnesses.ts
 * Static data tables for the Flexi health scenario builder.
 * Illness lists, hospital tiers, display styles, and care categories.
 */
import type { Illness, Hospital, CareCategory, OtherCareKey, CareInfoEntry, AestheticClinic } from '~/types'

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
  RASH:        `<circle cx="12" cy="12" r="10"/><path d="M8 9h.01M12 7h.01M16 9h.01M8 15h.01M12 17h.01M16 15h.01M10 12h.01M14 12h.01"/>`,
  DIZZY:       `<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/><path d="M9 9h.01M15 15h.01"/>`,
  EAR:         `<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 0 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 0 4 0"/>`,
  DUMBBELL:    `<line x1="6" y1="12" x2="18" y2="12"/><line x1="6" y1="8" x2="6" y2="16"/><line x1="18" y1="8" x2="18" y2="16"/><circle cx="3" cy="12" r="2"/><circle cx="21" cy="12" r="2"/>`,
  SHIELD_PLUS: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>`,
  SYRINGE:     `<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>`,
  LEAF:        `<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>`,
  SPARKLE:     `<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/>`,
  REHAB:       `<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>`,
  TOOTH:       `<path d="M12 5.5C10.5 3 7 3 5 5c-2 2-2 4.5-2 6 0 3 1.5 5.5 3.5 6.5.8.4 1.7.4 2.5 0l3-1 3 1c.8.4 1.7.4 2.5 0 2-1 3.5-3.5 3.5-6.5 0-1.5 0-4-2-6-2-1.5-5.5-1.5-6 .5z"/>`,
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

// ─── Care category illness lists ──────────────────────────────────────────────

// 1. Proactive Care — สร้างความแข็งแรง
export const PROACTIVE_GENERAL: Illness[] = [
  { name: 'โภชนาการ / ซัปพลีเมนต์',     en: 'Personalized Nutrition',      min: 3_000,  max: 20_000,  popular: true,  icon: IC.ACTIVITY  },
  { name: 'ตรวจ DNA โภชนาการ',           en: 'Nutrigenomics / DNA Test',    min: 8_000,  max: 25_000,                  icon: IC.ACTIVITY  },
  { name: 'โปรแกรมจัดการน้ำหนัก',       en: 'Weight Management Program',   min: 10_000, max: 50_000,  popular: true,  icon: IC.ACTIVITY  },
  { name: 'Personal Trainer',             en: 'Personal Trainer (Sport Med)',min: 12_000, max: 60_000,                  icon: IC.DUMBBELL  },
  { name: 'โยคะ / พิลาทีส',              en: 'Yoga / Pilates',              min: 6_000,  max: 30_000,  popular: true,  icon: IC.ACTIVITY  },
  { name: 'ป้องกันออฟฟิศซินโดรม',       en: 'Office Syndrome Prevention',  min: 3_000,  max: 20_000,  popular: true,  icon: IC.SPINE     },
  { name: 'สุขภาพจิต / Mindfulness',     en: 'Stress & Burnout Program',    min: 5_000,  max: 25_000,  popular: true,  icon: IC.BRAIN     },
  { name: 'คลินิกการนอนหลับ',            en: 'Sleep Hygiene Clinic',        min: 5_000,  max: 30_000,                  icon: IC.BRAIN     },
  { name: 'Wellness Retreat',             en: 'Wellness Retreat',            min: 15_000, max: 80_000,                  icon: IC.LEAF      },
  { name: 'ป้องกันกล้ามเนื้อลีบ',        en: 'Anti-Frailty / Sarcopenia',   min: 10_000, max: 40_000,                  icon: IC.DUMBBELL  },
  { name: 'ฝึกสมองป้องกันสมองเสื่อม',    en: 'Cognitive Training',          min: 5_000,  max: 25_000,                  icon: IC.BRAIN     },
  { name: 'กำหนดเอง',                     en: 'Custom',                      min: 0,      max: 0,                       icon: IC.EDIT      },
]
export const PROACTIVE_CHILDREN: Illness[] = [
  { name: 'โภชนาการเด็ก / แก้เลือกกิน', en: 'Child Nutrition Guidance',    min: 2_000,  max: 10_000,  popular: true,  icon: IC.ACTIVITY  },
  { name: 'ติดตามการเจริญเติบโต',         en: 'Growth Monitoring',           min: 500,    max: 3_000,   popular: true,  icon: IC.ACTIVITY  },
  { name: 'กิจกรรม IQ / EQ',             en: 'IQ / EQ Development',         min: 5_000,  max: 30_000,  popular: true,  icon: IC.BRAIN     },
  { name: 'ดนตรี / ศิลปะ',               en: 'Music / Art Class',           min: 5_000,  max: 25_000,  popular: true,  icon: IC.ZAP       },
  { name: 'เรียนว่ายน้ำ',                en: 'Swimming Class',              min: 3_000,  max: 15_000,  popular: true,  icon: IC.DROP      },
  { name: 'กีฬา (ฟุตบอล / บาส)',         en: 'Sports Class',                min: 5_000,  max: 20_000,  popular: true,  icon: IC.DUMBBELL  },
  { name: 'ปรับบุคลิก / ป้องกันกระดูกคด', en: 'Posture & Spine Training',  min: 2_000,  max: 10_000,  popular: true,  icon: IC.SPINE     },
  { name: 'โปรแกรมลดจอ / Screen Camp',   en: 'Screen-Time Program',         min: 5_000,  max: 20_000,  popular: true,  icon: IC.ALERT     },
  { name: 'ค่ายเยาวชน / ค่ายธรรมชาติ',   en: 'Youth / Nature Camp',         min: 3_000,  max: 15_000,                  icon: IC.LEAF      },
  { name: 'กำหนดเอง',                     en: 'Custom',                      min: 0,      max: 0,                       icon: IC.EDIT      },
]

// 2. Preventive Care — ยับยั้งโรค
export const PREVENTIVE_GENERAL: Illness[] = [
  { name: 'ตรวจสุขภาพประจำปี',           en: 'Annual Health Checkup',       min: 3_000,  max: 15_000,  popular: true,  icon: IC.ACTIVITY  },
  { name: 'ตรวจ Metabolic (HbA1c/ไขมัน)',en: 'Metabolic Screening',         min: 2_000,  max: 10_000,  popular: true,  icon: IC.ACTIVITY  },
  { name: 'คัดกรองมะเร็งเชิงลึก',        en: 'Advanced Cancer Screening',   min: 10_000, max: 50_000,  popular: true,  icon: IC.RIBBON    },
  { name: 'ตรวจหัวใจ / Calcium Score',    en: 'Cardiovascular Risk Check',   min: 5_000,  max: 20_000,                  icon: IC.HEART     },
  { name: 'AI ตรวจจอประสาทตา',           en: 'AI Retinal Health Scan',      min: 2_000,  max: 8_000,                   icon: IC.EYE       },
  { name: 'ตรวจฮอร์โมน (วัยทอง/ผู้ชาย)', en: 'Hormone Balance Check',      min: 3_000,  max: 15_000,                  icon: IC.ACTIVITY  },
  { name: 'ตรวจความหนาแน่นกระดูก',       en: 'Bone Density Scan',           min: 2_000,  max: 8_000,                   icon: IC.BONE      },
  { name: 'ตรวจการได้ยิน',               en: 'Hearing Screening',           min: 500,    max: 3_000,                   icon: IC.EAR       },
  { name: 'วัคซีนไข้หวัดใหญ่ 4 สาย',    en: 'Quad Influenza Vaccine',      min: 500,    max: 2_000,   popular: true,  icon: IC.SYRINGE   },
  { name: 'วัคซีน HPV',                  en: 'HPV Vaccine',                 min: 3_000,  max: 12_000,  popular: true,  icon: IC.SYRINGE   },
  { name: 'วัคซีนงูสวัด (Shingles)',      en: 'Shingles Vaccine',            min: 3_000,  max: 8_000,                   icon: IC.SYRINGE   },
  { name: 'ตรวจสายตา / แว่น',           en: 'Eye Checkup / Glasses',       min: 1_000,  max: 8_000,   popular: true,  icon: IC.EYE       },
  { name: 'ขูดหินปูน / ทำฟัน',           en: 'Dental Cleaning',             min: 1_500,  max: 8_000,   popular: true,  icon: IC.TOOTH     },
  { name: 'กำหนดเอง',                     en: 'Custom',                      min: 0,      max: 0,                       icon: IC.EDIT      },
]
export const PREVENTIVE_CHILDREN: Illness[] = [
  { name: 'วัคซีนพื้นฐาน (EPI)',         en: 'Basic EPI Vaccine',           min: 500,    max: 3_000,   popular: true,  icon: IC.SYRINGE   },
  { name: 'วัคซีน RSV',                  en: 'RSV Vaccine',                 min: 3_000,  max: 8_000,   popular: true,  icon: IC.WIND      },
  { name: 'วัคซีนไข้เลือดออก',           en: 'Dengue Vaccine',              min: 3_000,  max: 6_000,   popular: true,  icon: IC.DROP      },
  { name: 'วัคซีนอีสุกอีใส',             en: 'Chickenpox Vaccine',          min: 1_000,  max: 3_000,   popular: true,  icon: IC.SYRINGE   },
  { name: 'วัคซีน HPV (อายุ 9+ ปี)',     en: 'HPV Vaccine (Child 9+)',      min: 3_000,  max: 12_000,                  icon: IC.SYRINGE   },
  { name: 'ตรวจสายตา / การได้ยิน',      en: 'Vision & Hearing Screen',     min: 500,    max: 3_000,   popular: true,  icon: IC.EYE       },
  { name: 'ตรวจซีด / ขาดธาตุเหล็ก',     en: 'Anemia & Iron Screening',     min: 300,    max: 2_000,   popular: true,  icon: IC.ACTIVITY  },
  { name: 'ตรวจหาพยาธิ',                en: 'Parasite Screening',          min: 300,    max: 1_500,   popular: true,  icon: IC.VIRUS     },
  { name: 'ตรวจพัฒนาการเด็ก',           en: 'Developmental Screening',     min: 1_000,  max: 5_000,   popular: true,  icon: IC.BRAIN     },
  { name: 'เคลือบหลุมร่องฟัน / ฟลูออไรด์', en: 'Dental Sealants & Fluoride', min: 1_000, max: 5_000, popular: true,  icon: IC.TOOTH     },
  { name: 'ทันตกรรมเด็ก',               en: 'Child Dental Checkup',        min: 1_000,  max: 8_000,   popular: true,  icon: IC.TOOTH     },
  { name: 'กำหนดเอง',                     en: 'Custom',                      min: 0,      max: 0,                       icon: IC.EDIT      },
]

// 3. Restorative Care — ฟื้นฟู
export const RESTORATIVE_GENERAL: Illness[] = [
  { name: 'กายภาพบำบัด',                 en: 'Physical Therapy',            min: 3_000,  max: 30_000,  popular: true,  icon: IC.BONE      },
  { name: 'ฟื้นฟูอาการปวดเรื้อรัง (Shockwave)', en: 'Pain Management / Shockwave', min: 5_000, max: 30_000, popular: true, icon: IC.ZAP },
  { name: 'Sport Injury Rehab',           en: 'Sport Injury Rehabilitation', min: 5_000,  max: 40_000,  popular: true,  icon: IC.DUMBBELL  },
  { name: 'ฟื้นฟูหลังผ่าตัด',            en: 'Post-Surgery Rehab',          min: 10_000, max: 50_000,  popular: true,  icon: IC.REHAB     },
  { name: 'ฟื้นฟูอัมพฤกษ์ / Stroke',    en: 'Post-Stroke Rehabilitation',  min: 20_000, max: 150_000,                 icon: IC.BRAIN     },
  { name: 'ฟื้นฟูหัวใจ / Long Covid',    en: 'Cardiac & Pulmonary Rehab',   min: 15_000, max: 80_000,  popular: true,  icon: IC.LUNGS     },
  { name: 'การนวดบำบัด',                 en: 'Therapeutic Massage',         min: 2_000,  max: 12_000,  popular: true,  icon: IC.ACTIVITY  },
  { name: 'IV Drip Therapy (วิตามิน)',    en: 'IV Drip Vitamin Therapy',     min: 3_000,  max: 20_000,  popular: true,  icon: IC.DROP      },
  { name: 'ฟื้นฟูหลังคลอด',              en: 'Post-Partum Recovery',        min: 5_000,  max: 30_000,  popular: true,  icon: IC.HEART     },
  { name: 'โปรแกรม Detox / Ice Bath',    en: 'Detox / Ice Bath Recovery',   min: 5_000,  max: 30_000,                  icon: IC.DROP      },
  { name: 'จิตบำบัด / บำบัดหลังเจ็บป่วย', en: 'Psychotherapy / Post-Illness Counseling', min: 5_000, max: 30_000, icon: IC.BRAIN },
  { name: 'ฟื้นฟูหลังมะเร็ง',            en: 'Post-Cancer Rehab',           min: 20_000, max: 100_000,                 icon: IC.RIBBON    },
  { name: 'กำหนดเอง',                     en: 'Custom',                      min: 0,      max: 0,                       icon: IC.EDIT      },
]
export const RESTORATIVE_CHILDREN: Illness[] = [
  { name: 'กายภาพบำบัดเด็ก',             en: 'Pediatric Physical Therapy',  min: 3_000,  max: 20_000,  popular: true,  icon: IC.BONE      },
  { name: 'กิจกรรมบำบัด (OT)',           en: 'Occupational Therapy',        min: 3_000,  max: 15_000,  popular: true,  icon: IC.HAND      },
  { name: 'Sensory Integration (SI)',     en: 'Sensory Integration Therapy', min: 3_000,  max: 20_000,  popular: true,  icon: IC.HAND      },
  { name: 'ฟื้นฟูหลังไข้เลือดออก',      en: 'Dengue Recovery',             min: 5_000,  max: 25_000,  popular: true,  icon: IC.REHAB     },
  { name: 'ฟื้นฟูหลังปอดอักเสบ / RSV',  en: 'Post-Respiratory Rehab',      min: 5_000,  max: 30_000,  popular: true,  icon: IC.LUNGS     },
  { name: 'ฟื้นฟูหลังผ่าตัดเด็ก',       en: 'Post-Surgery Rehab (Child)',  min: 8_000,  max: 40_000,                  icon: IC.SPINE     },
  { name: 'การพูดบำบัด',                 en: 'Speech Therapy',              min: 3_000,  max: 15_000,  popular: true,  icon: IC.BRAIN     },
  { name: 'โปรแกรม ADHD / สมาธิสั้น',   en: 'ADHD Program',                min: 5_000,  max: 30_000,  popular: true,  icon: IC.BRAIN     },
  { name: 'กระตุ้นพัฒนาการ',             en: 'Developmental Therapy',       min: 3_000,  max: 15_000,  popular: true,  icon: IC.ZAP       },
  { name: 'บำบัดจิตใจเด็ก / Trauma',    en: 'Child Psychology / Trauma',   min: 3_000,  max: 20_000,                  icon: IC.BRAIN     },
  { name: 'กำหนดเอง',                     en: 'Custom',                      min: 0,      max: 0,                       icon: IC.EDIT      },
]

// 4. Aesthetics Care — ความงาม
export const AESTHETICS_GENERAL: Illness[] = [
  { name: 'จัดฟัน (Braces)',              en: 'Orthodontics / Braces',       min: 30_000, max: 200_000, popular: true,  icon: IC.TOOTH     },
  { name: 'ฟอกสีฟัน',                    en: 'Teeth Whitening',             min: 3_000,  max: 15_000,  popular: true,  icon: IC.TOOTH     },
  { name: 'เลเซอร์ผิว / ลดเม็ดสี',      en: 'Laser Skin / Pigmentation',   min: 5_000,  max: 30_000,  popular: true,  icon: IC.SPARKLE   },
  { name: 'Botox / ฟิลเลอร์ (Prejuvenation)', en: 'Botox / Filler',         min: 5_000,  max: 30_000,  popular: true,  icon: IC.SPARKLE   },
  { name: 'Ultherapy / Hifu (ยกกระชับ)',  en: 'Skin Lifting (Ultherapy)',    min: 15_000, max: 80_000,                  icon: IC.SPARKLE   },
  { name: 'IV Skin Boost (วิตามินผิว)',   en: 'IV Skin Vitamin Boost',       min: 3_000,  max: 15_000,  popular: true,  icon: IC.DROP      },
  { name: 'รักษาสิว / ฟื้นฟูผิว',       en: 'Acne & Skin Rehab',           min: 3_000,  max: 20_000,  popular: true,  icon: IC.RASH      },
  { name: 'ป้องกันริ้วรอย / Anti-Aging',  en: 'Anti-Aging Program',          min: 5_000,  max: 25_000,  popular: true,  icon: IC.SPARKLE   },
  { name: 'ลดไขมันเฉพาะจุด (CoolSculpting)', en: 'Body Contouring',          min: 15_000, max: 60_000,                  icon: IC.SPARKLE   },
  { name: 'ปลูกผม / Hair Transplant',    en: 'Hair Transplant',             min: 50_000, max: 200_000,                 icon: IC.ZAP       },
  { name: 'PRP บำรุงรากผม',              en: 'Scalp Rejuvenation / PRP',    min: 8_000,  max: 40_000,                  icon: IC.ZAP       },
  { name: 'ปรับสมดุลฮอร์โมน',            en: 'Hormone Balance Aesthetics',  min: 5_000,  max: 20_000,                  icon: IC.ACTIVITY  },
  { name: 'กำหนดเอง',                     en: 'Custom',                      min: 0,      max: 0,                       icon: IC.EDIT      },
]
export const AESTHETICS_CHILDREN: Illness[] = [
  { name: 'จัดฟันเด็ก (Braces)',         en: 'Child Orthodontics',          min: 20_000, max: 150_000, popular: true,  icon: IC.TOOTH     },
  { name: 'ฟันผุ / อุดฟัน',              en: 'Cavity Filling',              min: 1_000,  max: 10_000,  popular: true,  icon: IC.TOOTH     },
  { name: 'ผ่าตัดเหงือก / ฟัน',          en: 'Gum / Dental Surgery',        min: 10_000, max: 50_000,                  icon: IC.SCISSORS  },
  { name: 'สกินแคร์วัยรุ่น (ล้างหน้า/กันแดด)', en: 'Teen Skincare Routine', min: 2_000, max: 10_000,  popular: true,  icon: IC.RASH      },
  { name: 'รักษาสิววัยรุ่น',             en: 'Teen Acne Treatment',         min: 3_000,  max: 15_000,  popular: true,  icon: IC.RASH      },
  { name: 'ลบรอยแผลเป็น (เลเซอร์)',      en: 'Scar Treatment (Laser)',      min: 5_000,  max: 30_000,  popular: true,  icon: IC.SPARKLE   },
  { name: 'ตรวจสุขภาพหนังศีรษะ / รังแค', en: 'Scalp & Hair Health',         min: 2_000,  max: 8_000,                   icon: IC.ZAP       },
  { name: 'ป้องกันริ้วรอยรอบดวงตา (จอ)', en: 'Screen-Eye Skin Care',        min: 2_000,  max: 8_000,   popular: true,  icon: IC.EYE       },
  { name: 'กำหนดเอง',                     en: 'Custom',                      min: 0,      max: 0,                       icon: IC.EDIT      },
]

// ─── Care info content ────────────────────────────────────────────────────────

export const CARE_INFO: Record<OtherCareKey, CareInfoEntry> = {
  proactive: {
    concept: 'เน้นการปรับฐานรากของชีวิต (Lifestyle) เพื่อไม่ให้ร่างกายเสื่อมโทรมก่อนวัย และลดโอกาสเกิดโรคเรื้อรัง (NCDs)',
    groups: [
      { label: 'ทั่วไป', items: [
        { icon: IC.ACTIVITY, text: 'Personalized Nutrition — ปรึกษานักโภชนาการจัดอาหารเฉพาะบุคคลตามผลเลือดหรือพันธุกรรม' },
        { icon: IC.DUMBBELL, text: 'Exercise Prescription — ออกแบบการออกกำลังกายโดยแพทย์เวชศาสตร์การกีฬา (Sport Medicine)' },
        { icon: IC.BRAIN,    text: 'Sleep Hygiene Clinic — วิเคราะห์และปรับพฤติกรรมการนอนเพื่อเพิ่มประสิทธิภาพการซ่อมแซมร่างกาย' },
        { icon: IC.BRAIN,    text: 'Stress Management — โปรแกรมฝึกสมาธิหรือบำบัดความเครียดเพื่อป้องกัน Burnout' },
        { icon: IC.ACTIVITY, text: 'Weight Management Program — ปรับพฤติกรรมคุมน้ำหนักระยะยาวโดยทีมสหวิชาชีพ' },
      ]},
      { label: 'คนวัยทำงาน', items: [
        { icon: IC.SPINE,    text: 'Office Syndrome Prevention — ปรับสรีระการทำงานและยืดเหยียดเพื่อป้องกันพังผืด' },
        { icon: IC.BRAIN,    text: 'Mental Wellness — ปรึกษาจิตแพทย์หรือนักจิตวิทยาเพื่อจัดการภาวะ Burnout จากงาน' },
        { icon: IC.ACTIVITY, text: 'Nutrigenomics — ตรวจรหัสพันธุกรรมเพื่อจัดวิตามินและอาหารเสริมเฉพาะบุคคล' },
      ]},
      { label: 'คนสูงอายุ', items: [
        { icon: IC.DUMBBELL, text: 'Anti-Frailty Program — ออกกำลังกายเพิ่มมวลกล้ามเนื้อ (Sarcopenia) เพื่อป้องกันการหกล้ม' },
        { icon: IC.BRAIN,    text: 'Dementia Prevention — กิจกรรมฝึกสมอง (Cognitive Training) ป้องกันอัลไซเมอร์' },
        { icon: IC.LEAF,     text: 'Mediterranean Diet — ปรับอาหารเน้นบำรุงสมอง หัวใจ และลดการอักเสบของข้อต่อ' },
      ]},
      { label: 'เด็ก 1–15 ปี', items: [
        { icon: IC.ACTIVITY, text: 'Nutritional Guidance — ปรึกษาโภชนาการแก้ปัญหาเด็กเลือกกิน และป้องกันภาวะอ้วนในเด็ก' },
        { icon: IC.ACTIVITY, text: 'Growth Monitoring — ติดตามความสูงและน้ำหนักตามเกณฑ์ (ป้องกันภาวะเตี้ยหรือเป็นสาวก่อนวัย)' },
        { icon: IC.BRAIN,    text: 'IQ & EQ Development — กิจกรรมส่งเสริมทักษะทางอารมณ์ สังคม และการเรียนรู้ตามช่วงวัย' },
        { icon: IC.SPINE,    text: 'Posture & Physical Activity — ส่งเสริมการเล่นกีฬาและปรับบุคลิก (ป้องกันกระดูกสันหลังคดจากติดจอ)' },
      ]},
    ],
  },
  preventive: {
    concept: 'เน้นการหาความผิดปกติในระดับที่มองไม่เห็นด้วยตาเปล่า เพื่อหยุดยั้งโรคตั้งแต่ระยะที่ยังรักษาหายขาดได้ง่าย',
    groups: [
      { label: 'ทั่วไป', items: [
        { icon: IC.RIBBON,   text: 'Advanced Screening — ตรวจคัดกรองมะเร็งระดับลึก (ส่องกล้องลำไส้ใหญ่, CT Scan ปอด, Digital Mammogram)' },
        { icon: IC.ACTIVITY, text: 'Genomic Testing — ตรวจรหัสพันธุกรรมเพื่อดูความเสี่ยงโรคที่ถ่ายทอดทางสายเลือด' },
        { icon: IC.HEART,    text: 'Cardiovascular Risk Assessment — ตรวจแคลเซียมในหลอดเลือดหัวใจ (Calcium Score)' },
        { icon: IC.SYRINGE,  text: 'Immunization Center — บริการวัคซีนครบวงจร (HPV, ไข้หวัดใหญ่ 4 สายพันธุ์, งูสวัด, ปอดอักเสบ)' },
        { icon: IC.ACTIVITY, text: 'Hormone Balance Check — ตรวจระดับฮอร์โมนเพื่อเตรียมรับมือกับภาวะวัยทอง' },
      ]},
      { label: 'คนวัยทำงาน', items: [
        { icon: IC.ACTIVITY, text: 'Metabolic Screening — ตรวจคัดกรองไขมัน พอกตับ และระดับน้ำตาลสะสม (HbA1c)' },
        { icon: IC.RIBBON,   text: 'Early Cancer Screen — ตรวจมะเร็งเต้านม/ปากมดลูก (สตรี) หรือสมรรถภาพปอดในผู้สูบบุหรี่' },
        { icon: IC.HEART,    text: 'Heart Check-up — ตรวจ Calcium Score ดูหินปูนในหลอดเลือดหัวใจ' },
      ]},
      { label: 'คนสูงอายุ', items: [
        { icon: IC.BONE,     text: 'Bone Density Test — ตรวจความหนาแน่นมวลกระดูก ป้องกันกระดูกพรุนและหักง่าย' },
        { icon: IC.EYE,      text: 'Sensory Screening — ตรวจการได้ยินและสายตา (ต้อกระจก/ต้อหิน) เพื่อลดอุบัติเหตุ' },
        { icon: IC.SYRINGE,  text: 'Shingles & Pneumonia Vaccine — ฉีดวัคซีนป้องกันงูสวัดและปอดอักเสบซึ่งอันตรายสูงในวัยนี้' },
      ]},
      { label: 'เด็ก 1–15 ปี', items: [
        { icon: IC.SYRINGE,  text: 'Vaccination Program — วัคซีนเสริม เช่น ไข้เลือดออก, อีสุกอีใส, HPV (ฉีดได้ตั้งแต่อายุ 9 ปีขึ้นไป)' },
        { icon: IC.EYE,      text: 'Vision & Hearing Screen — ตรวจสายตา (สั้น/เอียง) และการได้ยิน เพื่อไม่ให้กระทบการเรียน' },
        { icon: IC.TOOTH,    text: 'Dental Sealants & Fluoride — เคลือบหลุมร่องฟันและฟลูออไรด์ ป้องกันฟันผุ' },
        { icon: IC.ACTIVITY, text: 'Anemia & Parasite Screen — ตรวจคัดกรองภาวะซีดจากขาดธาตุเหล็ก และตรวจหาพยาธิ' },
      ]},
    ],
  },
  restorative: {
    concept: 'เน้นการเยียวยาอวัยวะที่บาดเจ็บหรือเสื่อมถอย ให้กลับมาทำหน้าที่ได้ใกล้เคียงเดิมมากที่สุด',
    groups: [
      { label: 'ทั่วไป', items: [
        { icon: IC.BRAIN,    text: 'Post-Stroke Rehabilitation — ฟื้นฟูผู้ป่วยอัมพฤกษ์ด้วยหุ่นยนต์ช่วยเดิน (Robotic-assisted gait training)' },
        { icon: IC.LUNGS,    text: 'Cardiac & Pulmonary Rehab — ฟื้นฟูสมรรถภาพหัวใจและปอดหลังผ่าตัดหรือหลัง Long Covid' },
        { icon: IC.ZAP,      text: 'Pain Management — ระงับปวดเรื้อรังด้วยคลื่นกระแทก (Shockwave) หรือเลเซอร์พลังงานสูง' },
        { icon: IC.HAND,     text: 'Occupational Therapy — กิจกรรมบำบัดฝึกทักษะการใช้ชีวิตประจำวันให้กลับมาช่วยเหลือตัวเองได้' },
        { icon: IC.DROP,     text: 'Aesthetic & Regenerative Recovery — ใช้ Stem Cell หรือ PRP เพื่อฟื้นฟูข้อต่อหรือเนื้อเยื่อที่เสื่อม' },
      ]},
      { label: 'คนวัยทำงาน', items: [
        { icon: IC.BONE,     text: 'Ergonomic Rehab — กายภาพบำบัดรักษาปวดหลัง บ่า ไหล่ เรื้อรัง ด้วยไฟฟ้าหรือเลเซอร์' },
        { icon: IC.DROP,     text: 'IV Drip Therapy — ให้วิตามินทางสายน้ำเกลือเพื่อฟื้นฟูร่างกายจากความอ่อนเพลียสะสม' },
        { icon: IC.DUMBBELL, text: 'Sport Injury Rehab — ฟื้นฟูอาการบาดเจ็บจากการเล่นกีฬา (เช่น เอ็นไขว้หน้า, รองช้ำ)' },
      ]},
      { label: 'คนสูงอายุ', items: [
        { icon: IC.REHAB,    text: 'Fall Rehabilitation — ฝึกสมดุลการทรงตัวหลังหกล้ม เพื่อให้กลับมาเดินได้มั่นใจ' },
        { icon: IC.BRAIN,    text: 'Stroke Recovery — ฝึกพูดและกลืน (Speech Therapy) และกายภาพบำบัดซ้ำๆ เพื่อกู้คืนการเคลื่อนไหว' },
        { icon: IC.HEART,    text: 'Home Care Service — บริการฟื้นฟูถึงบ้านเพื่อให้ผู้สูงอายุคุ้นเคยกับสภาพแวดล้อมจริง' },
      ]},
      { label: 'เด็ก 1–15 ปี', items: [
        { icon: IC.ZAP,      text: 'Developmental Therapy — กระตุ้นพัฒนาการสำหรับเด็กที่พัฒนาการช้ากว่าวัย (การพูด, การเคลื่อนไหว)' },
        { icon: IC.HAND,     text: 'Sensory Integration (SI) — กิจกรรมบำบัดสำหรับเด็กที่มีปัญหาประมวลผลความรู้สึก หรือสมาธิสั้น (ADHD)' },
        { icon: IC.REHAB,    text: 'Post-Illness Recovery — ฟื้นฟูหลังเจ็บป่วยหนัก เช่น ไข้เลือดออก หรือทางเดินหายใจอักเสบรุนแรง' },
        { icon: IC.BRAIN,    text: 'Child Psychology — บำบัดจิตใจหลังเหตุการณ์กระทบกระเทือน หรือมีปัญหาการปรับตัวที่โรงเรียน' },
      ]},
    ],
  },
  aesthetics: {
    concept: 'เน้นสร้างความมั่นใจและบุคลิกภาพที่ดี ส่งผลโดยตรงต่อสุขภาพจิตและคุณภาพชีวิต',
    groups: [
      { label: 'คนวัยทำงาน', items: [
        { icon: IC.DROP,     text: 'IV Skin Boost — เติมวิตามินผิวเพื่อลดความโทรมจากการพักผ่อนน้อย' },
        { icon: IC.ACTIVITY, text: 'Weight Management — โปรแกรมลดไขมันเฉพาะจุดด้วยเทคโนโลยี (เช่น CoolSculpting)' },
        { icon: IC.SPARKLE,  text: 'Prejuvenation (Botox/Filler) — ฉีดในปริมาณน้อยเพื่อป้องกันริ้วรอยร่องลึกก่อนที่จะเกิด' },
        { icon: IC.SPARKLE,  text: 'Laser Treatment — เลเซอร์ลดเม็ดสี ป้องกันฝ้า กระ จากแสงแดดและหน้าจอคอม' },
        { icon: IC.SPARKLE,  text: 'Skin Rejuvenation — ยกกระชับ (Ultherapy/Hifu) ฟื้นฟูใบหน้าที่หย่อนคล้อยจากความเครียด' },
        { icon: IC.ZAP,      text: 'Hair Transplant — ปลูกผมถาวรสำหรับผู้มีปัญหาหัวล้านกรรมพัน' },
      ]},
      { label: 'คนสูงอายุ', items: [
        { icon: IC.LEAF,     text: 'Anti-Aging Nutrition — อาหารชะลอวัย เน้นสารต้านอนุมูลอิสระเพื่อผิวพรรณจากภายใน' },
        { icon: IC.ACTIVITY, text: 'Hormone Balance — ปรับสมดุลฮอร์โมนเพื่อคืนความสดใสและชะลอความเสื่อมของผิว' },
        { icon: IC.EYE,      text: 'Drooping Eye Prevention — ยกกระชับหนังตาที่หย่อนคล้อยเพื่อทัศนวิสัยและการมองเห็น' },
        { icon: IC.ZAP,      text: 'Scalp Rejuvenation — ฉีด PRP หรือบำรุงรากผมป้องกันปัญหาผมบางตามวัย' },
        { icon: IC.SPARKLE,  text: 'Dermal Fillers — เติมเต็มร่องลึกบนใบหน้าที่สูญเสียคอลลาเจนตามวัย' },
        { icon: IC.SCISSORS, text: 'Plastic Surgery — ผ่าตัดดึงหน้า (Face Lift) หรือแก้หนังตาตกเพื่อดูอ่อนเยาว์และมั่นใจ' },
      ]},
      { label: 'เด็กและวัยรุ่น', items: [
        { icon: IC.TOOTH,    text: 'จัดฟัน (Orthodontics) — ปรับโครงสร้างใบหน้าและการบดเคี้ยวตั้งแต่วัยเด็ก' },
        { icon: IC.RASH,     text: 'ดูแลผิวพรรณวัยรุ่น — ปรับพฤติกรรมการล้างหน้าและใช้กันแดดป้องกันสิวและฝ้าในอนาคต' },
        { icon: IC.ZAP,      text: 'ตรวจสุขภาพผมและหนังศีรษะ — ป้องกันผมร่วงหรือรังแคเรื้อรังจากฮอร์โมนวัยรุ่น' },
        { icon: IC.EYE,      text: 'Screen Time Management — ป้องกันริ้วรอยรอบดวงตาและสายตาเสียจากจ้องจอ' },
        { icon: IC.SPARKLE,  text: 'Scar Treatment — เลเซอร์ลบรอยแผลเป็นจากอุบัติเหตุหรืออีสุกอีใส' },
        { icon: IC.RASH,     text: 'Acne Rehab — ฟื้นฟูผิวจากสิวอักเสบเรื้อรังเพื่อป้องกันหลุมสิว' },
      ]},
    ],
  },
}

// ─── Care category config ─────────────────────────────────────────────────────

export interface CareCategoryConfig {
  key:         CareCategory
  label:       string
  labelEn:     string
  color:       string
  bgLight:     string
  icon:        string
  generalList: Illness[]
  childrenList: Illness[]
}

export const CARE_CATEGORIES: CareCategoryConfig[] = [
  { key: 'health',      label: 'สุขภาพ',           labelEn: 'Health',      color: '#004CB3', bgLight: '#E6EDF8', icon: IC.HEART,       generalList: ILLNESSES,           childrenList: CHILDREN_ILLNESSES  },
  { key: 'proactive',   label: 'สร้างความแข็งแรง',  labelEn: 'Proactive',   color: '#7C3AED', bgLight: '#F3F0FF', icon: IC.LEAF,        generalList: PROACTIVE_GENERAL,   childrenList: PROACTIVE_CHILDREN  },
  { key: 'preventive',  label: 'ยับยั้งโรค',         labelEn: 'Preventive',  color: '#0A8A4C', bgLight: '#F0FBF4', icon: IC.SHIELD_PLUS, generalList: PREVENTIVE_GENERAL,  childrenList: PREVENTIVE_CHILDREN },
  { key: 'restorative', label: 'ฟื้นฟู',            labelEn: 'Restorative', color: '#E67E22', bgLight: '#FFF8F0', icon: IC.REHAB,       generalList: RESTORATIVE_GENERAL, childrenList: RESTORATIVE_CHILDREN},
  { key: 'aesthetics',  label: 'ความงาม',           labelEn: 'Aesthetics',  color: '#D946A1', bgLight: '#FDF0F9', icon: IC.SPARKLE,     generalList: AESTHETICS_GENERAL,  childrenList: AESTHETICS_CHILDREN },
]

// ─── Aesthetic clinic list ────────────────────────────────────────────────────

export const AESTHETIC_CLINICS: AestheticClinic[] = [
  { name: 'APEX Medical Center',  tier: 'luxury'   },
  { name: 'Masterpiece Hospital', tier: 'luxury'   },
  { name: 'Yanhee Hospital',      tier: 'luxury'   },
  { name: 'Lelux Hospital',       tier: 'luxury'   },
  { name: 'V Square Clinic',      tier: 'premium'  },
  { name: 'SLC (Siam Laser)',     tier: 'premium'  },
  { name: 'Aura Bangkok Clinic',  tier: 'premium'  },
  { name: 'Sowon Clinic',         tier: 'premium'  },
  { name: 'Gangnam Clinic',       tier: 'premium'  },
  { name: 'Meko Clinic',          tier: 'standard' },
  { name: 'The Klinique',         tier: 'standard' },
  { name: 'Romrawin Clinic',      tier: 'standard' },
  { name: 'Nitipon Clinic',       tier: 'standard' },
  { name: 'Rajdhevee Clinic',     tier: 'standard' },
  { name: 'Pornkasem Clinic',     tier: 'standard' },
]
