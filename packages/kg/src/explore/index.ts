export * from './types';
export * from './alias-index';
export * from './parse-query';
export * from './execute-explore';
export { runExploreFromParse } from './execute-explore';

export const EXPLORE_PRESETS = [
  { label: '英伟达 上下游', query: '英伟达 上下游' },
  { label: '英伟达 上游 2跳', query: '英伟达 上游 2跳' },
  { label: '台积电 供应链', query: '台积电 供应链' },
  { label: 'OpenAI 到 Google', query: 'OpenAI 到 Google' },
  { label: 'AI 产业链', query: 'AI产业链' },
] as const;
