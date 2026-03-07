import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/hooks/useMode";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { MODE_CONFIGS } from "@/lib/mode-types";
import { CommandPalette } from "./CommandPalette";
import { Bell, ChevronDown, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { user, signOut } = useAuth();
  const { mode } = useMode();
  const [modeOpen, setModeOpen] = useState(false);
  const navigate = useNavigate();
  const cfg = MODE_CONFIGS[mode];

  const email = user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 lg:px-6">
        {/* Left: Mode + Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModeOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {cfg.label}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>

          <div className="hidden md:block w-64">
            <CommandPalette />
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-1.5">
          <button className="relative flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <Bell className="h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 text-xs font-bold text-accent hover:from-accent/30 transition-colors">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl p-1">
              <div className="px-3 py-2.5">
                <p className="text-xs font-medium truncate">{email}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{cfg.label} Mode</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="rounded-lg gap-2">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setModeOpen(true)} className="rounded-lg gap-2">
                <ChevronDown className="h-3.5 w-3.5" />
                Switch Mode
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="rounded-lg gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ModeSwitcher open={modeOpen} onOpenChange={setModeOpen} />
    </>
  );
}
