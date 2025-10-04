import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inisialisasi Sui Client langsung di sini
const network = process.env.SUI_NETWORK || 'devnet';
const rpcUrl = getFullnodeUrl(network as 'devnet' | 'testnet' | 'mainnet');
const suiClient = new SuiClient({ url: rpcUrl });

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Ambil 'address' dari URL
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
      }
    });

    // Filter manual by type
    const assets = objects.data.filter((obj: any) => {
      const type = obj.data?.type || '';
      return type.includes('DynamicAssetNFT');
    });

    // Kirim respons
    return response.status(200).json({
      success: true,
      data: assets,
      count: assets.length
    });

  } catch (error: any) {
    console.error('Error fetching assets:', error);
    return response.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch assets' 
    });
  }
}