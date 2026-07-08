"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function markNotified(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) return;

  const { error } = await supabase
    .from("inquiries")
    .update({ notified: true })
    .eq("id", id);
  if (error) throw new Error(`Could not mark as notified: ${error.message}`);

  revalidatePath("/admin/waiting");
}

/** Marks every waiter of one book as notified in one tap. */
export async function markBookNotified(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const bookId = String(formData.get("book_id") ?? "").trim();
  if (!UUID_RE.test(bookId)) return;

  const { error } = await supabase
    .from("inquiries")
    .update({ notified: true })
    .eq("book_id", bookId)
    .eq("notified", false);
  if (error) throw new Error(`Could not mark as notified: ${error.message}`);

  revalidatePath("/admin/waiting");
}
