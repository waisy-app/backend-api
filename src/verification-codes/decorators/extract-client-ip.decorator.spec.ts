import * as requestIp from 'request-ip'
import {GqlExecutionContext} from '@nestjs/graphql'
import {ClientIPType, extractClientIpFromContext} from './extract-client-ip.decorator'
import mocked = jest.mocked

jest.mock('request-ip', () => ({
  getClientIp: jest.fn(),
}))

describe('extractClientIpFromContext function', () => {
  it('should correctly extract client IP from the given context', () => {
    const reqMock = {req: 'mock request'}
    const ctxMock = {getContext: () => reqMock} as unknown as GqlExecutionContext
    const expectedClientIp: ClientIPType = '192.168.0.1'
    mocked(requestIp.getClientIp).mockReturnValue(expectedClientIp)

    const clientIp = extractClientIpFromContext(ctxMock)

    expect(requestIp.getClientIp).toBeCalledWith('mock request')
    expect(clientIp).toBe(expectedClientIp)
  })
})
