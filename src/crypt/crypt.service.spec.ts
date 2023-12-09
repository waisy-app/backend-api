import {CryptService} from './crypt.service'
import * as bcrypt from 'bcrypt'

describe(CryptService.name, () => {
  let cryptService: CryptService
  const password: string = 'password123'
  const hashedPassword: string = bcrypt.hashSync(password, 10)

  beforeEach(() => {
    cryptService = new CryptService()
  })

  it('Successfully Hashes Password', async () => {
    const hashedText: string = await cryptService.hashText(password)
    expect(await bcrypt.compare(password, hashedText)).toBe(true)
  })

  it('Successfully Compares Password with Hashed Password', async () => {
    expect(await cryptService.compareHash(password, hashedPassword)).toBe(true)
  })

  it('Successfully Detects Wrong Password on Comparison with Hashed Password', async () => {
    expect(await cryptService.compareHash('wrongpassword123', hashedPassword)).toBe(false)
  })
})
