-- 0004_book_streams — Class 11/12 stream tag on books.
--
-- null = the book is not stream-specific: every class below 11, and 11/12
-- books that all streams share (compulsory English/Nepali etc.). The public
-- Look-for-Book page shows a stream filter only for class 11/12 and always
-- includes null-stream books in each stream's results.

alter table books add column stream text
  check (stream in ('science', 'management', 'arts'));
