import { Request, Response } from 'express';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { suiClient, CONTRACT_CONFIG } from '../config/sui';
import { CreateHarvestRequest, TransferAssetRequest, ApplyProcessRequest } from '../types';

export async function getAssetsByOwner(req: Request, res: Response) {
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
    const assets = objects.data.filter((obj: any) => {
      const type = obj.data?.type || '';
      return type.includes('DynamicAssetNFT');
    });

    res.json({
      success: true,
      data: assets,
      count: assets.length
    });
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function getAssetById(req: Request, res: Response) {
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
        error: 'Asset not found'
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

export async function buildCreateHarvestTransaction(req: Request, res: Response) {
  try {
    const { name, description, quantity, unit, signer }: CreateHarvestRequest = req.body;

    if (!name || !description || !quantity || !unit || !signer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, description, quantity, unit, signer'
      });
    }

    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::create_harvest_batch`,
      arguments: [
        tx.pure(Array.from(new TextEncoder().encode(name))),
        tx.pure(Array.from(new TextEncoder().encode(description))),
        tx.pure(quantity),
        tx.pure(Array.from(new TextEncoder().encode(unit))),
        tx.object('0x6')
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

export async function buildTransferAssetTransaction(req: Request, res: Response) {
  try {
    const { 
      asset_id, 
      issuer_entity_id, 
      recipient_address, 
      invoice_amount, 
      invoice_due_date_ms, 
      signer 
    }: TransferAssetRequest = req.body;

    if (!asset_id || !issuer_entity_id || !recipient_address || !invoice_amount || !invoice_due_date_ms || !signer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::transfer_asset_and_create_invoice`,
      arguments: [
        tx.object(asset_id),
        tx.object(issuer_entity_id),
        tx.pure(recipient_address),
        tx.pure(invoice_amount),
        tx.pure(invoice_due_date_ms)
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

export async function buildApplyProcessTransaction(req: Request, res: Response) {
  try {
    const { 
      asset_id, 
      processor_entity_id, 
      process_name, 
      new_state, 
      notes, 
      signer 
    }: ApplyProcessRequest = req.body;

    if (!asset_id || !processor_entity_id || !process_name || !new_state || !notes || !signer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::apply_process`,
      arguments: [
        tx.object(asset_id),
        tx.object(processor_entity_id),
        tx.pure(Array.from(new TextEncoder().encode(process_name))),
        tx.pure(Array.from(new TextEncoder().encode(new_state))),
        tx.pure(Array.from(new TextEncoder().encode(notes))),
        tx.object('0x6')
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

export async function getInvoicesByBeneficiary(req: Request, res: Response) {
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
    const invoices = objects.data.filter((obj: any) => {
      const type = obj.data?.type || '';
      return type.includes('InvoiceNFT');
    });

    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}