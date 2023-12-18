describe('refreshAccessToken', () => {
  describe('failure', () => {
    describe('validation', () => {
      it('deviceInfo is not provided', async () => {})

      it('deviceInfo is not a string', async () => {})

      it('deviceInfo is an empty string', async () => {})

      it('deviceInfo is longer than 255 characters', async () => {})
    })

    describe('general errors', () => {
      it('InternalServerError', async () => {})

      it('GraphqlComplexityLimitException', async () => {})

      it('RequestTimeoutException', async () => {})
    })

    describe('auth', () => {
      it('should return UnauthorizedException if no refresh token provided', async () => {})

      it('should return UnauthorizedException if refresh token is invalid', async () => {})

      it('should return UnauthorizedException if refresh token is expired', async () => {})

      it('should return UnauthorizedException if user not found', async () => {})

      it('should return UnauthorizedException if refresh token not found', async () => {})

      it('should return UnauthorizedException if refresh token is not active', async () => {})

      it('should return UnauthorizedException if device info is not provided', async () => {})

      it('should return UnauthorizedException if device info not found', async () => {})
    })
  })

  describe('success', () => {
    it('should return Tokens', async () => {})
  })
})
