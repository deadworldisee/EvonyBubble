import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

const configureBackgroundFetch = () => {
  BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // Interval in minutes
      stopOnTerminate: false,
      enableHeadless: true,
      startOnBoot: true,
      // Android options
      forceAlarmManager: false
    },
    async (taskId) => {
      console.log('[BackgroundFetch] taskId:', taskId);
      await sendBackgroundRequest();
      BackgroundFetch.finish(taskId);
    },
    (error) => {
      console.log('[BackgroundFetch] configure failed:', error);
      Sentry.captureException(error);
    }
  );

  BackgroundFetch.start();

  BackgroundGeolocation.ready({
    reset: true,
    distanceFilter: 50,
    stopTimeout: 1,
    debug: true,
    logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    stopOnTerminate: false,
    startOnBoot: true,
    preventSuspend: true, // Added preventSuspend to prevent app suspension
  }, (state) => {
    if (!state.enabled) {
      BackgroundGeolocation.start();
    }
  });

  BackgroundGeolocation.onLocation(async (location) => {
    console.log('[BackgroundGeolocation] location:', location);
    await sendBackgroundRequest();
  }, (error) => {
    console.error('[BackgroundGeolocation] location error:', error);
    Sentry.captureException(error);
  });

  BackgroundGeolocation.onActivityChange((event) => {
    console.log('[BackgroundGeolocation] activity change:', event);
  });

  const intervalId = setInterval(async () => {
    const appState = AppState.currentState;
    if (appState === 'active') {
      await sendBackgroundRequest('foreground');
    }
  }, 10000); // 10 seconds interval

  return () => {
    clearInterval(intervalId);
    BackgroundFetch.stop();
    BackgroundGeolocation.stop();
  };
};

const sendBackgroundRequest = async (screenStatus) => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    const appState = AppState.currentState;
    const status = screenStatus || (appState === 'active' ? 'screen_on' : 'screen_off');

    const response = await fetch('https://evonybubble.com/background_online.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: userToken,
        screen_status: status,
      }),
    });

    const responseJson = await response.json();
    console.log('Background request response:', responseJson);
  } catch (error) {
    console.error('Background request error:', error);
    Sentry.captureException(error);
  }
};

export { configureBackgroundFetch };
