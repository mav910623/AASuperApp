import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppProvider } from "@/context/AppContext";
import { InstallAppBanner } from "@/components/InstallAppBanner";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { UiDictionary } from "@/types/app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Team Hub - Super App",
  description: "Team resource portal, daily tools, and training hub",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Team Hub",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

async function getUiDictionary(): Promise<UiDictionary[]> {
  "use cache";
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  ) {
    return [];
  }
  try {
    const client = process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin : supabase;
    const { data, error } = await client.from("ui_dictionary").select("*");
    if (!error && data && data.length > 0) {
      return data as UiDictionary[];
    }
  } catch {
    // Graceful fallback to default dictionary when Supabase is unconfigured or offline
  }
  return [];
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialDictionary = await getUiDictionary();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground tracking-tight selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-black">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider initialDictionary={initialDictionary}>
            {children}
            <InstallAppBanner />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

