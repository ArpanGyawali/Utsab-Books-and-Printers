"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Fires when the owner taps Notify / Notify again (the WhatsApp chat opens in
 * parallel). Stamping notified_at each time restarts the 5-day purge clock.
 */
export async function markNotified(id: string): Promise<void> {
  const { supabase } = await requireAdmin();

  if (!UUID_RE.test(id)) return;

  const { error } = await supabase
    .from("inquiries")
    .update({ notified: true, notified_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Could not mark as notified: ${error.message}`);

  revalidatePath("/admin/waiting");
}
