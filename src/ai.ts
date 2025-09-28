import { EnrichResult } from './types.js';
import { 
  AIProvider, 
  RuleBasedProvider, 
  DirectLlamaProvider,
  OpenAIProvider, 
  OllamaProvider, 
  GroqProvider, 
  HuggingFaceProvider 
} from './ai-providers.js';

// Initialize all providers (order matters - first available is used)
const providers: AIProvider[] = [
  new DirectLlamaProvider(),  // Direct Llama - no external dependencies
  new OllamaProvider(),       // Ollama - requires Ollama installation
  new GroqProvider(),         // Groq - free tier
  new OpenAIProvider(),       // OpenAI - paid
  new HuggingFaceProvider(),  // Hugging Face - free tier
  new RuleBasedProvider(),    // Always last as fallback
];

function getAvailableProvider(): AIProvider {
  const preferredProvider = process.env.AI_PROVIDER?.toLowerCase();
  
  // If a specific provider is requested, try it first
  if (preferredProvider) {
    const provider = providers.find(p => 
      p.name.toLowerCase().includes(preferredProvider) || 
      preferredProvider.includes(p.name.toLowerCase())
    );
    if (provider?.isAvailable()) {
      return provider;
    }
  }
  
  // Otherwise, find the first available provider
  return providers.find(p => p.isAvailable()) || new RuleBasedProvider();
}

export async function enrichWithAI(text: string): Promise<EnrichResult> {
  const provider = getAvailableProvider();
  
  try {
    console.log(`🤖 Using ${provider.name} for AI enrichment`);
    const result = await provider.enrich(text);
    

    
    return result;
  } catch (error) {
    console.warn(`⚠️  ${provider.name} failed:`, (error as Error).message);
    
    if (provider.name !== 'Rule-based') {
      const fallback = new RuleBasedProvider();
      return await fallback.enrich(text);
    }
    
    throw error;
  }
}

export { providers, getAvailableProvider };