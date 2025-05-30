// donate.tsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import WebView from 'react-native-webview';

const PAYPAL_DONATE_URL =
  'https://www.paypal.com/donate?token=vtSd-ZGHfn4hMktGpydUfjxumxi-czpA8iGVqcgr0BHE4x0U1TjWNyD-E5iwo5P6WENJOrAEFImkrnii';

const Donate: React.FC = () => {
  const [showWebView, setShowWebView] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  const onBack = () => setShowWebView(false);
  const onDonatePress = () => {
    setLoadingError(false);
    setShowWebView(true);
  };
  
  const onWebError = (event: any) => {
    console.warn('WebView failed to load:', event.nativeEvent);
    setLoadingError(true);
  };

  const Header = (
    <View className="flex-row items-center bg-white p-4 shadow">
      <TouchableOpacity onPress={onBack} className="p-2">
        <Text className="text-blue-600 text-lg">Back</Text>
      </TouchableOpacity>
      <Text className="flex-1 text-center text-xl font-semibold">Donate</Text>
      <View className="w-12" />
    </View>
  );

  if (showWebView) {
    // Fallback UI on WebView error
    if (loadingError) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', padding: 24 }}>
          {Header}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text className="mb-4 text-center">
              Oops! The donation page couldn't load.
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-full mb-3"
              onPress={() => Linking.openURL(PAYPAL_DONATE_URL)}
            >
              <Text className="text-white">Open in Browser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-200 px-6 py-3 rounded-full"
              onPress={() => {
                setLoadingError(false);
              }}
            >
              <Text>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        {Header}
        <WebView
          source={{ uri: PAYPAL_DONATE_URL }}
          originWhitelist={['https://*', 'http://*', 'about:*']}
          startInLoadingState
          onError={onWebError}
          onLoadStart={() => console.log('WebView load started')}
          onLoadEnd={() => console.log('WebView load ended')}
          renderLoading={() => (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator />
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text className="text-2xl font-bold mb-4 text-center">
        Support St. George &amp; St. Mercurius
      </Text>
      <TouchableOpacity
        className="bg-blue-600 px-8 py-3 rounded-full"
        onPress={onDonatePress}
      >
        <Text className="text-white text-lg">Donate with PayPal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Donate;