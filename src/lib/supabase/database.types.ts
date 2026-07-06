// Hand-written to match supabase/migrations/*.sql until a live project lets
// us run `supabase gen types typescript` for the generated version.

export type OrgRole = "owner" | "admin" | "member";
export type RoadmapStatus = "backlog" | "planned" | "in_progress" | "shipped";

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
      roadmap_items: {
        Row: {
          id: string;
          org_id: string;
          title: string;
          description: string | null;
          status: RoadmapStatus;
          target_quarter: string | null;
          linked_feature_id: string | null;
          priority_score: number | null;
          priority_rationale: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          title: string;
          description?: string | null;
          status?: RoadmapStatus;
          target_quarter?: string | null;
          linked_feature_id?: string | null;
          priority_score?: number | null;
          priority_rationale?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          title: string;
          description: string | null;
          status: RoadmapStatus;
          target_quarter: string | null;
          linked_feature_id: string | null;
          priority_score: number | null;
          priority_rationale: string | null;
          updated_at: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "roadmap_items_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roadmap_items_linked_feature_id_fkey";
            columns: ["linked_feature_id"];
            isOneToOne: false;
            referencedRelation: "features";
            referencedColumns: ["id"];
          }
        ];
      };
      roadmap_item_dependencies: {
        Row: {
          roadmap_item_id: string;
          depends_on_item_id: string;
          org_id: string;
          created_at: string;
        };
        Insert: {
          roadmap_item_id: string;
          depends_on_item_id: string;
          org_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "roadmap_item_dependencies_roadmap_item_id_fkey";
            columns: ["roadmap_item_id"];
            isOneToOne: false;
            referencedRelation: "roadmap_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roadmap_item_dependencies_depends_on_item_id_fkey";
            columns: ["depends_on_item_id"];
            isOneToOne: false;
            referencedRelation: "roadmap_items";
            referencedColumns: ["id"];
          }
        ];
      };
      prd_drafts: {
        Row: {
          id: string;
          org_id: string;
          feature_idea: string;
          title: string;
          user_stories: string[];
          acceptance_criteria: string[];
          success_metrics: string[];
          risks: string[];
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          feature_idea: string;
          title: string;
          user_stories?: string[];
          acceptance_criteria?: string[];
          success_metrics?: string[];
          risks?: string[];
          created_by?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "prd_drafts_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      feature_flags: {
        Row: {
          id: string;
          org_id: string;
          key: string;
          name: string;
          description: string | null;
          is_enabled: boolean;
          rollout_pct: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          key: string;
          name: string;
          description?: string | null;
          is_enabled?: boolean;
          rollout_pct?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          description: string | null;
          is_enabled: boolean;
          rollout_pct: number;
        }>;
        Relationships: [
          {
            foreignKeyName: "feature_flags_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      experiments: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          variant_a_name: string;
          variant_b_name: string;
          visitors_a: number;
          conversions_a: number;
          visitors_b: number;
          conversions_b: number;
          p_value: number | null;
          is_significant: boolean | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          variant_a_name?: string;
          variant_b_name?: string;
          visitors_a?: number;
          conversions_a?: number;
          visitors_b?: number;
          conversions_b?: number;
          p_value?: number | null;
          is_significant?: boolean | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          visitors_a: number;
          conversions_a: number;
          visitors_b: number;
          conversions_b: number;
          p_value: number | null;
          is_significant: boolean | null;
          updated_at: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "experiments_org_id_fkey";
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
