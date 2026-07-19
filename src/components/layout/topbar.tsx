"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, X } from "lucide-react";
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

interface SearchResult {
  devices: Array<{
    id: string;
    assetId: string;
    name: string;
    status: { name: string };
    deviceType: { name: string };
    manufacturer: { name: string } | null;
    department: { name: string } | null;
    location: { name: string; building: string; room: string } | null;
  }>;
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeId: string;
    department: { name: string } | null;
  }>;
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const title = getPageTitle(pathname);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setResults(json.data);
      setOpen(true);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchResults(val), 300);
    },
    [fetchResults]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const hasResults =
    results &&
    ((results.devices?.length ?? 0) > 0 || (results.users?.length ?? 0) > 0);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
      <h1 className="text-base font-semibold text-foreground lg:text-lg">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block" ref={wrapperRef}>
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-8 w-56 pl-8 text-sm lg:w-72"
            value={query}
            onChange={handleChange}
          />
          {query && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setQuery("");
                setResults(null);
                setOpen(false);
              }}
            >
              <X className="size-3.5" />
            </button>
          )}

          {open && (
            <div className="absolute right-0 top-full mt-1 w-80 overflow-hidden rounded-xl border bg-background shadow-lg">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : !hasResults ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {results.devices && results.devices.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        Devices
                      </div>
                      {results.devices.map((device) => (
                        <button
                          key={device.id}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => {
                            setOpen(false);
                            router.push(`/devices/${device.id}`);
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{device.name}</div>
                            <div className="truncate text-xs text-muted-foreground">
                              {device.assetId} · {device.deviceType.name}
                              {device.manufacturer ? ` · ${device.manufacturer.name}` : ""}
                              {device.department ? ` · ${device.department.name}` : ""}
                            </div>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {device.status.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.users && results.users.length > 0 && (
                    <div>
                      <div className="border-t px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        Users
                      </div>
                      {results.users.map((user) => (
                        <button
                          key={user.id}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => {
                            setOpen(false);
                            router.push(`/users/${user.id}`);
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {user.email}
                              {user.department ? ` · ${user.department.name}` : ""}
                            </div>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {user.employeeId}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
