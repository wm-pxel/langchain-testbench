import { ChainSpec } from './specs';

export interface Revision {
  id?: string | undefined;
  parent: string | null;
  chain: ChainSpec;
  llms: Record<string, any>;
}