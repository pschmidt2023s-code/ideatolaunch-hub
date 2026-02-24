export function Footer() {
  return (
    <footer className="border-t px-4 py-12">
      <div className="container mx-auto max-w-5xl flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <span className="text-xs font-bold text-primary-foreground">B</span>
          </div>
          <span className="font-semibold">BuildYourBrand</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BuildYourBrand. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
