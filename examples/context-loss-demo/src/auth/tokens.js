export function isExpiredToken(token) {
  const expiresAt = Number(token.expiresAt)

  if (!Number.isFinite(expiresAt)) {
    return true
  }

  return expiresAt <= Date.now()
}
