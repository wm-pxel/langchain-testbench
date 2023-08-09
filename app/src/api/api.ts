
import { Revision } from '../model/revision';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const listChains = async () => {
  const response = await fetch(`${API_URL}/chains`);
  return await response.json();
}

export const loadRevision = async (chainName: string): Promise<Revision> => {
  const response = await fetch(`${API_URL}/chain/${chainName}/revision`);
  return await response.json();
}

export const saveRevision = async (chainName: string, revision: Revision) => {
  const response = await fetch(`${API_URL}/chain/${chainName}/revision`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(revision),
  });
  return await response.json();
}

export const runOnce = async (chainName: string, input: Record<string, string>) => {
  const response = await fetch(`${API_URL}/chain/${chainName}/run`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(input),
  });
  return await response.json();
}
