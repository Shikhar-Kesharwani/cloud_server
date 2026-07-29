import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * Uploads a file buffer directly to a Supabase Cloud Storage bucket
 */
export async function uploadToSupabaseStorage(
  bucketName: string,
  filePath: string,
  fileBuffer: Buffer,
  contentType: string = "application/octet-stream"
) {
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("Supabase Storage Upload Error:", error.message);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Downloads a file directly from a Supabase Cloud Storage bucket
 */
export async function downloadFromSupabaseStorage(bucketName: string, filePath: string) {
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath);

  if (error) {
    console.error("Supabase Storage Download Error:", error.message);
    throw error;
  }

  return data;
}
