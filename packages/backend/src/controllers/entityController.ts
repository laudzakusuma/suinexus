import { Request, Response } from 'express';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { suiClient, CONTRACT_CONFIG } from '../config/sui';
import { CreateEntityRequest } from '../types';

export async function getEntitiesByOwner(req: Request, res: Response) {
  try {
    const { address } = req.params;

    const objects = await suiClient.getOwnedObjects({
      owner: address,
      options: {
        showContent: true,
        showType: true
      }
    });

    // Filter manual by type
    const entities = objects.data.filter((obj: any) => {
      const type = obj.data?.type || '';
      return type.includes('EntityObject');
    });

    res.json({
      success: true,
      data: entities,
      count: entities.length
    });
  } catch (error: any) {
    console.error('Error fetching entities:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function getEntityById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const object = await suiClient.getObject({
      id,
      options: {
        showContent: true,
        showType: true,
        showOwner: true
      }
    });

    if (!object.data) {
      return res.status(404).json({
        success: false,
        error: 'Entity not found'
      });
    }

    res.json({
      success: true,
      data: object.data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function buildCreateEntityTransaction(req: Request, res: Response) {
  try {
    const { entity_type, name, location, signer }: CreateEntityRequest = req.body;

    if (!entity_type || !name || !location || !signer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: entity_type, name, location, signer'
      });
    }

    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::create_entity`,
      arguments: [
        tx.pure(Array.from(new TextEncoder().encode(entity_type))),
        tx.pure(Array.from(new TextEncoder().encode(name))),
        tx.pure(Array.from(new TextEncoder().encode(location)))
      ]
    });

    const txBytes = await tx.build({ client: suiClient });

    res.json({
      success: true,
      data: {
        txBytes: Buffer.from(txBytes).toString('base64'),
        message: 'Transaction built successfully. Sign and execute on client side.'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}