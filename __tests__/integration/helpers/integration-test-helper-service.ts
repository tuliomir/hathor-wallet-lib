/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from 'axios';
import HathorWallet from '../../../src/new/wallet';
import HathorWalletServiceWallet from '../../../src/wallet/wallet';
import { TxNotFoundError } from '../../../src/errors';
import { OutputValueType } from '../../../src/types';
// XXX: Circular dependency — wallet.helper.ts imports getSimpleWallet from this file,
// and we import waitForTxReceived/waitUntilNextTimestamp from wallet.helper.ts.
// This works at runtime because neither module uses the other's exports at the top level,
// but it should be resolved by extracting the wait helpers into a dedicated module
// (e.g., tx-utils.helper.ts) that both files can import without cycles.
import { waitForTxReceived, waitUntilNextTimestamp } from './wallet.helper';
import { delay } from '../utils/core.util';
import { loggers } from '../utils/logger.util';

const TEST_HELPER_URL = process.env.TEST_HELPER_URL || 'http://localhost:3020';

interface SimpleWalletData {
  words: string;
  addresses: string[];
}

interface FundResult {
  txId: string;
  amount: OutputValueType;
  utxoSource: string;
}

export async function getSimpleWallet(): Promise<SimpleWalletData> {
  const response = await axios.get(`${TEST_HELPER_URL}/simpleWallet`);
  const { words, addresses } = response.data;
  return { words, addresses };
}

/**
 * Polls a wallet-service wallet for a transaction by its ID until found or max attempts reached.
 *
 * @param wallet - The wallet-service wallet instance to poll
 * @param txId - The transaction ID to look for
 * @returns The transaction object if found
 * @throws Error if the transaction is not found after max attempts
 */
async function pollWalletServiceForTx(wallet: HathorWalletServiceWallet, txId: string) {
  const maxAttempts = 10;
  const delayMs = 150;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const tx = await wallet.getTxById(txId);
      if (tx) {
        loggers.test!.log(`Polling wallet-service for ${txId} took ${attempts + 1} attempts`);
        return tx;
      }
    } catch (error) {
      if (!(error instanceof TxNotFoundError)) {
        throw error;
      }
    }
    attempts++;
    await delay(delayMs);
  }
  throw new Error(`Transaction ${txId} not found on wallet-service after ${maxAttempts} attempts`);
}

/**
 * Sends HTR funds to an address using the test helper service, then waits
 * for the destination wallet to process the transaction.
 *
 * Supports both fullnode wallets (HathorWallet) and wallet-service wallets
 * (HathorWalletServiceWallet). The waiting strategy differs per wallet type:
 * - HathorWallet: polls local storage via waitForTxReceived
 * - HathorWalletServiceWallet: polls the wallet-service API via getTxById
 *
 * @param destinationWallet - Wallet that owns the receiving address
 * @param address - Address to receive the funds
 * @param value - Amount of HTR to send ( defaults to 1000 HTR )
 * @param [options]
 * @param [options.waitTimeout] - Timeout in ms for waiting on tx receipt.
 *                                Set to 0 to skip waiting entirely.
 */
export async function fundAddress(
  destinationWallet?: HathorWallet | HathorWalletServiceWallet,
  // @ts-expect-error Keeping backward compatibility with existing calls
  address: string,
  value: OutputValueType,
  options?: { waitTimeout?: number }
): Promise<FundResult & { hash: string }> {
  const response = await axios.post(`${TEST_HELPER_URL}/fund`, {
    address,
    amount: Number(value),
  });
  const { txId, amount, utxoSource } = response.data;
  const result: FundResult & { hash: string } = { txId, amount, utxoSource, hash: txId };

  if (options?.waitTimeout === 0) {
    return result;
  }

  // On rare occasions the destination wallet will not be available.
  // It will be the caller responsibility to wait for the transaction
  if (destinationWallet) {
    if (destinationWallet instanceof HathorWalletServiceWallet) {
      await pollWalletServiceForTx(destinationWallet, txId);
    } else {
      await waitForTxReceived(destinationWallet, txId, options?.waitTimeout);
      await waitUntilNextTimestamp(destinationWallet, txId);
    }
  }

  return result;
}
