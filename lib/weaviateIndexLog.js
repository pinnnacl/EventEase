import { getSupabaseAdmin } from "./supabaseAdmin";

/**
 * @param {{
 *  vendorId: string,
 *  mediaKey: string,
 *  imageUrl: string,
 *  status: "success" | "failed" | "skipped",
 *  errorMessage?: string | null,
 *  vectorDim?: number | null,
 * }} row
 */
export async function insertWeaviateIndexLog(row) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("weaviate_media_index_logs").insert({
      vendor_id: row.vendorId,
      media_key: row.mediaKey,
      image_url: row.imageUrl,
      status: row.status,
      error_message: row.errorMessage ?? null,
      vector_dim: row.vectorDim ?? null,
    });
    if (error) {
      console.error("[weaviate-index-log] insert failed:", error.message);
    }
  } catch (e) {
    console.error("[weaviate-index-log] error:", e instanceof Error ? e.message : e);
  }
}
