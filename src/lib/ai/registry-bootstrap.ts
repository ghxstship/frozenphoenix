/**
 * AI Registry Bootstrap — Server-side only.
 *
 * Automatically registers available AI provider adapters based on
 * environment variable presence. Call initRegistry() exactly once
 * early in any server route that needs AI capabilities.
 *
 * Priority order (first configured = default):
 *   1. Anthropic (ANTHROPIC_API_KEY)
 *   2. OpenAI    (OPENAI_API_KEY)
 *   3. Google    (GOOGLE_GENERATIVE_AI_API_KEY)
 *   4. Groq      (GROQ_API_KEY)
 *   5. Mistral   (MISTRAL_API_KEY)
 *   6. Ollama    (OLLAMA_BASE_URL — always registered, no key needed)
 *
 * When an `ai_api_keys` DB row exists for the org, the chat route will
 * use that org-specific key instead of the env var key. Env var keys
 * serve as fallback / admin-level defaults.
 */

import { ModelRegistry } from "./model-registry";
import {
    AnthropicAdapter,
    GoogleAdapter,
    GroqAdapter,
    MistralAdapter,
    OllamaAdapter,
    OpenAIAdapter,
} from "./adapters";
import type { AIProviderKey } from "./types";

let initialized = false;

export function initRegistry(): ModelRegistry {
    const registry = ModelRegistry.getInstance();
    if (initialized) return registry;
    initialized = true;

    type ProviderEntry = {
        key: AIProviderKey;
        envVar: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        factory: (apiKey: string) => any;
        defaultModel: string;
        priority: number;
    };

    const providers: ProviderEntry[] = [
        {
            key: "anthropic",
            envVar: "ANTHROPIC_API_KEY",
            factory: (k) => new AnthropicAdapter(k),
            defaultModel: "claude-sonnet-4-20250514",
            priority: 100,
        },
        {
            key: "openai",
            envVar: "OPENAI_API_KEY",
            factory: (k) => new OpenAIAdapter(k),
            defaultModel: "gpt-4o",
            priority: 90,
        },
        {
            key: "google",
            envVar: "GOOGLE_GENERATIVE_AI_API_KEY",
            factory: (k) => new GoogleAdapter(k),
            defaultModel: "gemini-2.0-flash",
            priority: 80,
        },
        {
            key: "groq",
            envVar: "GROQ_API_KEY",
            factory: (k) => new GroqAdapter(k),
            defaultModel: "llama-3.3-70b-versatile",
            priority: 70,
        },
        {
            key: "mistral",
            envVar: "MISTRAL_API_KEY",
            factory: (k) => new MistralAdapter(k),
            defaultModel: "mistral-large-latest",
            priority: 60,
        },
    ];

    let highestPriority = -1;
    let defaultKey: AIProviderKey | null = null;
    let defaultModel = "";

    for (const { key, envVar, factory, defaultModel: model, priority } of providers) {
        const apiKey = process.env[envVar];
        if (apiKey) {
            registry.register(factory(apiKey), { isActive: true, priority });
            if (priority > highestPriority) {
                highestPriority = priority;
                defaultKey = key;
                defaultModel = model;
            }
        }
    }

    // Always register Ollama (local, no key required)
    const ollamaBase = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
    registry.register(new OllamaAdapter(ollamaBase), { isActive: true, priority: 10 });

    if (defaultKey) {
        try {
            registry.setDefault(defaultKey, defaultModel);
        } catch {
            // Ignore — setDefault throws if key not registered, but we just registered it
        }
    }

    return registry;
}
