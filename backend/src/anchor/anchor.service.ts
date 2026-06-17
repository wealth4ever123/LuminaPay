import { Injectable } from '@nestjs/common';
import axios from 'axios';

// SEP-12 KYC field stubs aligned with MoneyGram/Cowrie
export interface Sep12RegisterDto {
  account: string;
  first_name: string;
  last_name: string;
  email_address: string;
  bank_account_number: string;
  bank_number: string;
  mobile_number: string;
}

export interface Sep6DepositDto {
  asset_code: string;
  account: string;
  amount: string;
  memo?: string;
}

export interface Sep6WithdrawDto {
  asset_code: string;
  account: string;
  amount: string;
  dest: string;       // bank account
  dest_extra?: string; // sort code / routing
}

@Injectable()
export class AnchorService {
  // In production, forward to real anchor's SEP-12 endpoint
  async register(dto: Sep12RegisterDto) {
    return {
      id: `kyc_${Date.now()}`,
      status: 'PENDING',
      message: 'KYC submitted. Verification in progress.',
      fields: dto,
    };
  }

  async deposit(dto: Sep6DepositDto) {
    return {
      how: `Send ${dto.amount} ${dto.asset_code} to memo ${dto.memo ?? 'N/A'}`,
      fee_fixed: '0',
      fee_percent: '0',
      min_amount: '1',
      max_amount: '50000',
      extra_info: { message: 'LuminaPay zero-fee deposit' },
    };
  }

  async withdraw(dto: Sep6WithdrawDto) {
    return {
      account_id: 'GCKFBEIYTKP5RDBQBZDJCBYWLAXZWZ4RVTAAS5YNPXQZQZQZQZQZQZQ',
      memo_type: 'text',
      memo: `LPW_${Date.now()}`,
      fee_fixed: '0',
      fee_percent: '0',
      min_amount: '1',
      max_amount: '50000',
    };
  }
}
