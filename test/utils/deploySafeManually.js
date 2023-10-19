import core from './core';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
// Set up manually a Safe for being fully usable in Circles
export default async function deploySafe({ account, nonce }) {
  const {
    contracts: { safeMaster, proxyFactory },
    options: { fallbackHandlerAddress, proxyFactoryAddress, safeMasterAddress },
    safe,
    utils,
  } = core;
  const safeAddress = await safe.predictAddress(account, { nonce });

  // Deploy manually a Safe bypassing the 3 trust connections check
  return safeMaster.populateTransaction
    .setup(
      [account.address],
      1,
      ZERO_ADDRESS,
      '0x',
      fallbackHandlerAddress,
      ZERO_ADDRESS,
      0,
      ZERO_ADDRESS,
    )
    .then(({ data }) =>
      proxyFactory.populateTransaction.createProxyWithNonce(
        safeMasterAddress,
        data,
        nonce,
      ),
    )
    .then(({ data }) =>
      utils.sendTransaction({
        target: proxyFactoryAddress,
        data,
      }),
    )
    .then(() => safeAddress);
}
