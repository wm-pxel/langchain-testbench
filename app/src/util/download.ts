import { exportChain } from "../api/api";

export async function downloadChain(chainName: string): Promise<void>
{
  const blob = await exportChain(chainName);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${chainName}_exported_chain.json`;
  link.click();
  window.URL.revokeObjectURL(url);
}