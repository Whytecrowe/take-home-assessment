const { getWallets, getWalletsByAddress, getTransactions} = require('../config/store');
const { isValidEthAddress } = require('../middleware/validateRequest');

/**
 * List all wallet balances.
 * Query params: address (filter by address), chainId
 */
function listWallets(req, res, next) {
  try {
    let wallets = getWallets();
    const { address, chainId } = req.query;

    if (address) {
      wallets = getWalletsByAddress(address);
    }

    if (chainId) {
      wallets = wallets.filter((w) => String(w.chainId) === String(chainId));
    }

    res.json({ success: true, data: wallets, count: wallets.length });
  } catch (err) {
    next(err);
  }
}

/**
 * List transactions for a specific wallet address.
 * Query params: address, chainId (optional), limit (optional, max 100)
 */
function listTransactionsByWallet(req, res, next) {
  try {
    const { address } = req.params;
    const { chainId, limit } = req.query;

    if (!isValidEthAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address',
      });
    }

    const knownWallets = getWalletsByAddress(address);
    if (!knownWallets || knownWallets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found',
        address,
      });
    }

    let txs = getTransactions().filter(
      (t) => {
        const fromLc = String(t.from || '').toLowerCase();
        const toLc = String(t.to || '').toLowerCase();
        const addrLc = address.toLowerCase();
        const matches = fromLc === addrLc || toLc === addrLc;

        if (!matches) return false;

        // if chainId is present and doesn't match, the address could be from another chain
        return !(chainId && String(t.chainId) !== String(chainId));
      }
    );

    const max = Math.min(parseInt(limit, 10) || txs.length, 100);
    txs = txs.slice(0, max);

    return res.json({ success: true, data: txs, count: txs.length });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listWallets,
  listTransactionsByWallet,
};
