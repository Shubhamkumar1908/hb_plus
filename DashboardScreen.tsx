import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Image } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { ALLOWED_EMAIL_DOMAIN } from '../config';

export function DashboardScreen() {
  const { user, role, logout } = useAuth();
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const initial = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.page}>
      <View style={[styles.nav, compact && styles.navCompact]}>
        <View style={styles.brand}><View style={styles.brandIcon}><Text style={styles.brandIconText}>H+</Text></View><Text style={styles.brandName}>HBPlus <Text style={styles.brandLight}>Workspace</Text></Text></View>
        {!compact ? <View style={styles.userArea}>
          {user?.photoURL ? <Image source={{ uri: user.photoURL }} style={styles.avatar} /> : <View style={styles.avatarFallback}><Text style={styles.avatarText}>{initial}</Text></View>}
          <View><Text style={styles.userName}>{user?.displayName || 'Team member'}</Text><Text style={styles.userEmail}>{user?.email}</Text></View>
          <Pressable onPress={logout} style={styles.logout}><Text style={styles.logoutText}>Log out</Text></Pressable>
        </View> : <Pressable onPress={logout} style={styles.logout}><Text style={styles.logoutText}>Log out</Text></Pressable>}
      </View>
      <View style={styles.content}>
        <Text style={styles.kicker}>YOUR WORKSPACE</Text>
        <Text style={[styles.heading, compact && { fontSize: 29 }]}>Good to see you{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.</Text>
        <Text style={styles.description}>You’re signed in to the HBPlus secure portal.</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}><Text style={styles.check}>✓</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.statusTitle}>Access verified</Text><Text style={styles.statusSub}>Your account belongs to the authorized organization.</Text></View>
          <View style={styles.activePill}><Text style={styles.activeText}>ACTIVE</Text></View>
        </View>
        <View style={[styles.grid, compact && { flexDirection: 'column' }]}>
          <View style={styles.infoCard}><Text style={styles.cardLabel}>SIGNED-IN ACCOUNT</Text><Text style={styles.cardValue}>{user?.email}</Text><Text style={styles.cardHint}>Verified Google identity</Text></View>
          <View style={styles.infoCard}><Text style={styles.cardLabel}>ACCOUNT ROLE</Text><Text style={styles.cardValue}>{role === 'admin' ? 'Administrator' : 'User'}</Text><Text style={styles.cardHint}>Assigned workspace permissions</Text></View>
        </View>
        {compact ? <View style={styles.mobileProfile}><Text style={styles.mobileProfileText}>{user?.displayName || user?.email}</Text></View> : null}
        <Text style={styles.footerNote}>Protected area · Access restricted to @{ALLOWED_EMAIL_DOMAIN}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, minHeight: '100%', backgroundColor: '#F5F7FB' },
  nav: { minHeight: 76, paddingHorizontal: 34, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E9EDF4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navCompact: { paddingHorizontal: 18, minHeight: 68 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#3157D5', alignItems: 'center', justifyContent: 'center' },
  brandIconText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  brandName: { color: '#17233B', fontSize: 16, fontWeight: '800' },
  brandLight: { color: '#8190A8', fontWeight: '500' },
  userArea: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E9EEFF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#3157D5', fontWeight: '800' },
  userName: { color: '#25314A', fontSize: 12, fontWeight: '700' },
  userEmail: { color: '#8490A4', fontSize: 10, marginTop: 2 },
  logout: { borderWidth: 1, borderColor: '#E0E5EF', paddingHorizontal: 15, paddingVertical: 9, borderRadius: 9, marginLeft: 12 },
  logoutText: { color: '#34425C', fontWeight: '700', fontSize: 12 },
  content: { width: '100%', maxWidth: 960, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 54 },
  kicker: { color: '#3157D5', fontWeight: '800', letterSpacing: 1.8, fontSize: 10 },
  heading: { color: '#17233B', fontSize: 36, fontWeight: '800', letterSpacing: -1, marginTop: 10 },
  description: { color: '#748198', fontSize: 14, marginTop: 8, marginBottom: 30 },
  statusCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7ECF4', borderRadius: 15, padding: 19, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  statusIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#E9F8F0', alignItems: 'center', justifyContent: 'center' },
  check: { color: '#16834D', fontSize: 21, fontWeight: '800' },
  statusTitle: { color: '#25314A', fontWeight: '800', fontSize: 14 },
  statusSub: { color: '#8490A4', fontSize: 11, marginTop: 4 },
  activePill: { backgroundColor: '#EAF8F0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  activeText: { color: '#16834D', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  grid: { flexDirection: 'row', gap: 18 },
  infoCard: { flex: 1, minHeight: 130, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7ECF4', borderRadius: 15, padding: 20, marginBottom: 18 },
  cardLabel: { color: '#8793A8', fontSize: 9, letterSpacing: 1, fontWeight: '800' },
  cardValue: { color: '#25314A', fontSize: 15, fontWeight: '800', marginTop: 14 },
  cardHint: { color: '#9AA5B7', fontSize: 11, marginTop: 7 },
  mobileProfile: { padding: 14, backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 2 },
  mobileProfileText: { color: '#66748C', fontSize: 12 },
  footerNote: { color: '#A0AABC', fontSize: 10, marginTop: 20 }
});