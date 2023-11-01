import {Test, TestingModule} from '@nestjs/testing'
import {CryptService} from './crypt.service'
import {ConfigModule} from '../config/config.module'

describe(CryptService.name, () => {
  let cryptService: CryptService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptService],
      imports: [ConfigModule],
    }).compile()

    cryptService = module.get(CryptService)
  })

  describe(CryptService.prototype.hashText.name, () => {
    it('should return a hash', async () => {
      const text = 'test'
      const hash = await cryptService.hashText(text)
      expect(hash).toStrictEqual(expect.any(String))
    })
  })

  describe(CryptService.prototype.compareHash.name, () => {
    const text = 'test'
    let hash: string

    beforeEach(async () => {
      hash = await cryptService.hashText(text)
    })

    it('should return true if the text matches the hash', async () => {
      const result = await cryptService.compareHash(text, hash)
      expect(result).toBe(true)
    })

    it('should return false if the text does not match the hash', async () => {
      const result = await cryptService.compareHash('test2', hash)
      expect(result).toBe(false)
    })
  })
})
