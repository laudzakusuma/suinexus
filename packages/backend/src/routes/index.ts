import { Router } from 'express';
import * as entityController from '../controllers/entityController';
import * as assetController from '../controllers/assetController';

const router = Router();

router.get('/entities/owner/:address', entityController.getEntitiesByOwner);
router.get('/entities/:id', entityController.getEntityById);
router.post('/entities/build-transaction', entityController.buildCreateEntityTransaction);

router.get('/assets/owner/:address', assetController.getAssetsByOwner);
router.get('/assets/:id', assetController.getAssetById);
router.post('/assets/harvest/build-transaction', assetController.buildCreateHarvestTransaction);
router.post('/assets/transfer/build-transaction', assetController.buildTransferAssetTransaction);
router.post('/assets/process/build-transaction', assetController.buildApplyProcessTransaction);

router.get('/invoices/beneficiary/:address', assetController.getInvoicesByBeneficiary);

export default router;