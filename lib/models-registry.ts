export type ModelType = 'free' | 'paid';

export interface Model {
  id: string;
  name: string;
  type: ModelType;
}

export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  models: Model[];
}

export const PROVIDERS: Provider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', type: 'free' },
      { id: 'google/gemini-2.5-pro-preview-0506', name: 'Gemini 2.5 Pro', type: 'paid' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', type: 'paid' },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', type: 'free' },
      { id: 'openai/gpt-4o', name: 'GPT-4o', type: 'paid' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', type: 'free' },
      { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', type: 'free' },
      { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', type: 'free' },
      { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', type: 'free' },
      { id: 'qwen/qwen-2-72b-instruct', name: 'Qwen 2 72B', type: 'free' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', type: 'free' },
      { id: 'google/gemma-2-27b-instruct', name: 'Gemma 2 27B', type: 'free' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', type: 'free' },
      { id: 'llama-3.1-70b-instruct', name: 'Llama 3.1 70B', type: 'free' },
      { id: 'llama-3.1-8b-instruct', name: 'Llama 3.1 8B', type: 'free' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', type: 'free' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', type: 'free' },
    ],
  },
  {
    id: 'togetherai',
    name: 'TogetherAI',
    baseUrl: 'https://api.together.ai/v1',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', type: 'free' },
      { id: 'meta-llama/Llama-3.1-405B-Instruct', name: 'Llama 3.1 405B', type: 'paid' },
      { id: 'meta-llama/Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B', type: 'free' },
      { id: 'Qwen/Qwen2-72B-Instruct', name: 'Qwen 2 72B', type: 'free' },
      { id: 'mistralai/Mistral-7B-Instruct-v0.2', name: 'Mistral 7B', type: 'free' },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', type: 'free' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', type: 'free' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', type: 'free' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', type: 'paid' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', type: 'paid' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', type: 'paid' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', type: 'paid' },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental', type: 'free' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', type: 'free' },
      { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', type: 'paid' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', type: 'paid' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', type: 'free' },
    ],
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    baseUrl: 'https://api.x.ai/v1',
    models: [
      { id: 'grok-2', name: 'Grok 2', type: 'paid' },
      { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', type: 'paid' },
      { id: 'grok-beta', name: 'Grok Beta', type: 'free' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', type: 'paid' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', type: 'paid' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', type: 'paid' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', type: 'paid' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', type: 'paid' },
    ],
  },
  {
    id: 'glm',
    name: 'GLM (Zhipu)',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-4-plus', name: 'GLM-4 Plus', type: 'free' },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', type: 'free' },
      { id: 'glm-4', name: 'GLM-4', type: 'free' },
      { id: 'glm-3-turbo', name: 'GLM-3 Turbo', type: 'free' },
    ],
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    baseUrl: 'https://api.minimax.chat/v1',
    models: [
      { id: 'abab6.5s-chat', name: 'Abab 6.5s', type: 'free' },
      { id: 'abab6.5g-chat', name: 'Abab 6.5g', type: 'free' },
      { id: 'abab6-chat', name: 'Abab 6', type: 'free' },
    ],
  },
  {
    id: 'kimi',
    name: 'Kimi (Moonshot)',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: [
      { id: 'kimi-latest', name: 'Kimi Latest', type: 'free' },
      { id: 'kimi-k2-preview', name: 'Kimi K2 Preview', type: 'free' },
      { id: 'kimi-k2-0711', name: 'Kimi K2', type: 'free' },
    ],
  },
  {
    id: 'qwen',
    name: 'Qwen (Alibaba)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen-plus', name: 'Qwen Plus', type: 'free' },
      { id: 'qwen-turbo', name: 'Qwen Turbo', type: 'free' },
      { id: 'qwen-long', name: 'Qwen Long', type: 'paid' },
      { id: 'qwen2.5-72b-instruct', name: 'Qwen 2.5 72B', type: 'free' },
      { id: 'qwen2.5-32b-instruct', name: 'Qwen 2.5 32B', type: 'free' },
    ],
  },
];