/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from 'axios';

const TEST_HELPER_URL = process.env.TEST_HELPER_URL || 'http://localhost:3020';

interface SimpleWalletData {
  words: string;
  addresses: string[];
}

export async function getSimpleWallet(): Promise<SimpleWalletData> {
  const response = await axios.get(`${TEST_HELPER_URL}/simpleWallet`);
  const { words, addresses } = response.data;
  return { words, addresses };
}
