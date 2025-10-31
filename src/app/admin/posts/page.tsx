import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth-config";
import { Ad } from "@/app/data/mockAds";
import fs from 'fs/promises';
import path from 'path';
import AdminAdList from "@/app/components/AdminAdList";

export default async function ManagePosts() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/auth/signin");
  }

  const adsFilePath = path.join(process.cwd(), 'src/app/data/ads.json');

  async function readAds(): Promise<Ad[]> {
    try {
      const data = await fs.readFile(adsFilePath, 'utf-8');
      if (!data || data.trim() === '') {
        console.log('Ads file is empty, returning empty array');
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading ads:', error);
      return [];
    }
  }

  const ads = await readAds();

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold">Post History</h1>
            <button className="text-xl text-gray-600 hover:text-gray-800 focus:outline-none bg-white p-2 rounded border border-gray-300">
              ⋯
            </button>
          </div>
          <div></div> {/* Spacer for justify-between */}
        </div>
        
        <AdminAdList ads={ads} />
      </div>
    </div>
  );
}