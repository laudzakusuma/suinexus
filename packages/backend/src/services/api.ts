import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export class ApiService {
  // Entities
  static async getEntitiesByOwner(address: string) {
    const response = await apiClient.get(`/entities/owner/${address}`);
    return response.data;
  }

  static async getEntityById(id: string) {
    const response = await apiClient.get(`/entities/${id}`);
    return response.data;
  }

  static async buildCreateEntityTransaction(data: {
    entity_type: string;
    name: string;
    location: string;
    signer: string;
  }) {
    const response = await apiClient.post('/entities/build-transaction', data);
    return response.data;
  }

  // Assets
  static async getAssetsByOwner(address: string) {
    const response = await apiClient.get(`/assets/owner/${address}`);
    return response.data;
  }

  static async getAssetById(id: string) {
    const response = await apiClient.get(`/assets/${id}`);
    return response.data;
  }

  static async buildCreateHarvestTransaction(data: {
    name: string;
    description: string;
    quantity: number;
    unit: string;
    signer: string;
  }) {
    const response = await apiClient.post('/assets/harvest/build-transaction', data);
    return response.data;
  }

  static async buildTransferAssetTransaction(data: {
    asset_id: string;
    issuer_entity_id: string;
    recipient_address: string;
    invoice_amount: number;
    invoice_due_date_ms: number;
    signer: string;
  }) {
    const response = await apiClient.post('/assets/transfer/build-transaction', data);
    return response.data;
  }

  static async buildApplyProcessTransaction(data: {
    asset_id: string;
    processor_entity_id: string;
    process_name: string;
    new_state: string;
    notes: string;
    signer: string;
  }) {
    const response = await apiClient.post('/assets/process/build-transaction', data);
    return response.data;
  }

  // Invoices
  static async getInvoicesByBeneficiary(address: string) {
    const response = await apiClient.get(`/invoices/beneficiary/${address}`);
    return response.data;
  }
}

export default ApiService;