# SimpleToken.sol Security Review
___
## Summary
| Id | Description | Severity |
|----|-------------|-----|
| 1  | No zero-address check for the transfer function | High |
| 2  | Allowance race condition in `approve()` | High |
| 3  | Token can be launched with zero total supply without a possibility to mint | Medium |
| 4  | No zero-address check in `approve()` | Low |
| 5  | Contract not implementing standard ERC20 interface | Low |
| 6  | Possibly redundant returns of booleans in token methods | Informational |
| 7  | Mutable variables for fixed state metadata | Informational |

## Findings

#### 1. No zero-address check for the transfer function.
**Severity: High**

**Description:** 
`transfer()` and `transferFrom()` functions do not enforce zero-address check on the `to` address param, allowing token burns on transfer.
User error could also lead to the token burn, instead of transfer. Since the case of zero-address was not considered in the code,
transfers to zero-address would cause the total amount of token to decrease, while keeping the `totalSupply` unchanged, which would lead to errors in token accounting.

**Recommendation:**
Require non-zero `to` address in both functions. If a burn feature is desired, implement a separate `burn()` function that explicitly handles token burning and updates `totalSupply` accordingly.
___

#### 2. Allowance race condition in `approve()`.
**Severity: High**

**Description:**
The `approve()` function overrides previous values instead of incrementing/decrementing allowances, which can lead to the approval race condition
where a spender can use the old allowance before the state change is mined to get access to the next allowance after.

**Recommendation:**
Implement `increaseAllowance()` and `decreaseAllowance()` functions to safely and granularly manage allowances or change the `approve()` function
to dynamically increment/decrement allowances instead of setting them to a specific value.
___

#### 3. Token can be launched with zero total supply without a possibility to mint.
**Severity: Medium**

**Description:**
Token constructor does not enforce any checks on the initial total supply, allowing the token to be launched with zero total supply.
Since there is no minting function in the contract or any other way to mint, this would make the token unusable.

**Recommendation:**
Require the `_initialSupply` parameter in the constructor to not be 0 as a minimum. Additionally, some rules for potential amount ranges could be enforced if needed.
Alternatively, hardcode a specific supply amount into the contract, if contract is to be used for a single token on chain.
___

#### 4. No zero-address check in `approve()`.
**Severity: Low**

**Description:**
The `approve()` function does not enforce a zero-address check on the `spender` address param, allowing approvals to the zero-address,
which could lead to unintended consequences if the zero-address is used. This could also lead to problems with tooling and some applications.

**Recommendation:**
Require `spender` in `approve()` to be a non-zero address.
___

#### 5. Contract not implementing standard ERC20 interface.
**Severity: Low**

**Description:**
`SimpleToken.sol` does not implement the official ERC20 standard interface, which could lead to compatibility issues with wallets, exchanges, and other tools that expect ERC20 compliance.
Furthermore, many of the above issues would not be present since inheritance of standard contracts and solc would enforce proper usage of existing solutiions to the problems described above.

**Recommendation:**
Implement the IERC20 standard interface and follow the ERC20 specification to ensure compatibility and security best practices.
This includes implementing all required functions and events, as well as adhering to the expected behavior of those functions.
___

### Informational & Best Practices

#### 6. Possibly redundant returns of booleans in token methods.
**Description:**
Returning hardcoded values of `true` in `transfer()`, `transferFrom()`, and `approve()` is redundant since the functions will and should revert on failure.
Return values from these functions will always be the same (hardcoded), which makes specific checks of these return values redundant as well.
There have been problems in the past with existing tokens that have this code pattern, which could cause the need for this token to be wrapped to be used in certain apps.

**Recommendation:**
Remove the return values from these functions and ensure that they revert on failure.
___

#### 7. Mutable variables for fixed state metadata.
**Description:**
Contract declares state metadata variables such as `name`, `symbol`, and `decimals` as mutable even though they have no setters
and are never changed by any functions in the contract, making them constants in the real world, which could lead to confusion.

**Recommendation:**
These variables could be declared as "constant" or "immutable" to better reflect their intended usage and to save gas on reads.
