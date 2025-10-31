import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    const adminPath = path.join(process.cwd(), 'src/data/admin.json');
    const adminDataRaw = await fs.readFile(adminPath, 'utf8');
    const adminData = JSON.parse(adminDataRaw);

    if (name) adminData.name = name;
    if (email) adminData.email = email;
    if (password) adminData.password = password;

    await fs.writeFile(adminPath, JSON.stringify(adminData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}