import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

const INSTALLER_URL =
  "https://github.com/pschmidt2023s-code/ideatolaunch-hub/releases/download/2.0/BrandOS_0.2.0_x64-setup.exe";
const VERSION_JSON_URL =
  "https://raw.githubusercontent.com/pschmidt2023s-code/ideatolaunch-hub/main/docs/version.json";

export default function DownloadPage() {
  return (
    <>
      <SEO title="BrandOS Download" description="Lade die neueste Version von BrandOS für Windows herunter." path="/download" />
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <Card className="w-full max-w-[600px] text-center">
          <CardHeader>
            <CardTitle className="text-3xl">BrandOS Download</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button size="lg" className="w-full text-base gap-2" asChild>
              <a href={INSTALLER_URL} download>
                <Download className="h-5 w-5" />
                BrandOS für Windows herunterladen
              </a>
            </Button>

            <p className="text-sm text-muted-foreground">
              Nach dem Download die Datei ausführen. Das Update ersetzt die alte Version automatisch.
            </p>

            <div className="rounded-md border p-4 space-y-1">
              <h3 className="text-sm font-semibold">Update-Info</h3>
              <a
                href={VERSION_JSON_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                version.json anzeigen
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
