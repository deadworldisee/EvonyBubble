import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';
const FETCH_INTERVAL = 5000; // Interval in milliseconds

const requestPermissions = async () => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    console.log("Foreground permission status:", foregroundStatus);
    
    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      console.log("Background permission status:", backgroundStatus);
      
      if (backgroundStatus === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: FETCH_INTERVAL,
        });
        console.log("Started location updates");
      } else {
        console.error("Background permission not granted");
      }
    } else {
      console.error("Foreground permission not granted");
    }
  } catch (error) {
    console.error("Error requesting permissions:", error);
  }
};

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  console.log("TaskManager defineTask called");
  if (error) {
    console.error("TaskManager error:", error);
    return;
  }
  if (data) {
    console.log("TaskManager data received:", data);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.error("User token not found");
        return BackgroundFetch.Result.NoData;
      }

      const appState = AppState.currentState;
      const screenStatus = appState === 'active' ? 'screen_on' : 'screen_off';
      console.log("Sending request with screen status:", screenStatus);

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

      return responseJson.success ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.NoData;
    } catch (err) {
      console.error("Fetch error:", err);
      return BackgroundFetch.Result.Failed;
    }
  }
});

export { requestPermissions };
