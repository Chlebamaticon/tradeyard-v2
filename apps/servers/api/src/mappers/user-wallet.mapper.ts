import { UserWalletDto } from '@tradeyard-v2/api-dtos';
import { UserWalletViewEntity } from '@tradeyard-v2/server/database';

export function mapToUserWalletDto(
  wallet: UserWalletViewEntity
): UserWalletDto {
  return {
    user_wallet_id: wallet.user_wallet_id,
    user_id: wallet.user_id,
    type: wallet.type as 'turnkey' | 'custodial',
    address: wallet.address,
    created_at: wallet.created_at.toISOString(),
    sub_organization_id: wallet.sub_organization_id ?? '',
    chain: wallet.chain,
  };
}
