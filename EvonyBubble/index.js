import { registerRootComponent } from 'expo';
import BackgroundFetch from 'react-native-background-fetch';
import * as Sentry from '@sentry/react-native';

import App from './App';
import { sendBackgroundRequest } from './BackgroundFetch';

Sentry.init({
  dsn: 'https://ec5d28545b6c04f04d56de834b6d3094@o4507560581988352.ingest.de.sentry.io/4507560642543696',
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
    BackgroundFetch.finish(taskId);
    return;
  }

  console.log('[BackgroundFetch HeadlessTask] start: ', taskId);
  try {
    await sendBackgroundRequest();
  } catch (error) {
    console.error('[BackgroundFetch HeadlessTask] Error:', error);
    Sentry.captureException(error);
  }
  BackgroundFetch.finish(taskId);
};

// Register the headless task
BackgroundFetch.registerHeadlessTask(MyHeadlessTask);
