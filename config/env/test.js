'use strict';

const env = process.env;

module.exports = {
  httpPort: env.HTTP_PORT || '8080',
  httpsPort: env.HTTPS_PORT || '8443',
  hostName: env.HOST_NAME || 'localhost',
  mongo: env.MONGO_URL || 'mongodb://localhost/ticket-office-test',
  secret: env.SECRET_KEY || 'SomeVerySecretString',
  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID || 'AC277805c11ef1f2c4b194c81a70864f97',
    authToken: env.TWILIO_AUTH_TOKEN || '7a7bf51eeb6951901779codf8697d9d0',
    fromNumber: env.TWILIO_NUMBER || '+17068904920',
  },
  stripe: {
    publishableKey: env.STRIPE_PUBLISHABLE_KEY || 'pk_test_JzmOfTAgfdpZ88Dxi9EXIUR8',
    secretKey: env.STRIPE_SECRET_KEY || 'sk_test_W3mPpNQZCZnXd4qfZDgatSbv',
  },
  email: {
    from: 'Ticket-Office <no-reply@gmail.com>',
    options: {
      service: env.MAILER_SERVICE_PROVIDER || 'gmail',
      auth: {
        user: env.EMAIL_ADDR || 'grigoriev.aleks@gmail.com',
        pass: env.EMAIL_PASS || 'VEGbzklEMcUJs9h8vLbE',
      },
    },
  },
};
