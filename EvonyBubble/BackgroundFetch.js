import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { AppState, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

const { ScreenStatusModule } = NativeModules;

const configureBackgroundFetch = async () => {
  const userToken = await AsyncStorage.getItem('userToken');
  // "console.log('[configureBackgroundFetch] userToken:', userToken);"

  BackgroundFetch.configure({
      minimumFetchInterval: 15, // Setat pentru producție
      stopOnTerminate: false,
      enableHeadless: true,
      startOnBoot: true,
    },
    async (taskId) => {
      try {
        const appState = AppState.currentState;
        // "console.log('[BackgroundFetch] AppState:', appState);"
        const screenStatus = await getScreenStatusForFetch(appState);
        // "console.log('[BackgroundFetch HeadlessTask] screenStatus:', screenStatus);"
        await sendBackgroundRequest(screenStatus);
      } catch (error) {
        Sentry.captureException(error);
      }
      BackgroundFetch.finish(taskId);
    },
    (error) => {
      Sentry.captureException(error);
    }
  );

  BackgroundFetch.start();

  BackgroundGeolocation.ready({
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    reset: true,
    distanceFilter: 10,
    stopTimeout: 5,
    debug: false,
    logLevel: BackgroundGeolocation.LOG_LEVEL_OFF,
    stopOnTerminate: false,
    startOnBoot: true,
    preventSuspend: true,
    method: 'POST',
    url: 'https://evonybubble.com/background_online.php',
    autoSync: true,
    maxBatchSize: 10,
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      screen_status: 'bar',
      token: userToken,
    },
  });

  BackgroundGeolocation.onLocation(async (location) => {
    try {
      const appState = AppState.currentState;
      const screenStatus = await getScreenStatusForFetch(appState);
      await sendBackgroundRequest(screenStatus);
    } catch (error) {
      Sentry.captureException(error);
    }
  });

  const intervalId = setInterval(async () => {
    const appState = AppState.currentState;
    const screenStatus = await getScreenStatus();
    let status;

    if (appState === 'active') {
      status = 'foreground';
    } else if (appState === 'background' && screenStatus === 'off') {
      status = 'background';
    } else if (appState === 'background' && screenStatus === 'on') {
      status = 'screen_on';
    } else {
      status = 'screen_off';
    }

    // "console.log('[Interval Check] appState:', appState, ' screenStatus:', screenStatus, ' status:', status);"

    try {
      await sendBackgroundRequest(status);
    } catch (error) {
      Sentry.captureException(error);
    }
  }, 60000); // Pentru producție

  return () => {
    clearInterval(intervalId);
    BackgroundFetch.stop();
    BackgroundGeolocation.stop();
  };
};

const getScreenStatus = async () => {
  try {
    const screenStatus = await ScreenStatusModule.getScreenStatus();
    // "console.log('[getScreenStatus] screenStatus:', screenStatus);"
    return screenStatus ? 'on' : 'off';
  } catch (error) {
    Sentry.captureException(error);
    return 'off';
  }
};

const getScreenStatusForFetch = async (appState) => {
  try {
    const screenStatus = await getScreenStatus();
    if (appState === 'active') {
      return 'foreground';
    } else if (appState === 'background' && screenStatus === 'off') {
      return 'background';
    } else if (appState === 'background' && screenStatus === 'on') {
      return 'screen_on';
    } else {
      return 'screen_off';
    }
  } catch (error) {
    Sentry.captureException(error);
    return 'screen_off';
  }
};

const sendBackgroundRequest = async (screenStatus) => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    // "console.log('[sendBackgroundRequest] userToken:', userToken);"
    // "console.log('[sendBackgroundRequest] screenStatus:', screenStatus);"

    if (!screenStatus) {
      console.error('Error: Missing required parameter screenStatus.');
      Sentry.captureMessage('Error: Missing required parameter screenStatus.');
      return;
    }

    const requestBody = {
      token: userToken,
      screen_status: screenStatus,
    };

    // "console.log('[sendBackgroundRequest] Request Body:', requestBody);"

    const response = await fetch('https://evonybubble.com/background_online.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseJson = await response.json();
    // "console.log('Background request response:', responseJson);"
  } catch (error) {
    Sentry.captureException(error);
  }
};

export { configureBackgroundFetch, sendBackgroundRequest };
