import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/hooks/useMode";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { MODE_CONFIGS } from "@/lib/mode-types";
import { CommandPalette } from "./CommandPalette";
import { NotificationBell } from "./NotificationBell";
import { ExportCenter } from "./ExportCenter";
import { useChangelog } from "./ChangelogDialog";
import { ChevronDown, Settings, LogOut, Activity, Download, Sparkles } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export function TopBar() {
  const { user, signOut } = useAuth();
  const { mode } = useMode();
  const [modeOpen, setModeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const navigate = useNavigate();
  const cfg = MODE_CONFIGS[mode];
  const changelog = useChangelog();

  const email = user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-10 items-center justify-between border-b border-border bg-background px-4">
        {/* Left: System status + Mode + Search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Activity className="h-3 w-3 text-accent" />
            <span className="text-accent font-medium">LIVE</span>
            <span className="mx-1 text-border">|</span>
            <button
              onClick={() => setModeOpen(true)}
              className="flex items-center gap-1 hover:text-foreground transition-colors press-scale"
            >
              {cfg.label.toUpperCase()}
              <ChevronDown className="h-2.5 w-2.5 opacity-50" />
            </button>
          </div>

          <div className="hidden md:block w-56">
            <CommandPalette />
          </div>
        </div>

        {/* Right: Export + What's New + Notifications + User */}
        <div className="flex items-center gap-1">
          {/* What's New indicator */}
          {changelog.hasNew && (
            <button
              onClick={() => changelog.setOpen(true)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-accent bg-accent/10 hover:bg-accent/15 transition-colors animate-fade-in"
            >
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">Neu</span>
            </button>
          )}

          {/* Export Center */}
          <button
            onClick={() => setExportOpen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors press-scale"
            title="Export Center"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-6 w-6 items-center justify-center rounded bg-accent/15 text-[10px] font-bold font-mono text-accent hover:bg-accent/25 transition-colors press-scale">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-lg p-1">
              <div className="px-2.5 py-2">
                <p className="text-[11px] font-medium font-mono truncate">{email}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.label}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="rounded-md gap-2 text-xs">
                <Settings className="h-3 w-3" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setModeOpen(true)} className="rounded-md gap-2 text-xs">
                <ChevronDown className="h-3 w-3" />
                Switch Mode
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changelog.setOpen(true)} className="rounded-md gap-2 text-xs">
                <Sparkles className="h-3 w-3" />
                What&apos;s New
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="rounded-md gap-2 text-xs text-destructive focus:text-destructive">
                <LogOut className="h-3 w-3" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ModeSwitcher open={modeOpen} onOpenChange={setModeOpen} />
      <ExportCenter open={exportOpen} onOpenChange={setExportOpen} />
    </>
  );
}
