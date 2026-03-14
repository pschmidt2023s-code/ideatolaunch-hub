import { WebsiteData } from "./types";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PreviewRendererProps {
  data: WebsiteData;
  activePage: string;
  onNavigate: (p: string) => void;
  brandName: string;
  editingField: string | null;
  onFieldClick?: (fieldPath: string, currentValue: string) => void;
}

function EditableText({ path, value, editingField, onFieldClick, className, tag: Tag = "span" }: {
  path: string; value: string; editingField: string | null;
  onFieldClick?: (path: string, value: string) => void;
  className?: string; tag?: keyof JSX.IntrinsicElements;
}) {
  const isEditing = editingField === path;
  const Comp = Tag as any;
  return (
    <Comp
      className={cn(
        className,
        "cursor-pointer transition-all rounded px-0.5 -mx-0.5",
        onFieldClick && "hover:ring-1 hover:ring-accent/50 hover:bg-accent/5",
        isEditing && "ring-2 ring-accent bg-accent/10"
      )}
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onFieldClick?.(path, value); }}
      title="Klicken zum Bearbeiten"
    >
      {value}
    </Comp>
  );
}

export function PreviewRenderer({ data, activePage, onNavigate, brandName, editingField, onFieldClick }: PreviewRendererProps) {
  const page = data.pages[activePage as keyof typeof data.pages];
  if (!page) return <div className="p-8 text-center text-muted-foreground">Seite nicht gefunden</div>;

  return (
    <div className="text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3 bg-card">
        <span className="text-sm font-bold font-mono">{brandName}</span>
        <nav className="hidden sm:flex items-center gap-4">
          {data.navigation.map(nav => (
            <button key={nav.page} onClick={() => onNavigate(nav.page)}
              className={cn("text-xs transition-colors", activePage === nav.page ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground")}
            >{nav.label}</button>
          ))}
        </nav>
      </header>

      {activePage === "home" && data.pages.home && <HomePreview page={data.pages.home} editingField={editingField} onFieldClick={onFieldClick} />}
      {activePage === "about" && data.pages.about && <AboutPreview page={data.pages.about} editingField={editingField} onFieldClick={onFieldClick} />}
      {activePage === "products" && data.pages.products && <ProductsPreview page={data.pages.products} editingField={editingField} onFieldClick={onFieldClick} />}
      {activePage === "contact" && data.pages.contact && <ContactPreview page={data.pages.contact} editingField={editingField} onFieldClick={onFieldClick} />}
      {activePage === "faq" && data.pages.faq && <FaqPreview page={data.pages.faq} editingField={editingField} onFieldClick={onFieldClick} />}

      <footer className="border-t border-border bg-muted/30 px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          {data.footer.links?.map((link, i) => (
            <button key={i} onClick={() => onNavigate(link.page)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{link.label}</button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{data.footer.copyright}</p>
      </footer>
    </div>
  );
}

type EditProps = { editingField: string | null; onFieldClick?: (path: string, value: string) => void };

function HomePreview({ page, editingField, onFieldClick }: { page: NonNullable<WebsiteData["pages"]["home"]> } & EditProps) {
  return (
    <>
      <div className="bg-primary text-primary-foreground px-6 py-16 text-center space-y-4">
        {page.hero.trust_badge && <Badge className="bg-accent/20 text-accent border-accent/30">{page.hero.trust_badge}</Badge>}
        <EditableText path="pages.home.hero.headline" value={page.hero.headline} editingField={editingField} onFieldClick={onFieldClick} tag="h2" className="text-2xl sm:text-3xl font-bold font-display max-w-2xl mx-auto" />
        <EditableText path="pages.home.hero.subheadline" value={page.hero.subheadline} editingField={editingField} onFieldClick={onFieldClick} tag="p" className="text-base opacity-80 max-w-lg mx-auto" />
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2">{page.hero.cta_text}</Button>
      </div>
      <div className="px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {page.features.map((f, i) => (
            <div key={i} className="rounded-xl border border-border p-5 text-center space-y-2">
              <div className="text-2xl">{f.icon || "✨"}</div>
              <EditableText path={`pages.home.features.${i}.title`} value={f.title} editingField={editingField} onFieldClick={onFieldClick} tag="h3" className="font-semibold text-sm" />
              <EditableText path={`pages.home.features.${i}.description`} value={f.description} editingField={editingField} onFieldClick={onFieldClick} tag="p" className="text-xs text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-muted/30 px-6 py-12">
        <EditableText path="pages.home.social_proof.headline" value={page.social_proof.headline} editingField={editingField} onFieldClick={onFieldClick} tag="h3" className="text-lg font-bold text-center mb-6 font-display" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {page.social_proof.testimonials.map((t, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-accent text-accent" />)}</div>
              <EditableText path={`pages.home.social_proof.testimonials.${i}.text`} value={t.text} editingField={editingField} onFieldClick={onFieldClick} tag="p" className="text-xs" />
              <p className="text-[11px] text-muted-foreground font-medium">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-primary text-primary-foreground px-6 py-12 text-center space-y-3">
        <EditableText path="pages.home.cta_section.headline" value={page.cta_section.headline} editingField={editingField} onFieldClick={onFieldClick} tag="h3" className="text-xl font-bold font-display" />
        {page.cta_section.subheadline && <p className="text-sm opacity-80">{page.cta_section.subheadline}</p>}
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">{page.cta_section.cta_text}</Button>
        {page.cta_section.urgency_text && <p className="text-[11px] opacity-60">{page.cta_section.urgency_text}</p>}
      </div>
    </>
  );
}

function AboutPreview({ page, editingField, onFieldClick }: { page: NonNullable<WebsiteData["pages"]["about"]> } & EditProps) {
  return (
    <div className="px-6 py-12 max-w-3xl mx-auto space-y-8">
      <EditableText path="pages.about.headline" value={page.headline} editingField={editingField} onFieldClick={onFieldClick} tag="h2" className="text-2xl font-bold font-display text-center" />
      <EditableText path="pages.about.story" value={page.story} editingField={editingField} onFieldClick={onFieldClick} tag="p" className="text-sm text-muted-foreground leading-relaxed" />
      <div className="rounded-xl bg-primary/5 border border-border p-6 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Unsere Mission</p>
        <EditableText path="pages.about.mission" value={page.mission} editingField={editingField} onFieldClick={onFieldClick} tag="p" className="text-sm font-medium" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {page.values.map((v, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-1">
            <EditableText path={`pages.about.values.${i}.title`} value={v.title} editingField={editingField} onFieldClick={onFieldClick} tag="h4" className="text-sm font-semibold" />
            <EditableText path={`pages.about.values.${i}.description`} value={v.description} editingField={editingField} onFieldClick={onFieldClick} tag="p" className="text-xs text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsPreview({ page, editingField, onFieldClick }: { page: NonNullable<WebsiteData["pages"]["products"]> } & EditProps) {
  return (
    <div className="px-6 py-12 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <EditableText path="pages.products.headline" value={page.headline} editingField={editingField} onFieldClick={onFieldClick} tag="h2" className="text-2xl font-bold font-display" />
        {page.subheadline && <p className="text-sm text-muted-foreground">{page.subheadline}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {page.items.map((item, i) => (
          <div key={i} className="rounded-xl border border-border p-5 space-y-3 flex flex-col">
            {item.badge && <Badge variant="secondary" className="self-start text-[10px]">{item.badge}</Badge>}
            <EditableText path={`pages.products.items.${i}.name`} value={item.name} editingField={editingField} onFieldClick={onFieldClick} tag="h3" className="text-sm font-bold" />
            <EditableText path={`pages.products.items.${i}.description`} value={item.description} editingField={editingField} onFieldClick={onFieldClick} tag="p" className="text-xs text-muted-foreground flex-1" />
            {item.price && <p className="text-lg font-bold text-primary">{item.price}</p>}
            <Button size="sm" className="w-full">{item.cta_text || "Mehr erfahren"}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactPreview({ page, editingField, onFieldClick }: { page: NonNullable<WebsiteData["pages"]["contact"]> } & EditProps) {
  return (
    <div className="px-6 py-12 max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <EditableText path="pages.contact.headline" value={page.headline} editingField={editingField} onFieldClick={onFieldClick} tag="h2" className="text-2xl font-bold font-display" />
        {page.subheadline && <p className="text-sm text-muted-foreground">{page.subheadline}</p>}
      </div>
      <div className="rounded-xl border border-border p-6 space-y-4">
        {page.form_fields.map((field, i) => (
          <div key={i} className="space-y-1.5">
            <label className="text-xs font-medium">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder={field.placeholder} rows={4} />
            ) : (
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" type={field.type} placeholder={field.placeholder} />
            )}
          </div>
        ))}
        <Button className="w-full">Nachricht senden</Button>
      </div>
    </div>
  );
}

function FaqPreview({ page, editingField, onFieldClick }: { page: NonNullable<WebsiteData["pages"]["faq"]> } & EditProps) {
  return (
    <div className="px-6 py-12 max-w-2xl mx-auto space-y-6">
      <EditableText path="pages.faq.headline" value={page.headline} editingField={editingField} onFieldClick={onFieldClick} tag="h2" className="text-2xl font-bold font-display text-center" />
      <div className="space-y-3">
        {page.items.map((item, i) => (
          <div key={i} className="rounded-xl border border-border p-4">
            <EditableText path={`pages.faq.items.${i}.question`} value={item.question} editingField={editingField} onFieldClick={onFieldClick} tag="p" className="text-sm font-medium" />
            <EditableText path={`pages.faq.items.${i}.answer`} value={item.answer} editingField={editingField} onFieldClick={onFieldClick} tag="p" className="text-xs text-muted-foreground mt-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}
