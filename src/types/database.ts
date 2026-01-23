/**
 * Supabase Database Types
 * Generated based on database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          phone: string
          name: string
          photo_url: string | null
          language: 'ru' | 'he' | 'en' | 'ar'
          is_verified: boolean
          verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
          current_mode: 'free-world' | 'worker' | 'employer'
          referral_code: string | null
          referred_by: string | null
          created_at: string
          updated_at: string
          last_active_at: string
        }
        Insert: {
          id: string
          phone: string
          name: string
          photo_url?: string | null
          language?: 'ru' | 'he' | 'en' | 'ar'
          is_verified?: boolean
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected'
          current_mode?: 'free-world' | 'worker' | 'employer'
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          phone?: string
          name?: string
          photo_url?: string | null
          language?: 'ru' | 'he' | 'en' | 'ar'
          is_verified?: boolean
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected'
          current_mode?: 'free-world' | 'worker' | 'employer'
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
        Relationships: []
      }
      worker_profiles: {
        Row: {
          id: string
          age: number | null
          city: string | null
          specialization: string | null
          experience: number
          about: string | null
          has_car: boolean
          has_tools: boolean
          team_size: number
          min_rate: number
          max_rate: number
          availability: 'now' | 'today' | 'tomorrow' | 'flexible'
          availability_status: 'available' | 'busy' | 'offline'
          available_until: string | null
          completed_shifts: number
          total_earned: number
          total_hours: number
          rating: number
          review_count: number
          reliability_score: number
          response_time: number
          on_time_rate: number
          is_pro: boolean
          pro_expires_at: string | null
          location_lat: number | null
          location_lng: number | null
          location_address: string | null
          stripe_account_id: string | null
          skills: string[] | null
          languages: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          age?: number | null
          city?: string | null
          specialization?: string | null
          experience?: number
          about?: string | null
          has_car?: boolean
          has_tools?: boolean
          team_size?: number
          min_rate?: number
          max_rate?: number
          availability?: 'now' | 'today' | 'tomorrow' | 'flexible'
          availability_status?: 'available' | 'busy' | 'offline'
          available_until?: string | null
          completed_shifts?: number
          total_earned?: number
          total_hours?: number
          rating?: number
          review_count?: number
          reliability_score?: number
          response_time?: number
          on_time_rate?: number
          is_pro?: boolean
          pro_expires_at?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          stripe_account_id?: string | null
          skills?: string[] | null
          languages?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          age?: number | null
          city?: string | null
          specialization?: string | null
          experience?: number
          about?: string | null
          has_car?: boolean
          has_tools?: boolean
          team_size?: number
          min_rate?: number
          max_rate?: number
          availability?: 'now' | 'today' | 'tomorrow' | 'flexible'
          availability_status?: 'available' | 'busy' | 'offline'
          available_until?: string | null
          completed_shifts?: number
          total_earned?: number
          total_hours?: number
          rating?: number
          review_count?: number
          reliability_score?: number
          response_time?: number
          on_time_rate?: number
          is_pro?: boolean
          pro_expires_at?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          stripe_account_id?: string | null
          skills?: string[] | null
          languages?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      employer_profiles: {
        Row: {
          id: string
          company: string
          contact_person: string | null
          city: string | null
          industry: string | null
          plan: 'free' | 'pro' | 'business'
          plan_expires_at: string | null
          shifts_posted: number
          shifts_completed: number
          total_paid: number
          rating: number
          review_count: number
          stripe_customer_id: string | null
          stripe_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company: string
          contact_person?: string | null
          city?: string | null
          industry?: string | null
          plan?: 'free' | 'pro' | 'business'
          plan_expires_at?: string | null
          shifts_posted?: number
          shifts_completed?: number
          total_paid?: number
          rating?: number
          review_count?: number
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company?: string
          contact_person?: string | null
          city?: string | null
          industry?: string | null
          plan?: 'free' | 'pro' | 'business'
          plan_expires_at?: string | null
          shifts_posted?: number
          shifts_completed?: number
          total_paid?: number
          rating?: number
          review_count?: number
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      worker_documents: {
        Row: {
          id: string
          user_id: string
          type: 'passport' | 'work_permit' | 'driver_license' | 'other'
          image_url: string
          verification_status: 'pending' | 'verified' | 'rejected'
          verified_at: string | null
          verified_by: string | null
          rejection_reason: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'passport' | 'work_permit' | 'driver_license' | 'other'
          image_url: string
          verification_status?: 'pending' | 'verified' | 'rejected'
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'passport' | 'work_permit' | 'driver_license' | 'other'
          image_url?: string
          verification_status?: 'pending' | 'verified' | 'rejected'
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          uploaded_at?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          id: string
          user_id: string
          image_url: string
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          caption?: string | null
          created_at?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          id: string
          employer_id: string
          title: string
          description: string | null
          city: string
          address: string | null
          location_lat: number | null
          location_lng: number | null
          date: string
          start_time: string
          end_time: string
          urgency: 'instant' | 'today' | 'scheduled'
          base_rate: number
          surge_multiplier: number
          total_estimate: number | null
          payment_guarantee: boolean
          slots: number
          filled: number
          needs_car: boolean
          needs_tools: boolean
          needs_team: number
          min_experience: number
          min_rating: number
          required_skills: string[] | null
          specialization: string | null
          status: 'pending' | 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
          is_instant: boolean
          accepts_teams: boolean
          has_escrow: boolean
          moderated_at: string | null
          moderated_by: string | null
          rejection_reason: string | null
          view_count: number
          applicant_count: number
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          employer_id: string
          title: string
          description?: string | null
          city: string
          address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          date: string
          start_time: string
          end_time: string
          urgency?: 'instant' | 'today' | 'scheduled'
          base_rate: number
          surge_multiplier?: number
          total_estimate?: number | null
          payment_guarantee?: boolean
          slots?: number
          filled?: number
          needs_car?: boolean
          needs_tools?: boolean
          needs_team?: number
          min_experience?: number
          min_rating?: number
          required_skills?: string[] | null
          specialization?: string | null
          status?: 'pending' | 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
          is_instant?: boolean
          accepts_teams?: boolean
          has_escrow?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          rejection_reason?: string | null
          view_count?: number
          applicant_count?: number
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          employer_id?: string
          title?: string
          description?: string | null
          city?: string
          address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          date?: string
          start_time?: string
          end_time?: string
          urgency?: 'instant' | 'today' | 'scheduled'
          base_rate?: number
          surge_multiplier?: number
          total_estimate?: number | null
          payment_guarantee?: boolean
          slots?: number
          filled?: number
          needs_car?: boolean
          needs_tools?: boolean
          needs_team?: number
          min_experience?: number
          min_rating?: number
          required_skills?: string[] | null
          specialization?: string | null
          status?: 'pending' | 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
          is_instant?: boolean
          accepts_teams?: boolean
          has_escrow?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          rejection_reason?: string | null
          view_count?: number
          applicant_count?: number
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Relationships: []
      }
      task_flows: {
        Row: {
          id: string
          shift_id: string
          worker_id: string
          status: 'applied' | 'reviewing' | 'approved' | 'rejected' | 'upcoming' | 'in_progress' | 'completed' | 'awaiting_review' | 'reviewed' | 'payment_pending' | 'paid' | 'cancelled' | 'disputed'
          applied_at: string
          reviewed_at: string | null
          approved_at: string | null
          started_at: string | null
          completed_at: string | null
          paid_at: string | null
          agreed_rate: number
          hours_worked: number | null
          total_amount: number | null
          payment_status: 'pending' | 'processing' | 'escrowed' | 'released' | 'disputed' | 'failed'
          application_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shift_id: string
          worker_id: string
          status?: 'applied' | 'reviewing' | 'approved' | 'rejected' | 'upcoming' | 'in_progress' | 'completed' | 'awaiting_review' | 'reviewed' | 'payment_pending' | 'paid' | 'cancelled' | 'disputed'
          applied_at?: string
          reviewed_at?: string | null
          approved_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          paid_at?: string | null
          agreed_rate: number
          hours_worked?: number | null
          total_amount?: number | null
          payment_status?: 'pending' | 'processing' | 'escrowed' | 'released' | 'disputed' | 'failed'
          application_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shift_id?: string
          worker_id?: string
          status?: 'applied' | 'reviewing' | 'approved' | 'rejected' | 'upcoming' | 'in_progress' | 'completed' | 'awaiting_review' | 'reviewed' | 'payment_pending' | 'paid' | 'cancelled' | 'disputed'
          applied_at?: string
          reviewed_at?: string | null
          approved_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          paid_at?: string | null
          agreed_rate?: number
          hours_worked?: number | null
          total_amount?: number | null
          payment_status?: 'pending' | 'processing' | 'escrowed' | 'released' | 'disputed' | 'failed'
          application_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          author_id: string
          target_id: string
          task_flow_id: string | null
          shift_id: string | null
          rating: number
          comment: string | null
          target_type: 'worker' | 'employer'
          is_hidden: boolean
          hidden_reason: string | null
          hidden_by: string | null
          report_count: number
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          target_id: string
          task_flow_id?: string | null
          shift_id?: string | null
          rating: number
          comment?: string | null
          target_type: 'worker' | 'employer'
          is_hidden?: boolean
          hidden_reason?: string | null
          hidden_by?: string | null
          report_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          target_id?: string
          task_flow_id?: string | null
          shift_id?: string | null
          rating?: number
          comment?: string | null
          target_type?: 'worker' | 'employer'
          is_hidden?: boolean
          hidden_reason?: string | null
          hidden_by?: string | null
          report_count?: number
          created_at?: string
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          id: string
          task_flow_id: string
          shift_id: string
          worker_id: string
          employer_id: string
          amount: number
          platform_fee: number
          worker_payout: number
          status: 'pending' | 'escrowed' | 'released' | 'refunded' | 'disputed'
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          created_at: string
          escrowed_at: string | null
          released_at: string | null
          refunded_at: string | null
          refund_reason: string | null
        }
        Insert: {
          id?: string
          task_flow_id: string
          shift_id: string
          worker_id: string
          employer_id: string
          amount: number
          platform_fee: number
          worker_payout: number
          status?: 'pending' | 'escrowed' | 'released' | 'refunded' | 'disputed'
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          created_at?: string
          escrowed_at?: string | null
          released_at?: string | null
          refunded_at?: string | null
          refund_reason?: string | null
        }
        Update: {
          id?: string
          task_flow_id?: string
          shift_id?: string
          worker_id?: string
          employer_id?: string
          amount?: number
          platform_fee?: number
          worker_payout?: number
          status?: 'pending' | 'escrowed' | 'released' | 'refunded' | 'disputed'
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          created_at?: string
          escrowed_at?: string | null
          released_at?: string | null
          refunded_at?: string | null
          refund_reason?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'pro' | 'business'
          is_active: boolean
          stripe_subscription_id: string | null
          start_date: string
          end_date: string
          auto_renew: boolean
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: 'pro' | 'business'
          is_active?: boolean
          stripe_subscription_id?: string | null
          start_date: string
          end_date: string
          auto_renew?: boolean
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'pro' | 'business'
          is_active?: boolean
          stripe_subscription_id?: string | null
          start_date?: string
          end_date?: string
          auto_renew?: boolean
          price?: number
          created_at?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          id: string
          task_flow_id: string
          shift_id: string
          initiator_id: string
          respondent_id: string
          type: 'payment' | 'quality' | 'no_show' | 'harassment' | 'other'
          status: 'open' | 'investigating' | 'resolved' | 'escalated'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          description: string
          evidence: string[] | null
          resolution_outcome: 'initiator_favor' | 'respondent_favor' | 'split' | 'dismissed' | null
          resolution_description: string | null
          refund_amount: number | null
          resolved_by: string | null
          resolved_at: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_flow_id: string
          shift_id: string
          initiator_id: string
          respondent_id: string
          type: 'payment' | 'quality' | 'no_show' | 'harassment' | 'other'
          status?: 'open' | 'investigating' | 'resolved' | 'escalated'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          description: string
          evidence?: string[] | null
          resolution_outcome?: 'initiator_favor' | 'respondent_favor' | 'split' | 'dismissed' | null
          resolution_description?: string | null
          refund_amount?: number | null
          resolved_by?: string | null
          resolved_at?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_flow_id?: string
          shift_id?: string
          initiator_id?: string
          respondent_id?: string
          type?: 'payment' | 'quality' | 'no_show' | 'harassment' | 'other'
          status?: 'open' | 'investigating' | 'resolved' | 'escalated'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          description?: string
          evidence?: string[] | null
          resolution_outcome?: 'initiator_favor' | 'respondent_favor' | 'split' | 'dismissed' | null
          resolution_description?: string | null
          refund_amount?: number | null
          resolved_by?: string | null
          resolved_at?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      dispute_messages: {
        Row: {
          id: string
          dispute_id: string
          author_id: string
          author_role: 'worker' | 'employer' | 'admin'
          content: string
          attachments: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          dispute_id: string
          author_id: string
          author_role: 'worker' | 'employer' | 'admin'
          content: string
          attachments?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          dispute_id?: string
          author_id?: string
          author_role?: 'worker' | 'employer' | 'admin'
          content?: string
          attachments?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'match' | 'application' | 'approval' | 'rejection' | 'shift_start' | 'shift_completed' | 'payment' | 'review' | 'urgent' | 'promo' | 'system'
          title: string
          body: string
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'match' | 'application' | 'approval' | 'rejection' | 'shift_start' | 'shift_completed' | 'payment' | 'review' | 'urgent' | 'promo' | 'system'
          title: string
          body: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'match' | 'application' | 'approval' | 'rejection' | 'shift_start' | 'shift_completed' | 'payment' | 'review' | 'urgent' | 'promo' | 'system'
          title?: string
          body?: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          id: string
          shift_id: string | null
          task_flow_id: string | null
          worker_id: string
          employer_id: string
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          shift_id?: string | null
          task_flow_id?: string | null
          worker_id: string
          employer_id: string
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          shift_id?: string | null
          task_flow_id?: string | null
          worker_id?: string
          employer_id?: string
          last_message_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          role: 'superadmin' | 'admin' | 'moderator' | 'support'
          permissions: string[] | null
          avatar_url: string | null
          created_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name: string
          role: 'superadmin' | 'admin' | 'moderator' | 'support'
          permissions?: string[] | null
          avatar_url?: string | null
          created_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string
          role?: 'superadmin' | 'admin' | 'moderator' | 'support'
          permissions?: string[] | null
          avatar_url?: string | null
          created_at?: string
          last_login_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          id: string
          admin_id: string
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          bonus_earned: number
          status: 'pending' | 'completed' | 'expired'
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          bonus_earned?: number
          status?: 'pending' | 'completed' | 'expired'
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          bonus_earned?: number
          status?: 'pending' | 'completed' | 'expired'
          completed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_shifts_nearby: {
        Args: {
          p_lat: number
          p_lng: number
          p_radius_km?: number
          p_limit?: number
        }
        Returns: Database['public']['Tables']['shifts']['Row'][]
      }
      generate_referral_code: {
        Args: Record<string, never>
        Returns: string
      }
      increment_employer_shifts: {
        Args: {
          p_employer_id: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Commonly used types
export type Profile = Tables<'profiles'>
export type WorkerProfile = Tables<'worker_profiles'>
export type EmployerProfile = Tables<'employer_profiles'>
export type Shift = Tables<'shifts'>
export type TaskFlow = Tables<'task_flows'>
export type Review = Tables<'reviews'>
export type EscrowTransaction = Tables<'escrow_transactions'>
export type Subscription = Tables<'subscriptions'>
export type Dispute = Tables<'disputes'>
export type Notification = Tables<'notifications'>
export type ChatRoom = Tables<'chat_rooms'>
export type ChatMessage = Tables<'chat_messages'>
export type AdminUser = Tables<'admin_users'>

// Joined types for common queries
export type ShiftWithEmployer = Shift & {
  employer: Pick<Profile, 'id' | 'name' | 'photo_url'>
  employer_profile: Pick<EmployerProfile, 'company' | 'rating' | 'review_count'>
}

export type TaskFlowWithDetails = TaskFlow & {
  shift: Shift
  worker: Pick<Profile, 'id' | 'name' | 'photo_url'> & {
    worker_profile: WorkerProfile
  }
}

export type ChatRoomWithParticipants = ChatRoom & {
  worker: Pick<Profile, 'id' | 'name' | 'photo_url'>
  employer: Pick<Profile, 'id' | 'name' | 'photo_url'>
  last_message?: ChatMessage
}
