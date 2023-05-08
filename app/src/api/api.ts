
import { ChainSpec } from '../model/specs';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const listChains = async () => {
  console.log("API_URL", API_URL);
  const response = await fetch(`${API_URL}/chains`);
  return await response.json();
}

export const loadRevision = async (chainName: string) => {
  const response = await fetch(`${API_URL}/chain/${chainName}/revision`);
  return await response.json();
}

export const saveChain = async (chainName: string, chainSpec: ChainSpec) => {  
  const response = await fetch(`${API_URL}/chain/${chainName}/revision`, {
    method: 'POST',
    body: JSON.stringify(chainSpec),
  });
  return await response.json();
}
