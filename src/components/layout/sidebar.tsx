"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Laptop,
  Users,
  ArrowLeftRight,
  Building2,
  MapPin,
  Factory,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  Tags,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Devices", href: "/devices", icon: Laptop },
  { label: "Users", href: "/users", icon: Users },
  { label: "Assignments", href: "/assignments", icon: ArrowLeftRight },
  { label: "Departments", href: "/departments", icon: Building2 },
  { label: "Locations", href: "/locations", icon: MapPin },
  { label: "Manufacturers", href: "/manufacturers", icon: Factory },
  { label: "Vendors", href: "/vendors", icon: ShoppingCart },
];

const settingsItems = [
  { label: "Device types", href: "/settings/device-types", icon: Tags },
  { label: "Device statuses", href: "/settings/device-statuses", icon: Activity },
];

function NavItem({
  item,
  isActive,
  collapsed,
}: {
  item: (typeof navItems)[0];
  isActive: boolean;
  collapsed?: boolean;
}) {
  const link = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      <item.icon className="size-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<div />}>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

function SidebarContent({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className={cn("flex h-14 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
            J
          </div>
          {!collapsed && (
            <span className="text-base font-semibold text-sidebar-foreground">
              Jidaar
            </span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="mt-6">
          {!collapsed && (
            <div className="mb-1 px-3 text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider">
              Settings
            </div>
          )}
          <nav className="flex flex-col gap-1">
            {settingsItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </div>
      </ScrollArea>

      <div className={cn("border-t border-sidebar-border p-3", collapsed && "px-2")}>
        {user ? (
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
              {user.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            {!collapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {user.name}
                </span>
                <Badge variant="secondary" className="mt-0.5 w-fit text-[10px]">
                  {(user as { role?: string }).role}
                </Badge>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="shrink-0 text-sidebar-foreground/50 hover:text-sidebar-foreground"
              >
                <LogOut className="size-3.5" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="size-8 animate-pulse rounded-full bg-sidebar-accent" />
            {!collapsed && (
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3 w-20 animate-pulse rounded bg-sidebar-accent" />
                <div className="h-2.5 w-12 animate-pulse rounded bg-sidebar-accent" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      <aside className="hidden lg:flex lg:w-[232px] lg:shrink-0">
        <div className="fixed inset-y-0 left-0 z-30 w-[232px] border-r border-sidebar-border">
          <TooltipProvider>
            <SidebarContent />
          </TooltipProvider>
        </div>
      </aside>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="fixed top-3 left-3 z-40" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[232px] p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
