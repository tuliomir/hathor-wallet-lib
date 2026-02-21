/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from 'axios';
import HathorWallet from '../../../src/new/wallet';
import { OutputValueType } from '../../../src/types';
// XXX: Circular dependency — wallet.helper.ts imports getSimpleWallet from this file,
// and we import waitForTxReceived/waitUntilNextTimestamp from wallet.helper.ts.
// This works at runtime because neither module uses the other's exports at the top level,
// but it should be resolved by extracting the wait helpers into a dedicated module
// (e.g., tx-utils.helper.ts) that both files can import without cycles.
import { waitForTxReceived, waitUntilNextTimestamp } from './wallet.helper';

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
 * Sends HTR funds to an address using the test helper service, then waits
 * for the destination wallet to process the transaction.
 *
 * @param destinationWallet - Wallet that owns the receiving address
 * @param address - Address to receive the funds
 * @param value - Amount of HTR to send ( defaults to 1000 HTR )
 * @param [options]
 * @param [options.waitTimeout] - Timeout in ms for waiting on tx receipt.
 *                                Set to 0 to skip waiting entirely.
 */
export async function fundAddress(
  destinationWallet: HathorWallet,
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

  await waitForTxReceived(destinationWallet, txId, options?.waitTimeout);
  await waitUntilNextTimestamp(destinationWallet, txId);

  return result;
}
