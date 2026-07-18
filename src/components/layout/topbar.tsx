"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/devices": "Devices",
  "/users": "Users",
  "/assignments": "Assignments",
  "/departments": "Departments",
  "/locations": "Locations",
  "/manufacturers": "Manufacturers",
  "/vendors": "Vendors",
  "/settings/device-types": "Device types",
  "/settings/device-statuses": "Device statuses",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const base = segments[segments.length - 1];
    return base.charAt(0).toUpperCase() + base.slice(1).replace(/-/g, " ");
  }
  return "Dashboard";
}

export function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
      <h1 className="text-base font-semibold text-foreground lg:text-lg">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-8 w-56 pl-8 text-sm lg:w-72"
            disabled
          />
        </div>
        <ThemeToggle />
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <span className="hidden text-sm font-medium text-foreground md:block">
            {session?.user?.name ?? "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
