export interface ResumeData {
  photo?: string;
  contact?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  summary?: string;
  experience?: {
    company?: string;
    role?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    bullets?: string[];
  }[];
  education?: {
    school?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
  }[];
  skills?: { category?: string; items?: string[] }[];
  projects?: { name?: string; description?: string; bullets?: string[]; link?: string; image?: string }[];
  certifications?: { name?: string; issuer?: string; date?: string; link?: string; image?: string }[] | string[];
}

export interface TemplateProps {
  resume: ResumeData;
  accent?: string;
  density?: "comfortable" | "compact";
}

export const ACCENT_PRESETS = [
  { name: "Blue", value: "#2255D8" },
  { name: "Cyan", value: "#0EA5C4" },
  { name: "Indigo", value: "#4C4FE0" },
  { name: "Slate", value: "#3C4C6B" },
  { name: "Teal", value: "#0F9E8E" },
  { name: "Berry", value: "#B23A6B" },
];
