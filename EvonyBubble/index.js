import { registerRootComponent } from 'expo';
import * as Sentry from '@sentry/react-native';
import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';

import App from './App';
import { sendBackgroundRequest } from './BackgroundFetch';

// Configure Sentry
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN', // Inlocuieste cu DSN-ul tau Sentry
  enableAutoSessionTracking: true,
  tracesSampleRate: 1.0,
});

// Register the main application
registerRootComponent(App);

// Define the headless task
const MyHeadlessTask = async (event) => {
  let taskId = event.taskId;
  let isTimeout = event.timeout;  // <-- true when your background-time has expired.
  
  if (isTimeout) {
    console.log('[BackgroundFetch] Headless TIMEOUT:', taskId);
    Sentry.captureMessage(`[BackgroundFetch] Headless TIMEOUT: ${taskId}`);
    BackgroundFetch.finish(taskId);
    return;
  }
  
  console.log('[BackgroundFetch HeadlessTask] start: ', taskId);
  Sentry.captureMessage(`[BackgroundFetch HeadlessTask] start: ${taskId}`);
  await sendBackgroundRequest();
  BackgroundFetch.finish(taskId);
};

// Register the headless task
BackgroundFetch.registerHeadlessTask(MyHeadlessTask);

// Configure BackgroundGeolocation
BackgroundGeolocation.ready({
  reset: true,
  distanceFilter: 50,
  stopTimeout: 1,
  debug: true,
  logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
  stopOnTerminate: false,
  startOnBoot: true,
  preventSuspend: true, // Prevent suspend on both iOS and Android
}, (state) => {
  if (!state.enabled) {
    BackgroundGeolocation.start();
  }
});

