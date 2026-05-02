import { getSupabaseAdmin } from "./supabaseAdmin";

/**
 * @param {{
 *   toDigits: string,
 *   templateName: string,
 *   status: 'sent' | 'failed',
 *   vendorId?: string | null,
 *   messageId?: string | null,
 *   errorMessage?: string | null,
 *   attempts?: number | null,
 *   payload?: object | null,
 * }} row
 */
export async function insertWhatsAppOutboundLog(row) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("whatsapp_outbound_logs").insert({
      to_digits: row.toDigits,
      template_name: row.templateName,
      status: row.status,
      vendor_id: row.vendorId ?? null,
      message_id: row.messageId ?? null,
      error_message: row.errorMessage ?? null,
      attempts: row.attempts ?? null,
      payload: row.payload ?? null,
    });
    if (error) {
      console.error("[whatsapp] log insert failed:", error.message);
    }
  } catch (e) {
    console.error("[whatsapp] log insert error:", e instanceof Error ? e.message : e);
  }
}
