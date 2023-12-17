import {CryptService} from './crypt.service'

describe(CryptService.name, () => {
  let cryptService: CryptService

  beforeEach(() => {
    cryptService = new CryptService()
  })

  it('Successfully Hashes Different Tokens', async () => {
    const token1 =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkY2VhNDc1MS04YzdiLTQyODUtYjAxYS1kYThlOTAxOTg4Y2UiLCJkZXZpY2VJbmZvIjoic2FuZGJveCIsImlhdCI6MTcwMjc0NDU2MSwiZXhwIjoxNzAzMzQ5MzYxfQ.7YOi7ECsPY9st91TdTkAgzfYq3SJ3I3VN8rRgLY9fsI'
    const token2 =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkY2VhNDc1MS04YzdiLTQyODUtYjAxYS1kYThlOTAxOTg4Y2UiLCJkZXZpY2VJbmZvIjoic2FuZGJveCIsImlhdCI6MTcwMjc0NTEwMSwiZXhwIjoxNzAzMzQ5OTAxfQ.RQLrwx1NdgttplTOamaevL1CKo_H4IRljMBlTsmIAOk'

    const hashedToken1 = await cryptService.hashText(token1)
    const hashedToken2 = await cryptService.hashText(token2)

    expect(await cryptService.compareHash(token1, hashedToken1)).toBe(true)
    expect(await cryptService.compareHash(token2, hashedToken2)).toBe(true)

    expect(await cryptService.compareHash(token1, hashedToken2)).toBe(false)
    expect(await cryptService.compareHash(token2, hashedToken1)).toBe(false)
  })

  it('Successfully Compares Password with Hashed Password', async () => {
    const password = 'password123'
    const hashedPassword = await cryptService.hashText(password)
    expect(await cryptService.compareHash(password, hashedPassword)).toBe(true)
  })

  it('Successfully Detects Wrong Password on Comparison with Hashed Password', async () => {
    const password = 'password123'
    const hashedPassword = await cryptService.hashText(password)
    expect(await cryptService.compareHash('wrongpassword123', hashedPassword)).toBe(false)
  })
})
