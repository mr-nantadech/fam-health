"use client";

import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";

const DRAWER_WIDTH = 260;

const NAV = [
  { href: "/", label: "ภาพรวม", icon: <SpaceDashboardOutlinedIcon /> },
  { href: "/members", label: "สมาชิกในบ้าน", icon: <PeopleAltOutlinedIcon /> },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <List className="px-2">
      {NAV.map((item) => {
        const selected =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={selected}
            onClick={onNavigate}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: selected ? "primary.main" : "text.secondary",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const drawer = (
    <Box>
      <Suspense fallback={<div className="h-28" />}>
        <NavList onNavigate={() => setOpen(false)} />
      </Suspense>
      <Typography
        variant="caption"
        color="text.secondary"
        className="block px-5 pt-4"
      >
        ข้อมูลเก็บบนเครื่องนี้ ไม่มีการเข้าสู่ระบบ
      </Typography>
    </Box>
  );

  return (
    <div className="min-h-screen bg-[#f3f6f4]">
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="เปิดเมนู"
            onClick={() => setOpen(true)}
            sx={{ mr: 1, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <LocalHospitalOutlinedIcon sx={{ mr: 1 }} />
          <Typography
            component={Link}
            href="/"
            variant="h6"
            sx={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}
          >
            ครอบครัวสุขภาพ
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            top: 64,
            height: "calc(100% - 64px)",
            borderRight: "1px solid #e2eae7",
            background: "#f7fbfa",
          },
        }}
        open
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: { md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        <Toolbar />
        {drawer}
      </Drawer>
      <main className="pt-16 md:pl-[260px]">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
