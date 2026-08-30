// Express 4 는 async 핸들러가 reject 되면 그것을 잡지 못합니다.
// 그러면 Node 가 unhandledRejection 으로 프로세스를 종료시켜서,
// DB 오류 한 번에 서버 전체가 죽고 진행 중이던 다른 요청까지 끊깁니다.
//
// 이 래퍼는 rejection 을 next(err) 로 넘겨 server.js 의 에러 핸들러가
// 500 을 응답하도록 만듭니다. (프로세스는 살아있습니다)
//
//   router.get('/', asyncHandler(async (req, res) => { ... }))
function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

module.exports = { asyncHandler }
