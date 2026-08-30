const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token)
    return res.status(401).json({ errors: { email: ['Authentication required'] } })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)

    return next()
  }
  catch {
    return res.status(401).json({ errors: { email: ['Invalid or expired token'] } })
  }
}

// 관리자 전용 라우트 가드. requireAuth 다음에 사용합니다.
// role 은 JWT 에 서명되어 들어있으므로 클라이언트가 위조할 수 없습니다.
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ errors: { username: ['관리자 권한이 필요합니다'] } })

  return next()
}

module.exports = { requireAuth, requireAdmin }
