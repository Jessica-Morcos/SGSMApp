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


const rawUrl = process.env.EXPO_PUBLIC_PAYPAL_DONATE_URL || '';
const PAYPAL_DONATE_URL = rawUrl.replace(/;$/, '').trim();

const Donate: React.FC = () => {
  const [showWebView, setShowWebView] = useState(false);
  const [hasError, setHasError] = useState(false);



  const onBack = () => setShowWebView(false);
  const onDonatePress = () => {
    setHasError(false);
    setShowWebView(true);
  };

  const onWebError = () => setHasError(true);


  const Header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' }}>
      <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
        <Text style={{ color: '#DD3333', fontSize: 18 }}>Back</Text>
      </TouchableOpacity>
      <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Donate</Text>
      <View style={{ width: 32 }} />
    </View>
  );

  if (showWebView) {
    if (hasError) {
      return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          {Header}
          <Text style={{ marginBottom: 16, textAlign: 'center' }}>Failed to load donation page.</Text>
          <TouchableOpacity onPress={() => Linking.openURL(PAYPAL_DONATE_URL)} style={{ marginBottom: 12, padding: 12, backgroundColor: '#0070ba', borderRadius: 6 }}>
            <Text style={{ color: '#fff' }}>Open in Browser</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setHasError(false)} style={{ padding: 12, backgroundColor: '#eee', borderRadius: 6 }}>
            <Text>Retry</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} >
        {Header}
        <WebView
          style={{  marginBottom:20 }}
          source={{ uri: PAYPAL_DONATE_URL }}
          originWhitelist={['https://*', 'http://*', 'about:*']}
          startInLoadingState
          onError={onWebError}
          
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1"
          sharedCookiesEnabled={true}
          renderLoading={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator />
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' }}>
        Support St. George &amp; St. Mercurius
      </Text>
      <TouchableOpacity onPress={onDonatePress} style={{ paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#DD3333', borderRadius: 50}}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Donate with PayPal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Donate;
