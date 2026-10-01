import { ScrollView, View } from 'react-native';

import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { NotificationToggle, PreferenceRow } from '@/components/profile/FanHub';
import { FilterChip } from '@/components/ui/FilterChip';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Typography } from '@/components/ui/Typography';
import { getApiDiagnostics } from '@/lib/api/diagnostics';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { colors, radius, spacing } from '@/theme';

export default function SettingsScreen() {
  const prefs = usePreferencesStore();
  const diagnostics = __DEV__ ? getApiDiagnostics() : undefined;

  return (
    <AppScreen edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.base, gap: spacing.xl, paddingBottom: spacing['4xl'] }}>
        <ScreenHeader title="Settings" />

        <View style={{ gap: spacing.sm }}>
          <SectionTitle title="Notifications" />
          <PreferenceRow icon="notifications-outline" title="Alerts" detail="Local reminders and inbox notes">
            <NotificationToggle value={prefs.notificationsEnabled} onValueChange={prefs.toggleNotifications} />
          </PreferenceRow>
          <PreferenceRow icon="alarm-outline" title="Match reminders" detail="15 minutes before kickoff">
            <NotificationToggle value={prefs.matchRemindersEnabled} onValueChange={prefs.toggleMatchReminders} />
          </PreferenceRow>
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionTitle title="Time & date" />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <FilterChip label="24-hour" selected={prefs.timeFormat === '24h'} onPress={() => prefs.setTimeFormat('24h')} />
            <FilterChip label="12-hour" selected={prefs.timeFormat === '12h'} onPress={() => prefs.setTimeFormat('12h')} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <FilterChip label="Today / Tomorrow" selected={prefs.dateFormat === 'relative'} onPress={() => prefs.setDateFormat('relative')} />
            <FilterChip label="Absolute dates" selected={prefs.dateFormat === 'absolute'} onPress={() => prefs.setDateFormat('absolute')} />
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionTitle title="Data" />
          <PreferenceRow icon="pulse-outline" title="Live auto-refresh" detail="Conservative polling only while a live list is open">
            <NotificationToggle value={prefs.liveAutoRefresh} onValueChange={prefs.toggleLiveAutoRefresh} />
          </PreferenceRow>
          <PreferenceRow icon="leaf-outline" title="Data saver" detail="Longer cache, manual refresh">
            <NotificationToggle value={prefs.dataSaver} onValueChange={prefs.toggleDataSaver} />
          </PreferenceRow>
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionTitle title="Feel" />
          <PreferenceRow icon="phone-portrait-outline" title="Haptics" detail="Favorites, filters, reminders">
            <NotificationToggle value={prefs.hapticsEnabled} onValueChange={prefs.toggleHaptics} />
          </PreferenceRow>
          <PreferenceRow icon="moon-outline" title="Appearance" detail="Dark is the MatchPulse identity" />
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionTitle title="About" />
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, padding: spacing.lg, gap: spacing.sm }}>
            <Typography variant="label">MatchPulse v1.0.0</Typography>
            <Typography variant="body" color="textSecondary">
              Football data provided by API-Football / API-Sports. The API key is an EXPO_PUBLIC value and is therefore visible in the client bundle. A backend proxy can replace the repository later.
            </Typography>
          </View>
        </View>

        {diagnostics ? (
          <View style={{ gap: spacing.sm }}>
            <SectionTitle title="API diagnostics (dev)" />
            <Typography color="textSecondary">Requests this session: {diagnostics.totalRequests}</Typography>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}
