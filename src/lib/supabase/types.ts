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
          class_id: number;
          subject: string;
          title_en: string;
          title_ne: string | null;
          publisher: string | null;
          price: number | null;
          status: BookStatus;
          units: number;
          expected_arrival: string | null;
          stream: Stream | null;
          /** Path inside the public `covers` storage bucket; null = placeholder. */
          cover_path: string | null;
          updated_at: string;
          /** Generated column (title_en ∥ title_ne ∥ subject ∥ publisher). */
          search: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          class_id: number;
          subject: string;
          title_en: string;
          title_ne?: string | null;
          publisher?: string | null;
          price?: number | null;
          status?: BookStatus;
          units?: number;
          expected_arrival?: string | null;
          stream?: Stream | null;
          cover_path?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          class_id?: number;
          subject?: string;
          title_en?: string;
          title_ne?: string | null;
          publisher?: string | null;
          price?: number | null;
          status?: BookStatus;
          units?: number;
          expected_arrival?: string | null;
          stream?: Stream | null;
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
        ];
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
export type Inquiry = Database["public"]["Tables"]["inquiries"]["Row"];
export type PrintQuote = Database["public"]["Tables"]["print_quotes"]["Row"];
