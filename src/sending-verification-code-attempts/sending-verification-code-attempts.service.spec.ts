import {Test, TestingModule} from '@nestjs/testing'
import {SendingVerificationCodeAttemptsService} from './sending-verification-code-attempts.service'

describe('SendingVerificationCodeAttemptsService', () => {
  let service: SendingVerificationCodeAttemptsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendingVerificationCodeAttemptsService],
    }).compile()

    service = module.get<SendingVerificationCodeAttemptsService>(
      SendingVerificationCodeAttemptsService,
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
