'use server';

import path from "path";
import fs from "fs/promises";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const adminPath = path.join(process.cwd(), "src/data/admin.json");
  const adminDataRaw = await fs.readFile(adminPath, "utf8");
  const adminData = JSON.parse(adminDataRaw);

  // Update fields
  adminData.name = formData.get("name") as string;
  adminData.email = formData.get("email") as string;

  const password = formData.get("password") as string;
  if (password && password.length > 0) {
    adminData.password = password;
  }

  // Handle image upload
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = Date.now() + "_" + file.name.replace(/\s+/g, '_');
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    adminData.image = `/uploads/${filename}`;
  }

  // Write back
  await fs.writeFile(adminPath, JSON.stringify(adminData, null, 2));
  redirect("/admin/profile");
}