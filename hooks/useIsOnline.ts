import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useIsOnline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false);
    });
    return unsubscribe;
  }, []);

  return online;
}
