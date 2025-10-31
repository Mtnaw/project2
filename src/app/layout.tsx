import type { Metadata } from "next";
// import { GeistSans, GeistMono } from '@geist/font';
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth-config";
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
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";

  return (
    <html lang="en">
      <body className="antialiased">
        <Providers session={session}>
          <SidebarProvider>
            <NavBar />
            <main className="w-full">{children}</main>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
