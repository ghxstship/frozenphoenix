/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Model Registry Singleton
   
   Central registry for all model provider adapters. New providers
   are registered as adapter + config entry — zero refactoring.
   
   Usage:
     const registry = ModelRegistry.getInstance();
     registry.register(new AnthropicAdapter(apiKey));
     const provider = registry.getProvider("anthropic");
     const defaultProvider = registry.getDefaultProvider();
   ═══════════════════════════════════════════════════════════════ */

import type { AIProviderKey, IModelProvider, ModelDefinition, ProviderCapabilities } from "./types";

interface RegisteredProvider {
    adapter: IModelProvider;
    isActive: boolean;
    priority: number;
}

export class ModelRegistry {
    private static instance: ModelRegistry | null = null;
    private providers = new Map<AIProviderKey, RegisteredProvider>();
    private defaultProviderKey: AIProviderKey = "anthropic";
    private defaultModelKey: string = "claude-sonnet-4-20250514";

    private constructor() {}

    static getInstance(): ModelRegistry {
        if (!ModelRegistry.instance) {
            ModelRegistry.instance = new ModelRegistry();
        }
        return ModelRegistry.instance;
    }

    /**
     * Reset singleton — for testing only.
     */
    static resetInstance(): void {
        ModelRegistry.instance = null;
    }

    /**
     * Register a provider adapter with optional priority for failover ordering.
     * Higher priority = preferred failover target.
     */
    register(adapter: IModelProvider, options?: { isActive?: boolean; priority?: number }): void {
        this.providers.set(adapter.providerKey, {
            adapter,
            isActive: options?.isActive ?? true,
            priority: options?.priority ?? 0,
        });
    }

    /**
     * Unregister a provider adapter.
     */
    unregister(providerKey: AIProviderKey): void {
        this.providers.delete(providerKey);
    }

    /**
     * Get a specific provider adapter by key.
     * Throws if provider is not registered or not active.
     */
    getProvider(providerKey: AIProviderKey): IModelProvider {
        const entry = this.providers.get(providerKey);
        if (!entry) {
            throw new Error(`AI provider "${providerKey}" is not registered`);
        }
        if (!entry.isActive) {
            throw new Error(`AI provider "${providerKey}" is currently disabled`);
        }
        return entry.adapter;
    }

    /**
     * Get the default provider (Anthropic unless overridden).
     */
    getDefaultProvider(): IModelProvider {
        return this.getProvider(this.defaultProviderKey);
    }

    /**
     * Get the default model key.
     */
    getDefaultModelKey(): string {
        return this.defaultModelKey;
    }

    /**
     * Set the default provider and model.
     */
    setDefault(providerKey: AIProviderKey, modelKey: string): void {
        if (!this.providers.has(providerKey)) {
            throw new Error(`Cannot set default: provider "${providerKey}" is not registered`);
        }
        this.defaultProviderKey = providerKey;
        this.defaultModelKey = modelKey;
    }

    /**
     * Toggle a provider active/inactive.
     */
    setProviderActive(providerKey: AIProviderKey, isActive: boolean): void {
        const entry = this.providers.get(providerKey);
        if (!entry) {
            throw new Error(`AI provider "${providerKey}" is not registered`);
        }
        entry.isActive = isActive;
    }

    /**
     * List all registered providers with their capabilities and status.
     */
    listProviders(): Array<{
        key: AIProviderKey;
        displayName: string;
        isActive: boolean;
        capabilities: ProviderCapabilities;
        priority: number;
    }> {
        return Array.from(this.providers.entries()).map(([key, entry]) => ({
            key,
            displayName: entry.adapter.displayName,
            isActive: entry.isActive,
            capabilities: entry.adapter.capabilities,
            priority: entry.priority,
        }));
    }

    /**
     * List all active providers sorted by priority (descending).
     */
    listActiveProviders(): IModelProvider[] {
        return Array.from(this.providers.entries())
            .filter(([, entry]) => entry.isActive)
            .sort((a, b) => b[1].priority - a[1].priority)
            .map(([, entry]) => entry.adapter);
    }

    /**
     * Get all available models across all active providers.
     */
    listAllModels(): ModelDefinition[] {
        return this.listActiveProviders().flatMap((provider) => provider.getModels());
    }

    /**
     * Find a compatible fallback provider for failover.
     * Returns the highest-priority active provider that supports the
     * required capabilities, excluding the failed provider.
     */
    findFallbackProvider(
        failedProviderKey: AIProviderKey,
        requiredCapabilities?: Partial<ProviderCapabilities>
    ): IModelProvider | null {
        const candidates = Array.from(this.providers.entries())
            .filter(([key, entry]) => {
                if (key === failedProviderKey) return false;
                if (!entry.isActive) return false;
                if (requiredCapabilities) {
                    const caps = entry.adapter.capabilities;
                    for (const [cap, required] of Object.entries(requiredCapabilities)) {
                        if (required && !caps[cap as keyof ProviderCapabilities]) {
                            return false;
                        }
                    }
                }
                return true;
            })
            .sort((a, b) => b[1].priority - a[1].priority);

        const best = candidates[0];
        return best ? best[1].adapter : null;
    }

    /**
     * Resolve a model key to its provider.
     * Searches across all active providers for a matching model_key.
     */
    resolveModel(modelKey: string): { provider: IModelProvider; model: ModelDefinition } | null {
        for (const provider of this.listActiveProviders()) {
            const model = provider.getModels().find((m) => m.model_key === modelKey);
            if (model) {
                return { provider, model };
            }
        }
        return null;
    }

    /**
     * Check if any provider is registered and active.
     */
    hasActiveProvider(): boolean {
        return Array.from(this.providers.values()).some((entry) => entry.isActive);
    }
}
