import { Col } from 'web/components/layout/col'
import { Page } from 'web/components/layout/page'
import {
  Leaderboard,
  LoadingLeaderboard,
  type LeaderboardColumn,
  type LeaderboardEntry,
} from 'web/components/leaderboard'
import { SEO } from 'web/components/SEO'
import { useAPIGetter } from 'web/hooks/use-api-getter'
import { formatMoney, formatWithCommas } from 'common/util/format'
import { useMemo } from 'react'

type UserEntry = LeaderboardEntry & {
  username: string
  profit: number
  numTrades: number
  numQuestions: number
  investedAmount: number
}

export default function UsersPage() {
  const { data: users, loading } = useAPIGetter('users', {
    limit: 500,
  })

  const entries: UserEntry[] = useMemo(() => {
    if (!users) return []
    return users.map((u) => {
      const investedAmount = u.investedAmount ?? 0
      return {
        userId: u.id,
        username: u.username,
        score: u.balance,
        profit: u.balance + investedAmount - u.totalDeposits,
        numTrades: u.numTrades ?? 0,
        numQuestions: u.numQuestions ?? 0,
        investedAmount,
      }
    })
  }, [users])

  const loadingColumns: LeaderboardColumn[] = [
    { header: 'Balance', renderCell: () => null },
    { header: 'Invested', renderCell: () => null },
    { header: 'Trades', renderCell: () => null },
    { header: 'Questions', renderCell: () => null },
    { header: 'Profit', renderCell: () => null },
  ]

  const columns: LeaderboardColumn<UserEntry>[] = [
    { header: 'Balance', renderCell: (e) => formatMoney(e.score) },
    { header: 'Invested', renderCell: (e) => formatMoney(e.investedAmount) },
    { header: 'Trades', renderCell: (e) => formatWithCommas(e.numTrades) },
    {
      header: 'Questions',
      renderCell: (e) => formatWithCommas(e.numQuestions),
    },
    {
      header: 'Profit',
      renderCell: (e) => formatMoney(e.profit),
    },
  ]

  return (
    <Page trackPageView={'users'}>
      <SEO title="Users" description="All users on Manifold" url="/users" />

      <Col className="mx-auto w-full max-w-2xl gap-6 px-4 pb-8 pt-4">
        <Col className="gap-1">
          <h1 className="text-primary-700 text-2xl font-semibold">Users</h1>
          <p className="text-ink-500 text-sm">
            All users with their balance and profit
          </p>
        </Col>

        <div className="bg-canvas-0 border-ink-200 overflow-hidden rounded-lg border">
          {loading ? (
            <LoadingLeaderboard columns={loadingColumns} />
          ) : (
            <Leaderboard
              entries={entries}
              columns={columns}
              getRowHref={(e) => `/${e.username}`}
            />
          )}
        </div>
      </Col>
    </Page>
  )
}
