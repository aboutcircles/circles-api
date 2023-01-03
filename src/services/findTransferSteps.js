import findTransferSteps from '@circles/transfer';
import { performance } from 'perf_hooks';

import { EDGES_FILE_PATH, PATHFINDER_FILE_PATH } from '../constants';

const DEFAULT_PROCESS_TIMEOUT = 1000 * 200;
const FLAG = '--csv';
const HOPS = 15;
export default async function transferSteps({ from, to, value, hops }) {
  if (from === to) {
    throw new Error('Cannot send to yourself');
  }
  const startTime = performance.now();

  const timeout = process.env.TRANSFER_STEPS_TIMEOUT
    ? parseInt(process.env.TRANSFER_STEPS_TIMEOUT, 10)
    : DEFAULT_PROCESS_TIMEOUT;
  if (hops === null) {
    hops = HOPS;
  }
  const result = await findTransferSteps(
    {
      from,
      to,
      value,
      hops,
    },
    {
      edgesFile: EDGES_FILE_PATH,
      pathfinderExecutable: PATHFINDER_FILE_PATH,
      flag: FLAG,
      timeout,
    },
  );

  const endTime = performance.now();

  return {
    from,
    to,
    maxFlowValue: result.maxFlowValue,
    processDuration: Math.round(endTime - startTime),
    transferValue: value,
    transferSteps: result.transferSteps.map(({ token, ...step }) => {
      return {
        ...step,
        tokenOwnerAddress: token,
      };
    }),
  };
}
