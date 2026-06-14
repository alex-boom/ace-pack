import { isExpiredToken } from './tokens.js'

export function getSessionState(session) {
  if (!session || !session.userId || !session.accessToken) {
    return {
      reason: 'missing-session',
      status: 'anonymous',
    }
  }

  if (isExpiredToken(session.accessToken)) {
    return {
      reason: 'expired-token',
      status: 'expired',
      userId: session.userId,
    }
  }

  return {
    status: 'authenticated',
    userId: session.userId,
  }
}
