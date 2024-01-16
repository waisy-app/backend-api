export const resolverDescriptions = {
  sendEmailSubscribe: `
     Send email with subscribe link. Used for allow send any emails to provided email address.
  
     This mutation is rate-limited by the client IP and the email address.
  
     **Error codes:**
  
      - \`ServiceUnavailableError\` - *Unisender* service is temporarily unavailable.
      
      - \`TooManyAttemptsError\` 
        - Too many attempts from this IP or/and this email address. 
        - Too many requests for subscribe. Allow to send only 1 request per day for each email address.
      
      - \`InternalServerError\`
      
      - \`ValidationError\`
      
      - \`RequestTimeoutError\`
      
      - \`ComplexityLimitError\`
  `,
}
