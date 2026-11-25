// Generated from the Biz Link public schema with:
// supabase gen types typescript --project-id iywrbvtzkfyhcbsiybke --schema public
// Do not edit by hand. Regenerate if the remote schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json | null
          staff_id: string | null
          staff_name: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: never
          metadata?: Json | null
          staff_id?: string | null
          staff_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: never
          metadata?: Json | null
          staff_id?: string | null
          staff_name?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          author_id: string | null
          author_name: string | null
          content: string | null
          created_at: string | null
          id: number
          priority: string | null
          published: boolean | null
          published_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          id?: never
          priority?: string | null
          published?: boolean | null
          published_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          id?: never
          priority?: string | null
          published?: boolean | null
          published_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          buyer_id: string | null
          created_at: string
          id: number
          last_message: string | null
          seller_id: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          id?: number
          last_message?: string | null
          seller_id?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          id?: number
          last_message?: string | null
          seller_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string | null
          conversation_id: number | null
          created_at: string
          id: number
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
        }
        Insert: {
          content?: string | null
          conversation_id?: number | null
          created_at?: string
          id?: number
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: number | null
          created_at?: string
          id?: number
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          description: string | null
          disputant_id: string | null
          id: number
          order_id: number | null
          reason: string | null
          resolution: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          disputant_id?: string | null
          id?: number
          order_id?: number | null
          reason?: string | null
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          disputant_id?: string | null
          id?: number
          order_id?: number | null
          reason?: string | null
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: number
          key: string
          subject: string
          updated_at: string | null
          variables: string[] | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: number
          key: string
          subject: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: number
          key?: string
          subject?: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      moderation_flags: {
        Row: {
          created_at: string
          flag_type: string
          flagged_by: string | null
          id: string
          reason: string
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          flag_type: string
          flagged_by?: string | null
          id?: string
          reason: string
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          flag_type?: string
          flagged_by?: string | null
          id?: string
          reason?: string
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: number
          is_read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: never
          is_read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: never
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_confirmed_at: string | null
          buyer_id: string
          buyer_name: string
          created_at: string
          id: number
          notes: string | null
          payment_amount: string | null
          payment_reference: string | null
          payment_status: string | null
          payout_queued_at: string | null
          payout_status: string | null
          product_id: number
          product_image_url: string | null
          product_name: string
          product_price: string | null
          quantity: number
          seller_id: string
          seller_name: string
          status: string
          store_id: number
          store_name: string
          updated_at: string
        }
        Insert: {
          buyer_confirmed_at?: string | null
          buyer_id: string
          buyer_name: string
          created_at?: string
          id?: never
          notes?: string | null
          payment_amount?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          payout_queued_at?: string | null
          payout_status?: string | null
          product_id: number
          product_image_url?: string | null
          product_name: string
          product_price?: string | null
          quantity?: number
          seller_id: string
          seller_name: string
          status?: string
          store_id: number
          store_name: string
          updated_at?: string
        }
        Update: {
          buyer_confirmed_at?: string | null
          buyer_id?: string
          buyer_name?: string
          created_at?: string
          id?: never
          notes?: string | null
          payment_amount?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          payout_queued_at?: string | null
          payout_status?: string | null
          product_id?: number
          product_image_url?: string | null
          product_name?: string
          product_price?: string | null
          quantity?: number
          seller_id?: string
          seller_name?: string
          status?: string
          store_id?: number
          store_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          amount: string
          created_at: string
          email: string
          id: number
          order_id: number | null
          reference: string
          status: string | null
        }
        Insert: {
          amount: string
          created_at: string
          email: string
          id?: never
          order_id?: number | null
          reference: string
          status?: string | null
        }
        Update: {
          amount?: string
          created_at?: string
          email?: string
          id?: never
          order_id?: number | null
          reference?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          product_id: number | null
          product_image: string | null
          product_name: string | null
          reason: string | null
          reporter_id: string | null
          reporter_name: string | null
          resolution: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: never
          product_id?: number | null
          product_image?: string | null
          product_name?: string | null
          reason?: string | null
          reporter_id?: string | null
          reporter_name?: string | null
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: never
          product_id?: number | null
          product_image?: string | null
          product_name?: string | null
          reason?: string | null
          reporter_id?: string | null
          reporter_name?: string | null
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          created_at: string
          id: number
          product_id: number | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          product_id?: number | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          product_id?: number | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "test_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string | null
          address: string | null
          avatar_url: string | null
          favorites: Json
          id: string
          is_online: boolean
          last_seen: string | null
          matric: string | null
          phone: string | null
          role: string | null
          student_email: string | null
          student_email_verified: boolean
          university: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          verification_status: string | null
        }
        Insert: {
          account_type?: string | null
          address?: string | null
          avatar_url?: string | null
          favorites?: Json
          id: string
          is_online?: boolean
          last_seen?: string | null
          matric?: string | null
          phone?: string | null
          role?: string | null
          student_email?: string | null
          student_email_verified?: boolean
          university?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          verification_status?: string | null
        }
        Update: {
          account_type?: string | null
          address?: string | null
          avatar_url?: string | null
          favorites?: Json
          id?: string
          is_online?: boolean
          last_seen?: string | null
          matric?: string | null
          phone?: string | null
          role?: string | null
          student_email?: string | null
          student_email_verified?: boolean
          university?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          banner_urls: Json | null
          created_at: string
          id: number
          subtitle: string | null
          title: string | null
        }
        Insert: {
          banner_urls?: Json | null
          created_at?: string
          id?: number
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          banner_urls?: Json | null
          created_at?: string
          id?: number
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reportable_id: string
          reportable_type: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reportable_id: string
          reportable_type: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reportable_id?: string
          reportable_type?: string
          reporter_id?: string
          status?: string
        }
        Relationships: []
      }
      staff_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          id: number
          module: string
          staff_id: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          id?: never
          module: string
          staff_id: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          id?: never
          module?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_permissions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          department: string | null
          email: string
          first_name: string
          hire_date: string | null
          id: string
          image_url: string | null
          last_name: string
          location: string | null
          manager_id: string | null
          meta: Json | null
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          first_name: string
          hire_date?: string | null
          id?: string
          image_url?: string | null
          last_name: string
          location?: string | null
          manager_id?: string | null
          meta?: Json | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          first_name?: string
          hire_date?: string | null
          id?: string
          image_url?: string | null
          last_name?: string
          location?: string | null
          manager_id?: string | null
          meta?: Json | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: number
          rating: number | null
          store_id: number | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: number
          rating?: number | null
          store_id?: number | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: number
          rating?: number | null
          store_id?: number | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "test_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      student_verifications: {
        Row: {
          created_at: string
          id: string
          matric_number: string
          status: string
          student_email: string | null
          university: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          matric_number: string
          status?: string
          student_email?: string | null
          university: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          matric_number?: string
          status?: string
          student_email?: string | null
          university?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_name: string | null
          assigned_to: string | null
          created_at: string
          id: number
          message: string
          priority: string | null
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          assigned_name?: string | null
          assigned_to?: string | null
          created_at?: string
          id?: number
          message: string
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          assigned_name?: string | null
          assigned_to?: string | null
          created_at?: string
          id?: number
          message?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      test_products: {
        Row: {
          blocked_at: string | null
          blocked_reason: string | null
          category: string | null
          condition: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: number
          image_urls: Json | null
          is_blocked: boolean
          location: string | null
          name: string | null
          price: string | null
          rating: string | null
          rejection_reason: string | null
          status: string | null
          stock: number | null
          store_id: number | null
          store_logo_url: string | null
          store_name: string | null
        }
        Insert: {
          blocked_at?: string | null
          blocked_reason?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: number
          image_urls?: Json | null
          is_blocked?: boolean
          location?: string | null
          name?: string | null
          price?: string | null
          rating?: string | null
          rejection_reason?: string | null
          status?: string | null
          stock?: number | null
          store_id?: number | null
          store_logo_url?: string | null
          store_name?: string | null
        }
        Update: {
          blocked_at?: string | null
          blocked_reason?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: number
          image_urls?: Json | null
          is_blocked?: boolean
          location?: string | null
          name?: string | null
          price?: string | null
          rating?: string | null
          rejection_reason?: string | null
          status?: string | null
          stock?: number | null
          store_id?: number | null
          store_logo_url?: string | null
          store_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "test_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      test_services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: number
          image_urls: Json | null
          name: string | null
          owner_whatsapp: string | null
          status: string | null
          store_id: number | null
          tags: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: number
          image_urls?: Json | null
          name?: string | null
          owner_whatsapp?: string | null
          status?: string | null
          store_id?: number | null
          tags?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: number
          image_urls?: Json | null
          name?: string | null
          owner_whatsapp?: string | null
          status?: string | null
          store_id?: number | null
          tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "test_services_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "test_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      test_stores: {
        Row: {
          category: string | null
          created_at: string
          details: string | null
          id: number
          link: string | null
          location: string | null
          logo_url: string | null
          name: string | null
          owner_id: string | null
          owner_uid: string | null
          phone: string | null
          tag_line: string | null
          tags: string | null
          whatsapp_number: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          details?: string | null
          id?: number
          link?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          owner_id?: string | null
          owner_uid?: string | null
          phone?: string | null
          tag_line?: string | null
          tags?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          details?: string | null
          id?: number
          link?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          owner_id?: string | null
          owner_uid?: string | null
          phone?: string | null
          tag_line?: string | null
          tags?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_stores_owner_uid_fkey"
            columns: ["owner_uid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_stores_owner_uid_fkey"
            columns: ["owner_uid"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_replies: {
        Row: {
          created_at: string
          id: number
          message: string
          staff_id: string | null
          staff_name: string | null
          ticket_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          staff_id?: string | null
          staff_name?: string | null
          ticket_id: number
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          staff_id?: string | null
          staff_name?: string | null
          ticket_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string
          description: string | null
          id: number
          order_id: number | null
          reference: string | null
          status: string
          type: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: number
          order_id?: number | null
          reference?: string | null
          status?: string
          type?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: number
          order_id?: number | null
          reference?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          account_type: string | null
          avatar_url: string | null
          id: string | null
          is_online: boolean | null
          student_email_verified: boolean | null
          university: string | null
          username: string | null
          verification_status: string | null
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          id?: string | null
          is_online?: boolean | null
          student_email_verified?: boolean | null
          university?: string | null
          username?: string | null
          verification_status?: string | null
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          id?: string | null
          is_online?: boolean | null
          student_email_verified?: boolean | null
          university?: string | null
          username?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _move_product_row: {
        Args: { row_id: number; source_table: unknown; target_table: unknown }
        Returns: number
      }
      approve_product: { Args: { review_id: number }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      is_ceo: { Args: never; Returns: boolean }
      is_ceo_or_manager: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      reject_product: { Args: { review_id: number }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
