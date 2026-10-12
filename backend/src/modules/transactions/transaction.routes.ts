import {
  Router,
} from "express";

import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
} from "./transaction.controller.js";


const router =
  Router();


// =====================================================
// GET ALL TRANSACTIONS
// =====================================================

router.get(
  "/",
  getAllTransactions
);


// =====================================================
// GET SINGLE TRANSACTION
// =====================================================

router.get(
  "/:transactionId",
  getTransactionById
);


// =====================================================
// CREATE + ANALYZE TRANSACTION
// =====================================================

router.post(
  "/",
  createTransaction
);


export default router;