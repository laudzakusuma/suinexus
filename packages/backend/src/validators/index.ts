import { z } from 'zod'

export const CreateEntitySchema = z.object({
  entity_type: z.enum(['farmer', 'processor', 'distributor', 'retailer']),
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(200),
  signer: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Sui address')
})

export const CreateHarvestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(20),
  signer: z.string().regex(/^0x[a-fA-F0-9]{64}$/)
})

export const TransferAssetSchema = z.object({
  asset_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  issuer_entity_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  recipient_address: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  invoice_amount: z.number().nonnegative(),
  invoice_due_date_ms: z.number().positive(),
  signer: z.string().regex(/^0x[a-fA-F0-9]{64}$/)
})

export const ApplyProcessSchema = z.object({
  asset_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  processor_entity_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  process_name: z.string().min(1).max(100),
  new_state: z.string().min(1).max(50),
  notes: z.string().max(500),
  signer: z.string().regex(/^0x[a-fA-F0-9]{64}$/)
})