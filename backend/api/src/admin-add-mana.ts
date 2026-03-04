import { APIError, APIHandler } from './helpers/endpoint'
import { throwErrorIfNotAdmin } from 'shared/helpers/auth'
import { createSupabaseDirectClient } from 'shared/supabase/init'
import { runTxnFromBank } from 'shared/txn/run-txn'
import { SignupBonusTxn } from 'common/txn'

export const adminAddMana: APIHandler<'admin-add-mana'> = async (
  body,
  auth
) => {
  throwErrorIfNotAdmin(auth.uid)

  const { userId, username, amount } = body

  if (!userId && !username) {
    throw new APIError(400, 'Must provide userId or username')
  }

  const pg = createSupabaseDirectClient()

  const user = userId
    ? await pg.oneOrNone(`select id from users where id = $1`, [userId])
    : await pg.oneOrNone(`select id from users where username ilike $1`, [
        username,
      ])
  if (!user) {
    throw new APIError(404, 'User not found')
  }

  await pg.tx(async (tx) => {
    const txn: Omit<SignupBonusTxn, 'id' | 'createdTime' | 'fromId'> = {
      fromType: 'BANK',
      toId: user.id,
      toType: 'USER',
      amount,
      token: 'M$',
      category: 'SIGNUP_BONUS',
      description: 'Admin mana grant',
    }
    await runTxnFromBank(tx, txn)
  })

  return { success: true }
}
