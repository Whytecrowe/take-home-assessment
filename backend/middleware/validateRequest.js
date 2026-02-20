/**
 * Validation middleware utilities.
 * Candidates may extend these for POST /api/projects and other endpoints.
 */

const VALID_STATUSES = ['active', 'in-progress', 'archived'];

function validateProjectBody(req, res, next) {
  const { name, chain, status } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string') {
    errors.push('name is required and must be a string');
  }
  if (!chain || typeof chain !== 'string') {
    errors.push('chain is required and must be a string');
  }
  if (status && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
}

function isValidEthAddress(address) {
  let valid = typeof address === 'string';

  // checksum enforcement seems unnecessary here,
  // so I decided to not install another package just for a single function call
  // if we wanted it, we could use `ethers.isAddress(addr)` or `viem.isAddress(addrs, {strict: true})`
  return valid && /^0x[0-9a-fA-F]{40}$/.test(address);
}

module.exports = {
  validateProjectBody,
  isValidEthAddress,
  VALID_STATUSES,
};
