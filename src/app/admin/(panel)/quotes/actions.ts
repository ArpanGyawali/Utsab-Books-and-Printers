"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function setQuoteHandled(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) return;
  const handled = formData.get("handled") === "true";

  const { error } = await supabase
    .from("print_quotes")
    .update({ handled })
    .eq("id", id);
  if (error) throw new Error(`Could not update the quote: ${error.message}`);

  revalidatePath("/admin/quotes");
}
