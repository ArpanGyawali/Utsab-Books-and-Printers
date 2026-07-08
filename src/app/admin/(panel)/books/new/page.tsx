import { requireAdmin } from "@/lib/admin/auth";
import BookForm from "@/components/admin/BookForm";
import { saveBook } from "../actions";

export default async function NewBookPage() {
  const { supabase } = await requireAdmin();

  const [{ data: schools }, { data: classes }] = await Promise.all([
    supabase.from("schools").select("id, name_en").eq("active", true).order("name_en"),
    supabase.from("classes").select("*").order("sort"),
  ]);

  return (
    <>
      <h1 className="text-2xl font-semibold">Add a book</h1>
      <div className="mt-5">
        <BookForm action={saveBook} schools={schools ?? []} classes={classes ?? []} />
      </div>
    </>
  );
}
