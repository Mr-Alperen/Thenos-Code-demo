// ==============================
// Base JSON Type
// ==============================
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ==============================
// Supabase Database Schema
// (AUTO-GENERATED CORE — dokunma)
// ==============================
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      forum_channels: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      forum_messages: {
        Row: {
          id: string;
          channel_id: string;
          user_id: string;
          content: string;
          code_snippet: string | null;
          code_language: string | null;
          file_url: string | null;
          file_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          user_id: string;
          content: string;
          code_snippet?: string | null;
          code_language?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          channel_id?: string;
          user_id?: string;
          content?: string;
          code_snippet?: string | null;
          code_language?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "forum_messages_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "forum_channels";
            referencedColumns: ["id"];
          }
        ];
      };

      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          birth_date: string | null;
          gender: string | null;
          email: string;
          emergency_password_hash: string | null; // 🔐 artık hash
          github_url: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          birth_date?: string | null;
          gender?: string | null;
          email: string;
          emergency_password_hash?: string | null;
          github_url?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          birth_date?: string | null;
          gender?: string | null;
          email?: string;
          emergency_password_hash?: string | null;
          github_url?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };

    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

// ==============================
// 🔥 Developer Helper Types
// ==============================

type PublicSchema = Database["public"];

/** Tablonun satır tipini verir */
export type Row<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

/** Insert tipi */
export type InsertDto<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

/** Update tipi */
export type UpdateDto<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

/** Tablo isimleri union */
export type TableName = keyof PublicSchema["Tables"];

/** Realtime payload helper */
export type RealtimeInsert<T extends TableName> = {
  new: Row<T>;
  old: null;
};

export type RealtimeUpdate<T extends TableName> = {
  new: Row<T>;
  old: Row<T>;
};

export type RealtimeDelete<T extends TableName> = {
  old: Row<T>;
  new: null;
};

// ==============================
// 🎯 ÖRNEK KULLANIM
// ==============================
// type Profile = Row<"profiles">;
// type NewMessage = InsertDto<"forum_messages">;
// type UpdateProfile = UpdateDto<"profiles">;
