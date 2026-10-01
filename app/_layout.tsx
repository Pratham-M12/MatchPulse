import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createQueryClient } from '@/lib/query/client';
import { attachQueryPersistence, hydrateQueryClient } from '@/lib/query/persistence';
import { configureNotifications, subscribeNotificationResponses } from '@/lib/notifications/reminders';
import { colors } from '@/theme';

const queryClient = createQueryClient();

export default function RootLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void configureNotifications();
    const sub = subscribeNotificationResponses((href) => {
      if (href) router.push(href as never);
    });

    // Hydrate offline cache with safety timeout (max 1000ms)
    const hydrationPromise = hydrateQueryClient(queryClient);
    const timeoutPromise = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000));

    void Promise.race([hydrationPromise, timeoutPromise]).finally(() => {
      if (isMounted) setReady(true);
    });

    const detachPersistence = attachQueryPersistence(queryClient);

    return () => {
      isMounted = false;
      sub();
      detachPersistence();
    };
  }, [router]);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
