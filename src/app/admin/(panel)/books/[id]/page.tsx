import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { coverUrl } from "@/lib/books";
import BookForm from "@/components/admin/BookForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { deleteBook, saveBook } from "../actions";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;

  const [{ data: book }, { data: schools }, { data: classes }] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).maybeSingle(),
    supabase.from("schools").select("id, name_en").eq("active", true).order("name_en"),
    supabase.from("classes").select("*").order("sort"),
  ]);
  if (!book) notFound();

  return (
    <>
      <h1 className="text-2xl font-semibold">Edit book</h1>
      <p className="mt-1 truncate text-sm text-ink-soft">
        {book.title_en}
        {book.title_ne ? ` · ${book.title_ne}` : ""}
      </p>

      <div className="mt-5">
        <BookForm
          action={saveBook}
          book={book}
          coverUrl={coverUrl(book)}
          schools={schools ?? []}
          classes={classes ?? []}
        />
      </div>

      <form action={deleteBook} className="mt-8 border-t border-dashed border-[var(--ink-faint)] pt-5">
        <input type="hidden" name="id" value={book.id} />
        <ConfirmSubmit
          message={`Delete "${book.title_en}"? Anyone waiting for it is removed too. This cannot be undone.`}
          className="min-h-11 rounded-sm border-[1.5px] border-outofstock px-4 text-sm font-medium text-outofstock transition-colors duration-150 hover:bg-paper-shade"
        >
          Delete this book
        </ConfirmSubmit>
      </form>
    </>
  );
}
