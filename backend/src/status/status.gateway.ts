import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Horizon } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '../stellar.config';

@WebSocketGateway({ cors: true, namespace: '/status' })
export class StatusGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private horizon = new Horizon.Server(STELLAR_CONFIG.horizonUrl);

  handleConnection(client: Socket) {
    console.log(`WS connected: ${client.id}`);
  }

  @SubscribeMessage('watch')
  async watchTx(@MessageBody() txHash: string) {
    try {
      // Poll Horizon for transaction status
      const tx = await this.horizon.transactions().transaction(txHash).call();
      this.server.emit(`tx:${txHash}`, {
        hash: txHash,
        successful: tx.successful,
        ledger: tx.ledger,
        created_at: tx.created_at,
        status: tx.successful ? 'SUCCESS' : 'FAILED',
      });
    } catch (err: any) {
      this.server.emit(`tx:${txHash}`, {
        hash: txHash,
        status: 'NOT_FOUND',
        error: err.message,
      });
    }
  }
}
