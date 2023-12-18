describe('deactivateAllRefreshTokens', () => {
  describe('failure', () => {
    describe('general errors', () => {
      it('InternalServerError', async () => {})

      it('GraphqlComplexityLimitException', async () => {})

      it('RequestTimeoutException', async () => {})
    })

    describe('auth', () => {
      it('should throw UnauthorizedException if user was not found', async () => {})

      it('should throw UnauthorizedException if access token is invalid', async () => {})

      it('should throw UnauthorizedException if access token is expired', async () => {})

      it('should throw UnauthorizedException if access token was not provided', async () => {})
    })
  })

  describe('success', () => {
    it('should return true', async () => {})
  })
})
