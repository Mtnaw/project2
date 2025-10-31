import { query, transaction } from '@/lib/db';
import { Ad } from '@/app/data/mockAds';

// Convert database row to Ad type
export function dbRowToAd(row: any): Ad {
  return {
    id: row.id.toString(),
    title: row.title,
    description: row.description,
    img: row.img,
    category: row.category,
    price: parseFloat(row.price),
    contact: row.contact,
    supplierName: row.supplier_name,
    email: row.email,
    startDate: row.start_date,
    endDate: row.end_date,
    views: row.views,
  };
}

// Get all ads (public view - excludes admin-only fields)
export async function getAllAds(): Promise<Ad[]> {
  const result = await query(
    `SELECT id, title, description, img, category, price, contact, 
            start_date, end_date, views 
     FROM ads 
     WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE
     ORDER BY created_at DESC`
  );
  return result.rows.map(dbRowToAd);
}

// Get ad by ID (full view for admin)
export async function getAdById(id: string): Promise<Ad | null> {
  const result = await query(
    `SELECT * FROM ads WHERE id = $1`,
    [id]
  );
  return result.rows.length > 0 ? dbRowToAd(result.rows[0]) : null;
}

// Create new ad
export async function createAd(adData: Omit<Ad, 'id' | 'views'>): Promise<Ad> {
  const result = await transaction(async (client) => {
    const result = await client.query(
      `INSERT INTO ads (title, description, img, category, price, contact, 
                       supplier_name, email, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        adData.title,
        adData.description,
        adData.img,
        adData.category,
        adData.price,
        adData.contact,
        adData.supplierName,
        adData.email,
        adData.startDate,
        adData.endDate,
      ]
    );
    return dbRowToAd(result.rows[0]);
  });
  return result;
}

// Update ad
export async function updateAd(id: string, adData: Partial<Ad>): Promise<Ad | null> {
  const result = await transaction(async (client) => {
    const result = await client.query(
      `UPDATE ads 
       SET title = $1, description = $2, img = $3, category = $4, 
           price = $5, contact = $6, supplier_name = $7, email = $8,
           start_date = $9, end_date = $10
       WHERE id = $11
       RETURNING *`,
      [
        adData.title,
        adData.description,
        adData.img,
        adData.category,
        adData.price,
        adData.contact,
        adData.supplierName,
        adData.email,
        adData.startDate,
        adData.endDate,
        id,
      ]
    );
    return result.rows.length > 0 ? dbRowToAd(result.rows[0]) : null;
  });
  return result;
}

// Delete ad
export async function deleteAd(id: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM ads WHERE id = $1`,
    [id]
  );
  return (result.rowCount || 0) > 0;
}

// Increment ad views
export async function incrementAdViews(id: string): Promise<void> {
  await query(
    `UPDATE ads SET views = views + 1 WHERE id = $1`,
    [id]
  );
}

// Get ads by category
export async function getAdsByCategory(category: string): Promise<Ad[]> {
  const result = await query(
    `SELECT id, title, description, img, category, price, contact, 
            start_date, end_date, views 
     FROM ads 
     WHERE category = $1 AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE
     ORDER BY created_at DESC`,
    [category]
  );
  return result.rows.map(dbRowToAd);
}

// Search ads
export async function searchAds(searchTerm: string): Promise<Ad[]> {
  const searchResult = await query(
    `SELECT id, title, description, img, category, price, contact,
            start_date, end_date, views
     FROM ads
     WHERE (title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1)
       AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE
     ORDER BY views DESC, created_at DESC`,
    [`%${searchTerm}%`]
  );
  return searchResult.rows.map(dbRowToAd);
}

// Get ads by date range
export async function getAdsByDateRange(startDate: string, endDate: string): Promise<Ad[]> {
  const result = await query(
    `SELECT id, title, description, img, category, price, contact, 
            start_date, end_date, views 
     FROM ads 
     WHERE start_date <= $2 AND end_date >= $1
     ORDER BY start_date ASC`,
    [startDate, endDate]
  );
  return result.rows.map(dbRowToAd);
}