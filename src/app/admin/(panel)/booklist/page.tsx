import { requireAdmin } from "@/lib/admin/auth";
import BooklistForm from "@/components/admin/BooklistForm";
import { booklistFileUrl, getBooklist } from "@/lib/settings";
import { saveBooklist } from "./actions";

export default async function AdminBooklistPage() {
  await requireAdmin();

  const booklist = await getBooklist();
  const files = (booklist?.files ?? []).map((file) => ({
    path: file.path,
    type: file.type,
    label: file.label,
    url: booklistFileUrl(file),
  }));

  return (
    <>
      <h1 className="text-2xl font-semibold">School book lists</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Photos or PDFs of the official lists the school/college hands out.
        They appear as tappable cards on the public{" "}
        <a
          href="/ne/books"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-ink underline decoration-ink-soft/40 underline-offset-2"
        >
          Look for Book page
        </a>
        .
      </p>
      <div className="mt-5">
        <BooklistForm action={saveBooklist} files={files} />
      </div>
    </>
  );
}
