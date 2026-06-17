export const STELLAR_CONFIG = {
  testnet: {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
  },
  mainnet: {
    horizonUrl: 'https://horizon.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  },
  // USDC issued by Centre (centre.io)
  usdcIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  get horizonUrl() {
    return process.env.HORIZON_URL ?? this.testnet.horizonUrl;
  },
  get networkPassphrase() {
    return process.env.NETWORK_PASSPHRASE ?? this.testnet.networkPassphrase;
  },
};
