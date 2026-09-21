export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RoomStatus = 'CREATED' | 'LOBBY' | 'ACTIVE' | 'TIME_EXPIRED' | 'FINALIZED';

export type ActivityEventType =
  | 'ROOM_CREATED'
  | 'TEAM_CONFIGURED'
  | 'LOBBY_OPENED'
  | 'TEAM_CLAIMED'
  | 'TEAM_RELEASED'
  | 'GAME_STARTED'
  | 'CASH_SET'
  | 'CV_SET'
  | 'ADJUSTMENT'
  | 'BUSINESS_ADDED'
  | 'BUSINESS_LEVEL_SET'
  | 'BUSINESS_REMOVED'
  | 'BANKRUPTCY_SET'
  | 'TIEBREAK_SET'
  | 'TIME_EXPIRED'
  | 'GAME_FINALIZED'
  | 'GAME_ABORTED';

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          user_id: string;
        };
        Insert: {
          user_id: string;
        };
        Update: {
          user_id?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          code: string;
          status: RoomStatus;
          team_count: number;
          duration_seconds: number;
          started_at: string | null;
          ends_at: string | null;
          finalized_at: string | null;
          winner_team_id: string | null;
          tiebreak_note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          status?: RoomStatus;
          team_count: number;
          duration_seconds?: number;
          started_at?: string | null;
          ends_at?: string | null;
          finalized_at?: string | null;
          winner_team_id?: string | null;
          tiebreak_note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          status?: RoomStatus;
          team_count?: number;
          duration_seconds?: number;
          started_at?: string | null;
          ends_at?: string | null;
          finalized_at?: string | null;
          winner_team_id?: string | null;
          tiebreak_note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_rooms_winner_team';
            columns: ['winner_team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      teams: {
        Row: {
          id: string;
          room_id: string;
          slot: number;
          name: string;
          color: string;
          cash: number;
          cv: number;
          is_bankrupt: boolean;
          tiebreak_order: number | null;
          version: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          slot: number;
          name: string;
          color: string;
          cash?: number;
          cv?: number;
          is_bankrupt?: boolean;
          tiebreak_order?: number | null;
          version?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          slot?: number;
          name?: string;
          color?: string;
          cash?: number;
          cv?: number;
          is_bankrupt?: boolean;
          tiebreak_order?: number | null;
          version?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'teams_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      team_secrets: {
        Row: {
          team_id: string;
          join_pin: string;
        };
        Insert: {
          team_id: string;
          join_pin: string;
        };
        Update: {
          team_id?: string;
          join_pin?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_secrets_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: true;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      team_claims: {
        Row: {
          user_id: string;
          team_id: string;
          claimed_at: string;
        };
        Insert: {
          user_id: string;
          team_id: string;
          claimed_at?: string;
        };
        Update: {
          user_id?: string;
          team_id?: string;
          claimed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_claims_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      join_attempts: {
        Row: {
          id: number;
          user_id: string | null;
          team_id: string | null;
          success: boolean | null;
          attempted_at: string;
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          team_id?: string | null;
          success?: boolean | null;
          attempted_at?: string;
        };
        Update: {
          id?: never;
          user_id?: string | null;
          team_id?: string | null;
          success?: boolean | null;
          attempted_at?: string;
        };
        Relationships: [];
      };
      business_catalog: {
        Row: {
          key: string;
          name: string;
          cost: number;
          initial_cv: number;
          u1_cost: number;
          u2_cost: number;
          u1_cv: number;
          u2_cv: number;
          is_provisional: boolean;
          sort_order: number;
        };
        Insert: {
          key: string;
          name: string;
          cost: number;
          initial_cv: number;
          u1_cost: number;
          u2_cost: number;
          u1_cv?: number;
          u2_cv?: number;
          is_provisional?: boolean;
          sort_order: number;
        };
        Update: {
          key?: string;
          name?: string;
          cost?: number;
          initial_cv?: number;
          u1_cost?: number;
          u2_cost?: number;
          u1_cv?: number;
          u2_cv?: number;
          is_provisional?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      team_businesses: {
        Row: {
          id: string;
          room_id: string;
          team_id: string;
          business_key: string;
          level: number;
          acquired_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          team_id: string;
          business_key: string;
          level?: number;
          acquired_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          team_id?: string;
          business_key?: string;
          level?: number;
          acquired_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_businesses_business_key_fkey';
            columns: ['business_key'];
            isOneToOne: false;
            referencedRelation: 'business_catalog';
            referencedColumns: ['key'];
          },
          {
            foreignKeyName: 'team_businesses_team_id_room_id_fkey';
            columns: ['team_id', 'room_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id', 'room_id'];
          },
        ];
      };
      activity_events: {
        Row: {
          id: number;
          room_id: string;
          team_id: string | null;
          group_id: string | null;
          request_id: string | null;
          type: ActivityEventType;
          business_key: string | null;
          prev: Json | null;
          new: Json | null;
          note: string | null;
          is_correction: boolean;
          actor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          room_id: string;
          team_id?: string | null;
          group_id?: string | null;
          request_id?: string | null;
          type: ActivityEventType;
          business_key?: string | null;
          prev?: Json | null;
          new?: Json | null;
          note?: string | null;
          is_correction?: boolean;
          actor_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          room_id?: string;
          team_id?: string | null;
          group_id?: string | null;
          request_id?: string | null;
          type?: ActivityEventType;
          business_key?: string | null;
          prev?: Json | null;
          new?: Json | null;
          note?: string | null;
          is_correction?: boolean;
          actor_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_events_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_events_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      final_results: {
        Row: {
          room_id: string;
          team_id: string;
          rank: number;
          cv: number;
          cash: number;
          business_count: number;
          is_bankrupt: boolean;
        };
        Insert: {
          room_id: string;
          team_id: string;
          rank: number;
          cv: number;
          cash: number;
          business_count: number;
          is_bankrupt: boolean;
        };
        Update: {
          room_id?: string;
          team_id?: string;
          rank?: number;
          cv?: number;
          cash?: number;
          business_count?: number;
          is_bankrupt?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'final_results_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'final_results_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      app_now: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      server_time: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      expire_if_due: {
        Args: { p_room_id: string };
        Returns: RoomStatus;
      };
      admin_create_room: {
        Args: { team_count: number; teams: Json };
        Returns: Json;
      };
      admin_update_team_config: {
        Args: { team_id: string; name: string; color: string };
        Returns: Json;
      };
      admin_open_lobby: {
        Args: { room_id: string };
        Returns: Json;
      };
      admin_release_team: {
        Args: { team_id: string };
        Returns: Json;
      };
      admin_start_game: {
        Args: { room_id: string; force?: boolean };
        Returns: Json;
      };
      admin_set_team_values: {
        Args: {
          team_id: string;
          cash?: number | null;
          cv?: number | null;
          expected_version?: number;
          request_id?: string | null;
          note?: string | null;
        };
        Returns: Json;
      };
      admin_adjust: {
        Args: {
          changes: Json;
          label: string;
          note?: string | null;
          request_id?: string | null;
        };
        Returns: Json;
      };
      admin_add_business: {
        Args: {
          team_id: string;
          business_key: string;
          apply_purchase?: boolean;
          expected_version?: number;
          request_id?: string | null;
          note?: string | null;
        };
        Returns: Json;
      };
      admin_set_business_level: {
        Args: {
          team_id: string;
          business_key: string;
          new_level: number;
          apply_upgrade?: boolean;
          expected_version?: number;
          request_id?: string | null;
          note?: string | null;
        };
        Returns: Json;
      };
      admin_remove_business: {
        Args: {
          team_id: string;
          business_key: string;
          reason: string;
          credit_resale?: boolean;
          expected_version?: number;
          request_id?: string | null;
          note?: string | null;
        };
        Returns: Json;
      };
      admin_set_bankrupt: {
        Args: {
          team_id: string;
          value: boolean;
          expected_version?: number;
          request_id?: string | null;
          note?: string | null;
        };
        Returns: Json;
      };
      admin_set_tiebreak: {
        Args: {
          room_id: string;
          ordered_team_ids: string[];
          note?: string | null;
        };
        Returns: Json;
      };
      get_admin_snapshot: {
        Args: { room_id: string };
        Returns: Json;
      };
      list_history: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_history_detail: {
        Args: { room_id: string };
        Returns: Json;
      };
      get_lobby: {
        Args: { code: string };
        Returns: Json;
      };
      join_team: {
        Args: { code: string; slot: number; pin: string };
        Returns: Json;
      };
      get_my_state: {
        Args: Record<PropertyKey, never>;
        Returns: Json | null;
      };
      room_standings: {
        Args: { p_room_id: string };
        Returns: {
          team_id: string;
          slot: number;
          name: string;
          rank: number;
          is_bankrupt: boolean;
          cv: number;
          cash: number;
          business_count: number;
          tiebreak_order: number | null;
          tie_unresolved: boolean;
        }[];
      };
      get_standings: {
        Args: { p_room_id: string };
        Returns: Json;
      };
      admin_finalize: {
        Args: { p_room_id: string };
        Returns: Json;
      };
      admin_abort_game: {
        Args: { room_id: string; note?: string | null };
        Returns: Json;
      };
    };
    Enums: {
      room_status: RoomStatus;
      activity_event_type: ActivityEventType;
    };
    CompositeTypes: Record<string, never>;
  };
}
