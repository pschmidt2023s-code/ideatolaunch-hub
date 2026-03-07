import { useState } from "react";
import { useSupplierReviews, useCreateSupplierReview } from "@/hooks/useCommunity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Search, Plus, CheckCircle2 } from "lucide-react";

const COUNTRIES = ["China", "Indien", "Türkei", "Deutschland", "Vietnam", "Bangladesch", "Italien", "Polen", "USA", "Andere"];
const PRODUCT_TYPES = ["Kosmetik", "Nahrungsergänzung", "Textilien", "Elektronik", "Haushalt", "Lebensmittel", "Verpackung", "Andere"];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= value ? "text-accent fill-accent" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export function SupplierReviewsSection() {
  const [country, setCountry] = useState<string>();
  const [productType, setProductType] = useState<string>();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const { data: reviews, isLoading } = useSupplierReviews({ country, product_type: productType });
  const createReview = useCreateSupplierReview();

  const [form, setForm] = useState({
    supplier_name: "", country: "", product_type: "", moq: "",
    quality_rating: 3, communication_rating: 3, delivery_rating: 3, notes: "",
  });

  const filteredReviews = reviews?.filter((r) =>
    !search || r.supplier_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier_name.trim()) return;
    await createReview.mutateAsync(form as any);
    setForm({ supplier_name: "", country: "", product_type: "", moq: "", quality_rating: 3, communication_rating: 3, delivery_rating: 3, notes: "" });
    setAddOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Supplier suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={country || "all"} onValueChange={(v) => setCountry(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Land" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Länder</SelectItem>
            {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={productType || "all"} onValueChange={(v) => setProductType(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Produkttyp" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" className="h-9 gap-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Bewertung
        </Button>
      </div>

      {/* Reviews */}
      {isLoading && <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>}
      {filteredReviews?.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-sm text-muted-foreground">Keine Bewertungen gefunden.</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredReviews?.map((review) => {
          const avgRating = Math.round((review.quality_rating + review.communication_rating + review.delivery_rating) / 3);
          return (
            <Card key={review.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                      {review.supplier_name}
                      {review.verified && <CheckCircle2 className="h-3.5 w-3.5 text-accent" />}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {[review.country, review.product_type, review.moq && `MOQ: ${review.moq}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <StarRating value={avgRating} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground mb-2">
                  <div>Qualität <StarRating value={review.quality_rating} /></div>
                  <div>Kommunikation <StarRating value={review.communication_rating} /></div>
                  <div>Lieferung <StarRating value={review.delivery_rating} /></div>
                </div>
                {review.notes && <p className="text-xs text-muted-foreground line-clamp-2">{review.notes}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Review Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Supplier bewerten</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateReview} className="space-y-3">
            <Input placeholder="Supplier Name *" value={form.supplier_name} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.country || "empty"} onValueChange={(v) => setForm({ ...form, country: v === "empty" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Land" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Land wählen</SelectItem>
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.product_type || "empty"} onValueChange={(v) => setForm({ ...form, product_type: v === "empty" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Produkttyp" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Typ wählen</SelectItem>
                  {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="MOQ (z.B. 500 Stück)" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} />
            <div className="grid grid-cols-3 gap-3 text-xs">
              {(["quality_rating", "communication_rating", "delivery_rating"] as const).map((field) => (
                <div key={field}>
                  <label className="text-muted-foreground capitalize">{field.replace("_rating", "")}</label>
                  <Select value={String(form[field])} onValueChange={(v) => setForm({ ...form, [field]: Number(v) })}>
                    <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n} ★</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <Textarea placeholder="Deine Erfahrung (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Abbrechen</Button>
              <Button type="submit" disabled={createReview.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">Speichern</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
