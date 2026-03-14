export interface WebsiteData {
  pages: {
    home?: {
      hero: { headline: string; subheadline: string; cta_text: string; cta_target?: string; trust_badge?: string };
      features: { title: string; description: string; icon?: string }[];
      social_proof: { headline: string; testimonials: { name: string; text: string; rating: number }[] };
      cta_section: { headline: string; subheadline?: string; cta_text: string; urgency_text?: string };
    };
    about?: { headline: string; story: string; mission: string; values: { title: string; description: string }[]; team_headline?: string };
    products?: { headline: string; subheadline?: string; items: { name: string; description: string; price?: string; badge?: string; cta_text?: string }[] };
    contact?: { headline: string; subheadline?: string; email?: string; phone?: string; address?: string; form_fields: { label: string; type: string; placeholder?: string }[] };
    faq?: { headline: string; items: { question: string; answer: string }[] };
  };
  navigation: { label: string; page: string }[];
  footer: { copyright: string; links: { label: string; page: string }[] };
  meta: { title: string; description: string; primary_color?: string; accent_color?: string };
}

export interface WebsiteProject {
  id: string;
  user_id: string;
  brand_id: string | null;
  name: string;
  status: string;
  website_data: WebsiteData;
  color_scheme: string;
  selected_pages: string[];
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WebsiteWish {
  id: string;
  project_id: string;
  user_id: string;
  wish_text: string;
  target_page: string | null;
  target_section: string | null;
  status: string;
  result: unknown;
  created_at: string;
}

export const PAGE_OPTIONS = [
  { id: "home", label: "Startseite", desc: "Hero, Features, Testimonials, CTA", required: true },
  { id: "about", label: "Über uns", desc: "Story, Mission, Werte", required: false },
  { id: "products", label: "Produkte", desc: "Produktkarten mit Preisen", required: false },
  { id: "contact", label: "Kontakt", desc: "Formular & Kontaktdaten", required: false },
  { id: "faq", label: "FAQ", desc: "Häufige Fragen", required: false },
] as const;

export const COLOR_SCHEMES = [
  { value: "modern-dark", label: "Modern Dark", preview: "bg-[hsl(235,50%,15%)]" },
  { value: "clean-light", label: "Clean Light", preview: "bg-[hsl(0,0%,97%)]" },
  { value: "warm-natural", label: "Warm & Natural", preview: "bg-[hsl(30,30%,92%)]" },
  { value: "bold-accent", label: "Bold Accent", preview: "bg-[hsl(350,80%,50%)]" },
  { value: "luxury-minimal", label: "Luxury Minimal", preview: "bg-[hsl(0,0%,8%)]" },
] as const;

export const SECTION_BLOCKS = [
  { id: "hero", label: "Hero Banner", icon: "🎯", page: "home" },
  { id: "features", label: "Features Grid", icon: "⚡", page: "home" },
  { id: "testimonials", label: "Testimonials", icon: "⭐", page: "home" },
  { id: "cta", label: "Call-to-Action", icon: "🚀", page: "home" },
  { id: "story", label: "Gründergeschichte", icon: "📖", page: "about" },
  { id: "values", label: "Werte", icon: "💎", page: "about" },
  { id: "products", label: "Produkte", icon: "📦", page: "products" },
  { id: "contact-form", label: "Kontaktformular", icon: "✉️", page: "contact" },
  { id: "faq", label: "FAQ", icon: "❓", page: "faq" },
] as const;
