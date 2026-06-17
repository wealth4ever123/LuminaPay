import { Injectable, BadRequestException } from '@nestjs/common';
import {
  Keypair,
  Asset,
  Operation,
  TransactionBuilder,
  Networks,
  Horizon,
} from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '../stellar.config';

export interface RemitDto {
  senderKeypair: string; // secret key
  destAddress: string;
  sendAsset: { code: string; issuer?: string };
  destAsset: { code: string; issuer?: string };
  amount: string;
}

@Injectable()
export class RemitService {
  private server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);

  private toAsset(a: { code: string; issuer?: string }): Asset {
    return a.code === 'XLM' ? Asset.native() : new Asset(a.code, a.issuer!);
  }

  async remit(dto: RemitDto) {
    const keypair = Keypair.fromSecret(dto.senderKeypair);
    const account = await this.server.loadAccount(keypair.publicKey());

    const sendAsset = this.toAsset(dto.sendAsset);
    const destAsset = this.toAsset(dto.destAsset);

    // Apply 0.5% slippage: destMin = amount * 0.995
    const destMin = (parseFloat(dto.amount) * 0.995).toFixed(7);

    // Fetch best path
    const paths = await this.server
      .strictSendPaths(sendAsset, dto.amount, [destAsset])
      .call();

    if (!paths.records.length) throw new BadRequestException('No path found');

    const best = paths.records[0];

    const tx = new TransactionBuilder(account, {
      fee: '0', // zero-fee
      networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    })
      .addOperation(
        Operation.pathPaymentStrictSend({
          sendAsset,
          sendAmount: dto.amount,
          destination: dto.destAddress,
          destAsset,
          destMin,
          path: best.path.map((p) => this.toAsset(p as any)),
        }),
      )
      .setTimeout(30)
      .build();

    tx.sign(keypair);
    const result = await this.server.submitTransaction(tx);
    return { hash: result.hash, ledger: result.ledger };
  }
}
