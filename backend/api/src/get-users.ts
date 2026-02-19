import { toUserAPIResponse } from 'common/api/user-types'
import { convertUser } from 'common/supabase/users'
import { createSupabaseDirectClient } from 'shared/supabase/init'
import {
  from,
  limit as limitClause,
  orderBy,
  renderSql,
  select,
  where,
} from 'shared/supabase/sql-builder'
import { APIError, type APIHandler } from './helpers/endpoint'

export const getUsers: APIHandler<'users'> = async ({
  limit,
  before,
  order,
}) => {
  const pg = createSupabaseDirectClient()

  const q = [
    select('*'),
    from('users'),
    orderBy('created_time ' + order),
    limitClause(limit),
  ]

  if (before) {
    const beforeUser = await pg.oneOrNone(
      `select created_time from users where id = $1`,
      [before]
    )
    if (!beforeUser)
      throw new APIError(404, `Could not find user with id: ${before}`)

    q.push(where('created_time < $1', beforeUser.created_time))
  }

  const users = await pg.map(renderSql(q), [], (r) =>
    toUserAPIResponse(convertUser(r))
  )

  const userIds = users.map((u) => u.id)
  if (userIds.length === 0) return users

  const [tradeCounts, questionCounts, portfolios] = await Promise.all([
    pg.map(
      `select user_id, count(*)::int as n from contract_bets where user_id = any($1) group by user_id`,
      [userIds],
      (r: { user_id: string; n: number }) => r
    ),
    pg.map(
      `select creator_id, count(*)::int as n from contracts where creator_id = any($1) group by creator_id`,
      [userIds],
      (r: { creator_id: string; n: number }) => r
    ),
    pg.map(
      `select distinct on (user_id) user_id, investment_value
       from user_portfolio_history
       where user_id = any($1)
       order by user_id, ts desc`,
      [userIds],
      (r: { user_id: string; investment_value: number }) => r
    ),
  ])

  const tradesByUser = new Map(tradeCounts.map((r) => [r.user_id, r.n]))
  const questionsByUser = new Map(
    questionCounts.map((r) => [r.creator_id, r.n])
  )
  const investedByUser = new Map(
    portfolios.map((r) => [r.user_id, r.investment_value])
  )

  return users.map((u) => ({
    ...u,
    numTrades: tradesByUser.get(u.id) ?? 0,
    numQuestions: questionsByUser.get(u.id) ?? 0,
    investedAmount: investedByUser.get(u.id) ?? 0,
  }))
}
