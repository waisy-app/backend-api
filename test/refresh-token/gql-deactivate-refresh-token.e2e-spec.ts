describe('deactivateRefreshToken', () => {
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
