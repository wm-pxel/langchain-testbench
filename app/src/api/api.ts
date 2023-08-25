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

export const chainResults = async (chainName: string) => {
  const response = await fetch(`${API_URL}/chain/${chainName}/results`);
  return await response.json();
}

export const exportChain = async(chainName: string) => {
  const response = await fetch(`${API_URL}/chain/${chainName}/export`);
  if (response.ok) {
    return await response.blob();
  } else {
    throw new Error('Failed to export chain');
  }  
}

export const importChain = async (chainName: string, file: File) => {
  const fileContent = await file.text();
  
  const response = await fetch(`${API_URL}/chain/${chainName}/import`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: fileContent,
  });

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Failed to import chain');
  }
}

export const runOnce = async (chainName: string, input: Record<string, string>) => {
  const response = await fetch(`${API_URL}/chain/${chainName}/run`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(input),
  });
  return await response.json();
}
