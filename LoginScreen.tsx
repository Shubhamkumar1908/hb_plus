import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useAuth } from '../auth/AuthProvider';
import { ALLOWED_EMAIL_DOMAIN } from '../config';
import { isFirebaseConfigured } from '../firebase';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  return Platform.OS === 'web' ? <WebLoginScreen /> : <NativeLoginScreen />;
}

function WebLoginScreen() {
  const { loginWithGoogle, loading, error, clearError } = useAuth();
  const [busy, setBusy] = useState(false);

  const onGooglePress = async () => {
    clearError();
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch {
      // The auth provider exposes sign-in errors in the form.
    } finally {
      setBusy(false);
    }
  };

  return <LoginForm loading={loading} error={error} busy={busy} requestReady={isFirebaseConfigured} onGooglePress={onGooglePress} />;
}

function NativeLoginScreen() {
  const { loginWithGoogle, loading, error, clearError } = useAuth();
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken || response.params?.id_token;
      setBusy(true);
      loginWithGoogle(idToken).catch(() => {}).finally(() => setBusy(false));
    } else if (response?.type === 'error') {
      clearError();
    }
  }, [response]);

  const onGooglePress = async () => {
    clearError();
    setBusy(true);
    try { await promptAsync(); } finally { setBusy(false); }
  };

  return <LoginForm loading={loading} error={error} busy={busy} requestReady={Boolean(request) && isFirebaseConfigured} onGooglePress={onGooglePress} />;
}

function LoginForm({
  loading,
  error,
  busy,
  requestReady,
  onGooglePress,
}: {
  loading: boolean;
  error: string | null;
  busy: boolean;
  requestReady: boolean;
  onGooglePress: () => void;
}) {
  const { width } = useWindowDimensions();
  const compact = width < 560;

  return (
    <View style={styles.page}>
      <View style={[styles.panel, compact && styles.panelCompact]}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>H+</Text></View>
        <Text style={styles.eyebrow}>HBPLUS WORKSPACE</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in with your official account to continue to your secure workspace.</Text>
        <View style={styles.domainBox}>
          <Text style={styles.domainLabel}>AUTHORIZED ORGANIZATION</Text>
          <Text style={styles.domainValue}>@{ALLOWED_EMAIL_DOMAIN}</Text>
        </View>
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
          <Pressable accessibilityRole="button" disabled={loading || busy || !requestReady} onPress={onGooglePress} style={({ pressed }) => [styles.googleButton, pressed && styles.pressed, (loading || busy || !requestReady) && styles.disabled]}>
          {(loading || busy) ? <ActivityIndicator color="#172033" /> : <Text style={styles.googleG}>G</Text>}
          <Text style={styles.googleText}>{(loading || busy) ? 'Signing you in...' : 'Continue with Google'}</Text>
        </Pressable>
        <Text style={styles.footnote}>Access is limited to verified Google accounts belonging to the authorized domain.</Text>
      </View>
      <Text style={styles.copyright}>© {new Date().getFullYear()} HBPlus · Secure access portal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, minHeight: '100%', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F3F6FC' },
  panel: { width: '100%', maxWidth: 440, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 40, alignItems: 'center', shadowColor: '#1D315B', shadowOpacity: 0.08, shadowRadius: 28, shadowOffset: { width: 0, height: 12 }, elevation: 4 },
  panelCompact: { padding: 26, borderRadius: 20 },
  brandMark: { width: 54, height: 54, borderRadius: 17, backgroundColor: '#3157D5', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  brandMarkText: { color: '#FFFFFF', fontWeight: '800', fontSize: 20 },
  eyebrow: { color: '#3157D5', letterSpacing: 2, fontSize: 10, fontWeight: '800', marginBottom: 12 },
  title: { color: '#15213A', fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: '#68758C', fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 10, marginBottom: 26, maxWidth: 320 },
  domainBox: { width: '100%', backgroundColor: '#F4F7FF', borderRadius: 12, padding: 15, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E4EAFE' },
  domainLabel: { color: '#77849B', fontSize: 9, letterSpacing: 1.2, fontWeight: '800' },
  domainValue: { color: '#284BB7', fontSize: 17, fontWeight: '800', marginTop: 5 },
  errorBox: { width: '100%', padding: 12, backgroundColor: '#FFF1F0', borderRadius: 10, marginBottom: 14, borderWidth: 1, borderColor: '#FFD8D5' },
  errorText: { color: '#B42318', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  googleButton: { width: '100%', minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: '#DCE2EC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#FFFFFF' },
  googleG: { fontSize: 20, fontWeight: '800', color: '#4285F4' },
  googleText: { color: '#202B40', fontWeight: '700', fontSize: 14 },
  pressed: { opacity: 0.8, backgroundColor: '#F7F9FC' },
  disabled: { opacity: 0.6 },
  footnote: { color: '#929DB0', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 20, maxWidth: 300 },
  copyright: { color: '#9AA5B7', fontSize: 11, marginTop: 24 }
});