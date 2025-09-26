import { EnrichResult } from './types.js';

// Lazy import for Transformers.js to avoid loading if not needed
let transformersModule: any = null;
async function getTransformers() {
  if (!transformersModule) {
    transformersModule = await import('@xenova/transformers');
  }
  return transformersModule;
}

export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  enrich(text: string): Promise<EnrichResult>;
}

// Rule-based fallback (always available)
export class RuleBasedProvider implements AIProvider {
  name = 'Rule-based';

  isAvailable(): boolean {
    return true;
  }

  async enrich(text: string): Promise<EnrichResult> {
    const trimmed = text.trim();
    const summary = trimmed.length > 100 ? trimmed.slice(0, 97) + '...' : trimmed;
    const words = Array.from(new Set(trimmed.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean)));
    const tags = words.slice(0, 5);
    return { summary, tags };
  }
}

// OpenAI Provider
export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';

  isAvailable(): boolean {
    const key = process.env.OPENAI_API_KEY;
    return !!(key && key !== 'your_openai_api_key_here' && key.trim() !== '');
  }

  async enrich(text: string): Promise<EnrichResult> {
    const key = process.env.OPENAI_API_KEY!;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Summarize in ≤25 words and propose 1-5 short keyword tags for:\n\n${text}\n\nReturn JSON with keys: summary, tags.`
        }],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;
    return this.parseResponse(content);
  }

  private parseResponse(content: string): EnrichResult {
    if (!content) throw new Error('No content in response');
    
    // Remove markdown code blocks if present
    let cleanJson = content.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(cleanJson);
    if (typeof parsed.summary === 'string' && Array.isArray(parsed.tags)) {
      return { summary: parsed.summary, tags: parsed.tags.map(String) };
    }
    
    throw new Error('Invalid response format');
  }
}

// Direct Llama Provider (Local, No External Dependencies)
export class DirectLlamaProvider implements AIProvider {
  name = 'Direct Llama';
  private summarizer: any = null;

  isAvailable(): boolean {
    return process.env.AI_PROVIDER === 'llama' || process.env.AI_PROVIDER === 'direct-llama';
  }

  async enrich(text: string): Promise<EnrichResult> {
    try {
      if (!this.summarizer) {
        console.log('🔄 Loading Llama summarization model (first time may take a few minutes)...');
        const { pipeline } = await getTransformers();
        // Use a lightweight summarization model
        this.summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
      }

      // Summarize the text
      const summaryResult = await this.summarizer(text, {
        max_length: 50,
        min_length: 10,
        do_sample: false,
      });

      const summary = summaryResult[0]?.summary_text || text.substring(0, 97) + '...';

      // Generate tags using keyword extraction
      const tags = this.extractKeywords(text);

      return { summary, tags };
    } catch (error) {
      console.warn('⚠️ Direct Llama failed:', (error as Error).message);
      // Fallback to enhanced rule-based approach
      return this.enhancedRuleBasedEnrich(text);
    }
  }

  private extractKeywords(text: string): string[] {
    // Enhanced keyword extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    // Count word frequency
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // Get top 5 most frequent meaningful words
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'this', 'that', 'with', 'from', 'they', 'have', 'will', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'into', 'very', 'what', 'know', 'just', 'first', 'also', 'after', 'back', 'work', 'well', 'year', 'come', 'make', 'good', 'much', 'where', 'through', 'when', 'down', 'should', 'because', 'long', 'think', 'take', 'being', 'before', 'here', 'over', 'want', 'only', 'need', 'going', 'about', 'more', 'some', 'most', 'many', 'such', 'even', 'still', 'like', 'look', 'find', 'give', 'part', 'place', 'right', 'great', 'little', 'world', 'public', 'same', 'different', 'away', 'move', 'try', 'kind', 'hand', 'high', 'every', 'tell', 'does', 'set', 'three', 'state', 'never', 'become', 'between', 'important', 'often', 'during', 'without', 'again', 'something', 'fact', 'though', 'water', 'less', 'might', 'far', 'along', 'those', 'both', 'remember', 'until', 'power', 'another', 'while', 'learn', 'around', 'usually', 'form', 'meat', 'air', 'day', 'place', 'become', 'number', 'public', 'read', 'keep', 'part', 'start', 'year', 'every', 'field', 'large', 'once', 'available', 'down', 'give', 'fish', 'human', 'both', 'local', 'sure', 'something', 'without', 'come', 'me', 'back', 'better', 'general', 'process', 'she', 'heat', 'thanks', 'specific', 'enough', 'long', 'lot', 'hand', 'popular', 'small', 'though', 'experience', 'include', 'job', 'believe', 'bad', 'news', 'official', 'national', 'week', 'media', 'big', 'fail', 'despite', 'eat', 'face', 'far', 'fill', 'full', 'force', 'hot', 'however', 'item', 'its', 'itself', 'join', 'later', 'life', 'may', 'mean', 'might', 'miss', 'much', 'must', 'name', 'never', 'news', 'none', 'nor', 'not', 'note', 'nothing', 'now', 'number', 'occur', 'of', 'off', 'often', 'oil', 'ok', 'old', 'on', 'once', 'one', 'only', 'open', 'or', 'order', 'other', 'our', 'out', 'over', 'own', 'part', 'people', 'place', 'point', 'popular', 'possible', 'power', 'probably', 'problem', 'program', 'provide', 'put', 'quite', 'rather', 'really', 'right', 'room', 'run', 'same', 'school', 'seem', 'several', 'shall', 'she', 'should', 'show', 'side', 'since', 'small', 'so', 'some', 'someone', 'something', 'sometimes', 'sound', 'still', 'such', 'system', 'take', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'thing', 'think', 'this', 'those', 'though', 'three', 'through', 'thus', 'time', 'to', 'today', 'together', 'too', 'toward', 'turn', 'under', 'until', 'up', 'upon', 'us', 'use', 'used', 'using', 'very', 'want', 'water', 'way', 'we', 'week', 'well', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'why', 'will', 'with', 'within', 'without', 'work', 'would', 'write', 'year', 'yes', 'yet', 'you', 'young', 'your'
    ]);
    return stopWords.has(word);
  }

  private enhancedRuleBasedEnrich(text: string): EnrichResult {
    const trimmed = text.trim();
    const summary = trimmed.length > 100 ? trimmed.slice(0, 97) + '...' : trimmed;
    const tags = this.extractKeywords(text);
    return { summary, tags };
  }
}

// Ollama Provider (Local)
export class OllamaProvider implements AIProvider {
  name = 'Ollama';

  isAvailable(): boolean {
    const baseUrl = process.env.OLLAMA_BASE_URL;
    const model = process.env.OLLAMA_MODEL;
    return !!(baseUrl && model);
  }

  async enrich(text: string): Promise<EnrichResult> {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3.2:3b';

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `Summarize the following text in 25 words or less and provide 1-5 relevant keyword tags. Return your response as JSON with "summary" and "tags" keys:\n\n${text}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return this.parseResponse(data.response);
  }

  private parseResponse(content: string): EnrichResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.summary && parsed.tags) {
          return {
            summary: String(parsed.summary),
            tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [String(parsed.tags)]
          };
        }
      }
      
      // Fallback: extract summary and tags from text
      const lines = content.split('\n').filter(line => line.trim());
      const summary = lines[0]?.replace(/^(Summary|SUMMARY):\s*/i, '').trim() || content.substring(0, 100);
      const tags = content.toLowerCase().match(/\b\w+\b/g)?.slice(0, 5) || ['general'];
      
      return { summary, tags };
    } catch {
      // Last resort fallback
      return {
        summary: content.substring(0, 100),
        tags: content.toLowerCase().match(/\b\w+\b/g)?.slice(0, 5) || ['general']
      };
    }
  }
}

// Groq Provider
export class GroqProvider implements AIProvider {
  name = 'Groq';

  isAvailable(): boolean {
    const key = process.env.GROQ_API_KEY;
    return !!(key && key !== 'your_groq_api_key_here' && key.trim() !== '');
  }

  async enrich(text: string): Promise<EnrichResult> {
    const key = process.env.GROQ_API_KEY!;
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'user',
          content: `Summarize in ≤25 words and propose 1-5 short keyword tags for:\n\n${text}\n\nReturn JSON with keys: summary, tags.`
        }],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;
    return this.parseResponse(content);
  }

  private parseResponse(content: string): EnrichResult {
    if (!content) throw new Error('No content in response');
    
    // Remove markdown code blocks if present
    let cleanJson = content.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    try {
      const parsed = JSON.parse(cleanJson);
      if (typeof parsed.summary === 'string' && Array.isArray(parsed.tags)) {
        return { summary: parsed.summary, tags: parsed.tags.map(String) };
      }
    } catch {
      // Fallback parsing
      const lines = content.split('\n');
      const summary = lines.find(line => line.includes('summary'))?.split(':')[1]?.trim() || content.substring(0, 100);
      const tags = content.toLowerCase().match(/\b\w+\b/g)?.slice(0, 5) || ['general'];
      return { summary, tags };
    }
    
    throw new Error('Invalid response format');
  }
}

// Hugging Face Provider
export class HuggingFaceProvider implements AIProvider {
  name = 'Hugging Face';

  isAvailable(): boolean {
    const key = process.env.HUGGINGFACE_API_KEY;
    return !!(key && key !== 'your_hf_api_key_here' && key.trim() !== '');
  }

  async enrich(text: string): Promise<EnrichResult> {
    const key = process.env.HUGGINGFACE_API_KEY!;
    
    // Use a free model for text generation
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Summarize this text in 25 words and provide 5 tags: ${text}`,
        parameters: {
          max_length: 100,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const generatedText = data[0]?.generated_text || data.generated_text || '';
    
    // Simple parsing for Hugging Face response
    const summary = generatedText.substring(0, 100).trim() || text.substring(0, 97) + '...';
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const tags = [...new Set(words)].slice(0, 5);
    
    return { summary, tags };
  }
}