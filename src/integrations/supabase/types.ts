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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action_type: string
          admin_id: string
          affected_user_id: string | null
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          action_type: string
          admin_id: string
          affected_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          affected_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          active_referrals: number
          affiliate_code: string
          commission_rate: number
          created_at: string
          id: string
          payout_status: string
          total_clicks: number
          total_conversions: number
          total_earnings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_referrals?: number
          affiliate_code: string
          commission_rate?: number
          created_at?: string
          id?: string
          payout_status?: string
          total_clicks?: number
          total_conversions?: number
          total_earnings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_referrals?: number
          affiliate_code?: string
          commission_rate?: number
          created_at?: string
          id?: string
          payout_status?: string
          total_clicks?: number
          total_conversions?: number
          total_earnings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      brand_identities: {
        Row: {
          brand_id: string
          brand_name: string | null
          created_at: string
          id: string
          tagline: string | null
          tone: string | null
          updated_at: string
          visual_direction: string | null
        }
        Insert: {
          brand_id: string
          brand_name?: string | null
          created_at?: string
          id?: string
          tagline?: string | null
          tone?: string | null
          updated_at?: string
          visual_direction?: string | null
        }
        Update: {
          brand_id?: string
          brand_name?: string | null
          created_at?: string
          id?: string
          tagline?: string | null
          tone?: string | null
          updated_at?: string
          visual_direction?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_identities_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          brand_id: string
          brand_values: string | null
          budget: string | null
          country: string | null
          created_at: string
          differentiation: string | null
          id: string
          market_angle: string | null
          positioning_statement: string | null
          price_level: string | null
          product_category: string | null
          product_description: string | null
          product_type: string | null
          risk_flags: string[] | null
          target_audience: string | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          brand_values?: string | null
          budget?: string | null
          country?: string | null
          created_at?: string
          differentiation?: string | null
          id?: string
          market_angle?: string | null
          positioning_statement?: string | null
          price_level?: string | null
          product_category?: string | null
          product_description?: string | null
          product_type?: string | null
          risk_flags?: string[] | null
          target_audience?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          brand_values?: string | null
          budget?: string | null
          country?: string | null
          created_at?: string
          differentiation?: string | null
          id?: string
          market_angle?: string | null
          positioning_statement?: string | null
          price_level?: string | null
          product_category?: string | null
          product_description?: string | null
          product_type?: string | null
          risk_flags?: string[] | null
          target_audience?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_tasks: {
        Row: {
          brand_id: string
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          step_number: number | null
          title: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          step_number?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          step_number?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_tasks_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          current_step: number
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_waitlist: {
        Row: {
          created_at: string
          current_plan: string | null
          email: string
          id: string
          niche: string | null
        }
        Insert: {
          created_at?: string
          current_plan?: string | null
          email: string
          id?: string
          niche?: string | null
        }
        Update: {
          created_at?: string
          current_plan?: string | null
          email?: string
          id?: string
          niche?: string | null
        }
        Relationships: []
      }
      compliance_plans: {
        Row: {
          barcode_guide: string | null
          brand_id: string
          created_at: string
          id: string
          label_checklist: Json | null
          legal_summary: string | null
          packaging_info: Json | null
          updated_at: string
        }
        Insert: {
          barcode_guide?: string | null
          brand_id: string
          created_at?: string
          id?: string
          label_checklist?: Json | null
          legal_summary?: string | null
          packaging_info?: Json | null
          updated_at?: string
        }
        Update: {
          barcode_guide?: string | null
          brand_id?: string
          created_at?: string
          id?: string
          label_checklist?: Json | null
          legal_summary?: string | null
          packaging_info?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_scores: {
        Row: {
          agb_ready: boolean | null
          brand_id: string
          ce_marking_checked: boolean | null
          created_at: string
          datenschutz_ready: boolean | null
          dsgvo_assessment: boolean | null
          gewerbeanmeldung: boolean | null
          id: string
          impressum_ready: boolean | null
          overall_score: number | null
          product_labeling_done: boolean | null
          recommendations: Json | null
          risk_flags: Json | null
          updated_at: string
          verpackg_registered: boolean | null
          widerruf_ready: boolean | null
        }
        Insert: {
          agb_ready?: boolean | null
          brand_id: string
          ce_marking_checked?: boolean | null
          created_at?: string
          datenschutz_ready?: boolean | null
          dsgvo_assessment?: boolean | null
          gewerbeanmeldung?: boolean | null
          id?: string
          impressum_ready?: boolean | null
          overall_score?: number | null
          product_labeling_done?: boolean | null
          recommendations?: Json | null
          risk_flags?: Json | null
          updated_at?: string
          verpackg_registered?: boolean | null
          widerruf_ready?: boolean | null
        }
        Update: {
          agb_ready?: boolean | null
          brand_id?: string
          ce_marking_checked?: boolean | null
          created_at?: string
          datenschutz_ready?: boolean | null
          dsgvo_assessment?: boolean | null
          gewerbeanmeldung?: boolean | null
          id?: string
          impressum_ready?: boolean | null
          overall_score?: number | null
          product_labeling_done?: boolean | null
          recommendations?: Json | null
          risk_flags?: Json | null
          updated_at?: string
          verpackg_registered?: boolean | null
          widerruf_ready?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_scores_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          active: boolean
          applicable_plans: string[]
          code: string
          created_at: string
          created_by: string | null
          current_usage: number
          discount_type: string
          discount_value: number
          expiration_date: string | null
          id: string
          internal_notes: string | null
          updated_at: string
          usage_limit: number | null
        }
        Insert: {
          active?: boolean
          applicable_plans?: string[]
          code: string
          created_at?: string
          created_by?: string | null
          current_usage?: number
          discount_type: string
          discount_value: number
          expiration_date?: string | null
          id?: string
          internal_notes?: string | null
          updated_at?: string
          usage_limit?: number | null
        }
        Update: {
          active?: boolean
          applicable_plans?: string[]
          code?: string
          created_at?: string
          created_by?: string | null
          current_usage?: number
          discount_type?: string
          discount_value?: number
          expiration_date?: string | null
          id?: string
          internal_notes?: string | null
          updated_at?: string
          usage_limit?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          brand_id: string
          created_at: string
          document_type: string | null
          file_name: string
          file_type: string | null
          file_url: string | null
          id: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          document_type?: string | null
          file_name: string
          file_type?: string | null
          file_url?: string | null
          id?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          document_type?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string
          error_type: string
          id: string
          message: string
          metadata: Json | null
          route: string | null
          session_id: string | null
          stack: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_type?: string
          id?: string
          message: string
          metadata?: Json | null
          route?: string | null
          session_id?: string | null
          stack?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          route?: string | null
          session_id?: string | null
          stack?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flag_overrides: {
        Row: {
          enabled: boolean
          feature_key: string
          id: string
          modified_at: string
          modified_by: string | null
          override_type: string
          target_value: string | null
        }
        Insert: {
          enabled?: boolean
          feature_key: string
          id?: string
          modified_at?: string
          modified_by?: string | null
          override_type: string
          target_value?: string | null
        }
        Update: {
          enabled?: boolean
          feature_key?: string
          id?: string
          modified_at?: string
          modified_by?: string | null
          override_type?: string
          target_value?: string | null
        }
        Relationships: []
      }
      financial_models: {
        Row: {
          brand_id: string
          break_even_units: number | null
          created_at: string
          id: string
          margin: number | null
          marketing_budget: number | null
          packaging_cost: number | null
          production_cost: number | null
          recommended_price: number | null
          shipping_cost: number | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          break_even_units?: number | null
          created_at?: string
          id?: string
          margin?: number | null
          marketing_budget?: number | null
          packaging_cost?: number | null
          production_cost?: number | null
          recommended_price?: number | null
          shipping_cost?: number | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          break_even_units?: number | null
          created_at?: string
          id?: string
          margin?: number | null
          marketing_budget?: number | null
          packaging_cost?: number | null
          production_cost?: number | null
          recommended_price?: number | null
          shipping_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          plan: string
          risk_level: string | null
          step: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          plan?: string
          risk_level?: string | null
          step?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          plan?: string
          risk_level?: string | null
          step?: number | null
          user_id?: string
        }
        Relationships: []
      }
      founder_decisions: {
        Row: {
          brand_id: string
          created_at: string
          decision_type: string
          description: string | null
          id: string
          impact_label: string | null
          new_value: string | null
          old_value: string | null
          title: string
          user_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          decision_type: string
          description?: string | null
          id?: string
          impact_label?: string | null
          new_value?: string | null
          old_value?: string | null
          title: string
          user_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          decision_type?: string
          description?: string | null
          id?: string
          impact_label?: string | null
          new_value?: string | null
          old_value?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_decisions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_plans: {
        Row: {
          brand_id: string
          created_at: string
          fulfillment_model: string | null
          id: string
          launch_quantity: number | null
          launch_readiness_score: number | null
          logistics_steps: Json | null
          operational_checklist: Json | null
          roadmap: Json | null
          sales_channel: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          fulfillment_model?: string | null
          id?: string
          launch_quantity?: number | null
          launch_readiness_score?: number | null
          logistics_steps?: Json | null
          operational_checklist?: Json | null
          roadmap?: Json | null
          sales_channel?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          fulfillment_model?: string | null
          id?: string
          launch_quantity?: number | null
          launch_readiness_score?: number | null
          logistics_steps?: Json | null
          operational_checklist?: Json | null
          roadmap?: Json | null
          sales_channel?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          converted: boolean
          created_at: string
          email: string
          id: string
          page: string | null
          source: string
          trigger_type: string | null
        }
        Insert: {
          converted?: boolean
          created_at?: string
          email: string
          id?: string
          page?: string | null
          source?: string
          trigger_type?: string | null
        }
        Update: {
          converted?: boolean
          created_at?: string
          email?: string
          id?: string
          page?: string | null
          source?: string
          trigger_type?: string | null
        }
        Relationships: []
      }
      license_invitations: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          label: string | null
          license_key: string | null
          plan: string
          status: string
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          label?: string | null
          license_key?: string | null
          plan?: string
          status?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          license_key?: string | null
          plan?: string
          status?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string
          email_hint: string
          id: string
          ip_hint: string | null
          success: boolean
          user_agent_hint: string | null
        }
        Insert: {
          created_at?: string
          email_hint: string
          id?: string
          ip_hint?: string | null
          success?: boolean
          user_agent_hint?: string | null
        }
        Update: {
          created_at?: string
          email_hint?: string
          id?: string
          ip_hint?: string | null
          success?: boolean
          user_agent_hint?: string | null
        }
        Relationships: []
      }
      production_plans: {
        Row: {
          brand_id: string
          checklist: Json | null
          created_at: string
          id: string
          moq_expectation: string | null
          product_category: string | null
          production_region: string | null
          risk_warnings: Json | null
          supplier_questions: Json | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          checklist?: Json | null
          created_at?: string
          id?: string
          moq_expectation?: string | null
          product_category?: string | null
          production_region?: string | null
          risk_warnings?: Json | null
          supplier_questions?: Json | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          checklist?: Json | null
          created_at?: string
          id?: string
          moq_expectation?: string | null
          product_category?: string | null
          production_region?: string | null
          risk_warnings?: Json | null
          supplier_questions?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          archetype: string | null
          company_name: string | null
          completed_starter_mode: boolean
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          referred_by: string | null
          risk_tolerance: string | null
          selected_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archetype?: string | null
          company_name?: string | null
          completed_starter_mode?: boolean
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          referred_by?: string | null
          risk_tolerance?: string | null
          selected_mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archetype?: string | null
          company_name?: string | null
          completed_starter_mode?: boolean
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          referred_by?: string | null
          risk_tolerance?: string | null
          selected_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_validations: {
        Row: {
          admin_override: boolean | null
          admin_override_by: string | null
          admin_override_reason: string | null
          behavioral_similarity: number | null
          created_at: string
          device_fingerprint: string | null
          email_similarity_score: number | null
          fraud_score: number
          id: string
          ip_hash: string | null
          referral_id: string
          referred_user_id: string
          risk_factors: Json | null
          shared_payment_flag: boolean | null
          signup_velocity_flag: boolean | null
          status: string
          stripe_card_fingerprint: string | null
          updated_at: string
        }
        Insert: {
          admin_override?: boolean | null
          admin_override_by?: string | null
          admin_override_reason?: string | null
          behavioral_similarity?: number | null
          created_at?: string
          device_fingerprint?: string | null
          email_similarity_score?: number | null
          fraud_score?: number
          id?: string
          ip_hash?: string | null
          referral_id: string
          referred_user_id: string
          risk_factors?: Json | null
          shared_payment_flag?: boolean | null
          signup_velocity_flag?: boolean | null
          status?: string
          stripe_card_fingerprint?: string | null
          updated_at?: string
        }
        Update: {
          admin_override?: boolean | null
          admin_override_by?: string | null
          admin_override_reason?: string | null
          behavioral_similarity?: number | null
          created_at?: string
          device_fingerprint?: string | null
          email_similarity_score?: number | null
          fraud_score?: number
          id?: string
          ip_hash?: string | null
          referral_id?: string
          referred_user_id?: string
          risk_factors?: Json | null
          shared_payment_flag?: boolean | null
          signup_velocity_flag?: boolean | null
          status?: string
          stripe_card_fingerprint?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_validations_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referral_count: number
          reward_builder_months: number
          reward_pro_trial: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referral_count?: number
          reward_builder_months?: number
          reward_pro_trial?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referral_count?: number
          reward_builder_months?: number
          reward_pro_trial?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_hint: string | null
          metadata: Json | null
          route: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_hint?: string | null
          metadata?: Json | null
          route?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_hint?: string | null
          metadata?: Json | null
          route?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      strategic_scores: {
        Row: {
          ai_recommendations: Json | null
          brand_id: string
          capital_burn_monthly: number | null
          cash_runway_months: number | null
          created_at: string
          execution_score: number | null
          id: string
          launch_probability: number | null
          scenario_snapshots: Json | null
          supplier_risk_score: number | null
          updated_at: string
        }
        Insert: {
          ai_recommendations?: Json | null
          brand_id: string
          capital_burn_monthly?: number | null
          cash_runway_months?: number | null
          created_at?: string
          execution_score?: number | null
          id?: string
          launch_probability?: number | null
          scenario_snapshots?: Json | null
          supplier_risk_score?: number | null
          updated_at?: string
        }
        Update: {
          ai_recommendations?: Json | null
          brand_id?: string
          capital_burn_monthly?: number | null
          cash_runway_months?: number | null
          created_at?: string
          execution_score?: number | null
          id?: string
          launch_probability?: number | null
          scenario_snapshots?: Json | null
          supplier_risk_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategic_scores_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          license_key: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          license_key?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          license_key?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplier_clicks: {
        Row: {
          affiliate: boolean
          brand_id: string | null
          category: string | null
          created_at: string
          id: string
          supplier_id: string
          supplier_name: string
          user_id: string
        }
        Insert: {
          affiliate?: boolean
          brand_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          supplier_id: string
          supplier_name: string
          user_id: string
        }
        Update: {
          affiliate?: boolean
          brand_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          supplier_id?: string
          supplier_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_clicks_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      unboxing_profiles: {
        Row: {
          brand_id: string
          created_at: string
          custom_labeling: boolean
          id: string
          insert_samples: boolean
          packaging_budget: number | null
          packaging_type: string
          return_friendly: boolean
          sticker_seal: boolean
          target_positioning: string
          thank_you_card: boolean
          tissue_paper: boolean
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          custom_labeling?: boolean
          id?: string
          insert_samples?: boolean
          packaging_budget?: number | null
          packaging_type?: string
          return_friendly?: boolean
          sticker_seal?: boolean
          target_positioning?: string
          thank_you_card?: boolean
          tissue_paper?: boolean
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          custom_labeling?: boolean
          id?: string
          insert_samples?: boolean
          packaging_budget?: number | null
          packaging_type?: string
          return_friendly?: boolean
          sticker_seal?: boolean
          target_positioning?: string
          thank_you_card?: boolean
          tissue_paper?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unboxing_profiles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reviews: {
        Row: {
          brand_id: string
          confirmed: boolean
          confirmed_at: string | null
          created_at: string
          id: string
          inventory_exposure: number | null
          key_opportunity: string | null
          key_risk: string | null
          launch_score_change: number | null
          margin_trend: number | null
          momentum_score: number
          runway_trend: number | null
          streak_count: number
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          brand_id: string
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          id?: string
          inventory_exposure?: number | null
          key_opportunity?: string | null
          key_risk?: string | null
          launch_score_change?: number | null
          margin_trend?: number | null
          momentum_score?: number
          runway_trend?: number | null
          streak_count?: number
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          brand_id?: string
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          id?: string
          inventory_exposure?: number | null
          key_opportunity?: string | null
          key_risk?: string | null
          launch_score_change?: number | null
          margin_trend?: number | null
          momentum_score?: number
          runway_trend?: number | null
          streak_count?: number
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_referral_count: {
        Args: { _referral_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      owns_brand: { Args: { _brand_id: string }; Returns: boolean }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
