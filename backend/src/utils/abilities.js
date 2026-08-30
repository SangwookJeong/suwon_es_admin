// 기존 @fake-db/jwt 목업과 동일한 role -> CASL abilities 매핑
const ABILITIES_BY_ROLE = {
  admin: [{ action: 'manage', subject: 'all' }],
  client: [
    { action: 'read', subject: 'Auth' },
    { action: 'read', subject: 'AclDemo' },
  ],
}

function abilitiesForRole(role) {
  return ABILITIES_BY_ROLE[role] || ABILITIES_BY_ROLE.client
}

module.exports = { abilitiesForRole }
