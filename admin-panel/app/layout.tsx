import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProvider } from "@/providers/app-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "GoLongDrive Admin Panel",
  description: "Advanced Admin dashboard for GoLongDrive Platform",
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <AppProvider>
          {children}
        </AppProvider>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
