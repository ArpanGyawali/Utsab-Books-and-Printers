import { requireAdmin } from "@/lib/admin/auth";
import { getBookGenres } from "@/lib/genres";
import BookForm from "@/components/admin/BookForm";
import { saveBook } from "../actions";

export default async function NewBookPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { added } = await searchParams;

  const [{ data: schools }, { data: classes }, genres] = await Promise.all([
    supabase.from("schools").select("id, name_en").eq("active", true).order("name_en"),
    supabase.from("classes").select("*").order("sort"),
    getBookGenres(false),
  ]);

  return (
    <>
      <h1 className="text-2xl font-semibold">Add a book</h1>
      {added ? (
        <p className="mt-2 rounded-sm border-[1.5px] border-dashed border-instock px-3 py-2 text-sm font-medium text-instock">
          Saved. Add the next book below.
        </p>
      ) : null}
      <div className="mt-5">
        <BookForm
          action={saveBook}
          schools={schools ?? []}
          classes={classes ?? []}
          genres={genres}
        />
      </div>
    </>
  );
}
