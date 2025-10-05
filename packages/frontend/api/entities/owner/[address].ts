import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const network = (process.env.SUI_NETWORK || 'devnet') as 'devnet' | 'testnet' | 'mainnet';
const rpcUrl = getFullnodeUrl(network);
const suiClient = new SuiClient({ url: rpcUrl });

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { address } = request.query;

  if (typeof address !== 'string' || address.length < 60) {
    return response.status(400).json({ 
      success: false, 
      error: 'Invalid Sui address format' 
    });
  }

  try {
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      options: {
        showContent: true,
        showType: true,
        showDisplay: true,
        showOwner: true
      }
    });

    // Filter untuk EntityObject
    const entities = objects.data.filter((obj: any) => {
      const type = obj.data?.type || '';
      return type.includes('EntityObject');
    });

    return response.status(200).json({
      success: true,
      data: entities,
      count: entities.length
    });
  } catch (error: any) {
    console.error('Error fetching entities:', error);
    return response.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch entities' 
    });
  }
}