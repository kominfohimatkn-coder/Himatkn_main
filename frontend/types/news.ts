export type NewsStatus = "draft" | "published" | "archived";

export interface NewsTag {
  id: number;
  name: string;
  slug: string;
}

export interface NewsImage {
  id: number;
  news_id: number;
  storage_key: string;
  url: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface AdminNews {
  id: number;
  author_id: number | null;
  title: string;
  slug: string;
  content: string;
  featured_image: string | null;
  status: NewsStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags: NewsTag[];
  images: NewsImage[];
}

export interface PublicNewsBase {
  id: number;
  title: string;
  slug: string;
  featured_image: string | null;
  published_at: string | null;
  tags: NewsTag[];
  images: NewsImage[];
}

export interface PublicNewsItem extends PublicNewsBase {
  /** Potongan teks polos dari `content`, dibuat di server. */
  excerpt: string;
}

/**
 * Detail berita mengirim `content` penuh dan `tags`, tetapi tidak mengirim
 * `excerpt` (lihat `Backend/app/routers/public.py`).
 */
export interface PublicNewsDetail extends PublicNewsBase {
  content: string;
}

export interface PublicNewsListResponse {
  items: PublicNewsItem[];
  total: number;
  offset: number;
  limit: number;
}

export interface NewsListResponse<T> {
  items: T[];
  offset: number;
  limit: number;
}

export interface CreateNewsPayload {
  title: string;
  content: string;
  slug?: string;
  status?: NewsStatus;
  tag_ids?: number[];
}

export type UpdateNewsPayload = Partial<CreateNewsPayload>;

export interface CreateNewsTagPayload {
  name: string;
}
