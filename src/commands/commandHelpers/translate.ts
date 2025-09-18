import { Translate } from '@google-cloud/translate/build/src/v2/index.js'

export const gTranslate = new Translate({
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        private_key: process.env.GOOGLE_PRIVATE_KEY!
    }
})