import { requireAdmin } from "@/lib/admin/auth";
import BooklistForm from "@/components/admin/BooklistForm";
import { booklistFileUrl, getBooklist } from "@/lib/settings";
import { saveBooklist } from "./actions";

export default async function AdminBooklistPage() {
  await requireAdmin();

  const booklist = await getBooklist();
  const fileUrl = booklist ? booklistFileUrl(booklist) : null;

  return (
    <>
      <h1 className="text-2xl font-semibold">School book list</h1>
      <p className="mt-1 text-sm text-ink-soft">
        The official list the school/college hands out. Visitors see it from
        the{" "}
        <a
          href="/ne/books/list"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-ink underline decoration-ink-soft/40 underline-offset-2"
        >
          Look for Book page
        </a>
        . Type it, upload a photo or PDF of it, or both.
      </p>
      <div className="mt-5">
        <BooklistForm
          action={saveBooklist}
          text={booklist?.text ?? ""}
          fileUrl={fileUrl}
          fileType={booklist?.file_type ?? null}
        />
      </div>
    </>
  );
}
