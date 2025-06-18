import { getValidToken } from '../lib/auth'

jest.mock('../lib/prisma', () => {
  const tenantSecretUpsert = jest.fn()
  const accountUpdate = jest.fn()
  const accountFindFirst = jest.fn()
  return {
    prisma: {
      account: {
        findFirst: accountFindFirst,
        update: accountUpdate,
      },
      tenantSecret: {
        upsert: tenantSecretUpsert,
      },
    },
    __mocks: { tenantSecretUpsert, accountFindFirst, accountUpdate },
  }
})

// Mock axios for token refresh
jest.mock('axios', () => ({
  default: {
    post: jest.fn(() => Promise.resolve({ data: { access_token: 'new', refresh_token: 'newref', expires_in: 3600 } }))
  }
}))

const { prisma: prismaMock, __mocks } = require('../lib/prisma')

describe('getValidToken', () => {
  it('syncs TenantSecret on token refresh', async () => {
    __mocks.accountFindFirst.mockResolvedValueOnce({
      id: 'acc1',
      userId: 'user1',
      provider: 'oauth',
      access_token: 'old',
      refresh_token: 'refresh',
      expires_at: Math.floor(Date.now() / 1000) - 60, // expired
      locationId: 'loc',
    })

    await getValidToken('user1')

    expect(__mocks.tenantSecretUpsert).toHaveBeenCalled()
  })
}) 