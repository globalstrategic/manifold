import { getIp } from 'shared/analytics'
import { APIHandler } from './helpers/endpoint'
import { createUserMain } from 'shared/create-user-main'

export const createuser: APIHandler<'createuser'> = async (
  props,
  auth,
  req
) => {
  const host = req.get('referer')
  const ip = getIp(req)
  const decodedToken =
    auth.creds.kind === 'jwt' ? auth.creds.data : undefined
  return createUserMain(props, auth.uid, ip, host, decodedToken)
}
