import { useState } from "react";
import { useSupplierReviews, useCreateSupplierReview, SupplierReview } from "@/hooks/useCommunity";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Star, Search, Plus, CheckCircle2, Factory, Globe, Package, Clock, DollarSign, SortAsc } from "lucide-react";

const COUNTRIES = ["China", "Indien", "Türkei", "Deutschland", "Vietnam", "Bangladesch", "Italien", "Polen", "USA", "Andere"];
const PRODUCT_TYPES = ["Kosmetik", "Nahrungsergänzung", "Textilien", "Elektronik", "Haushalt", "Lebensmittel", "Verpackung", "Andere"];
const PLATFORMS = ["Alibaba", "Made-in-China", "Direkter Hersteller", "IndiaMART", "Global Sources", "1688", "Andere"];

function StarRating({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= value ? "text-accent fill-accent" : "text-muted-foreground/20"}`} />
      ))}
    </div>
  );
}

function SupplierScoreBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}/5</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

function SupplierProfileDialog({ review, open, onClose }: { review: SupplierReview | null; open: boolean; onClose: () => void }) {
  if (!review) return null;
  const avgRating = ((review.quality_rating + review.communication_rating + review.delivery_rating) / 3).toFixed(1);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-accent" />
            {review.supplier_name}
            {review.verified && <CheckCircle2 className="h-4 w-4 text-accent" />}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Overall score */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-accent">{avgRating}</div>
            <div>
              <StarRating value={Math.round(Number(avgRating))} size="md" />
              <p className="text-[11px] text-muted-foreground mt-0.5">Gesamtbewertung</p>
            </div>
          </div>

          {/* Detail scores */}
          <div className="space-y-2">
            <SupplierScoreBar label="Qualität" value={review.quality_rating} />
            <SupplierScoreBar label="Kommunikation" value={review.communication_rating} />
            <SupplierScoreBar label="Lieferzuverlässigkeit" value={review.delivery_rating} />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {review.country && (
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 p-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{review.country}</span>
              </div>
            )}
            {review.product_type && (
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 p-2">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{review.product_type}</span>
              </div>
            )}
            {review.platform && (
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 p-2">
                <Factory className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{review.platform}</span>
              </div>
            )}
            {review.moq && (
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 p-2">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span>MOQ: {review.moq}</span>
              </div>
            )}
            {review.avg_unit_cost != null && (
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 p-2">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <span>~{review.avg_unit_cost}€/Stk.</span>
              </div>
            )}
            {review.production_time && (
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 p-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{review.production_time}</span>
              </div>
            )}
          </div>

          {review.notes && (
            <div>
              <p className="text-xs font-semibold mb-1">Erfahrungsbericht</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SupplierIntelligenceSection() {
  const [country, setCountry] = useState<string>();
  const [productType, setProductType] = useState<string>();
  const [sort, setSort] = useState<string>("created_at");
  const [minRating, setMinRating] = useState<number>();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [profileReview, setProfileReview] = useState<SupplierReview | null>(null);
  const { data: reviews, isLoading } = useSupplierReviews({ country, product_type: productType, sort, minRating });
  const createReview = useCreateSupplierReview();

  const [form, setForm] = useState({
    supplier_name: "", country: "", product_type: "", platform: "", moq: "",
    avg_unit_cost: null as number | null, production_time: "",
    quality_rating: 3, communication_rating: 3, delivery_rating: 3, notes: "",
  });

  const filteredReviews = reviews?.filter((r) =>
    !search || r.supplier_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier_name.trim()) return;
    await createReview.mutateAsync(form as any);
    setForm({ supplier_name: "", country: "", product_type: "", platform: "", moq: "", avg_unit_cost: null, production_time: "", quality_rating: 3, communication_rating: 3, delivery_rating: 3, notes: "" });
    setAddOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Supplier Intelligence Database</h3>
          <p className="text-xs text-muted-foreground">Community-verifizierte Lieferanten-Bewertungen</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Supplier bewerten
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Supplier suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={country || "all"} onValueChange={(v) => setCountry(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Land" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Länder</SelectItem>
            {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={productType || "all"} onValueChange={(v) => setProductType(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Kategorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(minRating || "all")} onValueChange={(v) => setMinRating(v === "all" ? undefined : Number(v))}>
          <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="Min. Rating" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Ratings</SelectItem>
            {[3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>≥ {n} ★</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Neueste</SelectItem>
            <SelectItem value="rating">Beste Bewertung</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats bar */}
      {reviews && reviews.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
          <span className="font-medium">{filteredReviews?.length || 0} Bewertungen</span>
          <span>∅ Qualität: {(reviews.reduce((s, r) => s + r.quality_rating, 0) / reviews.length).toFixed(1)}</span>
          <span>∅ Kommunikation: {(reviews.reduce((s, r) => s + r.communication_rating, 0) / reviews.length).toFixed(1)}</span>
        </div>
      )}

      {/* Reviews Grid */}
      {isLoading && <div className="grid gap-3 sm:grid-cols-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}</div>}
      {filteredReviews?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Factory className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Keine Supplier gefunden</h3>
          <p className="text-xs text-muted-foreground mb-4">Sei der Erste und bewerte einen Lieferanten.</p>
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Erste Bewertung
          </Button>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReviews?.map((review) => {
          const avgRating = ((review.quality_rating + review.communication_rating + review.delivery_rating) / 3).toFixed(1);
          return (
            <Card
              key={review.id}
              className="border-border/60 cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => setProfileReview(review)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm flex items-center gap-1.5 group-hover:text-accent transition-colors">
                      {review.supplier_name}
                      {review.verified && <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {[review.country, review.product_type].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-muted/60 rounded-lg px-2 py-1 shrink-0">
                    <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                    <span className="text-xs font-bold">{avgRating}</span>
                  </div>
                </div>

                {/* Score bars */}
                <div className="space-y-1.5 mb-3">
                  <SupplierScoreBar label="Qualität" value={review.quality_rating} />
                  <SupplierScoreBar label="Kommunikation" value={review.communication_rating} />
                  <SupplierScoreBar label="Lieferung" value={review.delivery_rating} />
                </div>

                {/* Quick info */}
                <div className="flex flex-wrap gap-1.5">
                  {review.platform && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{review.platform}</Badge>}
                  {review.moq && <Badge variant="outline" className="text-[10px] px-1.5 py-0">MOQ: {review.moq}</Badge>}
                  {review.avg_unit_cost != null && <Badge variant="outline" className="text-[10px] px-1.5 py-0">~{review.avg_unit_cost}€</Badge>}
                  {review.production_time && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{review.production_time}</Badge>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Supplier Profile */}
      <SupplierProfileDialog review={profileReview} open={!!profileReview} onClose={() => setProfileReview(null)} />

      {/* Add Review Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Supplier Intelligence Report</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateReview} className="space-y-3">
            <Input placeholder="Supplier Name *" value={form.supplier_name} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} required maxLength={200} />
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.country || "empty"} onValueChange={(v) => setForm({ ...form, country: v === "empty" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Land" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Land wählen</SelectItem>
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.product_type || "empty"} onValueChange={(v) => setForm({ ...form, product_type: v === "empty" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Kategorie wählen</SelectItem>
                  {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Select value={form.platform || "empty"} onValueChange={(v) => setForm({ ...form, platform: v === "empty" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Plattform" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="empty">Plattform wählen</SelectItem>
                {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="MOQ (z.B. 500)" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} />
              <Input placeholder="Ø Stückkosten €" type="number" step="0.01" value={form.avg_unit_cost ?? ""} onChange={(e) => setForm({ ...form, avg_unit_cost: e.target.value ? Number(e.target.value) : null })} />
              <Input placeholder="Produktionszeit" value={form.production_time} onChange={(e) => setForm({ ...form, production_time: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {([["quality_rating", "Qualität"], ["communication_rating", "Kommunikation"], ["delivery_rating", "Lieferung"]] as const).map(([field, label]) => (
                <div key={field}>
                  <label className="text-muted-foreground">{label}</label>
                  <Select value={String(form[field])} onValueChange={(v) => setForm({ ...form, [field]: Number(v) })}>
                    <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n} ★</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <Textarea placeholder="Deine Erfahrung (Details zur Zusammenarbeit, Qualität, Probleme...)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} maxLength={3000} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Abbrechen</Button>
              <Button type="submit" disabled={createReview.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {createReview.isPending ? "Wird gespeichert..." : "Bewertung speichern"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
