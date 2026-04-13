import 'dotenv/config';

export default {
  expo: {
    name: 'StockFolio',
    slug: 'stockfolio',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    scheme: 'stockfolio',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain' as const,
      backgroundColor: '#020617',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.kyw1984.stockfolio',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#020617',
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'react-native-google-mobile-ads',
        {
          // AdMob 콘솔에서 발급받은 실제 App ID로 교체하세요
          androidAppId: 'ca-app-pub-3940256099942544~3347511713', // TODO: Android 앱 등록 후 교체
          iosAppId: process.env.ADMOB_IOS_APP_ID || 'ca-app-pub-6220210021054377~7258688890',
        },
      ],
    ],
    extra: {
      finnhubApiKey: process.env.FINNHUB_API_KEY || '',
      publicDataApiKey: process.env.PUBLIC_DATA_API_KEY || '',
      bokApiKey: process.env.BOK_API_KEY || '',
      admobIosBannerId: process.env.ADMOB_IOS_BANNER_ID || 'ca-app-pub-6220210021054377/5285476685',
      revenueCatIosKey: process.env.REVENUECAT_IOS_API_KEY || '',
    },
  },
};
