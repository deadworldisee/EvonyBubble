import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    const appState = AppState.currentState;
    const screenStatus = appState === 'active' ? 'screen_on' : 'screen_off';

    const response = await fetch('https://evonybubble.com/background_online.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: userToken,
        screen_status: screenStatus,
      }),
    });

    const responseJson = await response.json();
    console.log('Background request response:', responseJson);

    return responseJson.success ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.Failed;
  } catch (error) {
    console.error('Background request error:', error);
    return BackgroundFetch.Result.Failed;
  }
});

const configureBackgroundFetch = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  if (status !== BackgroundFetch.Status.Restricted && status !== BackgroundFetch.Status.Denied) {
    const task = await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60, // 1 minute
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background fetch task registered:', task);
  } else {
    console.log('Background fetch not supported.');
  }
};

export { configureBackgroundFetch };
