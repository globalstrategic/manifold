import { EnvConfig } from './prod'

let _config: EnvConfig | undefined

export function getSelfHostedConfig(): EnvConfig {
  if (!_config) {
    _config = {
      domain: process.env.DOMAIN ?? '',
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY ?? '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? '',
        projectId: process.env.FIREBASE_PROJECT_ID ?? '',
        region: process.env.FIREBASE_REGION ?? 'us-central1',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? '',
        privateBucket: process.env.FIREBASE_PRIVATE_BUCKET ?? '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
        appId: process.env.FIREBASE_APP_ID ?? '',
        measurementId: process.env.FIREBASE_MEASUREMENT_ID ?? '',
      },
      amplitudeApiKey: process.env.AMPLITUDE_API_KEY ?? '',
      supabaseInstanceId: process.env.SUPABASE_INSTANCE_ID ?? 'self-hosted',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
      twitchBotEndpoint: process.env.TWITCH_BOT_ENDPOINT ?? '',
      apiEndpoint: process.env.API_ENDPOINT ?? '',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID ?? '',
      cloudRunId: process.env.CLOUD_RUN_ID ?? 'self-hosted',
      cloudRunRegion: process.env.CLOUD_RUN_REGION ?? 'local',
      adminIds: process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [],
      visibility: 'PUBLIC',
      moneyMoniker: process.env.MONEY_MONIKER ?? 'M',
      spiceMoniker: process.env.SPICE_MONIKER ?? 'P',
      bettor: process.env.BETTOR ?? 'trader',
      nounBet: process.env.NOUN_BET ?? 'trade',
      verbPastBet: process.env.VERB_PAST_BET ?? 'traded',
      faviconPath: process.env.FAVICON_PATH ?? '/favicon.ico',
      newQuestionPlaceholders: [
        'Will this happen by end of year?',
        'Will this bill pass?',
      ],
      expoConfig: {},
    }
  }
  return _config
}
