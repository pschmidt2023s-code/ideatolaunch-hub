import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/hooks/useMode";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { MODE_CONFIGS } from "@/lib/mode-types";
import { CommandPalette } from "./CommandPalette";
import { Search, Bell, ChevronDown, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
            className="hidden sm:flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {cfg.label}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>

          <div className="hidden md:block w-64">
            <CommandPalette />
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-1">
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <Bell className="h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="text-xs font-medium truncate">{email}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{cfg.label}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setModeOpen(true)}>
                Switch Mode
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
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
