// Hand-written to match supabase/migrations/*.sql until a live project lets
// us run `supabase gen types typescript` for the generated version.

export type OrgRole = "owner" | "admin" | "member";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          email: string;
          full_name: string | null;
        }>;
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string;
          write_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_by: string;
          write_key?: string;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          slug: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      org_members: {
        Row: {
          org_id: string;
          user_id: string;
          role: OrgRole;
          invited_by: string | null;
          created_at: string;
        };
        Insert: {
          org_id: string;
          user_id: string;
          role?: OrgRole;
          invited_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          role: OrgRole;
        }>;
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "org_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_log: {
        Row: {
          id: string;
          org_id: string;
          actor_id: string | null;
          action: string;
          target_type: string;
          target_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          actor_id?: string | null;
          action: string;
          target_type: string;
          target_id?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<{
          metadata: Record<string, unknown>;
        }>;
        Relationships: [
          {
            foreignKeyName: "audit_log_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string;
          org_id: string;
          distinct_id: string;
          event_name: string;
          properties: Record<string, unknown>;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          distinct_id: string;
          event_name: string;
          properties?: Record<string, unknown>;
          occurred_at?: string;
          created_at?: string;
        };
        Update: Partial<{
          properties: Record<string, unknown>;
        }>;
        Relationships: [
          {
            foreignKeyName: "events_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      features: {
        Row: {
          id: string;
          org_id: string;
          key: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          key: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          key: string;
          name: string;
          description: string | null;
        }>;
        Relationships: [
          {
            foreignKeyName: "features_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      feedback_items: {
        Row: {
          id: string;
          org_id: string;
          source: string;
          author: string | null;
          body: string;
          sentiment: string | null;
          theme: string | null;
          embedding: number[] | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          source?: string;
          author?: string | null;
          body: string;
          sentiment?: string | null;
          theme?: string | null;
          embedding?: number[] | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          sentiment: string | null;
          theme: string | null;
          embedding: number[] | null;
        }>;
        Relationships: [
          {
            foreignKeyName: "feedback_items_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
