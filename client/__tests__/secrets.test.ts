// @ts-nocheck
/** @jest-environment node */

const findUnique = jest.fn()

jest.mock('../../backend/src/prisma', () => ({
  prisma: {
    tenantSecret: {
      findUnique,
    },
  },
}))

import { getTenantSecrets } from '../../backend/src/secrets'

describe('getTenantSecrets', () => {
  afterEach(() => {
    jest.resetAllMocks()
    delete process.env.NODE_ENV
  })

  it('returns stored credentials when row exists', async () => {
    findUnique.mockResolvedValueOnce({
      accessToken: 'real-token',
      locationId: 'loc-xyz',
    })

    const secret = await getTenantSecrets('tenant-123')
    expect(secret).toEqual({ accessToken: 'real-token', locationId: 'loc-xyz' })
  })

  it('throws when tenant not found in production', async () => {
    findUnique.mockResolvedValueOnce(null)
    process.env.NODE_ENV = 'production'

    await expect(getTenantSecrets('missing')).rejects.toThrow('TenantSecret not found')
  })

  it('returns stub credentials when tenant missing in development', async () => {
    findUnique.mockResolvedValueOnce(null)
    process.env.NODE_ENV = 'development'

    const secret = await getTenantSecrets('missing-dev')
    expect(secret).toEqual({ accessToken: 'stub-token', locationId: 'stub-loc' })
  })
}) 