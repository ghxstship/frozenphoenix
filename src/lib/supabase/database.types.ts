export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activations: {
        Row: {
          backup_plan: string | null
          budget: number | null
          components: Json | null
          created_at: string | null
          created_by: string | null
          depth: number | null
          description: string | null
          dimension_unit: string | null
          expected_footfall: number | null
          experience_goals: string[] | null
          floor_plan_position: Json | null
          height: number | null
          id: string
          install_date: string | null
          lead_id: string | null
          location_id: string | null
          name: string
          operating_hours: Json | null
          organization_id: string | null
          power_requirements: string | null
          project_id: string
          staffing_requirements: Json | null
          status: Database["public"]["Enums"]["activation_status"]
          strike_date: string | null
          target_audience: string | null
          team_ids: string[] | null
          type: Database["public"]["Enums"]["activation_type"]
          updated_at: string | null
          updated_by: string | null
          vendor_ids: string[] | null
          weather_contingency: string | null
          width: number | null
          zone: string | null
        }
        Insert: {
          backup_plan?: string | null
          budget?: number | null
          components?: Json | null
          created_at?: string | null
          created_by?: string | null
          depth?: number | null
          description?: string | null
          dimension_unit?: string | null
          expected_footfall?: number | null
          experience_goals?: string[] | null
          floor_plan_position?: Json | null
          height?: number | null
          id?: string
          install_date?: string | null
          lead_id?: string | null
          location_id?: string | null
          name: string
          operating_hours?: Json | null
          organization_id?: string | null
          power_requirements?: string | null
          project_id: string
          staffing_requirements?: Json | null
          status?: Database["public"]["Enums"]["activation_status"]
          strike_date?: string | null
          target_audience?: string | null
          team_ids?: string[] | null
          type?: Database["public"]["Enums"]["activation_type"]
          updated_at?: string | null
          updated_by?: string | null
          vendor_ids?: string[] | null
          weather_contingency?: string | null
          width?: number | null
          zone?: string | null
        }
        Update: {
          backup_plan?: string | null
          budget?: number | null
          components?: Json | null
          created_at?: string | null
          created_by?: string | null
          depth?: number | null
          description?: string | null
          dimension_unit?: string | null
          expected_footfall?: number | null
          experience_goals?: string[] | null
          floor_plan_position?: Json | null
          height?: number | null
          id?: string
          install_date?: string | null
          lead_id?: string | null
          location_id?: string | null
          name?: string
          operating_hours?: Json | null
          organization_id?: string | null
          power_requirements?: string | null
          project_id?: string
          staffing_requirements?: Json | null
          status?: Database["public"]["Enums"]["activation_status"]
          strike_date?: string | null
          target_audience?: string | null
          team_ids?: string[] | null
          type?: Database["public"]["Enums"]["activation_type"]
          updated_at?: string | null
          updated_by?: string | null
          vendor_ids?: string[] | null
          weather_contingency?: string | null
          width?: number | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "activations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      active_timers: {
        Row: {
          description: string | null
          id: string
          is_billable: boolean | null
          organization_id: string
          project_id: string | null
          started_at: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_billable?: boolean | null
          organization_id: string
          project_id?: string | null
          started_at?: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          description?: string | null
          id?: string
          is_billable?: boolean | null
          organization_id?: string
          project_id?: string | null
          started_at?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_timers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_timers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_timers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "active_timers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "production_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_timers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          activation_id: string | null
          contingency_plan: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          equipment_needed: string[] | null
          event_id: string
          frequency: string | null
          id: string
          instructions: string | null
          lead_id: string | null
          name: string
          objective: string | null
          organization_id: string | null
          participant_count: number | null
          project_id: string
          requirements: string[] | null
          specific_location: string | null
          staff_ids: string[] | null
          start_time: string
          status: Database["public"]["Enums"]["activity_status"]
          type: Database["public"]["Enums"]["activity_type"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          activation_id?: string | null
          contingency_plan?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          equipment_needed?: string[] | null
          event_id: string
          frequency?: string | null
          id?: string
          instructions?: string | null
          lead_id?: string | null
          name: string
          objective?: string | null
          organization_id?: string | null
          participant_count?: number | null
          project_id: string
          requirements?: string[] | null
          specific_location?: string | null
          staff_ids?: string[] | null
          start_time: string
          status?: Database["public"]["Enums"]["activity_status"]
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          activation_id?: string | null
          contingency_plan?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          equipment_needed?: string[] | null
          event_id?: string
          frequency?: string | null
          id?: string
          instructions?: string | null
          lead_id?: string | null
          name?: string
          objective?: string | null
          organization_id?: string | null
          participant_count?: number | null
          project_id?: string
          requirements?: string[] | null
          specific_location?: string | null
          staff_ids?: string[] | null
          start_time?: string
          status?: Database["public"]["Enums"]["activity_status"]
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "activities_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_steps: {
        Row: {
          approver_role: string | null
          approver_user_ids: string[] | null
          conditions: Json | null
          created_at: string | null
          description: string | null
          escalation_hours: number | null
          escalation_to_role: string | null
          escalation_to_user_id: string | null
          id: string
          name: string
          on_approve_action: Json | null
          on_reject_action: Json | null
          step_order: number
          step_type: Database["public"]["Enums"]["approval_step_type"]
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          approver_role?: string | null
          approver_user_ids?: string[] | null
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          escalation_hours?: number | null
          escalation_to_role?: string | null
          escalation_to_user_id?: string | null
          id?: string
          name: string
          on_approve_action?: Json | null
          on_reject_action?: Json | null
          step_order: number
          step_type?: Database["public"]["Enums"]["approval_step_type"]
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          approver_role?: string | null
          approver_user_ids?: string[] | null
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          escalation_hours?: number | null
          escalation_to_role?: string | null
          escalation_to_user_id?: string | null
          id?: string
          name?: string
          on_approve_action?: Json | null
          on_reject_action?: Json | null
          step_order?: number
          step_type?: Database["public"]["Enums"]["approval_step_type"]
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_steps_escalation_to_user_id_fkey"
            columns: ["escalation_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "approval_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          allow_delegation: boolean | null
          auto_escalation_hours: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          entity_type: string
          id: string
          lifecycle_stage: string | null
          name: string
          organization_id: string
          require_comments: boolean | null
          status: Database["public"]["Enums"]["workflow_status"]
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          allow_delegation?: boolean | null
          auto_escalation_hours?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type: string
          id?: string
          lifecycle_stage?: string | null
          name: string
          organization_id: string
          require_comments?: boolean | null
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          allow_delegation?: boolean | null
          auto_escalation_hours?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type?: string
          id?: string
          lifecycle_stage?: string | null
          name?: string
          organization_id?: string
          require_comments?: boolean | null
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_workflows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_workflows_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          approved_at: string | null
          approver_id: string
          created_at: string | null
          deadline: string
          deliverable_url: string | null
          id: string
          milestone_id: string
          milestone_name: string
          organization_id: string
          project_id: string
          requested_at: string
          status: string
          timeline_impact_days: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id: string
          created_at?: string | null
          deadline: string
          deliverable_url?: string | null
          id?: string
          milestone_id: string
          milestone_name: string
          organization_id: string
          project_id: string
          requested_at?: string
          status?: string
          timeline_impact_days?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string
          created_at?: string | null
          deadline?: string
          deliverable_url?: string | null
          id?: string
          milestone_id?: string
          milestone_name?: string
          organization_id?: string
          project_id?: string
          requested_at?: string
          status?: string
          timeline_impact_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      asset_assignments: {
        Row: {
          activation_id: string | null
          actual_return_date: string | null
          asset_id: string
          check_out_date: string
          checked_out_by_id: string | null
          condition_on_checkout: Database["public"]["Enums"]["asset_condition"]
          condition_on_return:
            | Database["public"]["Enums"]["asset_condition"]
            | null
          created_at: string | null
          created_by: string | null
          expected_return_date: string
          id: string
          notes: string | null
          organization_id: string | null
          project_id: string
          returned_by_id: string | null
          status: Database["public"]["Enums"]["asset_assignment_status"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          activation_id?: string | null
          actual_return_date?: string | null
          asset_id: string
          check_out_date: string
          checked_out_by_id?: string | null
          condition_on_checkout: Database["public"]["Enums"]["asset_condition"]
          condition_on_return?:
            | Database["public"]["Enums"]["asset_condition"]
            | null
          created_at?: string | null
          created_by?: string | null
          expected_return_date: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id: string
          returned_by_id?: string | null
          status?: Database["public"]["Enums"]["asset_assignment_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          activation_id?: string | null
          actual_return_date?: string | null
          asset_id?: string
          check_out_date?: string
          checked_out_by_id?: string | null
          condition_on_checkout?: Database["public"]["Enums"]["asset_condition"]
          condition_on_return?:
            | Database["public"]["Enums"]["asset_condition"]
            | null
          created_at?: string | null
          created_by?: string | null
          expected_return_date?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string
          returned_by_id?: string | null
          status?: Database["public"]["Enums"]["asset_assignment_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_assignments_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_checked_out_by_id_fkey"
            columns: ["checked_out_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "asset_assignments_returned_by_id_fkey"
            columns: ["returned_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          barcode: string
          category: string
          certification_types: string[] | null
          condition: string
          created_at: string | null
          current_custodian_id: string | null
          current_location_id: string | null
          current_value: number | null
          daily_rental_cost: number | null
          home_location_id: string | null
          id: string
          image_url: string | null
          insurance_value: number | null
          last_maintenance_date: string | null
          location: string
          maintenance_schedule: string | null
          manufacturer: string | null
          model: string | null
          name: string
          next_maintenance_date: string | null
          notes: string | null
          organization_id: string
          owned_or_rental: string
          owner_id: string | null
          purchase_price: number | null
          rental_return_date: string | null
          requires_certification: boolean | null
          serial_number: string | null
          specifications: Json | null
          subcategory: string | null
          updated_at: string | null
          vendor_id: string | null
          warranty_expiry: string | null
        }
        Insert: {
          barcode: string
          category: string
          certification_types?: string[] | null
          condition?: string
          created_at?: string | null
          current_custodian_id?: string | null
          current_location_id?: string | null
          current_value?: number | null
          daily_rental_cost?: number | null
          home_location_id?: string | null
          id?: string
          image_url?: string | null
          insurance_value?: number | null
          last_maintenance_date?: string | null
          location: string
          maintenance_schedule?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          next_maintenance_date?: string | null
          notes?: string | null
          organization_id: string
          owned_or_rental?: string
          owner_id?: string | null
          purchase_price?: number | null
          rental_return_date?: string | null
          requires_certification?: boolean | null
          serial_number?: string | null
          specifications?: Json | null
          subcategory?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          barcode?: string
          category?: string
          certification_types?: string[] | null
          condition?: string
          created_at?: string | null
          current_custodian_id?: string | null
          current_location_id?: string | null
          current_value?: number | null
          daily_rental_cost?: number | null
          home_location_id?: string | null
          id?: string
          image_url?: string | null
          insurance_value?: number | null
          last_maintenance_date?: string | null
          location?: string
          maintenance_schedule?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          next_maintenance_date?: string | null
          notes?: string | null
          organization_id?: string
          owned_or_rental?: string
          owner_id?: string | null
          purchase_price?: number | null
          rental_return_date?: string | null
          requires_certification?: boolean | null
          serial_number?: string | null
          specifications?: Json | null
          subcategory?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_current_custodian_id_fkey"
            columns: ["current_custodian_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          automation_id: string
          automation_rule_id: string | null
          entity_id: string
          error_message: string | null
          execution_data: Json | null
          id: string
          organization_id: string
          success: boolean
          triggered_at: string | null
        }
        Insert: {
          automation_id: string
          automation_rule_id?: string | null
          entity_id: string
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          organization_id: string
          success: boolean
          triggered_at?: string | null
        }
        Update: {
          automation_id?: string
          automation_rule_id?: string | null
          entity_id?: string
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          organization_id?: string
          success?: boolean
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_automation_rule_id_fkey"
            columns: ["automation_rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json | null
          action_type: Database["public"]["Enums"]["automation_action"]
          automation_id: string
          conditions: Json | null
          created_at: string | null
          execution_order: number | null
          id: string
          is_active: boolean | null
          trigger_config: Json | null
          trigger_type: Database["public"]["Enums"]["automation_trigger"]
          updated_at: string | null
        }
        Insert: {
          action_config?: Json | null
          action_type: Database["public"]["Enums"]["automation_action"]
          automation_id: string
          conditions?: Json | null
          created_at?: string | null
          execution_order?: number | null
          id?: string
          is_active?: boolean | null
          trigger_config?: Json | null
          trigger_type: Database["public"]["Enums"]["automation_trigger"]
          updated_at?: string | null
        }
        Update: {
          action_config?: Json | null
          action_type?: Database["public"]["Enums"]["automation_action"]
          automation_id?: string
          conditions?: Json | null
          created_at?: string | null
          execution_order?: number | null
          id?: string
          is_active?: boolean | null
          trigger_config?: Json | null
          trigger_type?: Database["public"]["Enums"]["automation_trigger"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          organization_id: string
          project_id: string | null
          trigger_count: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          organization_id: string
          project_id?: string | null
          trigger_count?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          organization_id?: string
          project_id?: string | null
          trigger_count?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "automations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kits: {
        Row: {
          accent_color: string
          client_id: string
          client_name: string
          created_at: string | null
          font_family: string
          guidelines: string | null
          id: string
          logo_url: string | null
          organization_id: string
          primary_color: string
          secondary_color: string
          updated_at: string | null
        }
        Insert: {
          accent_color: string
          client_id: string
          client_name: string
          created_at?: string | null
          font_family: string
          guidelines?: string | null
          id?: string
          logo_url?: string | null
          organization_id: string
          primary_color: string
          secondary_color: string
          updated_at?: string | null
        }
        Update: {
          accent_color?: string
          client_id?: string
          client_name?: string
          created_at?: string | null
          font_family?: string
          guidelines?: string | null
          id?: string
          logo_url?: string | null
          organization_id?: string
          primary_color?: string
          secondary_color?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_line_items: {
        Row: {
          actual_amount: number
          category: string
          created_at: string | null
          description: string
          estimated_amount: number
          id: string
          notes: string | null
          organization_id: string | null
          project_id: string | null
          updated_at: string | null
          variance: number | null
        }
        Insert: {
          actual_amount?: number
          category: string
          created_at?: string | null
          description: string
          estimated_amount?: number
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          updated_at?: string | null
          variance?: number | null
        }
        Update: {
          actual_amount?: number
          category?: string
          created_at?: string | null
          description?: string
          estimated_amount?: number
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          updated_at?: string | null
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_line_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_line_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_line_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      budgets: {
        Row: {
          approved_by_id: string | null
          contingency_percent: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          effective_date: string
          id: string
          markup_percent: number | null
          notes: string | null
          organization_id: string | null
          prepared_by_id: string | null
          project_id: string
          status: Database["public"]["Enums"]["budget_status"]
          total_actual: number
          total_budget: number
          total_variance: number | null
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          approved_by_id?: string | null
          contingency_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          effective_date: string
          id?: string
          markup_percent?: number | null
          notes?: string | null
          organization_id?: string | null
          prepared_by_id?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["budget_status"]
          total_actual?: number
          total_budget?: number
          total_variance?: number | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          approved_by_id?: string | null
          contingency_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          effective_date?: string
          id?: string
          markup_percent?: number | null
          notes?: string | null
          organization_id?: string | null
          prepared_by_id?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["budget_status"]
          total_actual?: number
          total_budget?: number
          total_variance?: number | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_approved_by_id_fkey"
            columns: ["approved_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_prepared_by_id_fkey"
            columns: ["prepared_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "budgets_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean
          color: string | null
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string
          event_type: string
          id: string
          organization_id: string
          project_id: string | null
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          all_day?: boolean
          color?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date: string
          event_type?: string
          id?: string
          organization_id: string
          project_id?: string | null
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          all_day?: boolean
          color?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          organization_id?: string
          project_id?: string | null
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      call_sheet_crew: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          call_sheet_id: string
          call_time: string
          created_at: string | null
          crew_member_id: string | null
          department: string | null
          display_order: number | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          role: string
          wrap_time: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          call_sheet_id: string
          call_time: string
          created_at?: string | null
          crew_member_id?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          role: string
          wrap_time?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          call_sheet_id?: string
          call_time?: string
          created_at?: string | null
          crew_member_id?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string
          wrap_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sheet_crew_call_sheet_id_fkey"
            columns: ["call_sheet_id"]
            isOneToOne: false
            referencedRelation: "call_sheets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sheet_crew_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sheet_crew_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "v_crew_utilization"
            referencedColumns: ["crew_member_id"]
          },
        ]
      }
      call_sheets: {
        Row: {
          breakfast_time: string | null
          call_sheet_number: string | null
          craft_services_notes: string | null
          created_at: string | null
          created_by: string | null
          crew_schedule: Json | null
          date: string
          department_notes: Json | null
          distributed_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          event_id: string | null
          first_shot_time: string | null
          general_call_time: string | null
          id: string
          load_in_instructions: string | null
          location_id: string | null
          lunch_time: string | null
          nearest_hospital: string | null
          nearest_hospital_address: string | null
          organization_id: string
          parking_instructions: string | null
          project_id: string
          published_at: string | null
          special_instructions: string | null
          status: Database["public"]["Enums"]["call_sheet_status"]
          title: string
          updated_at: string | null
          updated_by: string | null
          venue_address: string | null
          venue_name: string | null
          weather_forecast: string | null
          weather_temp_high: number | null
          weather_temp_low: number | null
          wrap_time: string | null
        }
        Insert: {
          breakfast_time?: string | null
          call_sheet_number?: string | null
          craft_services_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          crew_schedule?: Json | null
          date: string
          department_notes?: Json | null
          distributed_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          event_id?: string | null
          first_shot_time?: string | null
          general_call_time?: string | null
          id?: string
          load_in_instructions?: string | null
          location_id?: string | null
          lunch_time?: string | null
          nearest_hospital?: string | null
          nearest_hospital_address?: string | null
          organization_id: string
          parking_instructions?: string | null
          project_id: string
          published_at?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["call_sheet_status"]
          title: string
          updated_at?: string | null
          updated_by?: string | null
          venue_address?: string | null
          venue_name?: string | null
          weather_forecast?: string | null
          weather_temp_high?: number | null
          weather_temp_low?: number | null
          wrap_time?: string | null
        }
        Update: {
          breakfast_time?: string | null
          call_sheet_number?: string | null
          craft_services_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          crew_schedule?: Json | null
          date?: string
          department_notes?: Json | null
          distributed_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          event_id?: string | null
          first_shot_time?: string | null
          general_call_time?: string | null
          id?: string
          load_in_instructions?: string | null
          location_id?: string | null
          lunch_time?: string | null
          nearest_hospital?: string | null
          nearest_hospital_address?: string | null
          organization_id?: string
          parking_instructions?: string | null
          project_id?: string
          published_at?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["call_sheet_status"]
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          venue_address?: string | null
          venue_name?: string | null
          weather_forecast?: string | null
          weather_temp_high?: number | null
          weather_temp_low?: number | null
          wrap_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sheets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sheets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sheets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sheets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "call_sheets_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          client: string
          created_at: string | null
          featured: boolean | null
          gallery_images: string[] | null
          hero_image: string | null
          hero_image_url: string | null
          id: string
          organization_id: string
          project_id: string
          public_visible: boolean | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          status: string
          summary: string
          tags: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          client: string
          created_at?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hero_image?: string | null
          hero_image_url?: string | null
          id?: string
          organization_id: string
          project_id: string
          public_visible?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string
          summary: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          client?: string
          created_at?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hero_image?: string | null
          hero_image_url?: string | null
          id?: string
          organization_id?: string
          project_id?: string
          public_visible?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      case_study_metrics: {
        Row: {
          case_study_id: string
          created_at: string | null
          id: string
          label: string
          value: string
        }
        Insert: {
          case_study_id: string
          created_at?: string | null
          id?: string
          label: string
          value: string
        }
        Update: {
          case_study_id?: string
          created_at?: string | null
          id?: string
          label?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_study_metrics_case_study_id_fkey"
            columns: ["case_study_id"]
            isOneToOne: false
            referencedRelation: "case_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string | null
          crew_member_id: string
          document_url: string | null
          expiry_date: string
          id: string
          issued_date: string
          label: string
          type: string
        }
        Insert: {
          created_at?: string | null
          crew_member_id: string
          document_url?: string | null
          expiry_date: string
          id?: string
          issued_date: string
          label: string
          type: string
        }
        Update: {
          created_at?: string | null
          crew_member_id?: string
          document_url?: string | null
          expiry_date?: string
          id?: string
          issued_date?: string
          label?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "v_crew_utilization"
            referencedColumns: ["crew_member_id"]
          },
        ]
      }
      client_invoices: {
        Row: {
          amount_paid: number
          approved_at: string | null
          approved_by: string | null
          balance_due: number | null
          billing_period_end: string | null
          billing_period_start: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          discount_amount: number | null
          discount_percent: number | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          last_reminder_at: string | null
          notes: string | null
          organization_id: string
          paid_at: string | null
          payment_instructions: string | null
          payment_terms_days: number | null
          project_id: string
          reference: string | null
          reminder_count: number | null
          sent_at: string | null
          sow_id: string | null
          status: Database["public"]["Enums"]["client_invoice_status"]
          subtotal: number
          tax_amount: number | null
          tax_percent: number | null
          template_id: string | null
          title: string | null
          total: number
          updated_at: string | null
          updated_by: string | null
          viewed_at: string | null
        }
        Insert: {
          amount_paid?: number
          approved_at?: string | null
          approved_by?: string | null
          balance_due?: number | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          last_reminder_at?: string | null
          notes?: string | null
          organization_id: string
          paid_at?: string | null
          payment_instructions?: string | null
          payment_terms_days?: number | null
          project_id: string
          reference?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          sow_id?: string | null
          status?: Database["public"]["Enums"]["client_invoice_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_percent?: number | null
          template_id?: string | null
          title?: string | null
          total?: number
          updated_at?: string | null
          updated_by?: string | null
          viewed_at?: string | null
        }
        Update: {
          amount_paid?: number
          approved_at?: string | null
          approved_by?: string | null
          balance_due?: number | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          last_reminder_at?: string | null
          notes?: string | null
          organization_id?: string
          paid_at?: string | null
          payment_instructions?: string | null
          payment_terms_days?: number | null
          project_id?: string
          reference?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          sow_id?: string | null
          status?: Database["public"]["Enums"]["client_invoice_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_percent?: number | null
          template_id?: string | null
          title?: string | null
          total?: number
          updated_at?: string | null
          updated_by?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_invoices_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "client_invoices_sow_id_fkey"
            columns: ["sow_id"]
            isOneToOne: false
            referencedRelation: "scopes_of_work"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_sow_id_fkey"
            columns: ["sow_id"]
            isOneToOne: false
            referencedRelation: "v_sow_summary"
            referencedColumns: ["sow_id"]
          },
          {
            foreignKeyName: "client_invoices_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          attachments: string[] | null
          author_id: string | null
          content: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          mentions: string[] | null
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          author_id?: string | null
          content: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          mentions?: string[] | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          author_id?: string | null
          content?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          mentions?: string[] | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          account_manager_id: string | null
          address_city: string | null
          address_country: string | null
          address_postal_code: string | null
          address_state: string | null
          address_street1: string | null
          address_street2: string | null
          billing_address_same: boolean | null
          billing_city: string | null
          billing_country: string | null
          billing_postal_code: string | null
          billing_state: string | null
          billing_street1: string | null
          billing_street2: string | null
          brand_kit_id: string | null
          company_type: string
          created_at: string | null
          created_by: string | null
          default_currency: string | null
          email: string | null
          id: string
          industry: string | null
          legal_name: string | null
          logo_url: string | null
          name: string
          notes: string | null
          organization_id: string
          parent_company_id: string | null
          payment_terms_days: number | null
          phone: string | null
          status: string
          tags: string[] | null
          tax_id: string | null
          updated_at: string | null
          updated_by: string | null
          website: string | null
        }
        Insert: {
          account_manager_id?: string | null
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street1?: string | null
          address_street2?: string | null
          billing_address_same?: boolean | null
          billing_city?: string | null
          billing_country?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          billing_street1?: string | null
          billing_street2?: string | null
          brand_kit_id?: string | null
          company_type?: string
          created_at?: string | null
          created_by?: string | null
          default_currency?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          organization_id: string
          parent_company_id?: string | null
          payment_terms_days?: number | null
          phone?: string | null
          status?: string
          tags?: string[] | null
          tax_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          account_manager_id?: string | null
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street1?: string | null
          address_street2?: string | null
          billing_address_same?: boolean | null
          billing_city?: string | null
          billing_country?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          billing_street1?: string | null
          billing_street2?: string | null
          brand_kit_id?: string | null
          company_type?: string
          created_at?: string | null
          created_by?: string | null
          default_currency?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          parent_company_id?: string | null
          payment_terms_days?: number | null
          phone?: string | null
          status?: string
          tags?: string[] | null
          tax_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_parent_company_id_fkey"
            columns: ["parent_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consumable_usage: {
        Row: {
          consumable_id: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          organization_id: string | null
          project_id: string
          quantity: number
          used_by_id: string | null
        }
        Insert: {
          consumable_id: string
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id: string
          quantity: number
          used_by_id?: string | null
        }
        Update: {
          consumable_id?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string
          quantity?: number
          used_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consumable_usage_consumable_id_fkey"
            columns: ["consumable_id"]
            isOneToOne: false
            referencedRelation: "consumables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumable_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumable_usage_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumable_usage_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "consumable_usage_used_by_id_fkey"
            columns: ["used_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consumables: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          location_id: string | null
          name: string
          organization_id: string | null
          preferred_vendor_id: string | null
          quantity_on_hand: number
          reorder_point: number
          reorder_quantity: number
          sku: string
          unit: string
          unit_cost: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location_id?: string | null
          name: string
          organization_id?: string | null
          preferred_vendor_id?: string | null
          quantity_on_hand?: number
          reorder_point?: number
          reorder_quantity?: number
          sku: string
          unit: string
          unit_cost: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location_id?: string | null
          name?: string
          organization_id?: string | null
          preferred_vendor_id?: string | null
          quantity_on_hand?: number
          reorder_point?: number
          reorder_quantity?: number
          sku?: string
          unit?: string
          unit_cost?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consumables_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumables_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumables_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumables_preferred_vendor_id_fkey"
            columns: ["preferred_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumables_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          department: string | null
          email: string | null
          first_name: string
          full_name: string | null
          id: string
          is_billing_contact: boolean | null
          is_decision_maker: boolean | null
          is_primary: boolean | null
          last_name: string
          linkedin_url: string | null
          mobile: string | null
          notes: string | null
          organization_id: string
          phone: string | null
          preferred_contact_method: string | null
          preferred_name: string | null
          status: string
          tags: string[] | null
          timezone: string | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          first_name: string
          full_name?: string | null
          id?: string
          is_billing_contact?: boolean | null
          is_decision_maker?: boolean | null
          is_primary?: boolean | null
          last_name: string
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          organization_id: string
          phone?: string | null
          preferred_contact_method?: string | null
          preferred_name?: string | null
          status?: string
          tags?: string[] | null
          timezone?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          first_name?: string
          full_name?: string | null
          id?: string
          is_billing_contact?: boolean | null
          is_decision_maker?: boolean | null
          is_primary?: boolean | null
          last_name?: string
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          organization_id?: string
          phone?: string | null
          preferred_contact_method?: string | null
          preferred_name?: string | null
          status?: string
          tags?: string[] | null
          timezone?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          amendment_ids: string[] | null
          auto_renew: boolean | null
          counterparty_name: string
          created_at: string | null
          created_by: string | null
          description: string | null
          document_url: string | null
          effective_date: string
          expiration_date: string
          id: string
          number: string
          organization_id: string | null
          project_id: string | null
          scope: string | null
          signatory_id: string | null
          signed_at: string | null
          status: Database["public"]["Enums"]["contract_status"]
          termination_clause: string | null
          title: string
          type: Database["public"]["Enums"]["contract_type"]
          updated_at: string | null
          updated_by: string | null
          value: number | null
          vendor_id: string | null
        }
        Insert: {
          amendment_ids?: string[] | null
          auto_renew?: boolean | null
          counterparty_name: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          effective_date: string
          expiration_date: string
          id?: string
          number: string
          organization_id?: string | null
          project_id?: string | null
          scope?: string | null
          signatory_id?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          termination_clause?: string | null
          title: string
          type?: Database["public"]["Enums"]["contract_type"]
          updated_at?: string | null
          updated_by?: string | null
          value?: number | null
          vendor_id?: string | null
        }
        Update: {
          amendment_ids?: string[] | null
          auto_renew?: boolean | null
          counterparty_name?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          effective_date?: string
          expiration_date?: string
          id?: string
          number?: string
          organization_id?: string | null
          project_id?: string | null
          scope?: string | null
          signatory_id?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          termination_clause?: string | null
          title?: string
          type?: Database["public"]["Enums"]["contract_type"]
          updated_at?: string | null
          updated_by?: string | null
          value?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "contracts_signatory_id_fkey"
            columns: ["signatory_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_notes: {
        Row: {
          amount: number
          applied_at: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: string
          invoice_id: string
          issued_at: string | null
          number: string
          organization_id: string
          reason: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          applied_at?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          invoice_id: string
          issued_at?: string | null
          number: string
          organization_id: string
          reason: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          applied_at?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          invoice_id?: string
          issued_at?: string | null
          number?: string
          organization_id?: string
          reason?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_invoice_aging"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "credit_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_availability: {
        Row: {
          created_at: string | null
          crew_member_id: string
          date: string
          id: string
          notes: string | null
          organization_id: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["availability_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crew_member_id: string
          date: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["availability_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crew_member_id?: string
          date?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["availability_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_availability_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_availability_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "v_crew_utilization"
            referencedColumns: ["crew_member_id"]
          },
          {
            foreignKeyName: "crew_availability_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_availability_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_availability_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      crew_members: {
        Row: {
          avatar_url: string | null
          background_check_date: string | null
          created_at: string | null
          day_rate: number | null
          department: Database["public"]["Enums"]["department"] | null
          drug_test_date: string | null
          email: string
          emergency_contact: Json | null
          employee_id: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          first_name: string | null
          hire_date: string | null
          home_base: string | null
          hourly_rate: number
          id: string
          last_name: string | null
          name: string
          organization_id: string
          overtime_rate: number | null
          phone: string
          preferred_name: string | null
          primary_role: string | null
          role: string
          secondary_roles: string[] | null
          skills: string[] | null
          status: string
          supervisor_id: string | null
          termination_date: string | null
          travel_radius: number | null
          union_local: string | null
          union_member: boolean | null
          updated_at: string | null
          willing_to_travel: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          background_check_date?: string | null
          created_at?: string | null
          day_rate?: number | null
          department?: Database["public"]["Enums"]["department"] | null
          drug_test_date?: string | null
          email: string
          emergency_contact?: Json | null
          employee_id?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          first_name?: string | null
          hire_date?: string | null
          home_base?: string | null
          hourly_rate?: number
          id?: string
          last_name?: string | null
          name: string
          organization_id: string
          overtime_rate?: number | null
          phone: string
          preferred_name?: string | null
          primary_role?: string | null
          role: string
          secondary_roles?: string[] | null
          skills?: string[] | null
          status?: string
          supervisor_id?: string | null
          termination_date?: string | null
          travel_radius?: number | null
          union_local?: string | null
          union_member?: boolean | null
          updated_at?: string | null
          willing_to_travel?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          background_check_date?: string | null
          created_at?: string | null
          day_rate?: number | null
          department?: Database["public"]["Enums"]["department"] | null
          drug_test_date?: string | null
          email?: string
          emergency_contact?: Json | null
          employee_id?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          first_name?: string | null
          hire_date?: string | null
          home_base?: string | null
          hourly_rate?: number
          id?: string
          last_name?: string | null
          name?: string
          organization_id?: string
          overtime_rate?: number | null
          phone?: string
          preferred_name?: string | null
          primary_role?: string | null
          role?: string
          secondary_roles?: string[] | null
          skills?: string[] | null
          status?: string
          supervisor_id?: string | null
          termination_date?: string | null
          travel_radius?: number | null
          union_local?: string | null
          union_member?: boolean | null
          updated_at?: string | null
          willing_to_travel?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_shifts: {
        Row: {
          break_minutes: number | null
          call_time: string
          created_at: string | null
          created_by: string | null
          crew_member_id: string
          date: string
          department: Database["public"]["Enums"]["department"]
          duties: string[] | null
          end_time: string
          event_id: string | null
          hourly_rate: number
          id: string
          location_id: string
          meal_provided: boolean | null
          notes: string | null
          organization_id: string | null
          overtime_rate: number | null
          project_id: string
          reporting_location: string | null
          role: string
          start_time: string
          status: Database["public"]["Enums"]["shift_status"]
          supervisor_id: string | null
          time_entry_id: string | null
          travel_reimbursement: boolean | null
          updated_at: string | null
          updated_by: string | null
          wrap_time: string | null
        }
        Insert: {
          break_minutes?: number | null
          call_time: string
          created_at?: string | null
          created_by?: string | null
          crew_member_id: string
          date: string
          department?: Database["public"]["Enums"]["department"]
          duties?: string[] | null
          end_time: string
          event_id?: string | null
          hourly_rate: number
          id?: string
          location_id: string
          meal_provided?: boolean | null
          notes?: string | null
          organization_id?: string | null
          overtime_rate?: number | null
          project_id: string
          reporting_location?: string | null
          role: string
          start_time: string
          status?: Database["public"]["Enums"]["shift_status"]
          supervisor_id?: string | null
          time_entry_id?: string | null
          travel_reimbursement?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          wrap_time?: string | null
        }
        Update: {
          break_minutes?: number | null
          call_time?: string
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string
          date?: string
          department?: Database["public"]["Enums"]["department"]
          duties?: string[] | null
          end_time?: string
          event_id?: string | null
          hourly_rate?: number
          id?: string
          location_id?: string
          meal_provided?: boolean | null
          notes?: string | null
          organization_id?: string | null
          overtime_rate?: number | null
          project_id?: string
          reporting_location?: string | null
          role?: string
          start_time?: string
          status?: Database["public"]["Enums"]["shift_status"]
          supervisor_id?: string | null
          time_entry_id?: string | null
          travel_reimbursement?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          wrap_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_shifts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_shifts_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_shifts_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "v_crew_utilization"
            referencedColumns: ["crew_member_id"]
          },
          {
            foreignKeyName: "crew_shifts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_shifts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_shifts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_shifts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_shifts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "crew_shifts_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_shifts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          created_at: string | null
          custom_field_id: string
          entity_id: string
          id: string
          organization_id: string
          updated_at: string | null
          value_boolean: boolean | null
          value_date: string | null
          value_datetime: string | null
          value_json: Json | null
          value_number: number | null
          value_text: string | null
        }
        Insert: {
          created_at?: string | null
          custom_field_id: string
          entity_id: string
          id?: string
          organization_id: string
          updated_at?: string | null
          value_boolean?: boolean | null
          value_date?: string | null
          value_datetime?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Update: {
          created_at?: string | null
          custom_field_id?: string
          entity_id?: string
          id?: string
          organization_id?: string
          updated_at?: string | null
          value_boolean?: boolean | null
          value_date?: string | null
          value_datetime?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_custom_field_id_fkey"
            columns: ["custom_field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_values_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          created_at: string | null
          created_by: string | null
          default_value: string | null
          description: string | null
          display_order: number | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          field_key: string
          field_type: Database["public"]["Enums"]["custom_field_type"]
          group_name: string | null
          id: string
          is_filterable: boolean | null
          is_required: boolean | null
          is_visible_in_list: boolean | null
          name: string
          options: Json | null
          organization_id: string
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_value?: string | null
          description?: string | null
          display_order?: number | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          field_key: string
          field_type: Database["public"]["Enums"]["custom_field_type"]
          group_name?: string | null
          id?: string
          is_filterable?: boolean | null
          is_required?: boolean | null
          is_visible_in_list?: boolean | null
          name: string
          options?: Json | null
          organization_id: string
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_value?: string | null
          description?: string | null
          display_order?: number | null
          entity_type?: Database["public"]["Enums"]["entity_type"]
          field_key?: string
          field_type?: Database["public"]["Enums"]["custom_field_type"]
          group_name?: string | null
          id?: string
          is_filterable?: boolean | null
          is_required?: boolean | null
          is_visible_in_list?: boolean | null
          name?: string
          options?: Json | null
          organization_id?: string
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_fields_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_fields_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          color: string | null
          config: Json | null
          created_at: string | null
          dashboard_id: string
          data_source: string
          filters: Json | null
          id: string
          last_refreshed_at: string | null
          name: string
          refresh_interval_seconds: number | null
          subtitle: string | null
          time_range: string | null
          title: string | null
          updated_at: string | null
          widget_type: Database["public"]["Enums"]["widget_type"]
        }
        Insert: {
          color?: string | null
          config?: Json | null
          created_at?: string | null
          dashboard_id: string
          data_source: string
          filters?: Json | null
          id?: string
          last_refreshed_at?: string | null
          name: string
          refresh_interval_seconds?: number | null
          subtitle?: string | null
          time_range?: string | null
          title?: string | null
          updated_at?: string | null
          widget_type: Database["public"]["Enums"]["widget_type"]
        }
        Update: {
          color?: string | null
          config?: Json | null
          created_at?: string | null
          dashboard_id?: string
          data_source?: string
          filters?: Json | null
          id?: string
          last_refreshed_at?: string | null
          name?: string
          refresh_interval_seconds?: number | null
          subtitle?: string | null
          time_range?: string | null
          title?: string | null
          updated_at?: string | null
          widget_type?: Database["public"]["Enums"]["widget_type"]
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          layout: Json | null
          name: string
          organization_id: string
          owner_id: string
          shared_with_role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout?: Json | null
          name: string
          organization_id: string
          owner_id: string
          shared_with_role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout?: Json | null
          name?: string
          organization_id?: string
          owner_id?: string
          shared_with_role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboards_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          assigned_to: string | null
          company: string
          company_id: string | null
          contact_email: string
          contact_id: string | null
          contact_name: string
          converted_at: string | null
          converted_project_id: string | null
          created_at: string | null
          expected_close_date: string
          id: string
          lead_id: string | null
          lost_reason: string | null
          lost_reason_id: string | null
          lost_to_competitor: string | null
          next_step: string | null
          next_step_date: string | null
          notes: string | null
          organization_id: string
          pipeline_id: string | null
          probability: number
          source: Database["public"]["Enums"]["lead_source"] | null
          stage: string
          title: string
          updated_at: string | null
          value: number
        }
        Insert: {
          assigned_to?: string | null
          company: string
          company_id?: string | null
          contact_email: string
          contact_id?: string | null
          contact_name: string
          converted_at?: string | null
          converted_project_id?: string | null
          created_at?: string | null
          expected_close_date: string
          id?: string
          lead_id?: string | null
          lost_reason?: string | null
          lost_reason_id?: string | null
          lost_to_competitor?: string | null
          next_step?: string | null
          next_step_date?: string | null
          notes?: string | null
          organization_id: string
          pipeline_id?: string | null
          probability?: number
          source?: Database["public"]["Enums"]["lead_source"] | null
          stage?: string
          title: string
          updated_at?: string | null
          value?: number
        }
        Update: {
          assigned_to?: string | null
          company?: string
          company_id?: string | null
          contact_email?: string
          contact_id?: string | null
          contact_name?: string
          converted_at?: string | null
          converted_project_id?: string | null
          created_at?: string | null
          expected_close_date?: string
          id?: string
          lead_id?: string | null
          lost_reason?: string | null
          lost_reason_id?: string | null
          lost_to_competitor?: string | null
          next_step?: string | null
          next_step_date?: string | null
          notes?: string | null
          organization_id?: string
          pipeline_id?: string | null
          probability?: number
          source?: Database["public"]["Enums"]["lead_source"] | null
          stage?: string
          title?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_converted_project_id_fkey"
            columns: ["converted_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_converted_project_id_fkey"
            columns: ["converted_project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lost_reason_id_fkey"
            columns: ["lost_reason_id"]
            isOneToOne: false
            referencedRelation: "lost_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_slides: {
        Row: {
          content: string
          created_at: string | null
          data_bindings: Json | null
          deck_id: string
          id: string
          order: number
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          data_bindings?: Json | null
          deck_id: string
          id?: string
          order: number
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          data_bindings?: Json | null
          deck_id?: string
          id?: string
          order?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deck_slides_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      decks: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          project_id: string
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          project_id: string
          status?: string
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          project_id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      deliverable_progress_snapshots: {
        Row: {
          amount_invoiced: number
          amount_spent: number
          created_at: string | null
          hours_logged: number
          id: string
          notes: string | null
          organization_id: string
          percent_complete: number
          recorded_by: string | null
          snapshot_date: string
          sow_deliverable_id: string
          tasks_completed: number
          tasks_total: number
        }
        Insert: {
          amount_invoiced?: number
          amount_spent?: number
          created_at?: string | null
          hours_logged?: number
          id?: string
          notes?: string | null
          organization_id: string
          percent_complete: number
          recorded_by?: string | null
          snapshot_date?: string
          sow_deliverable_id: string
          tasks_completed?: number
          tasks_total?: number
        }
        Update: {
          amount_invoiced?: number
          amount_spent?: number
          created_at?: string | null
          hours_logged?: number
          id?: string
          notes?: string | null
          organization_id?: string
          percent_complete?: number
          recorded_by?: string | null
          snapshot_date?: string
          sow_deliverable_id?: string
          tasks_completed?: number
          tasks_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_progress_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_progress_snapshots_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_progress_snapshots_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "sow_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_progress_snapshots_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "v_sow_deliverable_summary"
            referencedColumns: ["deliverable_id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string | null
          content: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          preview_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          preview_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          preview_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          change_description: string | null
          content: Json
          created_at: string | null
          created_by: string | null
          document_id: string
          id: string
          title: string
          version_number: number
        }
        Insert: {
          change_description?: string | null
          content: Json
          created_at?: string | null
          created_by?: string | null
          document_id: string
          id?: string
          title: string
          version_number: number
        }
        Update: {
          change_description?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          document_id?: string
          id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          can_comment: boolean | null
          can_edit: boolean | null
          content: Json | null
          cover_image_url: string | null
          created_at: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          icon: string | null
          id: string
          is_public: boolean | null
          last_edited_by: string | null
          organization_id: string
          owner_id: string
          parent_id: string | null
          project_id: string | null
          published_at: string | null
          shared_with_team_ids: string[] | null
          shared_with_user_ids: string[] | null
          status: Database["public"]["Enums"]["document_status"]
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          can_comment?: boolean | null
          can_edit?: boolean | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          icon?: string | null
          id?: string
          is_public?: boolean | null
          last_edited_by?: string | null
          organization_id: string
          owner_id: string
          parent_id?: string | null
          project_id?: string | null
          published_at?: string | null
          shared_with_team_ids?: string[] | null
          shared_with_user_ids?: string[] | null
          status?: Database["public"]["Enums"]["document_status"]
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          can_comment?: boolean | null
          can_edit?: boolean | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          icon?: string | null
          id?: string
          is_public?: boolean | null
          last_edited_by?: string | null
          organization_id?: string
          owner_id?: string
          parent_id?: string | null
          project_id?: string | null
          published_at?: string | null
          shared_with_team_ids?: string[] | null
          shared_with_user_ids?: string[] | null
          status?: Database["public"]["Enums"]["document_status"]
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_last_edited_by_fkey"
            columns: ["last_edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      e_signatures: {
        Row: {
          access_token: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          expires_at: string | null
          id: string
          ip_address: string | null
          organization_id: string
          reminder_sent_at: string | null
          signature_data: string | null
          signed_at: string | null
          signer_email: string
          signer_name: string
          signer_role: string | null
          signer_user_id: string | null
          status: Database["public"]["Enums"]["signature_status"]
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          organization_id: string
          reminder_sent_at?: string | null
          signature_data?: string | null
          signed_at?: string | null
          signer_email: string
          signer_name: string
          signer_role?: string | null
          signer_user_id?: string | null
          status?: Database["public"]["Enums"]["signature_status"]
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string
          reminder_sent_at?: string | null
          signature_data?: string | null
          signed_at?: string | null
          signer_email?: string
          signer_name?: string
          signer_role?: string | null
          signer_user_id?: string | null
          status?: Database["public"]["Enums"]["signature_status"]
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "e_signatures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "e_signatures_signer_user_id_fkey"
            columns: ["signer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          activation_id: string | null
          attendee_count: number | null
          budget: number | null
          cancellation_policy: string | null
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          doors_time: string | null
          end_time: string
          id: string
          location_id: string | null
          name: string
          organization_id: string | null
          producer_id: string | null
          project_id: string
          purpose: string | null
          rain_plan: string | null
          run_of_show: Json | null
          specific_location: string | null
          stage_manager_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string | null
          updated_by: string | null
          vip_count: number | null
        }
        Insert: {
          activation_id?: string | null
          attendee_count?: number | null
          budget?: number | null
          cancellation_policy?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          doors_time?: string | null
          end_time: string
          id?: string
          location_id?: string | null
          name: string
          organization_id?: string | null
          producer_id?: string | null
          project_id: string
          purpose?: string | null
          rain_plan?: string | null
          run_of_show?: Json | null
          specific_location?: string | null
          stage_manager_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
          updated_by?: string | null
          vip_count?: number | null
        }
        Update: {
          activation_id?: string | null
          attendee_count?: number | null
          budget?: number | null
          cancellation_policy?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          doors_time?: string | null
          end_time?: string
          id?: string
          location_id?: string | null
          name?: string
          organization_id?: string | null
          producer_id?: string | null
          project_id?: string
          purpose?: string | null
          rain_plan?: string | null
          run_of_show?: Json | null
          specific_location?: string | null
          stage_manager_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
          updated_by?: string | null
          vip_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "events_stage_manager_id_fkey"
            columns: ["stage_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          organization_id: string | null
          project_id: string | null
          receipt_url: string | null
          sow_deliverable_id: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          organization_id?: string | null
          project_id?: string | null
          receipt_url?: string | null
          sow_deliverable_id?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          organization_id?: string | null
          project_id?: string | null
          receipt_url?: string | null
          sow_deliverable_id?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "expenses_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "sow_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "v_sow_deliverable_summary"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "expenses_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          actual_cost: number | null
          assigned_to_id: string | null
          attachment_ids: string[] | null
          claim_number: string | null
          created_at: string | null
          created_by: string | null
          description: string
          estimated_cost: number | null
          follow_up_task_ids: string[] | null
          id: string
          immediate_actions: string | null
          insurance_claim: boolean | null
          involved_party_ids: string[] | null
          location_id: string | null
          number: string
          occurred_at: string
          organization_id: string | null
          preventive_measures: string | null
          project_id: string
          reported_at: string | null
          reported_by_id: string | null
          resolution: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          specific_location: string | null
          status: Database["public"]["Enums"]["incident_status"]
          title: string
          type: Database["public"]["Enums"]["incident_type"]
          updated_at: string | null
          updated_by: string | null
          witness_ids: string[] | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to_id?: string | null
          attachment_ids?: string[] | null
          claim_number?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          estimated_cost?: number | null
          follow_up_task_ids?: string[] | null
          id?: string
          immediate_actions?: string | null
          insurance_claim?: boolean | null
          involved_party_ids?: string[] | null
          location_id?: string | null
          number: string
          occurred_at: string
          organization_id?: string | null
          preventive_measures?: string | null
          project_id: string
          reported_at?: string | null
          reported_by_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          specific_location?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          title: string
          type: Database["public"]["Enums"]["incident_type"]
          updated_at?: string | null
          updated_by?: string | null
          witness_ids?: string[] | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to_id?: string | null
          attachment_ids?: string[] | null
          claim_number?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          estimated_cost?: number | null
          follow_up_task_ids?: string[] | null
          id?: string
          immediate_actions?: string | null
          insurance_claim?: boolean | null
          involved_party_ids?: string[] | null
          location_id?: string | null
          number?: string
          occurred_at?: string
          organization_id?: string | null
          preventive_measures?: string | null
          project_id?: string
          reported_at?: string | null
          reported_by_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          specific_location?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          type?: Database["public"]["Enums"]["incident_type"]
          updated_at?: string | null
          updated_by?: string | null
          witness_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "incidents_reported_by_id_fkey"
            columns: ["reported_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          name: string
          organization_id: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          name: string
          organization_id?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          name?: string
          organization_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          amount: number | null
          billing_period_end: string | null
          billing_period_start: string | null
          budget_category: Database["public"]["Enums"]["budget_category"] | null
          client_invoice_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          line_number: number
          line_type: Database["public"]["Enums"]["invoice_line_item_type"]
          name: string
          phase: Database["public"]["Enums"]["production_phase"] | null
          quantity: number
          sow_deliverable_id: string | null
          tax_rate: number | null
          taxable: boolean | null
          unit: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          budget_category?:
            | Database["public"]["Enums"]["budget_category"]
            | null
          client_invoice_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          line_number: number
          line_type?: Database["public"]["Enums"]["invoice_line_item_type"]
          name: string
          phase?: Database["public"]["Enums"]["production_phase"] | null
          quantity?: number
          sow_deliverable_id?: string | null
          tax_rate?: number | null
          taxable?: boolean | null
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          budget_category?:
            | Database["public"]["Enums"]["budget_category"]
            | null
          client_invoice_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          line_number?: number
          line_type?: Database["public"]["Enums"]["invoice_line_item_type"]
          name?: string
          phase?: Database["public"]["Enums"]["production_phase"] | null
          quantity?: number
          sow_deliverable_id?: string | null
          tax_rate?: number | null
          taxable?: boolean | null
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_client_invoice_id_fkey"
            columns: ["client_invoice_id"]
            isOneToOne: false
            referencedRelation: "client_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_client_invoice_id_fkey"
            columns: ["client_invoice_id"]
            isOneToOne: false
            referencedRelation: "v_client_invoice_aging"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_line_items_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "sow_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "v_sow_deliverable_summary"
            referencedColumns: ["deliverable_id"]
          },
        ]
      }
      invoice_templates: {
        Row: {
          accent_color: string | null
          bank_details: string | null
          created_at: string | null
          created_by: string | null
          font_family: string | null
          footer_text: string | null
          header_text: string | null
          id: string
          is_default: boolean | null
          logo_url: string | null
          name: string
          organization_id: string
          payment_instructions: string | null
          primary_color: string | null
          show_company_address: boolean | null
          show_line_item_details: boolean | null
          show_logo: boolean | null
          show_tax_breakdown: boolean | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          bank_details?: string | null
          created_at?: string | null
          created_by?: string | null
          font_family?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name: string
          organization_id: string
          payment_instructions?: string | null
          primary_color?: string | null
          show_company_address?: boolean | null
          show_line_item_details?: boolean | null
          show_logo?: boolean | null
          show_tax_breakdown?: boolean | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          bank_details?: string | null
          created_at?: string | null
          created_by?: string | null
          font_family?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name?: string
          organization_id?: string
          payment_instructions?: string | null
          primary_color?: string | null
          show_company_address?: boolean | null
          show_line_item_details?: boolean | null
          show_logo?: boolean | null
          show_tax_breakdown?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_time_entries: {
        Row: {
          amount_billed: number | null
          created_at: string | null
          hours_billed: number
          id: string
          invoice_line_item_id: string
          production_time_entry_id: string | null
          rate_billed: number
          time_entry_id: string | null
        }
        Insert: {
          amount_billed?: number | null
          created_at?: string | null
          hours_billed: number
          id?: string
          invoice_line_item_id: string
          production_time_entry_id?: string | null
          rate_billed: number
          time_entry_id?: string | null
        }
        Update: {
          amount_billed?: number | null
          created_at?: string | null
          hours_billed?: number
          id?: string
          invoice_line_item_id?: string
          production_time_entry_id?: string | null
          rate_billed?: number
          time_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_time_entries_invoice_line_item_id_fkey"
            columns: ["invoice_line_item_id"]
            isOneToOne: false
            referencedRelation: "invoice_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_time_entries_production_time_entry_id_fkey"
            columns: ["production_time_entry_id"]
            isOneToOne: false
            referencedRelation: "production_time_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_time_entries_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string | null
          delivery_status:
            | Database["public"]["Enums"]["invoice_delivery_status"]
            | null
          due_date: string
          id: string
          invoice_date: string
          organization_id: string
          paid_at: string | null
          purchase_order_id: string | null
          reminder_sent_at: string | null
          sent_at: string | null
          status: string
          template_id: string | null
          updated_at: string | null
          variance: number | null
          vendor_id: string
          viewed_at: string | null
        }
        Insert: {
          amount?: number
          company_id?: string | null
          created_at?: string | null
          delivery_status?:
            | Database["public"]["Enums"]["invoice_delivery_status"]
            | null
          due_date: string
          id?: string
          invoice_date: string
          organization_id: string
          paid_at?: string | null
          purchase_order_id?: string | null
          reminder_sent_at?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string | null
          variance?: number | null
          vendor_id: string
          viewed_at?: string | null
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string | null
          delivery_status?:
            | Database["public"]["Enums"]["invoice_delivery_status"]
            | null
          due_date?: string
          id?: string
          invoice_date?: string
          organization_id?: string
          paid_at?: string | null
          purchase_order_id?: string | null
          reminder_sent_at?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string | null
          variance?: number | null
          vendor_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_articles: {
        Row: {
          acknowledgment_ids: string[] | null
          attachment_ids: string[] | null
          author_id: string | null
          category: Database["public"]["Enums"]["document_category"]
          content: string
          created_at: string | null
          created_by: string | null
          department: Database["public"]["Enums"]["department"] | null
          id: string
          next_review_date: string | null
          organization_id: string | null
          published_at: string | null
          purpose: string | null
          related_article_ids: string[] | null
          requires_acknowledgment: boolean | null
          reviewed_at: string | null
          reviewer_ids: string[] | null
          status: Database["public"]["Enums"]["document_status"]
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          acknowledgment_ids?: string[] | null
          attachment_ids?: string[] | null
          author_id?: string | null
          category: Database["public"]["Enums"]["document_category"]
          content: string
          created_at?: string | null
          created_by?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          id?: string
          next_review_date?: string | null
          organization_id?: string | null
          published_at?: string | null
          purpose?: string | null
          related_article_ids?: string[] | null
          requires_acknowledgment?: boolean | null
          reviewed_at?: string | null
          reviewer_ids?: string[] | null
          status?: Database["public"]["Enums"]["document_status"]
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          acknowledgment_ids?: string[] | null
          attachment_ids?: string[] | null
          author_id?: string | null
          category?: Database["public"]["Enums"]["document_category"]
          content?: string
          created_at?: string | null
          created_by?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          id?: string
          next_review_date?: string | null
          organization_id?: string | null
          published_at?: string | null
          purpose?: string | null
          related_article_ids?: string[] | null
          requires_acknowledgment?: boolean | null
          reviewed_at?: string | null
          reviewer_ids?: string[] | null
          status?: Database["public"]["Enums"]["document_status"]
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_articles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_articles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_articles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          lead_id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget_range: Database["public"]["Enums"]["budget_range"] | null
          company: string | null
          converted_at: string | null
          converted_to_deal_id: string | null
          created_at: string
          description: string | null
          email: string
          first_name: string
          id: string
          job_title: string | null
          last_contacted_at: string | null
          last_name: string | null
          marketing_consent: boolean | null
          notes: string | null
          phone: string | null
          privacy_accepted: boolean | null
          project_type:
            | Database["public"]["Enums"]["project_type_interest"]
            | null
          referrer_url: string | null
          score: number | null
          source: Database["public"]["Enums"]["lead_source"] | null
          source_detail: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          timeline: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_range?: Database["public"]["Enums"]["budget_range"] | null
          company?: string | null
          converted_at?: string | null
          converted_to_deal_id?: string | null
          created_at?: string
          description?: string | null
          email: string
          first_name: string
          id?: string
          job_title?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          marketing_consent?: boolean | null
          notes?: string | null
          phone?: string | null
          privacy_accepted?: boolean | null
          project_type?:
            | Database["public"]["Enums"]["project_type_interest"]
            | null
          referrer_url?: string | null
          score?: number | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          source_detail?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          timeline?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_range?: Database["public"]["Enums"]["budget_range"] | null
          company?: string | null
          converted_at?: string | null
          converted_to_deal_id?: string | null
          created_at?: string
          description?: string | null
          email?: string
          first_name?: string
          id?: string
          job_title?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          marketing_consent?: boolean | null
          notes?: string | null
          phone?: string | null
          privacy_accepted?: boolean | null
          project_type?:
            | Database["public"]["Enums"]["project_type_interest"]
            | null
          referrer_url?: string | null
          score?: number | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          source_detail?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          timeline?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          access_end_date: string | null
          access_start_date: string | null
          address_city: string | null
          address_country: string | null
          address_postal_code: string | null
          address_state: string | null
          address_street1: string | null
          address_street2: string | null
          amenities: string[] | null
          capacity: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          coordinates: unknown
          created_at: string | null
          created_by: string | null
          daily_rate: number | null
          description: string | null
          dock_info: string | null
          id: string
          insurance_required: boolean | null
          internet_available: boolean | null
          load_in_windows: Json | null
          load_out_windows: Json | null
          name: string
          organization_id: string | null
          parking_info: string | null
          permits_required: string[] | null
          power_available: string | null
          project_id: string | null
          purpose: string | null
          restrictions: string[] | null
          square_footage: number | null
          total_cost: number | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string | null
          updated_by: string | null
          venue_rep_id: string | null
        }
        Insert: {
          access_end_date?: string | null
          access_start_date?: string | null
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street1?: string | null
          address_street2?: string | null
          amenities?: string[] | null
          capacity?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coordinates?: unknown
          created_at?: string | null
          created_by?: string | null
          daily_rate?: number | null
          description?: string | null
          dock_info?: string | null
          id?: string
          insurance_required?: boolean | null
          internet_available?: boolean | null
          load_in_windows?: Json | null
          load_out_windows?: Json | null
          name: string
          organization_id?: string | null
          parking_info?: string | null
          permits_required?: string[] | null
          power_available?: string | null
          project_id?: string | null
          purpose?: string | null
          restrictions?: string[] | null
          square_footage?: number | null
          total_cost?: number | null
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string | null
          updated_by?: string | null
          venue_rep_id?: string | null
        }
        Update: {
          access_end_date?: string | null
          access_start_date?: string | null
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street1?: string | null
          address_street2?: string | null
          amenities?: string[] | null
          capacity?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coordinates?: unknown
          created_at?: string | null
          created_by?: string | null
          daily_rate?: number | null
          description?: string | null
          dock_info?: string | null
          id?: string
          insurance_required?: boolean | null
          internet_available?: boolean | null
          load_in_windows?: Json | null
          load_out_windows?: Json | null
          name?: string
          organization_id?: string | null
          parking_info?: string | null
          permits_required?: string[] | null
          power_available?: string | null
          project_id?: string | null
          purpose?: string | null
          restrictions?: string[] | null
          square_footage?: number | null
          total_cost?: number | null
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string | null
          updated_by?: string | null
          venue_rep_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "locations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_venue_rep_id_fkey"
            columns: ["venue_rep_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lost_reasons: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lost_reasons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          asset_id: string
          cost: number | null
          created_at: string | null
          created_by: string | null
          date: string
          description: string
          id: string
          next_due_date: string | null
          notes: string | null
          organization_id: string | null
          performed_by_id: string | null
          type: string
          vendor_id: string | null
        }
        Insert: {
          asset_id: string
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          date: string
          description: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          organization_id?: string | null
          performed_by_id?: string | null
          type: string
          vendor_id?: string | null
        }
        Update: {
          asset_id?: string
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          organization_id?: string | null
          performed_by_id?: string | null
          type?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_performed_by_id_fkey"
            columns: ["performed_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          approval_id: string | null
          approval_required: boolean | null
          completed_at: string | null
          created_at: string | null
          deliverables: string[] | null
          description: string | null
          due_date: string
          id: string
          name: string
          organization_id: string | null
          project_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          approval_id?: string | null
          approval_required?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          deliverables?: string[] | null
          description?: string | null
          due_date: string
          id?: string
          name: string
          organization_id?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          approval_id?: string | null
          approval_required?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          deliverables?: string[] | null
          description?: string | null
          due_date?: string
          id?: string
          name?: string
          organization_id?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          categories: Json | null
          created_at: string | null
          daily_digest_enabled: boolean | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          push_enabled: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          quiet_hours_timezone: string | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
          weekly_digest_enabled: boolean | null
        }
        Insert: {
          categories?: Json | null
          created_at?: string | null
          daily_digest_enabled?: boolean | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          quiet_hours_timezone?: string | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_digest_enabled?: boolean | null
        }
        Update: {
          categories?: Json | null
          created_at?: string | null
          daily_digest_enabled?: boolean | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          quiet_hours_timezone?: string | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_digest_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean
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
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: string
          invoice_id: string
          notes: string | null
          organization_id: string
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference_number: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          organization_id: string
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          organization_id?: string
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_invoice_aging"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_batches: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          organization_id: string | null
          period_end: string
          period_start: string
          processed_at: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["payroll_status"]
          time_entry_ids: string[] | null
          total_deductions: number
          total_gross: number
          total_net: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id?: string | null
          period_end: string
          period_start: string
          processed_at?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["payroll_status"]
          time_entry_ids?: string[] | null
          total_deductions?: number
          total_gross?: number
          total_net?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id?: string | null
          period_end?: string
          period_start?: string
          processed_at?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["payroll_status"]
          time_entry_ids?: string[] | null
          total_deductions?: number
          total_gross?: number
          total_net?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_batches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_batches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "payroll_batches_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          default_assignee_id: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          organization_id: string
          stages: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_assignee_id?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          organization_id: string
          stages?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_assignee_id?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          organization_id?: string
          stages?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipelines_default_assignee_id_fkey"
            columns: ["default_assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipelines_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      production_budget_lines: {
        Row: {
          actual_amount: number
          budget_id: string
          budgeted_amount: number
          category: Database["public"]["Enums"]["budget_category"]
          committed_amount: number
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          notes: string | null
          organization_id: string | null
          phase: Database["public"]["Enums"]["production_phase"]
          quantity: number
          subcategory: string | null
          unit: string | null
          unit_cost: number
          updated_at: string | null
          updated_by: string | null
          variance: number | null
          vendor_id: string | null
        }
        Insert: {
          actual_amount?: number
          budget_id: string
          budgeted_amount?: number
          category: Database["public"]["Enums"]["budget_category"]
          committed_amount?: number
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          phase?: Database["public"]["Enums"]["production_phase"]
          quantity?: number
          subcategory?: string | null
          unit?: string | null
          unit_cost?: number
          updated_at?: string | null
          updated_by?: string | null
          variance?: number | null
          vendor_id?: string | null
        }
        Update: {
          actual_amount?: number
          budget_id?: string
          budgeted_amount?: number
          category?: Database["public"]["Enums"]["budget_category"]
          committed_amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          phase?: Database["public"]["Enums"]["production_phase"]
          quantity?: number
          subcategory?: string | null
          unit?: string | null
          unit_cost?: number
          updated_at?: string | null
          updated_by?: string | null
          variance?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_budget_lines_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_budget_lines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_budget_lines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_budget_lines_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_budget_lines_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      production_checklists: {
        Row: {
          assigned_to_id: string | null
          completed_at: string | null
          completed_by_id: string | null
          completion_percent: number | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          event_id: string | null
          id: string
          items: Json | null
          organization_id: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["checklist_status"]
          template_id: string | null
          title: string
          type: Database["public"]["Enums"]["checklist_type"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assigned_to_id?: string | null
          completed_at?: string | null
          completed_by_id?: string | null
          completion_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          items?: Json | null
          organization_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["checklist_status"]
          template_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["checklist_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assigned_to_id?: string | null
          completed_at?: string | null
          completed_by_id?: string | null
          completion_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          items?: Json | null
          organization_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["checklist_status"]
          template_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["checklist_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_checklists_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_checklists_completed_by_id_fkey"
            columns: ["completed_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_checklists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_checklists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_checklists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "production_checklists_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      production_expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by_id: string | null
          budget_line_id: string | null
          category: Database["public"]["Enums"]["budget_category"]
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string
          expense_date: string
          id: string
          invoice_id: string | null
          invoice_line_item_id: string | null
          justification: string | null
          organization_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          project_id: string
          purchase_order_id: string | null
          receipt_url: string | null
          reimbursable: boolean | null
          sow_deliverable_id: string | null
          status: Database["public"]["Enums"]["expense_status"]
          submitted_at: string | null
          submitted_by_id: string | null
          updated_at: string | null
          updated_by: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by_id?: string | null
          budget_line_id?: string | null
          category: Database["public"]["Enums"]["budget_category"]
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description: string
          expense_date: string
          id?: string
          invoice_id?: string | null
          invoice_line_item_id?: string | null
          justification?: string | null
          organization_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          project_id: string
          purchase_order_id?: string | null
          receipt_url?: string | null
          reimbursable?: boolean | null
          sow_deliverable_id?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          submitted_at?: string | null
          submitted_by_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by_id?: string | null
          budget_line_id?: string | null
          category?: Database["public"]["Enums"]["budget_category"]
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string
          expense_date?: string
          id?: string
          invoice_id?: string | null
          invoice_line_item_id?: string | null
          justification?: string | null
          organization_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          project_id?: string
          purchase_order_id?: string | null
          receipt_url?: string | null
          reimbursable?: boolean | null
          sow_deliverable_id?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          submitted_at?: string | null
          submitted_by_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_expenses_approved_by_id_fkey"
            columns: ["approved_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_expenses_budget_line_id_fkey"
            columns: ["budget_line_id"]
            isOneToOne: false
            referencedRelation: "production_budget_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_expenses_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_expenses_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_invoice_aging"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "production_expenses_invoice_line_item_id_fkey"
            columns: ["invoice_line_item_id"]
            isOneToOne: false
            referencedRelation: "invoice_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "production_expenses_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_expenses_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "sow_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_expenses_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "v_sow_deliverable_summary"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "production_expenses_submitted_by_id_fkey"
            columns: ["submitted_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_expenses_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      production_milestones: {
        Row: {
          approval_id: string | null
          approver_ids: string[] | null
          client_facing: boolean | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          deliverables: Json | null
          description: string | null
          due_date: string
          id: string
          is_critical_path: boolean | null
          name: string
          organization_id: string | null
          owner_id: string | null
          payment_amount: number | null
          payment_trigger: boolean | null
          phase: Database["public"]["Enums"]["production_phase"]
          project_id: string
          status: Database["public"]["Enums"]["milestone_status"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          approval_id?: string | null
          approver_ids?: string[] | null
          client_facing?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deliverables?: Json | null
          description?: string | null
          due_date: string
          id?: string
          is_critical_path?: boolean | null
          name: string
          organization_id?: string | null
          owner_id?: string | null
          payment_amount?: number | null
          payment_trigger?: boolean | null
          phase: Database["public"]["Enums"]["production_phase"]
          project_id: string
          status?: Database["public"]["Enums"]["milestone_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          approval_id?: string | null
          approver_ids?: string[] | null
          client_facing?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deliverables?: Json | null
          description?: string | null
          due_date?: string
          id?: string
          is_critical_path?: boolean | null
          name?: string
          organization_id?: string | null
          owner_id?: string | null
          payment_amount?: number | null
          payment_trigger?: boolean | null
          phase?: Database["public"]["Enums"]["production_phase"]
          project_id?: string
          status?: Database["public"]["Enums"]["milestone_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_milestones_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_milestones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_milestones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_milestones_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "production_milestones_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      production_sops: {
        Row: {
          applicable_roles: string[] | null
          created_at: string | null
          created_by: string | null
          department: Database["public"]["Enums"]["department"]
          effective_date: string
          form_ids: string[] | null
          id: string
          number: string
          organization_id: string | null
          owner_id: string | null
          purpose: string | null
          related_sop_ids: string[] | null
          requires_training: boolean | null
          review_date: string
          safety_related: boolean | null
          scope: string | null
          status: Database["public"]["Enums"]["sop_status"]
          steps: Json | null
          title: string
          training_material_ids: string[] | null
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          applicable_roles?: string[] | null
          created_at?: string | null
          created_by?: string | null
          department: Database["public"]["Enums"]["department"]
          effective_date: string
          form_ids?: string[] | null
          id?: string
          number: string
          organization_id?: string | null
          owner_id?: string | null
          purpose?: string | null
          related_sop_ids?: string[] | null
          requires_training?: boolean | null
          review_date: string
          safety_related?: boolean | null
          scope?: string | null
          status?: Database["public"]["Enums"]["sop_status"]
          steps?: Json | null
          title: string
          training_material_ids?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          applicable_roles?: string[] | null
          created_at?: string | null
          created_by?: string | null
          department?: Database["public"]["Enums"]["department"]
          effective_date?: string
          form_ids?: string[] | null
          id?: string
          number?: string
          organization_id?: string | null
          owner_id?: string | null
          purpose?: string | null
          related_sop_ids?: string[] | null
          requires_training?: boolean | null
          review_date?: string
          safety_related?: boolean | null
          scope?: string | null
          status?: Database["public"]["Enums"]["sop_status"]
          steps?: Json | null
          title?: string
          training_material_ids?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_sops_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_sops_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_sops_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_sops_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      production_tasks: {
        Row: {
          acceptance_criteria: string[] | null
          activation_id: string | null
          actual_hours: number | null
          assignee_id: string | null
          blockers: string[] | null
          board_position: number | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          deliverables: string[] | null
          department: Database["public"]["Enums"]["department"]
          dependencies: string[] | null
          dependents: string[] | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          impact_if_delayed: string | null
          location_id: string | null
          milestone_id: string | null
          organization_id: string | null
          parent_task_id: string | null
          percent_complete: number | null
          phase: Database["public"]["Enums"]["production_phase"]
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string
          reviewer_id: string | null
          sow_deliverable_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string | null
          updated_by: string | null
          vendor_id: string | null
        }
        Insert: {
          acceptance_criteria?: string[] | null
          activation_id?: string | null
          actual_hours?: number | null
          assignee_id?: string | null
          blockers?: string[] | null
          board_position?: number | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deliverables?: string[] | null
          department?: Database["public"]["Enums"]["department"]
          dependencies?: string[] | null
          dependents?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          impact_if_delayed?: string | null
          location_id?: string | null
          milestone_id?: string | null
          organization_id?: string | null
          parent_task_id?: string | null
          percent_complete?: number | null
          phase?: Database["public"]["Enums"]["production_phase"]
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id: string
          reviewer_id?: string | null
          sow_deliverable_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: string | null
        }
        Update: {
          acceptance_criteria?: string[] | null
          activation_id?: string | null
          actual_hours?: number | null
          assignee_id?: string | null
          blockers?: string[] | null
          board_position?: number | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deliverables?: string[] | null
          department?: Database["public"]["Enums"]["department"]
          dependencies?: string[] | null
          dependents?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          impact_if_delayed?: string | null
          location_id?: string | null
          milestone_id?: string | null
          organization_id?: string | null
          parent_task_id?: string | null
          percent_complete?: number | null
          phase?: Database["public"]["Enums"]["production_phase"]
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string
          reviewer_id?: string | null
          sow_deliverable_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_tasks_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "production_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "production_tasks_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "sow_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "v_sow_deliverable_summary"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "production_tasks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      production_time_entries: {
        Row: {
          approved_by_id: string | null
          break_minutes: number | null
          created_at: string | null
          created_by: string | null
          crew_member_id: string
          date: string
          description: string | null
          double_time_hours: number
          double_time_rate: number | null
          end_time: string
          id: string
          invoice_line_item_id: string | null
          is_billable: boolean | null
          notes: string | null
          organization_id: string | null
          overtime_hours: number
          overtime_rate: number | null
          project_id: string
          regular_hours: number
          regular_rate: number
          shift_id: string | null
          sow_deliverable_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["time_entry_status"]
          task_id: string | null
          total_pay: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          approved_by_id?: string | null
          break_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          crew_member_id: string
          date: string
          description?: string | null
          double_time_hours?: number
          double_time_rate?: number | null
          end_time: string
          id?: string
          invoice_line_item_id?: string | null
          is_billable?: boolean | null
          notes?: string | null
          organization_id?: string | null
          overtime_hours?: number
          overtime_rate?: number | null
          project_id: string
          regular_hours?: number
          regular_rate: number
          shift_id?: string | null
          sow_deliverable_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["time_entry_status"]
          task_id?: string | null
          total_pay?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          approved_by_id?: string | null
          break_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string
          date?: string
          description?: string | null
          double_time_hours?: number
          double_time_rate?: number | null
          end_time?: string
          id?: string
          invoice_line_item_id?: string | null
          is_billable?: boolean | null
          notes?: string | null
          organization_id?: string | null
          overtime_hours?: number
          overtime_rate?: number | null
          project_id?: string
          regular_hours?: number
          regular_rate?: number
          shift_id?: string | null
          sow_deliverable_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["time_entry_status"]
          task_id?: string | null
          total_pay?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_time_entries_approved_by_id_fkey"
            columns: ["approved_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_time_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_time_entries_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_time_entries_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "v_crew_utilization"
            referencedColumns: ["crew_member_id"]
          },
          {
            foreignKeyName: "production_time_entries_invoice_line_item_id_fkey"
            columns: ["invoice_line_item_id"]
            isOneToOne: false
            referencedRelation: "invoice_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "production_time_entries_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "crew_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_time_entries_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "sow_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_time_entries_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "v_sow_deliverable_summary"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "production_time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "production_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_time_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          organization_id: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          organization_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          organization_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_assignments: {
        Row: {
          actual_hours: number | null
          created_at: string | null
          created_by: string | null
          crew_member_id: string
          department: Database["public"]["Enums"]["department"]
          end_date: string
          estimated_hours: number | null
          id: string
          organization_id: string | null
          project_id: string
          rate: number
          rate_type: Database["public"]["Enums"]["rate_type"]
          role: string
          start_date: string
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          actual_hours?: number | null
          created_at?: string | null
          created_by?: string | null
          crew_member_id: string
          department?: Database["public"]["Enums"]["department"]
          end_date: string
          estimated_hours?: number | null
          id?: string
          organization_id?: string | null
          project_id: string
          rate: number
          rate_type?: Database["public"]["Enums"]["rate_type"]
          role: string
          start_date: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          actual_hours?: number | null
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string
          department?: Database["public"]["Enums"]["department"]
          end_date?: string
          estimated_hours?: number | null
          id?: string
          organization_id?: string | null
          project_id?: string
          rate?: number
          rate_type?: Database["public"]["Enums"]["rate_type"]
          role?: string
          start_date?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "v_crew_utilization"
            referencedColumns: ["crew_member_id"]
          },
          {
            foreignKeyName: "project_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_assignments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          project_id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          project_id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          default_budget_categories: string[] | null
          default_roles: string[] | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          phases: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_budget_categories?: string[] | null
          default_roles?: string[] | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          phases?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_budget_categories?: string[] | null
          default_roles?: string[] | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          phases?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          billing_type: Database["public"]["Enums"]["billing_type"] | null
          budget_actual: number
          budget_planned: number
          client: string
          client_logo: string | null
          company_id: string | null
          created_at: string | null
          current_phase: string
          end_date: string
          id: string
          manager_id: string | null
          name: string
          organization_id: string
          progress: number
          rate_card_id: string | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          billing_type?: Database["public"]["Enums"]["billing_type"] | null
          budget_actual?: number
          budget_planned?: number
          client: string
          client_logo?: string | null
          company_id?: string | null
          created_at?: string | null
          current_phase?: string
          end_date: string
          id?: string
          manager_id?: string | null
          name: string
          organization_id: string
          progress?: number
          rate_card_id?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          billing_type?: Database["public"]["Enums"]["billing_type"] | null
          budget_actual?: number
          budget_planned?: number
          client?: string
          client_logo?: string | null
          company_id?: string | null
          created_at?: string | null
          current_phase?: string
          end_date?: string
          id?: string
          manager_id?: string | null
          name?: string
          organization_id?: string
          progress?: number
          rate_card_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "rate_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_items: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_optional: boolean | null
          name: string
          phase: Database["public"]["Enums"]["production_phase"] | null
          proposal_id: string
          quantity: number
          rate_card_item_id: string | null
          total: number | null
          unit: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_optional?: boolean | null
          name: string
          phase?: Database["public"]["Enums"]["production_phase"] | null
          proposal_id: string
          quantity?: number
          rate_card_item_id?: string | null
          total?: number | null
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_optional?: boolean | null
          name?: string
          phase?: Database["public"]["Enums"]["production_phase"] | null
          proposal_id?: string
          quantity?: number
          rate_card_item_id?: string | null
          total?: number | null
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_items_rate_card_item_id_fkey"
            columns: ["rate_card_item_id"]
            isOneToOne: false
            referencedRelation: "rate_card_items"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          company_id: string | null
          contact_id: string | null
          converted_project_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          deal_id: string | null
          deliverables: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          introduction: string | null
          number: string
          organization_id: string
          parent_proposal_id: string | null
          proposed_end_date: string | null
          proposed_start_date: string | null
          rejected_at: string | null
          scope_of_work: string | null
          sent_at: string | null
          signature_ip: string | null
          signature_required: boolean | null
          signed_at: string | null
          signed_by: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          subtotal: number
          tax_amount: number | null
          tax_percent: number | null
          template_id: string | null
          terms_and_conditions: string | null
          title: string
          total: number
          updated_at: string | null
          updated_by: string | null
          valid_until: string | null
          version: number | null
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          converted_project_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          deliverables?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          introduction?: string | null
          number: string
          organization_id: string
          parent_proposal_id?: string | null
          proposed_end_date?: string | null
          proposed_start_date?: string | null
          rejected_at?: string | null
          scope_of_work?: string | null
          sent_at?: string | null
          signature_ip?: string | null
          signature_required?: boolean | null
          signed_at?: string | null
          signed_by?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_percent?: number | null
          template_id?: string | null
          terms_and_conditions?: string | null
          title: string
          total?: number
          updated_at?: string | null
          updated_by?: string | null
          valid_until?: string | null
          version?: number | null
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          converted_project_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          deliverables?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          introduction?: string | null
          number?: string
          organization_id?: string
          parent_proposal_id?: string | null
          proposed_end_date?: string | null
          proposed_start_date?: string | null
          rejected_at?: string | null
          scope_of_work?: string | null
          sent_at?: string | null
          signature_ip?: string | null
          signature_required?: boolean | null
          signed_at?: string | null
          signed_by?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_percent?: number | null
          template_id?: string | null
          terms_and_conditions?: string | null
          title?: string
          total?: number
          updated_at?: string | null
          updated_by?: string | null
          valid_until?: string | null
          version?: number | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_converted_project_id_fkey"
            columns: ["converted_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_converted_project_id_fkey"
            columns: ["converted_project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_parent_proposal_id_fkey"
            columns: ["parent_proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          purchase_order_id: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          purchase_order_id: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          purchase_order_id?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          id: string
          issued_date: string
          organization_id: string
          project_id: string
          status: string
          total_amount: number
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          issued_date: string
          organization_id: string
          project_id: string
          status?: string
          total_amount?: number
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          issued_date?: string
          organization_id?: string
          project_id?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_card_items: {
        Row: {
          billing_type: Database["public"]["Enums"]["billing_type"] | null
          created_at: string | null
          daily_rate: number | null
          department: Database["public"]["Enums"]["department"] | null
          hourly_rate: number | null
          id: string
          internal_cost_rate: number | null
          is_billable: boolean | null
          rate_card_id: string
          role: string | null
          service_description: string | null
          service_name: string
          unit_name: string | null
          unit_rate: number | null
          updated_at: string | null
        }
        Insert: {
          billing_type?: Database["public"]["Enums"]["billing_type"] | null
          created_at?: string | null
          daily_rate?: number | null
          department?: Database["public"]["Enums"]["department"] | null
          hourly_rate?: number | null
          id?: string
          internal_cost_rate?: number | null
          is_billable?: boolean | null
          rate_card_id: string
          role?: string | null
          service_description?: string | null
          service_name: string
          unit_name?: string | null
          unit_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_type?: Database["public"]["Enums"]["billing_type"] | null
          created_at?: string | null
          daily_rate?: number | null
          department?: Database["public"]["Enums"]["department"] | null
          hourly_rate?: number | null
          id?: string
          internal_cost_rate?: number | null
          is_billable?: boolean | null
          rate_card_id?: string
          role?: string | null
          service_description?: string | null
          service_name?: string
          unit_name?: string | null
          unit_rate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_card_items_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "rate_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_cards: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          effective_date: string | null
          expiration_date: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          organization_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          organization_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_cards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_invoices: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          day_of_month: number | null
          day_of_week: number | null
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          invoices_generated: number | null
          is_active: boolean | null
          last_invoice_date: string | null
          line_items: Json | null
          next_invoice_date: string
          organization_id: string
          project_id: string | null
          start_date: string
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          invoices_generated?: number | null
          is_active?: boolean | null
          last_invoice_date?: string | null
          line_items?: Json | null
          next_invoice_date: string
          organization_id: string
          project_id?: string | null
          start_date: string
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          invoices_generated?: number | null
          is_active?: boolean | null
          last_invoice_date?: string | null
          line_items?: Json | null
          next_invoice_date?: string
          organization_id?: string
          project_id?: string | null
          start_date?: string
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "recurring_invoices_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_definitions: {
        Row: {
          columns: Json | null
          created_at: string | null
          created_by: string | null
          filters: Json | null
          group_by: string | null
          id: string
          is_template: boolean | null
          name: string
          organization_id: string | null
          sort_by: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          filters?: Json | null
          group_by?: string | null
          id?: string
          is_template?: boolean | null
          name: string
          organization_id?: string | null
          sort_by?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          filters?: Json | null
          group_by?: string | null
          id?: string
          is_template?: boolean | null
          name?: string
          organization_id?: string | null
          sort_by?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_bookings: {
        Row: {
          booking_type: Database["public"]["Enums"]["booking_type"]
          created_at: string | null
          created_by: string | null
          crew_member_id: string | null
          department: Database["public"]["Enums"]["department"] | null
          end_date: string
          has_conflict: boolean | null
          hours_per_day: number | null
          id: string
          notes: string | null
          organization_id: string
          placeholder_name: string | null
          project_id: string | null
          rate: number | null
          rate_type: Database["public"]["Enums"]["rate_type"] | null
          role: string | null
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          task_id: string | null
          total_hours: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          end_date: string
          has_conflict?: boolean | null
          hours_per_day?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          placeholder_name?: string | null
          project_id?: string | null
          rate?: number | null
          rate_type?: Database["public"]["Enums"]["rate_type"] | null
          role?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          task_id?: string | null
          total_hours?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          end_date?: string
          has_conflict?: boolean | null
          hours_per_day?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          placeholder_name?: string | null
          project_id?: string | null
          rate?: number | null
          rate_type?: Database["public"]["Enums"]["rate_type"] | null
          role?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          task_id?: string | null
          total_hours?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_bookings_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_bookings_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "v_crew_utilization"
            referencedColumns: ["crew_member_id"]
          },
          {
            foreignKeyName: "resource_bookings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_bookings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_bookings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "resource_bookings_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "production_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_bookings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string
          external_id: string | null
          external_url: string | null
          flagged: boolean | null
          helpful_count: number | null
          id: string
          platform: string
          rating: number
          response: string | null
          response_date: string | null
          review_date: string | null
          reviewer_avatar_url: string | null
          reviewer_name: string | null
          title: string | null
          updated_at: string
          visible: boolean | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          external_id?: string | null
          external_url?: string | null
          flagged?: boolean | null
          helpful_count?: number | null
          id?: string
          platform: string
          rating: number
          response?: string | null
          response_date?: string | null
          review_date?: string | null
          reviewer_avatar_url?: string | null
          reviewer_name?: string | null
          title?: string | null
          updated_at?: string
          visible?: boolean | null
        }
        Update: {
          content?: string | null
          created_at?: string
          external_id?: string | null
          external_url?: string | null
          flagged?: boolean | null
          helpful_count?: number | null
          id?: string
          platform?: string
          rating?: number
          response?: string | null
          response_date?: string | null
          review_date?: string | null
          reviewer_avatar_url?: string | null
          reviewer_name?: string | null
          title?: string | null
          updated_at?: string
          visible?: boolean | null
        }
        Relationships: []
      }
      rfqs: {
        Row: {
          awarded_po_id: string | null
          budget_code: string | null
          created_at: string | null
          created_by: string | null
          delivery_location_id: string | null
          description: string | null
          id: string
          issue_date: string
          justification: string | null
          line_items: Json | null
          number: string
          organization_id: string | null
          project_id: string
          requested_by_id: string | null
          required_by_date: string
          response_deadline: string
          responses: Json | null
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
          vendor_ids: string[] | null
        }
        Insert: {
          awarded_po_id?: string | null
          budget_code?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_location_id?: string | null
          description?: string | null
          id?: string
          issue_date: string
          justification?: string | null
          line_items?: Json | null
          number: string
          organization_id?: string | null
          project_id: string
          requested_by_id?: string | null
          required_by_date: string
          response_deadline: string
          responses?: Json | null
          status?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_ids?: string[] | null
        }
        Update: {
          awarded_po_id?: string | null
          budget_code?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_location_id?: string | null
          description?: string | null
          id?: string
          issue_date?: string
          justification?: string | null
          line_items?: Json | null
          number?: string
          organization_id?: string | null
          project_id?: string
          requested_by_id?: string | null
          required_by_date?: string
          response_deadline?: string
          responses?: Json | null
          status?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_delivery_location_id_fkey"
            columns: ["delivery_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "rfqs_requested_by_id_fkey"
            columns: ["requested_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_views: {
        Row: {
          board_config: Json | null
          column_widths: Json | null
          created_at: string | null
          description: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          filters: Json | null
          group_by: string | null
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          name: string
          organization_id: string
          owner_id: string
          project_id: string | null
          shared_with_team_ids: string[] | null
          sort_by: Json | null
          updated_at: string | null
          view_type: string
          visible_columns: string[] | null
        }
        Insert: {
          board_config?: Json | null
          column_widths?: Json | null
          created_at?: string | null
          description?: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          filters?: Json | null
          group_by?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          name: string
          organization_id: string
          owner_id: string
          project_id?: string | null
          shared_with_team_ids?: string[] | null
          sort_by?: Json | null
          updated_at?: string | null
          view_type: string
          visible_columns?: string[] | null
        }
        Update: {
          board_config?: Json | null
          column_widths?: Json | null
          created_at?: string | null
          description?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"]
          filters?: Json | null
          group_by?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          name?: string
          organization_id?: string
          owner_id?: string
          project_id?: string | null
          shared_with_team_ids?: string[] | null
          sort_by?: Json | null
          updated_at?: string | null
          view_type?: string
          visible_columns?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_views_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_views_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      schedule_entries: {
        Row: {
          all_day: boolean | null
          assignee_ids: string[] | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_datetime: string
          id: string
          location_id: string | null
          location_name: string | null
          organization_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          project_id: string
          recurrence: Json | null
          reference_id: string
          reference_name: string
          reminder_minutes: number[] | null
          start_datetime: string
          status: string
          timezone: string | null
          title: string
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          all_day?: boolean | null
          assignee_ids?: string[] | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_datetime: string
          id?: string
          location_id?: string | null
          location_name?: string | null
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id: string
          recurrence?: Json | null
          reference_id: string
          reference_name: string
          reminder_minutes?: number[] | null
          start_datetime: string
          status?: string
          timezone?: string | null
          title: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          all_day?: boolean | null
          assignee_ids?: string[] | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_datetime?: string
          id?: string
          location_id?: string | null
          location_name?: string | null
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id?: string
          recurrence?: Json | null
          reference_id?: string
          reference_name?: string
          reminder_minutes?: number[] | null
          start_datetime?: string
          status?: string
          timezone?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_entries_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "schedule_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scopes_of_work: {
        Row: {
          acceptance_criteria: string | null
          approved_at: string | null
          approved_by: string | null
          assumptions: string | null
          billing_type: Database["public"]["Enums"]["billing_type"]
          client_signed_at: string | null
          client_signed_by: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          effective_date: string
          estimated_end_date: string | null
          estimated_start_date: string | null
          exclusions: string | null
          expiration_date: string | null
          id: string
          notes: string | null
          number: string
          organization_id: string
          owner_id: string | null
          parent_sow_id: string | null
          payment_terms_days: number | null
          prepared_by: string | null
          project_id: string
          proposal_id: string | null
          retainer_amount: number | null
          retainer_frequency: string | null
          status: Database["public"]["Enums"]["sow_status"]
          tags: string[] | null
          title: string
          total_value: number
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          acceptance_criteria?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assumptions?: string | null
          billing_type?: Database["public"]["Enums"]["billing_type"]
          client_signed_at?: string | null
          client_signed_by?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          effective_date: string
          estimated_end_date?: string | null
          estimated_start_date?: string | null
          exclusions?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          number: string
          organization_id: string
          owner_id?: string | null
          parent_sow_id?: string | null
          payment_terms_days?: number | null
          prepared_by?: string | null
          project_id: string
          proposal_id?: string | null
          retainer_amount?: number | null
          retainer_frequency?: string | null
          status?: Database["public"]["Enums"]["sow_status"]
          tags?: string[] | null
          title: string
          total_value?: number
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          acceptance_criteria?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assumptions?: string | null
          billing_type?: Database["public"]["Enums"]["billing_type"]
          client_signed_at?: string | null
          client_signed_by?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          effective_date?: string
          estimated_end_date?: string | null
          estimated_start_date?: string | null
          exclusions?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          number?: string
          organization_id?: string
          owner_id?: string | null
          parent_sow_id?: string | null
          payment_terms_days?: number | null
          prepared_by?: string | null
          project_id?: string
          proposal_id?: string | null
          retainer_amount?: number | null
          retainer_frequency?: string | null
          status?: Database["public"]["Enums"]["sow_status"]
          tags?: string[] | null
          title?: string
          total_value?: number
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "scopes_of_work_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_parent_sow_id_fkey"
            columns: ["parent_sow_id"]
            isOneToOne: false
            referencedRelation: "scopes_of_work"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_parent_sow_id_fkey"
            columns: ["parent_sow_id"]
            isOneToOne: false
            referencedRelation: "v_sow_summary"
            referencedColumns: ["sow_id"]
          },
          {
            foreignKeyName: "scopes_of_work_prepared_by_fkey"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "scopes_of_work_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string | null
          crew_member_id: string
          date: string
          end_time: string
          id: string
          project_id: string
          role: string | null
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crew_member_id: string
          date: string
          end_time: string
          id?: string
          project_id: string
          role?: string | null
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crew_member_id?: string
          date?: string
          end_time?: string
          id?: string
          project_id?: string
          role?: string | null
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "v_crew_utilization"
            referencedColumns: ["crew_member_id"]
          },
          {
            foreignKeyName: "shifts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery_date: string | null
          appointment_required: boolean | null
          carrier_id: string | null
          carrier_name: string
          coordinator_id: string | null
          cost: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          destination_address: Json | null
          destination_location_id: string | null
          driver_id: string | null
          estimated_delivery_date: string
          id: string
          inside_delivery: boolean | null
          items: Json | null
          liftgate_required: boolean | null
          number: string
          organization_id: string | null
          origin_address: Json | null
          origin_location_id: string | null
          pickup_date: string
          pickup_time: string | null
          priority: Database["public"]["Enums"]["shipment_priority"]
          project_id: string
          purchase_order_id: string | null
          special_instructions: string | null
          status: Database["public"]["Enums"]["shipment_status"]
          total_pieces: number | null
          total_weight: number | null
          tracking_number: string | null
          type: Database["public"]["Enums"]["shipment_type"]
          updated_at: string | null
          updated_by: string | null
          vehicle_id: string | null
          weight_unit: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          appointment_required?: boolean | null
          carrier_id?: string | null
          carrier_name: string
          coordinator_id?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          destination_address?: Json | null
          destination_location_id?: string | null
          driver_id?: string | null
          estimated_delivery_date: string
          id?: string
          inside_delivery?: boolean | null
          items?: Json | null
          liftgate_required?: boolean | null
          number: string
          organization_id?: string | null
          origin_address?: Json | null
          origin_location_id?: string | null
          pickup_date: string
          pickup_time?: string | null
          priority?: Database["public"]["Enums"]["shipment_priority"]
          project_id: string
          purchase_order_id?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          total_pieces?: number | null
          total_weight?: number | null
          tracking_number?: string | null
          type?: Database["public"]["Enums"]["shipment_type"]
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          weight_unit?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          appointment_required?: boolean | null
          carrier_id?: string | null
          carrier_name?: string
          coordinator_id?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          destination_address?: Json | null
          destination_location_id?: string | null
          driver_id?: string | null
          estimated_delivery_date?: string
          id?: string
          inside_delivery?: boolean | null
          items?: Json | null
          liftgate_required?: boolean | null
          number?: string
          organization_id?: string | null
          origin_address?: Json | null
          origin_location_id?: string | null
          pickup_date?: string
          pickup_time?: string | null
          priority?: Database["public"]["Enums"]["shipment_priority"]
          project_id?: string
          purchase_order_id?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          total_pieces?: number | null
          total_weight?: number | null
          tracking_number?: string | null
          type?: Database["public"]["Enums"]["shipment_type"]
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_crew_utilization"
            referencedColumns: ["crew_member_id"]
          },
          {
            foreignKeyName: "shipments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_origin_location_id_fkey"
            columns: ["origin_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "shipments_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_acknowledgments: {
        Row: {
          acknowledged_at: string | null
          id: string
          sop_id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          id?: string
          sop_id: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          id?: string
          sop_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sop_acknowledgments_sop_id_fkey"
            columns: ["sop_id"]
            isOneToOne: false
            referencedRelation: "sops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_acknowledgments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sops: {
        Row: {
          content: string
          created_at: string | null
          id: string
          organization_id: string
          role: string
          title: string
          updated_at: string | null
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          organization_id: string
          role: string
          title: string
          updated_at?: string | null
          version?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: string
          title?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "sops_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sow_change_log: {
        Row: {
          change_summary: string | null
          change_type: string
          changed_at: string
          changed_by: string | null
          field_name: string | null
          id: string
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          organization_id: string
          sow_deliverable_id: string | null
          sow_id: string
        }
        Insert: {
          change_summary?: string | null
          change_type: string
          changed_at?: string
          changed_by?: string | null
          field_name?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          organization_id: string
          sow_deliverable_id?: string | null
          sow_id: string
        }
        Update: {
          change_summary?: string | null
          change_type?: string
          changed_at?: string
          changed_by?: string | null
          field_name?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          organization_id?: string
          sow_deliverable_id?: string | null
          sow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sow_change_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sow_change_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sow_change_log_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "sow_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sow_change_log_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "v_sow_deliverable_summary"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "sow_change_log_sow_id_fkey"
            columns: ["sow_id"]
            isOneToOne: false
            referencedRelation: "scopes_of_work"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sow_change_log_sow_id_fkey"
            columns: ["sow_id"]
            isOneToOne: false
            referencedRelation: "v_sow_summary"
            referencedColumns: ["sow_id"]
          },
        ]
      }
      sow_deliverables: {
        Row: {
          acceptance_criteria: string | null
          amount_invoiced: number
          amount_paid: number
          budget_category: Database["public"]["Enums"]["budget_category"] | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          deliverable_type: Database["public"]["Enums"]["sow_deliverable_type"]
          department: Database["public"]["Enums"]["department"] | null
          description: string | null
          display_order: number | null
          due_date: string | null
          estimated_hours: number | null
          hourly_rate: number | null
          id: string
          is_optional: boolean | null
          line_number: number
          milestone_id: string | null
          name: string
          not_to_exceed: number | null
          organization_id: string
          percent_complete: number | null
          phase: Database["public"]["Enums"]["production_phase"] | null
          quantity: number
          requires_client_approval: boolean | null
          sow_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["sow_deliverable_status"]
          total_price: number | null
          unit: string | null
          unit_price: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          acceptance_criteria?: string | null
          amount_invoiced?: number
          amount_paid?: number
          budget_category?:
            | Database["public"]["Enums"]["budget_category"]
            | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deliverable_type?: Database["public"]["Enums"]["sow_deliverable_type"]
          department?: Database["public"]["Enums"]["department"] | null
          description?: string | null
          display_order?: number | null
          due_date?: string | null
          estimated_hours?: number | null
          hourly_rate?: number | null
          id?: string
          is_optional?: boolean | null
          line_number: number
          milestone_id?: string | null
          name: string
          not_to_exceed?: number | null
          organization_id: string
          percent_complete?: number | null
          phase?: Database["public"]["Enums"]["production_phase"] | null
          quantity?: number
          requires_client_approval?: boolean | null
          sow_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["sow_deliverable_status"]
          total_price?: number | null
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          acceptance_criteria?: string | null
          amount_invoiced?: number
          amount_paid?: number
          budget_category?:
            | Database["public"]["Enums"]["budget_category"]
            | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deliverable_type?: Database["public"]["Enums"]["sow_deliverable_type"]
          department?: Database["public"]["Enums"]["department"] | null
          description?: string | null
          display_order?: number | null
          due_date?: string | null
          estimated_hours?: number | null
          hourly_rate?: number | null
          id?: string
          is_optional?: boolean | null
          line_number?: number
          milestone_id?: string | null
          name?: string
          not_to_exceed?: number | null
          organization_id?: string
          percent_complete?: number | null
          phase?: Database["public"]["Enums"]["production_phase"] | null
          quantity?: number
          requires_client_approval?: boolean | null
          sow_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["sow_deliverable_status"]
          total_price?: number | null
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sow_deliverables_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sow_deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "production_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sow_deliverables_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sow_deliverables_sow_id_fkey"
            columns: ["sow_id"]
            isOneToOne: false
            referencedRelation: "scopes_of_work"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sow_deliverables_sow_id_fkey"
            columns: ["sow_id"]
            isOneToOne: false
            referencedRelation: "v_sow_summary"
            referencedColumns: ["sow_id"]
          },
          {
            foreignKeyName: "sow_deliverables_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_projects: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          stakeholder_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          stakeholder_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          stakeholder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "stakeholder_projects_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          organization_id: string
          phone: string | null
          role: string
          type: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          role: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          role?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string | null
          depends_on_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string | null
          depends_on_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string | null
          depends_on_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_id_fkey"
            columns: ["depends_on_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          board_position: number | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          fabrication_status: string | null
          id: string
          material_cost: number | null
          parent_id: string | null
          phase: string
          priority: string
          project_id: string
          sow_deliverable_id: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          board_position?: number | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          fabrication_status?: string | null
          id?: string
          material_cost?: number | null
          parent_id?: string | null
          phase?: string
          priority?: string
          project_id: string
          sow_deliverable_id?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          board_position?: number | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          fabrication_status?: string | null
          id?: string
          material_cost?: number | null
          parent_id?: string | null
          phase?: string
          priority?: string
          project_id?: string
          sow_deliverable_id?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "tasks_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "sow_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "v_sow_deliverable_summary"
            referencedColumns: ["deliverable_id"]
          },
        ]
      }
      tech_sheets: {
        Row: {
          activation_id: string | null
          approved_at: string | null
          approved_by: string | null
          audio_requirements: Json | null
          bandwidth_requirements: string | null
          ceiling_height: string | null
          created_at: string | null
          created_by: string | null
          electrical_diagram_url: string | null
          emergency_exits: string | null
          equipment_list: Json | null
          event_id: string | null
          fire_safety_notes: string | null
          floor_plan_url: string | null
          floor_type: string | null
          generator_required: boolean | null
          generator_specs: string | null
          id: string
          internet_required: boolean | null
          lighting_requirements: Json | null
          load_in_access: string | null
          location_id: string | null
          max_occupancy: number | null
          network_equipment: Json | null
          organization_id: string
          power_requirements: Json | null
          power_source: string | null
          project_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          rigging_notes: string | null
          rigging_plot_url: string | null
          rigging_points: Json | null
          rigging_weight_limit: string | null
          safety_equipment: Json | null
          special_requirements: string | null
          status: Database["public"]["Enums"]["tech_sheet_status"]
          tech_sheet_number: string | null
          title: string
          total_amperage: number | null
          updated_at: string | null
          updated_by: string | null
          vendor_notes: string | null
          venue_dimensions: string | null
          venue_name: string | null
          version: number | null
          video_requirements: Json | null
        }
        Insert: {
          activation_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          audio_requirements?: Json | null
          bandwidth_requirements?: string | null
          ceiling_height?: string | null
          created_at?: string | null
          created_by?: string | null
          electrical_diagram_url?: string | null
          emergency_exits?: string | null
          equipment_list?: Json | null
          event_id?: string | null
          fire_safety_notes?: string | null
          floor_plan_url?: string | null
          floor_type?: string | null
          generator_required?: boolean | null
          generator_specs?: string | null
          id?: string
          internet_required?: boolean | null
          lighting_requirements?: Json | null
          load_in_access?: string | null
          location_id?: string | null
          max_occupancy?: number | null
          network_equipment?: Json | null
          organization_id: string
          power_requirements?: Json | null
          power_source?: string | null
          project_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rigging_notes?: string | null
          rigging_plot_url?: string | null
          rigging_points?: Json | null
          rigging_weight_limit?: string | null
          safety_equipment?: Json | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["tech_sheet_status"]
          tech_sheet_number?: string | null
          title: string
          total_amperage?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_notes?: string | null
          venue_dimensions?: string | null
          venue_name?: string | null
          version?: number | null
          video_requirements?: Json | null
        }
        Update: {
          activation_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          audio_requirements?: Json | null
          bandwidth_requirements?: string | null
          ceiling_height?: string | null
          created_at?: string | null
          created_by?: string | null
          electrical_diagram_url?: string | null
          emergency_exits?: string | null
          equipment_list?: Json | null
          event_id?: string | null
          fire_safety_notes?: string | null
          floor_plan_url?: string | null
          floor_type?: string | null
          generator_required?: boolean | null
          generator_specs?: string | null
          id?: string
          internet_required?: boolean | null
          lighting_requirements?: Json | null
          load_in_access?: string | null
          location_id?: string | null
          max_occupancy?: number | null
          network_equipment?: Json | null
          organization_id?: string
          power_requirements?: Json | null
          power_source?: string | null
          project_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rigging_notes?: string | null
          rigging_plot_url?: string | null
          rigging_points?: Json | null
          rigging_weight_limit?: string | null
          safety_equipment?: Json | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["tech_sheet_status"]
          tech_sheet_number?: string | null
          title?: string
          total_amperage?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_notes?: string | null
          venue_dimensions?: string | null
          venue_name?: string | null
          version?: number | null
          video_requirements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "tech_sheets_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_sheets_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_sheets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_sheets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_sheets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_sheets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_sheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_sheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "tech_sheets_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_sheets_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author_avatar_url: string | null
          author_company: string | null
          author_name: string
          author_title: string | null
          case_study_id: string | null
          category: string | null
          created_at: string
          display_order: number | null
          featured: boolean | null
          full_testimonial: string | null
          id: string
          project_id: string | null
          quote: string
          rating: number | null
          received_at: string | null
          status: Database["public"]["Enums"]["testimonial_status"] | null
          tags: string[] | null
          updated_at: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          author_avatar_url?: string | null
          author_company?: string | null
          author_name: string
          author_title?: string | null
          case_study_id?: string | null
          category?: string | null
          created_at?: string
          display_order?: number | null
          featured?: boolean | null
          full_testimonial?: string | null
          id?: string
          project_id?: string | null
          quote: string
          rating?: number | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["testimonial_status"] | null
          tags?: string[] | null
          updated_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          author_avatar_url?: string | null
          author_company?: string | null
          author_name?: string
          author_title?: string | null
          case_study_id?: string | null
          category?: string | null
          created_at?: string
          display_order?: number | null
          featured?: boolean | null
          full_testimonial?: string | null
          id?: string
          project_id?: string | null
          quote?: string
          rating?: number | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["testimonial_status"] | null
          tags?: string[] | null
          updated_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_case_study_id_fkey"
            columns: ["case_study_id"]
            isOneToOne: false
            referencedRelation: "case_studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "testimonials_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          approved_by: string | null
          created_at: string | null
          crew_member_id: string | null
          date: string
          hourly_rate: number
          hours_worked: number
          id: string
          invoice_line_item_id: string | null
          is_billable: boolean | null
          notes: string | null
          organization_id: string | null
          project_id: string | null
          sow_deliverable_id: string | null
          status: string
          task_id: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          date: string
          hourly_rate: number
          hours_worked: number
          id?: string
          invoice_line_item_id?: string | null
          is_billable?: boolean | null
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          sow_deliverable_id?: string | null
          status?: string
          task_id?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          date?: string
          hourly_rate?: number
          hours_worked?: number
          id?: string
          invoice_line_item_id?: string | null
          is_billable?: boolean | null
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          sow_deliverable_id?: string | null
          status?: string
          task_id?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "v_crew_utilization"
            referencedColumns: ["crew_member_id"]
          },
          {
            foreignKeyName: "time_entries_invoice_line_item_id_fkey"
            columns: ["invoice_line_item_id"]
            isOneToOne: false
            referencedRelation: "invoice_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "time_entries_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "sow_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_sow_deliverable_id_fkey"
            columns: ["sow_deliverable_id"]
            isOneToOne: false
            referencedRelation: "v_sow_deliverable_summary"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          created_at: string | null
          created_by: string | null
          crew_member_id: string
          end_date: string
          hours_per_day: number | null
          id: string
          is_half_day: boolean | null
          notes: string | null
          organization_id: string
          reason: string | null
          rejection_reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["time_off_status"]
          time_off_type: Database["public"]["Enums"]["time_off_type"]
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string | null
          created_by?: string | null
          crew_member_id: string
          end_date: string
          hours_per_day?: number | null
          id?: string
          is_half_day?: boolean | null
          notes?: string | null
          organization_id: string
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["time_off_status"]
          time_off_type: Database["public"]["Enums"]["time_off_type"]
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string
          end_date?: string
          hours_per_day?: number | null
          id?: string
          is_half_day?: boolean | null
          notes?: string | null
          organization_id?: string
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["time_off_status"]
          time_off_type?: Database["public"]["Enums"]["time_off_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_off_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_requests_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_requests_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "v_crew_utilization"
            referencedColumns: ["crew_member_id"]
          },
          {
            foreignKeyName: "time_off_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_documents: {
        Row: {
          access_level: string
          category: string
          created_at: string | null
          expiring_link_expires_at: string | null
          expiring_link_url: string | null
          id: string
          mime_type: string
          name: string
          organization_id: string
          project_id: string | null
          size: number
          updated_at: string | null
          uploaded_by: string
          url: string
        }
        Insert: {
          access_level?: string
          category?: string
          created_at?: string | null
          expiring_link_expires_at?: string | null
          expiring_link_url?: string | null
          id?: string
          mime_type: string
          name: string
          organization_id: string
          project_id?: string | null
          size: number
          updated_at?: string | null
          uploaded_by: string
          url: string
        }
        Update: {
          access_level?: string
          category?: string
          created_at?: string | null
          expiring_link_expires_at?: string | null
          expiring_link_url?: string | null
          id?: string
          mime_type?: string
          name?: string
          organization_id?: string
          project_id?: string | null
          size?: number
          updated_at?: string | null
          uploaded_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "vault_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string | null
          dock_height: string
          driver_name: string
          driver_phone: string
          gps_enabled: boolean
          id: string
          license_plate: string
          name: string
          organization_id: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dock_height: string
          driver_name: string
          driver_phone: string
          gps_enabled?: boolean
          id?: string
          license_plate: string
          name: string
          organization_id: string
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dock_height?: string
          driver_name?: string
          driver_phone?: string
          gps_enabled?: boolean
          id?: string
          license_plate?: string
          name?: string
          organization_id?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          coi_expiry_date: string | null
          contact_name: string
          created_at: string | null
          email: string
          id: string
          name: string
          nda_signed: boolean
          organization_id: string
          phone: string
          rating: number
          specialty: string
          status: string
          updated_at: string | null
          w9_uploaded: boolean
        }
        Insert: {
          coi_expiry_date?: string | null
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          nda_signed?: boolean
          organization_id: string
          phone: string
          rating?: number
          specialty: string
          status?: string
          updated_at?: string | null
          w9_uploaded?: boolean
        }
        Update: {
          coi_expiry_date?: string | null
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          nda_signed?: boolean
          organization_id?: string
          phone?: string
          rating?: number
          specialty?: string
          status?: string
          updated_at?: string | null
          w9_uploaded?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_postal_code: string | null
          address_state: string | null
          address_street1: string | null
          address_street2: string | null
          climate_controlled: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          manager_id: string | null
          name: string
          organization_id: string | null
          security_level: string | null
          status: string
          total_square_footage: number | null
          type: string
          updated_at: string | null
          updated_by: string | null
          usable_square_footage: number | null
          zones: Json | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street1?: string | null
          address_street2?: string | null
          climate_controlled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          manager_id?: string | null
          name: string
          organization_id?: string | null
          security_level?: string | null
          status?: string
          total_square_footage?: number | null
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          usable_square_footage?: number | null
          zones?: Json | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street1?: string | null
          address_street2?: string | null
          climate_controlled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          organization_id?: string | null
          security_level?: string | null
          status?: string
          total_square_footage?: number | null
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          usable_square_footage?: number | null
          zones?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouses_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouses_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_instances: {
        Row: {
          cancelled_at: string | null
          cancelled_reason: string | null
          completed_at: string | null
          context: Json | null
          created_at: string | null
          current_step_id: string | null
          entity_id: string
          entity_name: string | null
          entity_type: string
          id: string
          initiated_at: string | null
          initiated_by: string | null
          organization_id: string
          status: Database["public"]["Enums"]["workflow_instance_status"]
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_reason?: string | null
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          current_step_id?: string | null
          entity_id: string
          entity_name?: string | null
          entity_type: string
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["workflow_instance_status"]
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          cancelled_at?: string | null
          cancelled_reason?: string | null
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          current_step_id?: string | null
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["workflow_instance_status"]
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_instances_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "approval_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "approval_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_step_approvals: {
        Row: {
          approver_id: string | null
          assigned_at: string | null
          comments: string | null
          created_at: string | null
          deadline: string | null
          decided_at: string | null
          decision: string | null
          delegated_from: string | null
          escalated: boolean | null
          escalated_at: string | null
          id: string
          instance_id: string
          step_id: string
        }
        Insert: {
          approver_id?: string | null
          assigned_at?: string | null
          comments?: string | null
          created_at?: string | null
          deadline?: string | null
          decided_at?: string | null
          decision?: string | null
          delegated_from?: string | null
          escalated?: boolean | null
          escalated_at?: string | null
          id?: string
          instance_id: string
          step_id: string
        }
        Update: {
          approver_id?: string | null
          assigned_at?: string | null
          comments?: string | null
          created_at?: string | null
          deadline?: string | null
          decided_at?: string | null
          decision?: string | null
          delegated_from?: string | null
          escalated?: boolean | null
          escalated_at?: string | null
          id?: string
          instance_id?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_approvals_delegated_from_fkey"
            columns: ["delegated_from"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_approvals_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_approvals_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "approval_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      access_audit_log: {
        Row: {
          id: string
          user_id: string
          resource: string
          action: string
          scope_type: string | null
          scope_id: string | null
          granted: boolean
          role_key: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource: string
          action: string
          scope_type?: string | null
          scope_id?: string | null
          granted: boolean
          role_key?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource?: string
          action?: string
          scope_type?: string | null
          scope_id?: string | null
          granted?: boolean
          role_key?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          id: string
          organization_id: string | null
          key: string
          label: string
          is_active: boolean | null
          color_primary: string | null
          color_accent: string | null
          color_background: string | null
          color_foreground: string | null
          color_muted: string | null
          font_family: string | null
          font_heading: string | null
          font_mono: string | null
          logo_icon_url: string | null
          logo_wordmark_url: string | null
          favicon_url: string | null
          support_email: string | null
          support_phone: string | null
          support_url: string | null
          social_links: Json | null
          enable_dark_mode: boolean | null
          enable_animations: boolean | null
          enable_glass_effects: boolean | null
          custom_domain: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          key: string
          label: string
          is_active?: boolean | null
          color_primary?: string | null
          color_accent?: string | null
          color_background?: string | null
          color_foreground?: string | null
          color_muted?: string | null
          font_family?: string | null
          font_heading?: string | null
          font_mono?: string | null
          logo_icon_url?: string | null
          logo_wordmark_url?: string | null
          favicon_url?: string | null
          support_email?: string | null
          support_phone?: string | null
          support_url?: string | null
          social_links?: Json | null
          enable_dark_mode?: boolean | null
          enable_animations?: boolean | null
          enable_glass_effects?: boolean | null
          custom_domain?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          key?: string
          label?: string
          is_active?: boolean | null
          color_primary?: string | null
          color_accent?: string | null
          color_background?: string | null
          color_foreground?: string | null
          color_muted?: string | null
          font_family?: string | null
          font_heading?: string | null
          font_mono?: string | null
          logo_icon_url?: string | null
          logo_wordmark_url?: string | null
          favicon_url?: string | null
          support_email?: string | null
          support_phone?: string | null
          support_url?: string | null
          social_links?: Json | null
          enable_dark_mode?: boolean | null
          enable_animations?: boolean | null
          enable_glass_effects?: boolean | null
          custom_domain?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flag_overrides: {
        Row: {
          id: string
          flag_id: string
          scope_type: Database["public"]["Enums"]["feature_flag_override_scope"]
          scope_id: string
          value: Json
          reason: string | null
          created_by: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          flag_id: string
          scope_type: Database["public"]["Enums"]["feature_flag_override_scope"]
          scope_id: string
          value: Json
          reason?: string | null
          created_by?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          flag_id?: string
          scope_type?: Database["public"]["Enums"]["feature_flag_override_scope"]
          scope_id?: string
          value?: Json
          reason?: string | null
          created_by?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flag_overrides_flag_id_fkey"
            columns: ["flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          id: string
          key: string
          label: string
          description: string | null
          flag_type: Database["public"]["Enums"]["feature_flag_type"]
          default_value: Json
          is_active: boolean | null
          target_orgs: string[] | null
          target_roles: string[] | null
          target_environments: string[] | null
          target_regions: string[] | null
          target_user_ids: string[] | null
          rollout_percentage: number | null
          variants: Json | null
          starts_at: string | null
          expires_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          label: string
          description?: string | null
          flag_type?: Database["public"]["Enums"]["feature_flag_type"]
          default_value?: Json
          is_active?: boolean | null
          target_orgs?: string[] | null
          target_roles?: string[] | null
          target_environments?: string[] | null
          target_regions?: string[] | null
          target_user_ids?: string[] | null
          rollout_percentage?: number | null
          variants?: Json | null
          starts_at?: string | null
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          label?: string
          description?: string | null
          flag_type?: Database["public"]["Enums"]["feature_flag_type"]
          default_value?: Json
          is_active?: boolean | null
          target_orgs?: string[] | null
          target_roles?: string[] | null
          target_environments?: string[] | null
          target_regions?: string[] | null
          target_user_ids?: string[] | null
          rollout_percentage?: number | null
          variants?: Json | null
          starts_at?: string | null
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: string
          token: string
          status: Database["public"]["Enums"]["invitation_status"]
          invited_by: string
          personal_message: string | null
          project_ids: string[] | null
          expires_at: string
          accepted_at: string | null
          accepted_by: string | null
          revoked_at: string | null
          revoked_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role?: string
          token: string
          status?: Database["public"]["Enums"]["invitation_status"]
          invited_by: string
          personal_message?: string | null
          project_ids?: string[] | null
          expires_at?: string
          accepted_at?: string | null
          accepted_by?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: string
          token?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          invited_by?: string
          personal_message?: string | null
          project_ids?: string[] | null
          expires_at?: string
          accepted_at?: string | null
          accepted_by?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      login_audit_log: {
        Row: {
          id: string
          user_id: string | null
          email: string | null
          event_type: string
          auth_method: string | null
          ip_address: string | null
          user_agent: string | null
          device_fingerprint: string | null
          country_code: string | null
          city: string | null
          success: boolean
          failure_reason: string | null
          session_id: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          email?: string | null
          event_type: string
          auth_method?: string | null
          ip_address?: string | null
          user_agent?: string | null
          device_fingerprint?: string | null
          country_code?: string | null
          city?: string | null
          success?: boolean
          failure_reason?: string | null
          session_id?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string | null
          event_type?: string
          auth_method?: string | null
          ip_address?: string | null
          user_agent?: string | null
          device_fingerprint?: string | null
          country_code?: string | null
          city?: string | null
          success?: boolean
          failure_reason?: string | null
          session_id?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      onboarding_step_definitions: {
        Row: {
          id: string
          role: string
          step_key: string
          title: string
          description: string | null
          sort_order: number
          is_required: boolean
          is_active: boolean
          gate_access: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          role: string
          step_key: string
          title: string
          description?: string | null
          sort_order?: number
          is_required?: boolean
          is_active?: boolean
          gate_access?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          role?: string
          step_key?: string
          title?: string
          description?: string | null
          sort_order?: number
          is_required?: boolean
          is_active?: boolean
          gate_access?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      org_memberships: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role: string
          status: Database["public"]["Enums"]["org_membership_status"]
          is_default_org: boolean
          invited_by: string | null
          invited_at: string | null
          joined_at: string | null
          expires_at: string | null
          suspended_at: string | null
          suspended_reason: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          role?: string
          status?: Database["public"]["Enums"]["org_membership_status"]
          is_default_org?: boolean
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string | null
          expires_at?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          role?: string
          status?: Database["public"]["Enums"]["org_membership_status"]
          is_default_org?: boolean
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string | null
          expires_at?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_grants: {
        Row: {
          id: string
          role_definition_id: string
          resource: string
          action: Database["public"]["Enums"]["permission_action"]
          scope_type: Database["public"]["Enums"]["permission_scope_type"] | null
          scope_id: string | null
          conditions: Json | null
          field_restrictions: string[] | null
          field_exclusions: string[] | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          role_definition_id: string
          resource: string
          action: Database["public"]["Enums"]["permission_action"]
          scope_type?: Database["public"]["Enums"]["permission_scope_type"] | null
          scope_id?: string | null
          conditions?: Json | null
          field_restrictions?: string[] | null
          field_exclusions?: string[] | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          role_definition_id?: string
          resource?: string
          action?: Database["public"]["Enums"]["permission_action"]
          scope_type?: Database["public"]["Enums"]["permission_scope_type"] | null
          scope_id?: string | null
          conditions?: Json | null
          field_restrictions?: string[] | null
          field_exclusions?: string[] | null
          is_active?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "permission_grants_role_definition_id_fkey"
            columns: ["role_definition_id"]
            isOneToOne: false
            referencedRelation: "role_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      role_definitions: {
        Row: {
          id: string
          organization_id: string | null
          key: string
          label: string
          description: string | null
          is_system: boolean | null
          is_active: boolean | null
          parent_role_id: string | null
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          key: string
          label: string
          description?: string | null
          is_system?: boolean | null
          is_active?: boolean | null
          parent_role_id?: string | null
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          key?: string
          label?: string
          description?: string | null
          is_system?: boolean | null
          is_active?: boolean | null
          parent_role_id?: string | null
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_definitions_parent_role_id_fkey"
            columns: ["parent_role_id"]
            isOneToOne: false
            referencedRelation: "role_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      setting_definitions: {
        Row: {
          id: string
          category: Database["public"]["Enums"]["setting_category"]
          key: string
          label: string
          description: string | null
          value_type: Database["public"]["Enums"]["setting_value_type"]
          default_value: Json
          allowed_values: Json | null
          min_value: number | null
          max_value: number | null
          min_scope: Database["public"]["Enums"]["setting_scope"]
          max_scope: Database["public"]["Enums"]["setting_scope"]
          is_sensitive: boolean | null
          requires_restart: boolean | null
          requires_approval: boolean | null
          display_order: number | null
          deprecated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: Database["public"]["Enums"]["setting_category"]
          key: string
          label: string
          description?: string | null
          value_type: Database["public"]["Enums"]["setting_value_type"]
          default_value: Json
          allowed_values?: Json | null
          min_value?: number | null
          max_value?: number | null
          min_scope?: Database["public"]["Enums"]["setting_scope"]
          max_scope?: Database["public"]["Enums"]["setting_scope"]
          is_sensitive?: boolean | null
          requires_restart?: boolean | null
          requires_approval?: boolean | null
          display_order?: number | null
          deprecated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: Database["public"]["Enums"]["setting_category"]
          key?: string
          label?: string
          description?: string | null
          value_type?: Database["public"]["Enums"]["setting_value_type"]
          default_value?: Json
          allowed_values?: Json | null
          min_value?: number | null
          max_value?: number | null
          min_scope?: Database["public"]["Enums"]["setting_scope"]
          max_scope?: Database["public"]["Enums"]["setting_scope"]
          is_sensitive?: boolean | null
          requires_restart?: boolean | null
          requires_approval?: boolean | null
          display_order?: number | null
          deprecated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          definition_id: string
          scope_type: Database["public"]["Enums"]["setting_scope"]
          scope_id: string | null
          value: Json
          is_locked: boolean | null
          locked_by: string | null
          locked_at: string | null
          locked_reason: string | null
          inherit_from_parent: boolean | null
          version: number
          previous_value: Json | null
          changed_by: string | null
          changed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          definition_id: string
          scope_type: Database["public"]["Enums"]["setting_scope"]
          scope_id?: string | null
          value: Json
          is_locked?: boolean | null
          locked_by?: string | null
          locked_at?: string | null
          locked_reason?: string | null
          inherit_from_parent?: boolean | null
          version?: number
          previous_value?: Json | null
          changed_by?: string | null
          changed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          definition_id?: string
          scope_type?: Database["public"]["Enums"]["setting_scope"]
          scope_id?: string | null
          value?: Json
          is_locked?: boolean | null
          locked_by?: string | null
          locked_at?: string | null
          locked_reason?: string | null
          inherit_from_parent?: boolean | null
          version?: number
          previous_value?: Json | null
          changed_by?: string | null
          changed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "setting_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      settings_change_log: {
        Row: {
          id: string
          setting_id: string
          definition_id: string
          scope_type: Database["public"]["Enums"]["setting_scope"]
          scope_id: string | null
          old_value: Json | null
          new_value: Json | null
          changed_by: string
          change_reason: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          setting_id: string
          definition_id: string
          scope_type: Database["public"]["Enums"]["setting_scope"]
          scope_id?: string | null
          old_value?: Json | null
          new_value?: Json | null
          changed_by: string
          change_reason?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          setting_id?: string
          definition_id?: string
          scope_type?: Database["public"]["Enums"]["setting_scope"]
          scope_id?: string | null
          old_value?: Json | null
          new_value?: Json | null
          changed_by?: string
          change_reason?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_change_log_setting_id_fkey"
            columns: ["setting_id"]
            isOneToOne: false
            referencedRelation: "settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_change_log_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "setting_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      settings_change_requests: {
        Row: {
          id: string
          organization_id: string
          setting_key: string
          scope_type: string
          scope_id: string | null
          current_value: Json | null
          proposed_value: Json
          reason: string | null
          status: Database["public"]["Enums"]["settings_approval_status"]
          requested_by: string
          reviewed_by: string | null
          review_comment: string | null
          requested_at: string
          reviewed_at: string | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          setting_key: string
          scope_type?: string
          scope_id?: string | null
          current_value?: Json | null
          proposed_value: Json
          reason?: string | null
          status?: Database["public"]["Enums"]["settings_approval_status"]
          requested_by: string
          reviewed_by?: string | null
          review_comment?: string | null
          requested_at?: string
          reviewed_at?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          setting_key?: string
          scope_type?: string
          scope_id?: string | null
          current_value?: Json | null
          proposed_value?: Json
          reason?: string | null
          status?: Database["public"]["Enums"]["settings_approval_status"]
          requested_by?: string
          reviewed_by?: string | null
          review_comment?: string | null
          requested_at?: string
          reviewed_at?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_change_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding_progress: {
        Row: {
          id: string
          user_id: string
          step_definition_id: string
          status: Database["public"]["Enums"]["onboarding_step_status"]
          completed_at: string | null
          skipped_at: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          step_definition_id: string
          status?: Database["public"]["Enums"]["onboarding_step_status"]
          completed_at?: string | null
          skipped_at?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          step_definition_id?: string
          status?: Database["public"]["Enums"]["onboarding_step_status"]
          completed_at?: string | null
          skipped_at?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_progress_step_definition_id_fkey"
            columns: ["step_definition_id"]
            isOneToOne: false
            referencedRelation: "onboarding_step_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token_hash: string
          ip_address: string | null
          user_agent: string | null
          device_name: string | null
          device_type: string | null
          browser: string | null
          os: string | null
          country_code: string | null
          city: string | null
          is_current: boolean
          last_active_at: string | null
          expires_at: string
          revoked_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          session_token_hash: string
          ip_address?: string | null
          user_agent?: string | null
          device_name?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          country_code?: string | null
          city?: string | null
          is_current?: boolean
          last_active_at?: string | null
          expires_at?: string
          revoked_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          session_token_hash?: string
          ip_address?: string | null
          user_agent?: string | null
          device_name?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          country_code?: string | null
          city?: string | null
          is_current?: boolean
          last_active_at?: string | null
          expires_at?: string
          revoked_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      lead_pipeline_stats: {
        Row: {
          count: number | null
          new_this_month: number | null
          new_this_week: number | null
          status: Database["public"]["Enums"]["lead_status"] | null
        }
        Relationships: []
      }
      review_stats: {
        Row: {
          average_rating: number | null
          negative_reviews: number | null
          platforms: number | null
          positive_reviews: number | null
          total_reviews: number | null
        }
        Relationships: []
      }
      v_client_invoice_aging: {
        Row: {
          aging_bucket: string | null
          amount_paid: number | null
          balance_due: number | null
          company_id: string | null
          days_overdue: number | null
          due_date: string | null
          invoice_id: string | null
          invoice_number: string | null
          organization_id: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["client_invoice_status"] | null
          total: number | null
        }
        Insert: {
          aging_bucket?: never
          amount_paid?: number | null
          balance_due?: number | null
          company_id?: string | null
          days_overdue?: never
          due_date?: string | null
          invoice_id?: string | null
          invoice_number?: string | null
          organization_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["client_invoice_status"] | null
          total?: number | null
        }
        Update: {
          aging_bucket?: never
          amount_paid?: number | null
          balance_due?: number | null
          company_id?: string | null
          days_overdue?: never
          due_date?: string | null
          invoice_id?: string | null
          invoice_number?: string | null
          organization_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["client_invoice_status"] | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
      v_crew_utilization: {
        Row: {
          crew_member_id: string | null
          department: Database["public"]["Enums"]["department"] | null
          name: string | null
          organization_id: string | null
          period_end: string | null
          period_start: string | null
          utilization_percent: number | null
        }
        Insert: {
          crew_member_id?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          name?: string | null
          organization_id?: string | null
          period_end?: never
          period_start?: never
          utilization_percent?: never
        }
        Update: {
          crew_member_id?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          name?: string | null
          organization_id?: string | null
          period_end?: never
          period_start?: never
          utilization_percent?: never
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_invoice_aging: {
        Row: {
          aging_bucket: string | null
          amount: number | null
          company_id: string | null
          days_overdue: number | null
          due_date: string | null
          invoice_id: string | null
          organization_id: string | null
          status: string | null
          vendor_id: string | null
        }
        Insert: {
          aging_bucket?: never
          amount?: number | null
          company_id?: string | null
          days_overdue?: never
          due_date?: string | null
          invoice_id?: string | null
          organization_id?: string | null
          status?: string | null
          vendor_id?: string | null
        }
        Update: {
          aging_bucket?: never
          amount?: number | null
          company_id?: string | null
          days_overdue?: never
          due_date?: string | null
          invoice_id?: string | null
          organization_id?: string | null
          status?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      v_pipeline_summary: {
        Row: {
          avg_probability: number | null
          deal_count: number | null
          organization_id: string | null
          pipeline_id: string | null
          pipeline_name: string | null
          stage: string | null
          total_value: number | null
          weighted_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      v_project_profitability: {
        Row: {
          budget_actual: number | null
          budget_planned: number | null
          budget_variance: number | null
          client: string | null
          company_id: string | null
          margin_percent: number | null
          name: string | null
          organization_id: string | null
          project_id: string | null
          total_expenses: number | null
          total_hours_logged: number | null
          total_labor_cost: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_sow_deliverable_summary: {
        Row: {
          amount_invoiced: number | null
          amount_paid: number | null
          deliverable_id: string | null
          deliverable_type:
            | Database["public"]["Enums"]["sow_deliverable_type"]
            | null
          due_date: string | null
          estimated_hours: number | null
          expense_total: number | null
          hours_logged: number | null
          labor_cost: number | null
          margin_percent: number | null
          name: string | null
          organization_id: string | null
          percent_complete: number | null
          project_id: string | null
          sow_id: string | null
          status: Database["public"]["Enums"]["sow_deliverable_status"] | null
          task_count: number | null
          tasks_completed: number | null
          total_cost: number | null
          total_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scopes_of_work_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "sow_deliverables_sow_id_fkey"
            columns: ["sow_id"]
            isOneToOne: false
            referencedRelation: "scopes_of_work"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sow_deliverables_sow_id_fkey"
            columns: ["sow_id"]
            isOneToOne: false
            referencedRelation: "v_sow_summary"
            referencedColumns: ["sow_id"]
          },
        ]
      }
      v_sow_summary: {
        Row: {
          billing_type: Database["public"]["Enums"]["billing_type"] | null
          completed_count: number | null
          deliverable_count: number | null
          number: string | null
          organization_id: string | null
          percent_complete: number | null
          percent_invoiced: number | null
          project_id: string | null
          sow_id: string | null
          status: Database["public"]["Enums"]["sow_status"] | null
          title: string | null
          total_invoiced: number | null
          total_paid: number | null
          total_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scopes_of_work_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_of_work_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_profitability"
            referencedColumns: ["project_id"]
          },
        ]
      }
    }
    Functions: {
      calculate_lead_score: {
        Args: { lead_row: Database["public"]["Tables"]["leads"]["Row"] }
        Returns: number
      }
      calculate_utilization: {
        Args: {
          p_crew_member_id: string
          p_end_date: string
          p_start_date: string
        }
        Returns: number
      }
      convert_deal_to_project: { Args: { p_deal_id: string }; Returns: string }
      generate_client_invoice_number: {
        Args: { p_org_id: string }
        Returns: string
      }
      generate_proposal_number: { Args: { p_org_id: string }; Returns: string }
      generate_sow_number: { Args: { p_org_id: string }; Returns: string }
      get_user_org_id: { Args: never; Returns: string }
    }
    Enums: {
      activation_status:
        | "planning"
        | "design"
        | "build"
        | "installed"
        | "active"
        | "struck"
        | "stored"
      activation_type:
        | "booth"
        | "stage"
        | "installation"
        | "pop_up"
        | "mobile"
        | "digital"
        | "hybrid"
      activity_status:
        | "planned"
        | "ready"
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
      activity_type:
        | "performance"
        | "presentation"
        | "demo"
        | "sampling"
        | "photo_op"
        | "game"
        | "workshop"
        | "meet_greet"
        | "other"
      approval_step_type: "single" | "all" | "any" | "sequential"
      asset_assignment_status:
        | "reserved"
        | "checked_out"
        | "in_use"
        | "returned"
        | "damaged"
        | "lost"
      asset_category:
        | "staging"
        | "lighting"
        | "audio"
        | "video"
        | "rigging"
        | "scenic"
        | "props"
        | "furniture"
        | "tools"
        | "vehicles"
        | "technology"
        | "safety"
        | "other"
      asset_condition:
        | "new"
        | "excellent"
        | "good"
        | "fair"
        | "needs_repair"
        | "decommissioned"
      asset_ownership:
        | "owned"
        | "rental"
        | "client_provided"
        | "vendor_provided"
      assignment_status:
        | "pending"
        | "confirmed"
        | "active"
        | "completed"
        | "cancelled"
      automation_action:
        | "send_notification"
        | "send_email"
        | "update_field"
        | "create_task"
        | "assign_user"
        | "move_stage"
        | "add_comment"
        | "webhook"
        | "slack_message"
      automation_trigger:
        | "created"
        | "updated"
        | "status_changed"
        | "assigned"
        | "due_date_approaching"
        | "overdue"
        | "field_changed"
        | "time_logged"
        | "budget_threshold"
        | "scheduled"
      availability_status: "available" | "unavailable" | "tentative" | "booked"
      billing_type:
        | "fixed_price"
        | "time_and_materials"
        | "retainer"
        | "non_billable"
        | "milestone"
      booking_status: "tentative" | "confirmed" | "cancelled"
      booking_type:
        | "project_work"
        | "internal"
        | "time_off"
        | "training"
        | "admin"
      budget_category:
        | "labor"
        | "materials"
        | "equipment_rental"
        | "equipment_purchase"
        | "fabrication"
        | "print"
        | "av"
        | "lighting"
        | "scenic"
        | "travel"
        | "lodging"
        | "per_diem"
        | "shipping"
        | "trucking"
        | "venue"
        | "permits"
        | "insurance"
        | "talent"
        | "catering"
        | "staffing"
        | "security"
        | "contingency"
        | "overhead"
        | "markup"
      budget_range:
        | "under_50k"
        | "50k_150k"
        | "150k_500k"
        | "500k_1m"
        | "1m_5m"
        | "over_5m"
      budget_status: "draft" | "pending_approval" | "approved" | "locked"
      call_sheet_status:
        | "draft"
        | "published"
        | "distributed"
        | "acknowledged"
        | "archived"
      checklist_status: "pending" | "in_progress" | "completed" | "overdue"
      checklist_type:
        | "pre_event"
        | "post_event"
        | "safety"
        | "quality"
        | "maintenance"
        | "custom"
      client_invoice_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "sent"
        | "viewed"
        | "partial"
        | "paid"
        | "overdue"
        | "disputed"
        | "void"
        | "credited"
      contract_status:
        | "draft"
        | "pending_review"
        | "pending_signature"
        | "active"
        | "expired"
        | "terminated"
        | "renewed"
      contract_type:
        | "vendor"
        | "client"
        | "venue"
        | "talent"
        | "sponsor"
        | "nda"
        | "other"
      crew_status:
        | "active"
        | "inactive"
        | "on_leave"
        | "terminated"
        | "do_not_rehire"
      custom_field_type:
        | "text"
        | "number"
        | "date"
        | "datetime"
        | "boolean"
        | "select"
        | "multi_select"
        | "url"
        | "email"
        | "phone"
        | "currency"
        | "user"
        | "file"
      deliverable_status: "pending" | "submitted" | "approved" | "rejected"
      department:
        | "production"
        | "construction"
        | "technical"
        | "fabrication"
        | "print"
        | "scenic"
        | "props"
        | "av"
        | "lighting"
        | "rigging"
        | "food_beverage"
        | "staffing"
        | "logistics"
        | "finance"
        | "creative"
      document_category:
        | "sop"
        | "template"
        | "checklist"
        | "guide"
        | "policy"
        | "form"
        | "reference"
        | "training"
      document_status: "draft" | "pending_review" | "published" | "archived"
      document_type:
        | "doc"
        | "wiki"
        | "meeting_notes"
        | "specification"
        | "proposal_doc"
        | "sow"
        | "template"
      employment_type:
        | "employee"
        | "contractor"
        | "freelance"
        | "temp"
        | "intern"
        | "volunteer"
      entity_type:
        | "project"
        | "task"
        | "deal"
        | "contact"
        | "company"
        | "crew_member"
        | "asset"
        | "invoice"
        | "proposal"
        | "document"
      event_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "postponed"
      event_type:
        | "show"
        | "rehearsal"
        | "setup"
        | "strike"
        | "meeting"
        | "walkthrough"
        | "training"
        | "press"
        | "vip"
      feature_flag_override_scope:
        | "organization"
        | "project"
        | "user"
        | "role"
      feature_flag_type: "boolean" | "percentage" | "variant"
      expense_status:
        | "draft"
        | "submitted"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "reimbursed"
      incident_severity: "minor" | "moderate" | "major" | "critical"
      incident_status:
        | "reported"
        | "investigating"
        | "pending_action"
        | "resolved"
        | "closed"
      incident_type:
        | "safety"
        | "injury"
        | "property_damage"
        | "theft"
        | "security"
        | "weather"
        | "equipment_failure"
        | "vendor_issue"
        | "client_complaint"
        | "other"
      invitation_status: "pending" | "accepted" | "expired" | "revoked"
      invoice_delivery_status:
        | "draft"
        | "sent"
        | "viewed"
        | "reminded"
        | "paid"
        | "overdue"
        | "disputed"
        | "void"
      invoice_line_item_type:
        | "deliverable"
        | "time_and_materials"
        | "expense"
        | "retainer"
        | "adjustment"
        | "discount"
        | "tax"
      invoice_status:
        | "draft"
        | "sent"
        | "viewed"
        | "partial"
        | "paid"
        | "overdue"
        | "disputed"
        | "void"
      invoice_type: "vendor" | "client"
      lead_source:
        | "website"
        | "referral"
        | "trade_show"
        | "cold_outreach"
        | "social_media"
        | "advertising"
        | "partner"
        | "other"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal_sent"
        | "negotiating"
        | "won"
        | "lost"
        | "nurturing"
      location_type:
        | "venue"
        | "warehouse"
        | "office"
        | "fabrication_shop"
        | "staging_area"
        | "hotel"
        | "airport"
        | "other"
      onboarding_step_status: "not_started" | "in_progress" | "completed" | "skipped"
      org_membership_status: "invited" | "active" | "suspended" | "expired" | "revoked"
      milestone_status:
        | "pending"
        | "in_progress"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "overdue"
      payment_method:
        | "corporate_card"
        | "personal_card"
        | "cash"
        | "check"
        | "wire"
        | "ach"
      payment_status: "pending" | "partial" | "paid" | "refunded" | "failed"
      permission_action: "read" | "write" | "delete" | "manage"
      permission_scope_type: "global" | "organization" | "project" | "activation" | "team"
      payroll_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "processing"
        | "completed"
      procurement_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "sent"
        | "acknowledged"
        | "in_progress"
        | "shipped"
        | "received"
        | "completed"
        | "cancelled"
        | "disputed"
      production_phase:
        | "discovery"
        | "design"
        | "pre_production"
        | "procurement"
        | "fabrication"
        | "logistics"
        | "load_in"
        | "rehearsal"
        | "show"
        | "strike"
        | "load_out"
        | "wrap"
      project_status:
        | "draft"
        | "planning"
        | "pre_production"
        | "in_production"
        | "wrap"
        | "completed"
        | "cancelled"
        | "on_hold"
      project_type:
        | "tour"
        | "festival"
        | "activation"
        | "installation"
        | "broadcast"
        | "corporate"
        | "retail"
        | "experiential"
      project_type_interest:
        | "brand_activation"
        | "stage_set_design"
        | "immersive_installation"
        | "trade_show_expo"
        | "pop_up_retail"
        | "festival_production"
        | "corporate_event"
        | "product_launch"
        | "other"
      proposal_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "rejected"
        | "expired"
        | "revised"
      rate_type: "hourly" | "daily" | "weekly" | "flat"
      risk_level: "low" | "medium" | "high" | "critical"
      shift_status:
        | "scheduled"
        | "confirmed"
        | "checked_in"
        | "on_break"
        | "checked_out"
        | "no_show"
        | "cancelled"
      setting_category:
        | "governance"
        | "security"
        | "operational"
        | "branding"
        | "feature_access"
        | "notifications"
        | "preferences"
      setting_scope:
        | "platform"
        | "environment"
        | "organization"
        | "brand"
        | "department"
        | "project"
        | "activation"
        | "team"
        | "role"
        | "user"
      setting_value_type:
        | "boolean"
        | "integer"
        | "float"
        | "text"
        | "enum"
        | "text_array"
        | "jsonb"
      settings_approval_status:
        | "pending"
        | "approved"
        | "rejected"
        | "expired"
        | "cancelled"
      shipment_priority: "standard" | "expedited" | "rush" | "hot"
      shipment_status:
        | "planning"
        | "booked"
        | "picked_up"
        | "in_transit"
        | "out_for_delivery"
        | "delivered"
        | "exception"
        | "cancelled"
      shipment_type: "outbound" | "inbound" | "transfer" | "return"
      signature_status: "pending" | "signed" | "declined" | "expired"
      sop_status:
        | "draft"
        | "active"
        | "under_review"
        | "superseded"
        | "archived"
      sow_deliverable_status:
        | "not_started"
        | "in_progress"
        | "submitted"
        | "under_review"
        | "revision_requested"
        | "approved"
        | "completed"
        | "cancelled"
      sow_deliverable_type:
        | "milestone"
        | "fixed_fee"
        | "time_and_materials"
        | "unit_based"
        | "retainer"
        | "expense_passthrough"
      sow_status:
        | "draft"
        | "pending_review"
        | "pending_approval"
        | "approved"
        | "active"
        | "on_hold"
        | "completed"
        | "cancelled"
        | "amended"
      task_priority: "low" | "medium" | "high" | "urgent" | "critical"
      task_status:
        | "backlog"
        | "todo"
        | "in_progress"
        | "review"
        | "blocked"
        | "completed"
        | "cancelled"
      tech_sheet_status:
        | "draft"
        | "reviewed"
        | "approved"
        | "distributed"
        | "archived"
      testimonial_status: "pending" | "approved" | "featured" | "archived"
      time_entry_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "processed"
      time_off_status: "pending" | "approved" | "rejected" | "cancelled"
      time_off_type:
        | "vacation"
        | "sick"
        | "personal"
        | "parental"
        | "bereavement"
        | "jury_duty"
        | "holiday"
        | "unpaid"
        | "other"
      vehicle_ownership: "owned" | "leased" | "rental"
      vehicle_status: "available" | "in_use" | "maintenance" | "out_of_service"
      vehicle_type:
        | "box_truck"
        | "semi"
        | "sprinter"
        | "pickup"
        | "trailer"
        | "forklift"
        | "other"
      widget_type:
        | "number"
        | "chart_bar"
        | "chart_line"
        | "chart_pie"
        | "chart_donut"
        | "table"
        | "list"
        | "progress"
        | "gauge"
        | "calendar"
        | "timeline"
      workflow_instance_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "escalated"
      workflow_status: "draft" | "active" | "paused" | "archived"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activation_status: [
        "planning",
        "design",
        "build",
        "installed",
        "active",
        "struck",
        "stored",
      ],
      activation_type: [
        "booth",
        "stage",
        "installation",
        "pop_up",
        "mobile",
        "digital",
        "hybrid",
      ],
      activity_status: [
        "planned",
        "ready",
        "active",
        "paused",
        "completed",
        "cancelled",
      ],
      activity_type: [
        "performance",
        "presentation",
        "demo",
        "sampling",
        "photo_op",
        "game",
        "workshop",
        "meet_greet",
        "other",
      ],
      approval_step_type: ["single", "all", "any", "sequential"],
      asset_assignment_status: [
        "reserved",
        "checked_out",
        "in_use",
        "returned",
        "damaged",
        "lost",
      ],
      asset_category: [
        "staging",
        "lighting",
        "audio",
        "video",
        "rigging",
        "scenic",
        "props",
        "furniture",
        "tools",
        "vehicles",
        "technology",
        "safety",
        "other",
      ],
      asset_condition: [
        "new",
        "excellent",
        "good",
        "fair",
        "needs_repair",
        "decommissioned",
      ],
      asset_ownership: [
        "owned",
        "rental",
        "client_provided",
        "vendor_provided",
      ],
      assignment_status: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
      ],
      automation_action: [
        "send_notification",
        "send_email",
        "update_field",
        "create_task",
        "assign_user",
        "move_stage",
        "add_comment",
        "webhook",
        "slack_message",
      ],
      automation_trigger: [
        "created",
        "updated",
        "status_changed",
        "assigned",
        "due_date_approaching",
        "overdue",
        "field_changed",
        "time_logged",
        "budget_threshold",
        "scheduled",
      ],
      availability_status: ["available", "unavailable", "tentative", "booked"],
      billing_type: [
        "fixed_price",
        "time_and_materials",
        "retainer",
        "non_billable",
        "milestone",
      ],
      booking_status: ["tentative", "confirmed", "cancelled"],
      booking_type: [
        "project_work",
        "internal",
        "time_off",
        "training",
        "admin",
      ],
      budget_category: [
        "labor",
        "materials",
        "equipment_rental",
        "equipment_purchase",
        "fabrication",
        "print",
        "av",
        "lighting",
        "scenic",
        "travel",
        "lodging",
        "per_diem",
        "shipping",
        "trucking",
        "venue",
        "permits",
        "insurance",
        "talent",
        "catering",
        "staffing",
        "security",
        "contingency",
        "overhead",
        "markup",
      ],
      budget_range: [
        "under_50k",
        "50k_150k",
        "150k_500k",
        "500k_1m",
        "1m_5m",
        "over_5m",
      ],
      budget_status: ["draft", "pending_approval", "approved", "locked"],
      call_sheet_status: [
        "draft",
        "published",
        "distributed",
        "acknowledged",
        "archived",
      ],
      checklist_status: ["pending", "in_progress", "completed", "overdue"],
      checklist_type: [
        "pre_event",
        "post_event",
        "safety",
        "quality",
        "maintenance",
        "custom",
      ],
      client_invoice_status: [
        "draft",
        "pending_approval",
        "approved",
        "sent",
        "viewed",
        "partial",
        "paid",
        "overdue",
        "disputed",
        "void",
        "credited",
      ],
      contract_status: [
        "draft",
        "pending_review",
        "pending_signature",
        "active",
        "expired",
        "terminated",
        "renewed",
      ],
      contract_type: [
        "vendor",
        "client",
        "venue",
        "talent",
        "sponsor",
        "nda",
        "other",
      ],
      crew_status: [
        "active",
        "inactive",
        "on_leave",
        "terminated",
        "do_not_rehire",
      ],
      custom_field_type: [
        "text",
        "number",
        "date",
        "datetime",
        "boolean",
        "select",
        "multi_select",
        "url",
        "email",
        "phone",
        "currency",
        "user",
        "file",
      ],
      deliverable_status: ["pending", "submitted", "approved", "rejected"],
      department: [
        "production",
        "construction",
        "technical",
        "fabrication",
        "print",
        "scenic",
        "props",
        "av",
        "lighting",
        "rigging",
        "food_beverage",
        "staffing",
        "logistics",
        "finance",
        "creative",
      ],
      document_category: [
        "sop",
        "template",
        "checklist",
        "guide",
        "policy",
        "form",
        "reference",
        "training",
      ],
      document_status: ["draft", "pending_review", "published", "archived"],
      document_type: [
        "doc",
        "wiki",
        "meeting_notes",
        "specification",
        "proposal_doc",
        "sow",
        "template",
      ],
      employment_type: [
        "employee",
        "contractor",
        "freelance",
        "temp",
        "intern",
        "volunteer",
      ],
      entity_type: [
        "project",
        "task",
        "deal",
        "contact",
        "company",
        "crew_member",
        "asset",
        "invoice",
        "proposal",
        "document",
      ],
      event_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "postponed",
      ],
      event_type: [
        "show",
        "rehearsal",
        "setup",
        "strike",
        "meeting",
        "walkthrough",
        "training",
        "press",
        "vip",
      ],
      expense_status: [
        "draft",
        "submitted",
        "pending_approval",
        "approved",
        "rejected",
        "reimbursed",
      ],
      incident_severity: ["minor", "moderate", "major", "critical"],
      incident_status: [
        "reported",
        "investigating",
        "pending_action",
        "resolved",
        "closed",
      ],
      incident_type: [
        "safety",
        "injury",
        "property_damage",
        "theft",
        "security",
        "weather",
        "equipment_failure",
        "vendor_issue",
        "client_complaint",
        "other",
      ],
      invoice_delivery_status: [
        "draft",
        "sent",
        "viewed",
        "reminded",
        "paid",
        "overdue",
        "disputed",
        "void",
      ],
      invoice_line_item_type: [
        "deliverable",
        "time_and_materials",
        "expense",
        "retainer",
        "adjustment",
        "discount",
        "tax",
      ],
      invoice_status: [
        "draft",
        "sent",
        "viewed",
        "partial",
        "paid",
        "overdue",
        "disputed",
        "void",
      ],
      invoice_type: ["vendor", "client"],
      lead_source: [
        "website",
        "referral",
        "trade_show",
        "cold_outreach",
        "social_media",
        "advertising",
        "partner",
        "other",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal_sent",
        "negotiating",
        "won",
        "lost",
        "nurturing",
      ],
      location_type: [
        "venue",
        "warehouse",
        "office",
        "fabrication_shop",
        "staging_area",
        "hotel",
        "airport",
        "other",
      ],
      milestone_status: [
        "pending",
        "in_progress",
        "pending_approval",
        "approved",
        "rejected",
        "overdue",
      ],
      payment_method: [
        "corporate_card",
        "personal_card",
        "cash",
        "check",
        "wire",
        "ach",
      ],
      payment_status: ["pending", "partial", "paid", "refunded", "failed"],
      payroll_status: [
        "draft",
        "pending_approval",
        "approved",
        "processing",
        "completed",
      ],
      procurement_status: [
        "draft",
        "pending_approval",
        "approved",
        "sent",
        "acknowledged",
        "in_progress",
        "shipped",
        "received",
        "completed",
        "cancelled",
        "disputed",
      ],
      production_phase: [
        "discovery",
        "design",
        "pre_production",
        "procurement",
        "fabrication",
        "logistics",
        "load_in",
        "rehearsal",
        "show",
        "strike",
        "load_out",
        "wrap",
      ],
      project_status: [
        "draft",
        "planning",
        "pre_production",
        "in_production",
        "wrap",
        "completed",
        "cancelled",
        "on_hold",
      ],
      project_type: [
        "tour",
        "festival",
        "activation",
        "installation",
        "broadcast",
        "corporate",
        "retail",
        "experiential",
      ],
      project_type_interest: [
        "brand_activation",
        "stage_set_design",
        "immersive_installation",
        "trade_show_expo",
        "pop_up_retail",
        "festival_production",
        "corporate_event",
        "product_launch",
        "other",
      ],
      proposal_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "rejected",
        "expired",
        "revised",
      ],
      rate_type: ["hourly", "daily", "weekly", "flat"],
      risk_level: ["low", "medium", "high", "critical"],
      shift_status: [
        "scheduled",
        "confirmed",
        "checked_in",
        "on_break",
        "checked_out",
        "no_show",
        "cancelled",
      ],
      shipment_priority: ["standard", "expedited", "rush", "hot"],
      shipment_status: [
        "planning",
        "booked",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "exception",
        "cancelled",
      ],
      shipment_type: ["outbound", "inbound", "transfer", "return"],
      signature_status: ["pending", "signed", "declined", "expired"],
      sop_status: ["draft", "active", "under_review", "superseded", "archived"],
      sow_deliverable_status: [
        "not_started",
        "in_progress",
        "submitted",
        "under_review",
        "revision_requested",
        "approved",
        "completed",
        "cancelled",
      ],
      sow_deliverable_type: [
        "milestone",
        "fixed_fee",
        "time_and_materials",
        "unit_based",
        "retainer",
        "expense_passthrough",
      ],
      sow_status: [
        "draft",
        "pending_review",
        "pending_approval",
        "approved",
        "active",
        "on_hold",
        "completed",
        "cancelled",
        "amended",
      ],
      task_priority: ["low", "medium", "high", "urgent", "critical"],
      task_status: [
        "backlog",
        "todo",
        "in_progress",
        "review",
        "blocked",
        "completed",
        "cancelled",
      ],
      tech_sheet_status: [
        "draft",
        "reviewed",
        "approved",
        "distributed",
        "archived",
      ],
      testimonial_status: ["pending", "approved", "featured", "archived"],
      time_entry_status: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "processed",
      ],
      time_off_status: ["pending", "approved", "rejected", "cancelled"],
      time_off_type: [
        "vacation",
        "sick",
        "personal",
        "parental",
        "bereavement",
        "jury_duty",
        "holiday",
        "unpaid",
        "other",
      ],
      vehicle_ownership: ["owned", "leased", "rental"],
      vehicle_status: ["available", "in_use", "maintenance", "out_of_service"],
      vehicle_type: [
        "box_truck",
        "semi",
        "sprinter",
        "pickup",
        "trailer",
        "forklift",
        "other",
      ],
      widget_type: [
        "number",
        "chart_bar",
        "chart_line",
        "chart_pie",
        "chart_donut",
        "table",
        "list",
        "progress",
        "gauge",
        "calendar",
        "timeline",
      ],
      workflow_instance_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "escalated",
      ],
      workflow_status: ["draft", "active", "paused", "archived"],
    },
  },
} as const

