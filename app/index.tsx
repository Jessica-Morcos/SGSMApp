// app/index.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    StatusBar as RNStatusBar,
    StyleSheet,
    Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootSplash() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          // After fade-out, replace this route with the tabs navigator
          router.replace("/(tabs)");
        }
      });
    }, 2000);

    return () => {
      clearTimeout(timeout);
      opacity.stopAnimation();
    };
  }, [opacity, router]);

  return (
    <>
      {/* Hide the status bar on splash to avoid Android “edge-to-edge” warnings */}
      <RNStatusBar hidden />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.container, { opacity }]}>
          <Image
            source={require("../assets/images/splash-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            ST. GEORGE{"\n"}& ST. MERCURIUS
          </Text>
          <Text style={styles.subtitle}>Coptic Orthodox Church</Text>
        </Animated.View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 240,
    height: 240,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 34,
    color: "#000000",
  },
  subtitle: {
    fontSize: 16,
    color: "#555555",
    marginTop: 8,
  },
});
