const express = require('express');
const walletController = require('../controllers/walletController');

const router = express.Router();

router.get('/', walletController.listWallets);
router.get('/:address/transactions', walletController.listTransactionsByWallet);

module.exports = router;
