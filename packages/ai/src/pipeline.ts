import type { PipelineInput, ExtractionResult } from './types.js';
import { runStubExtraction } from './stub-extractor.js';

export function getExtractorMode(): 'stub' | 'openai' {
  if (process.env.OPENAI_API_KEY?.trim()) return 'openai';
  return 'stub';
}

/**
 * M4 extraction entry. OpenAI path falls back to stub until LLM adapter is wired.
 */
export function runExtractionPipeline(input: PipelineInput): ExtractionResult {
  const mode = getExtractorMode();
  if (mode === 'openai') {
    // TODO M4.5+: structured LLM output; stub keeps local dev zero-config.
    return runStubExtraction(input);
  }
  return runStubExtraction(input);
}
