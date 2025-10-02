import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

const network = process.env.SUI_NETWORK || 'devnet';
const rpcUrl = getFullnodeUrl(network as 'devnet' | 'testnet' | 'mainnet');

export const suiClient = new SuiClient({ url: rpcUrl });

export const CONTRACT_CONFIG = {
  packageId: process.env.PACKAGE_ID!,
  moduleName: process.env.MODULE_NAME || 'nexus'
};

export function getKeypairFromPrivateKey(privateKey: string): Ed25519Keypair {
  const keypair = Ed25519Keypair.fromSecretKey(
    Buffer.from(privateKey, 'hex')
  );
  return keypair;
}

export async function getNetworkInfo() {
  try {
    const chainId = await suiClient.getChainIdentifier();
    const latestCheckpoint = await suiClient.getLatestCheckpointSequenceNumber();
    
    return {
      network,
      chainId,
      latestCheckpoint,
      rpcUrl
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    throw error;
  }
}