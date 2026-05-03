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
      buildNumber: '20',
    },
    android: {
      package: 'com.kyw1984.stockfolio',
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#020617',
      },
      edgeToEdgeEnabled: true,
      permissions: ['com.android.vending.BILLING'],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-tracking-transparency',
        {
          userTrackingPermission:
            'This identifier will be used to deliver personalized ads and measure ad performance.',
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: process.env.ADMOB_ANDROID_APP_ID || 'ca-app-pub-6220210021054377~2880311795',
          iosAppId: process.env.ADMOB_IOS_APP_ID || 'ca-app-pub-6220210021054377~7258688890',
        },
      ],
    ],
    extra: {
      finnhubApiKey: process.env.FINNHUB_API_KEY || '',
      publicDataApiKey: process.env.PUBLIC_DATA_API_KEY || '',
      bokApiKey: process.env.BOK_API_KEY || '',
      admobIosBannerId: process.env.ADMOB_IOS_BANNER_ID || 'ca-app-pub-6220210021054377/5285476685',
      admobAndroidBannerId: process.env.ADMOB_ANDROID_BANNER_ID || 'ca-app-pub-3940256099942544/6300978111',
      revenueCatIosKey: process.env.REVENUECAT_IOS_API_KEY || '',
      revenueCatAndroidKey: process.env.REVENUECAT_ANDROID_API_KEY || '',
      eas: {
        projectId: '9467aeb8-6aea-48fa-910e-f5de61ec49d9',
      },
    },
  },
};
