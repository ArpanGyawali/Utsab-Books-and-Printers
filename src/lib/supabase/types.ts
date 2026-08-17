/**
 * Database types for supabase-js.
 *
 * Hand-written to mirror supabase/migrations/*.sql (the Supabase CLI isn't
 * available in this environment). If the schema changes, update BOTH the
 * migration and this file — or regenerate with
 * `supabase gen types typescript` once the CLI is set up.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BookStatus = "in_stock" | "out_of_stock" | "arriving";

/** Class 11/12 stream; null = common to all streams (and classes below 11). */
export type Stream = "science" | "management" | "arts";

/**
 * Non-school books ("Other books" shelf); null = school textbook. A `slug`
 * from the admin-managed `book_genres` table (0011) — dynamic, so a string.
 */
export type Genre = string;

/**
 * Stationery showcase category (products.category). A `slug` from the
 * admin-managed `stationery_categories` table (0011) — dynamic, so a string.
 */
export type ProductCategory = string;

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name_en: string;
          name_ne: string;
          slug: string;
          active: boolean;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_ne: string;
          slug: string;
          active?: boolean;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_ne?: string;
          slug?: string;
          active?: boolean;
        };
        Relationships: [];
      };
      classes: {
        Row: {
          id: number;
          name_en: string;
          name_ne: string;
          sort: number;
        };
        Insert: {
          id: number;
          name_en: string;
          name_ne: string;
          sort: number;
        };
        Update: {
          id?: number;
          name_en?: string;
          name_ne?: string;
          sort?: number;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          school_id: string;
          /** null = non-school book (see genre). */
          class_id: number | null;
          subject: string;
          title_en: string;
          title_ne: string | null;
          publisher: string | null;
          price: number | null;
          status: BookStatus;
          units: number;
          expected_arrival: string | null;
          stream: Stream | null;
          /** Set exactly when class_id is null (books_genre_xor_class). */
          genre: Genre | null;
          /** Path inside the public `covers` storage bucket; null = placeholder. */
          cover_path: string | null;
          updated_at: string;
          /** Generated column (title_en ∥ title_ne ∥ subject ∥ publisher). */
          search: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          class_id?: number | null;
          subject: string;
          title_en: string;
          title_ne?: string | null;
          publisher?: string | null;
          price?: number | null;
          status?: BookStatus;
          units?: number;
          expected_arrival?: string | null;
          stream?: Stream | null;
          genre?: Genre | null;
          cover_path?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          class_id?: number | null;
          subject?: string;
          title_en?: string;
          title_ne?: string | null;
          publisher?: string | null;
          price?: number | null;
          status?: BookStatus;
          units?: number;
          expected_arrival?: string | null;
          stream?: Stream | null;
          genre?: Genre | null;
          cover_path?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "books_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "books_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "books_genre_fk";
            columns: ["genre"];
            isOneToOne: false;
            referencedRelation: "book_genres";
            referencedColumns: ["slug"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name_en: string;
          name_ne: string | null;
          category: ProductCategory;
          price: number | null;
          /** Path inside the public `products` storage bucket; null = placeholder. */
          image_path: string | null;
          visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_ne?: string | null;
          category: ProductCategory;
          price?: number | null;
          image_path?: string | null;
          visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_ne?: string | null;
          category?: ProductCategory;
          price?: number | null;
          image_path?: string | null;
          visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_fk";
            columns: ["category"];
            isOneToOne: false;
            referencedRelation: "stationery_categories";
            referencedColumns: ["slug"];
          },
        ];
      };
      book_genres: {
        Row: {
          slug: string;
          name_en: string;
          name_ne: string | null;
          sort: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          slug: string;
          name_en: string;
          name_ne?: string | null;
          sort?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name_en?: string;
          name_ne?: string | null;
          sort?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      stationery_categories: {
        Row: {
          slug: string;
          name_en: string;
          name_ne: string | null;
          sort: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          slug: string;
          name_en: string;
          name_ne?: string | null;
          sort?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name_en?: string;
          name_ne?: string | null;
          sort?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          book_id: string;
          phone: string;
          created_at: string;
          notified: boolean;
          /** Last time the owner tapped Notify; purged 5 days later. */
          notified_at: string | null;
        };
        Insert: {
          id?: string;
          book_id: string;
          phone: string;
          created_at?: string;
          notified?: boolean;
          notified_at?: string | null;
        };
        Update: {
          id?: string;
          book_id?: string;
          phone?: string;
          created_at?: string;
          notified?: boolean;
          notified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: { key: string; value: Json };
        Insert: { key: string; value: Json };
        Update: { key?: string; value?: Json };
        Relationships: [];
      };
      events: {
        Row: {
          id: number;
          type: string;
          locale: string | null;
          data: Json;
          created_at: string;
        };
        Insert: {
          type: string;
          locale?: string | null;
          data?: Json;
          created_at?: string;
        };
        Update: {
          type?: string;
          locale?: string | null;
          data?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      print_quotes: {
        Row: {
          id: string;
          name: string;
          phone: string;
          description: string;
          pages: number | null;
          color: boolean | null;
          binding: string | null;
          created_at: string;
          handled: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          description: string;
          pages?: number | null;
          color?: boolean | null;
          binding?: string | null;
          created_at?: string;
          handled?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          description?: string;
          pages?: number | null;
          color?: boolean | null;
          binding?: string | null;
          created_at?: string;
          handled?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type School = Database["public"]["Tables"]["schools"]["Row"];
export type ClassRow = Database["public"]["Tables"]["classes"]["Row"];
export type Book = Database["public"]["Tables"]["books"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type BookGenre = Database["public"]["Tables"]["book_genres"]["Row"];
export type StationeryCategory =
  Database["public"]["Tables"]["stationery_categories"]["Row"];
export type Inquiry = Database["public"]["Tables"]["inquiries"]["Row"];
export type PrintQuote = Database["public"]["Tables"]["print_quotes"]["Row"];
