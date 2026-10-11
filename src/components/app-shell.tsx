"use client";

import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";

const NAV = [
  { href: "/", label: "ภาพรวม", icon: <SpaceDashboardOutlinedIcon /> },
  { href: "/members", label: "สมาชิกในบ้าน", icon: <PeopleAltOutlinedIcon /> },
];

function isSelected(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavButtons() {
  const pathname = usePathname();
  return (
    <>
      {NAV.map((item) => {
        const selected = isSelected(pathname, item.href);
        return (
          <Button
            key={item.href}
            component={Link}
            href={item.href}
            startIcon={item.icon}
            sx={{
              color: "inherit",
              bgcolor: selected ? "rgba(255,255,255,0.16)" : "transparent",
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </>
  );
}

function NavMenu({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {NAV.map((item) => (
        <MenuItem
          key={item.href}
          component={Link}
          href={item.href}
          selected={isSelected(pathname, item.href)}
          onClick={onNavigate}
        >
          <Box
            sx={{
              display: "inline-flex",
              mr: 1.5,
              color: "text.secondary",
              "& svg": { display: "inline-block", width: 24, height: 24 },
            }}
          >
            {item.icon}
          </Box>
          {item.label}
        </MenuItem>
      ))}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", px: 2, pt: 1, pb: 0.5, maxWidth: 260 }}
      >
        ข้อมูลเก็บบนเครื่องนี้ ไม่มีการเข้าสู่ระบบ
      </Typography>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = anchorEl != null;

  return (
    <div className="min-h-screen bg-[#f3f6f4]">
      <AppBar position="fixed" elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="เปิดเมนู"
            aria-controls={menuOpen ? "app-nav-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={{ mr: 1, display: { md: "none" } }}
          >
            <MenuIcon sx={{ display: "inline-block", width: 24, height: 24 }} />
          </IconButton>
          <Menu
            id="app-nav-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <Suspense fallback={<div className="h-24 w-40" />}>
              <NavMenu onNavigate={() => setAnchorEl(null)} />
            </Suspense>
          </Menu>
          <LocalHospitalOutlinedIcon sx={{ mr: 1 }} />
          <Typography
            component={Link}
            href="/"
            variant="h6"
            sx={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}
          >
            ครอบครัวสุขภาพ
          </Typography>
          <Box sx={{ display: { xs: "none", md: "flex" }, ml: 2, gap: 0.5 }}>
            <Suspense fallback={<div className="h-9 w-56" />}>
              <NavButtons />
            </Suspense>
          </Box>
        </Toolbar>
      </AppBar>
      <main className="pt-16">
        <div className="px-12 py-4 md:py-6">{children}</div>
      </main>
    </div>
  );
}
