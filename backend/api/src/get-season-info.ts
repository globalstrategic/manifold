import { APIHandler } from 'api/helpers/endpoint'
import { createSupabaseDirectClient } from 'shared/supabase/init'
import {
  getEffectiveCurrentSeason,
  getSeasonStartAndEnd,
} from 'shared/supabase/leagues'

export const getSeasonInfo: APIHandler<'get-season-info'> = async (props) => {
  const pg = createSupabaseDirectClient()
  try {
    const season = props.season ?? (await getEffectiveCurrentSeason())

    const boundaries = await getSeasonStartAndEnd(pg, season)
    if (!boundaries) {
      return { season: 1, startTime: Date.now(), endTime: null, status: 'active' as const }
    }

    const { seasonStart, seasonEnd, status } = boundaries
    let endTime: number | null = null
    if (status !== 'active') {
      endTime = seasonEnd
    }

    return { season, startTime: seasonStart, endTime, status }
  } catch (e) {
    return { season: 1, startTime: Date.now(), endTime: null, status: 'active' as const }
  }
}
