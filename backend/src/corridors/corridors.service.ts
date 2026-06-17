import { Injectable } from '@nestjs/common';
import { Asset, Horizon } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '../stellar.config';

const USDC = new Asset('USDC', STELLAR_CONFIG.usdcIssuer);

// Corridor assets — replace ANCHOR_ISSUER with real anchor addresses (e.g. Cowrie/Flutterwave SEP-24)
const ANCHOR_ISSUER = process.env.ANCHOR_ISSUER ?? 'GDZ2TZ2OG7HIGXMHCV7KET5MCLB2VAZ22VZOSCNUHUTOX3P7XYBY5RCR';
const CORRIDORS = [
  { code: 'NGNC', issuer: ANCHOR_ISSUER, label: 'NGN' },
  { code: 'GHSC', issuer: ANCHOR_ISSUER, label: 'GHS' },
  { code: 'KESC', issuer: ANCHOR_ISSUER, label: 'KES' },
  { code: 'ZARC', issuer: ANCHOR_ISSUER, label: 'ZAR' },
];

@Injectable()
export class CorridorsService {
  private server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);

  async getCorridors(sendAmount = '10') {
    const results = await Promise.allSettled(
      CORRIDORS.map(async (c) => {
        const destAsset = new Asset(c.code, c.issuer);
        const paths = await this.server
          .strictSendPaths(USDC, sendAmount, [destAsset])
          .call();
        return {
          corridor: `USDC→${c.label}`,
          destAsset: c.code,
          bestRate: paths.records[0]?.destination_amount ?? null,
          paths: paths.records.slice(0, 3),
        };
      }),
    );

    return results.map((r) => (r.status === 'fulfilled' ? r.value : { error: (r as any).reason?.message }));
  }
}
