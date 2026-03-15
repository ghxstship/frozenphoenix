/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Core Type Definitions
   
   Defines the provider abstraction interface, capability manifest,
   streaming chunk format, and all shared types for the AI system.
   ═══════════════════════════════════════════════════════════════ */

// ─── Provider Keys ───────────────────────────────────────────

export type AIProviderKey = "anthropic" | "openai" | "google" | "ollama" | "mistral" | "groq";

// ─── Chat Messages ───────────────────────────────────────────

export type ChatRole = "user" | "assistant" | "system" | "tool_call" | "tool_result";

export interface ChatMessage {
    role: ChatRole;
    content: string;
    name?: string;
    tool_call_id?: string;
    tool_calls?: ToolCall[];
    attachments?: MessageAttachment[];
}

export interface MessageAttachment {
    type: "image" | "file" | "document";
    url?: string;
    base64?: string;
    mime_type: string;
    filename?: string;
}

// ─── Tool Calling ────────────────────────────────────────────

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
}

export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
}

export interface ToolResult {
    tool_call_id: string;
    content: string;
    is_error?: boolean;
}

// ─── Completion Options ──────────────────────────────────────

export interface CompletionOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stop_sequences?: string[];
    tools?: ToolDefinition[];
    json_mode?: boolean;
    system_prompt?: string;
    stream?: boolean;
}

// ─── Streaming ───────────────────────────────────────────────

export interface CopilotChunk {
    delta: string;
    tool_call?: ToolCall;
    finish_reason?: "stop" | "tool_use" | "max_tokens" | "error";
    usage?: TokenUsage;
}

export interface TokenUsage {
    input_tokens: number;
    output_tokens: number;
}

// ─── Moderation ──────────────────────────────────────────────

export interface ModerationResult {
    flagged: boolean;
    categories: Record<string, boolean>;
    scores: Record<string, number>;
}

// ─── Embeddings ──────────────────────────────────────────────

export interface EmbeddingResult {
    embedding: number[];
    token_count: number;
}

// ─── Model Definitions ───────────────────────────────────────

export interface ModelDefinition {
    model_key: string;
    display_name: string;
    provider: AIProviderKey;
    context_window: number;
    max_output_tokens: number;
    supports_vision: boolean;
    supports_tools: boolean;
    supports_streaming: boolean;
    supports_json_mode: boolean;
    supports_extended_thinking: boolean;
    cost_per_1k_input: number;
    cost_per_1k_output: number;
}

// ─── Provider Capabilities ───────────────────────────────────

export interface ProviderCapabilities {
    streaming: boolean;
    vision: boolean;
    tool_use: boolean;
    embeddings: boolean;
    json_mode: boolean;
    extended_thinking: boolean;
    moderation: boolean;
    batch_embeddings: boolean;
}

// ─── Provider Interface ──────────────────────────────────────

export interface IModelProvider {
    readonly providerKey: AIProviderKey;
    readonly displayName: string;
    readonly capabilities: ProviderCapabilities;

    chat(
        messages: ChatMessage[],
        options?: CompletionOptions
    ): AsyncGenerator<CopilotChunk, void, undefined>;

    complete(prompt: string, options?: CompletionOptions): Promise<string>;

    embed(input: string | string[]): Promise<EmbeddingResult[]>;

    moderate(content: string): Promise<ModerationResult>;

    getModels(): ModelDefinition[];

    estimateTokens(content: string): number;

    getContextWindow(model: string): number;

    validateApiKey(apiKey: string): Promise<boolean>;
}

// ─── Workspace Context ───────────────────────────────────────

export type WorkspaceContext = "global" | string;

// ─── Conversation Types ──────────────────────────────────────

export interface AIConversation {
    id: string;
    user_id: string;
    workspace_context: WorkspaceContext;
    model_id: string;
    title: string;
    summary?: string;
    pinned: boolean;
    archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface AIMessage {
    id: string;
    conversation_id: string;
    role: ChatRole;
    content: string;
    attachments?: MessageAttachment[];
    tool_calls?: ToolCall[];
    token_count_input: number;
    token_count_output: number;
    model_id: string | null;
    latency_ms: number;
    created_at: string;
}

// ─── Usage & Limits ──────────────────────────────────────────

export interface AIUsageEntry {
    id: string;
    user_id: string;
    org_id: string;
    provider_id: string;
    model_id: string;
    token_count_input: number;
    token_count_output: number;
    estimated_cost: number;
    endpoint_called: string;
    response_status: number;
    created_at: string;
}

export interface AIUsageLimit {
    id: string;
    org_id: string;
    role_id?: string;
    daily_token_limit: number;
    monthly_token_limit: number;
    max_context_per_request: number;
    active: boolean;
}

// ─── RAG Types ───────────────────────────────────────────────

export type DocumentSourceType =
    | "upload"
    | "sop"
    | "handbook"
    | "template"
    | "proposal"
    | "runsheet";

export type DocumentProcessingStatus = "pending" | "chunking" | "embedding" | "ready" | "failed";

export interface AIDocument {
    id: string;
    org_id: string;
    source_type: DocumentSourceType;
    title: string;
    original_filename: string;
    mime_type: string;
    storage_path: string;
    processing_status: DocumentProcessingStatus;
    created_at: string;
}

export interface AIDocumentChunk {
    id: string;
    document_id: string;
    chunk_index: number;
    content: string;
    token_count: number;
    embedding?: number[];
    metadata: ChunkMetadata;
    created_at: string;
}

export interface ChunkMetadata {
    page_number?: number;
    section_header?: string;
    source_context?: string;
    [key: string]: unknown;
}

export interface RankedChunk {
    chunk: AIDocumentChunk;
    score: number;
    document_title: string;
    document_source_type: DocumentSourceType;
}

// ─── System Prompts ──────────────────────────────────────────

export interface AISystemPrompt {
    id: string;
    workspace_context: WorkspaceContext;
    role_id?: string;
    prompt_name: string;
    prompt_text: string;
    is_active: boolean;
    version: number;
    created_at: string;
    updated_at: string;
}

// ─── Failover ────────────────────────────────────────────────

export interface FailoverConfig {
    max_retries: number;
    retry_delay_ms: number;
    fallback_providers: AIProviderKey[];
}
