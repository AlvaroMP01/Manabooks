export interface Book {
  volumeId: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
  publishedDate: string | null;
  description: string | null;
  pageCount: number | null;
  categories: string[];
  language: string | null;
  previewLink: string | null;
}

export interface BooksSearchResult {
  items: Book[];
  total: number;
}
