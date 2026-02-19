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
import { formatMoney } from 'common/util/format'
import { useMemo } from 'react'

type UserEntry = LeaderboardEntry & {
  username: string
  profit?: number
}

export default function UsersPage() {
  const { data: users, loading: usersLoading } = useAPIGetter('users', {
    limit: 500,
  })

  const { data: profitEntries, loading: profitLoading } = useAPIGetter(
    'leaderboard',
    { kind: 'profit' as const, limit: 100 }
  )

  const loading = usersLoading || profitLoading

  const entries: UserEntry[] = useMemo(() => {
    if (!users) return []
    const profitByUserId = new Map(
      (profitEntries ?? []).map((e) => [e.userId, e.score])
    )
    return users.map((u) => ({
      userId: u.id,
      username: u.username,
      score: u.balance,
      profit: profitByUserId.get(u.id),
    }))
  }, [users, profitEntries])

  const columns: LeaderboardColumn<UserEntry>[] = [
    { header: 'Balance', renderCell: (e) => formatMoney(e.score) },
    {
      header: 'Profit',
      renderCell: (e) =>
        formatMoney(e.profit ?? 0),
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
            <LoadingLeaderboard columns={columns} />
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
