import { EnvConfig } from './prod'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

let _config: EnvConfig | undefined

export function getSelfHostedConfig(): EnvConfig {
  if (!_config) {
    _config = {
      domain: requireEnv('DOMAIN'),
      firebaseConfig: {
        apiKey: requireEnv('FIREBASE_API_KEY'),
        authDomain: requireEnv('FIREBASE_AUTH_DOMAIN'),
        projectId: requireEnv('FIREBASE_PROJECT_ID'),
        region: process.env.FIREBASE_REGION ?? 'us-central1',
        storageBucket: requireEnv('FIREBASE_STORAGE_BUCKET'),
        privateBucket: process.env.FIREBASE_PRIVATE_BUCKET ?? '',
        messagingSenderId: requireEnv('FIREBASE_MESSAGING_SENDER_ID'),
        appId: requireEnv('FIREBASE_APP_ID'),
        measurementId: process.env.FIREBASE_MEASUREMENT_ID ?? '',
      },
      amplitudeApiKey: process.env.AMPLITUDE_API_KEY ?? '',
      supabaseInstanceId: process.env.SUPABASE_INSTANCE_ID ?? 'self-hosted',
      supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY'),
      twitchBotEndpoint: process.env.TWITCH_BOT_ENDPOINT ?? '',
      apiEndpoint: requireEnv('API_ENDPOINT'),
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
