// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: "SGSM",
    slug: "SGSM",
    version: "1.0.6",
    orientation: "portrait",
    icon: "./assets/images/app-icon.png",
    scheme: "sgsm",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      buildNumber: "6", 
      bundleIdentifier: "com.jessicamorcos.SGSM",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ["audio"]
      }
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ]
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/app-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-video",
      "expo-audio"
    ],

    experiments: {
      typedRoutes: true
    },

    extra: {
     
      EXPO_PUBLIC_BIBLE_API_KEY: process.env.EXPO_PUBLIC_BIBLE_API_KEY,
      EXPO_PUBLIC_PAYPAL_DONATE_URL: process.env.EXPO_PUBLIC_PAYPAL_DONATE_URL,


      router: {},
      eas: {
        projectId: "466e4660-7d0e-41ca-b316-e10f66d13b4b"
      }
    }
  }
};
