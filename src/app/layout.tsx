import type { Metadata } from "next";
// import { GeistSans, GeistMono } from '@geist/font';
import "./globals.css";
import Providers from "@/app/providers";
//import Home from "@/app/page";
import NavBar from "@/app/components/NavBar";
import { SidebarProvider } from "@/app/components/SidebarContext";

export const metadata: Metadata = {
  title: "Online Services Advertising System",
  description: "Advertisement platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <SidebarProvider>
            <NavBar />
            <main className="w-full pt-16">{children}</main>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
