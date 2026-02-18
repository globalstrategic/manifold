import { APIError, APIHandler } from './helpers/endpoint'
import { createSupabaseDirectClient } from 'shared/supabase/init'
import { runTxnFromBank } from 'shared/txn/run-txn'

export const addFreeMana: APIHandler<'add-free-mana'> = async (
  { amount },
  auth
) => {
  if (process.env.SELF_HOSTED !== 'true') {
    throw new APIError(403, 'This endpoint is only available on self-hosted instances')
  }

  const pg = createSupabaseDirectClient()

  await pg.tx(async (tx) => {
    await runTxnFromBank(tx, {
      fromType: 'BANK',
      toId: auth.uid,
      toType: 'USER',
      amount,
      token: 'M$',
      category: 'MANA_PURCHASE',
      description: 'Free mana deposit',
    })
  })

}
