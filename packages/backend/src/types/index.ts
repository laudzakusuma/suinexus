export interface Entity {
  id: string;
  entity_type: string;
  name: string;
  location: string;
  reputation_score: number;
  owner: string;
}

export interface CreateEntityRequest {
  entity_type: string;
  name: string;
  location: string;
  signer: string;
}

export interface DynamicAsset {
  id: string;
  owner: string;
  creator: string;
  creation_timestamp_ms: number;
  name: string;
  description: string;
  current_state: string;
  quantity: number;
  unit: string;
  history: string[];
}

export interface CreateHarvestRequest {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  signer: string;
}

export interface TransferAssetRequest {
  asset_id: string;
  issuer_entity_id: string;
  recipient_address: string;
  invoice_amount: number;
  invoice_due_date_ms: number;
  signer: string;
}

export interface ApplyProcessRequest {
  asset_id: string;
  processor_entity_id: string;
  process_name: string;
  new_state: string;
  notes: string;
  signer: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  transactionDigest?: string;
}