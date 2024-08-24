import React, { useEffect, useState } from 'react';
import { View, StyleSheet, AppRegistry, NativeModules, AppState, LogBox, Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import from Expo

import OnboardingScreen from './screens/OnboardingScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import HomeScreen from './screens/HomeScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import TabNavigator from './TabNavigator';

const { ScreenStatusModule } = NativeModules;

LogBox.ignoreAllLogs(); // Ignore all log notifications

Sentry.init({
  dsn: 'https://ec5d28545b6c04f04d56de834b6d3094@o4507560581988352.ingest.de.sentry.io/4507560642543696',
  tracesSampleRate: 1.0,
});

const Stack = createStackNavigator();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const checkUserToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await fetch('https://evonybubble.com/user_data.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'validate_token',
              token: token,
            }),
          });
          const responseJson = await response.json();
          if (responseJson.success) {
            setUserToken(token);
          } else {
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
          }
        }
      } catch (e) {
        console.error('Failed to load user token.', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserToken();
    configureBackgroundFetch();
  }, []);

  const configureBackgroundFetch = async () => {
    const userToken = await AsyncStorage.getItem('userToken');
    console.log('[configureBackgroundFetch] userToken:', userToken);

    BackgroundFetch.configure(
      {
        minimumFetchInterval: 1, // Interval in minutes for debugging
        stopOnTerminate: false,
        enableHeadless: true,
        startOnBoot: true,
      },
      async (taskId) => {
        console.log('[BackgroundFetch] taskId:', taskId);
        try {
          const appState = AppState.currentState;
          console.log('[BackgroundFetch] AppState:', appState);
          const screenStatus = await getScreenStatusForFetch(appState);
          console.log('[BackgroundFetch HeadlessTask] screenStatus:', screenStatus);
          await sendBackgroundRequest(screenStatus);
        } catch (error) {
          console.error('[BackgroundFetch] Error in sendBackgroundRequest:', error);
          Sentry.captureException(error);
        }
        BackgroundFetch.finish(taskId);
      },
      (error) => {
        console.log('[BackgroundFetch] configure failed:', error);
        Sentry.captureException(error);
      }
    );

    BackgroundFetch.start();

    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      reset: true,
      distanceFilter: 10,
      stopTimeout: 5,
      debug: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,
      startOnBoot: true,
      preventSuspend: true,
      method: 'POST',
      url: 'https://evonybubble.com/background_online.php',
      batchSync: false,
      autoSync: true,
      maxBatchSize: 50,
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        screen_status: 'bar',
        token: userToken,
      },
    }, (state) => {
      if (!state.enabled) {
        BackgroundGeolocation.start();
      }
    });

    BackgroundGeolocation.onLocation(async (location) => {
      console.log('[BackgroundGeolocation] location:', location);
      try {
        const appState = AppState.currentState;
        const screenStatus = await getScreenStatusForFetch(appState);
        console.log('[BackgroundGeolocation] screenStatus:', screenStatus);
        await sendBackgroundRequest(screenStatus);
      } catch (error) {
        console.error('[BackgroundGeolocation] location error:', error);
        Sentry.captureException(error);
      }
    });

    BackgroundGeolocation.onActivityChange((event) => {
      console.log('[BackgroundGeolocation] activity change:', event);
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

      console.log('[Interval Check] appState:', appState, ' screenStatus:', screenStatus, ' status:', status);

      try {
        await sendBackgroundRequest(status);
      } catch (error) {
        console.error('[BackgroundFetch] interval error:', error);
        Sentry.captureException(error);
      }
    }, 60000); // 1 minute interval for debugging

    return () => {
      clearInterval(intervalId);
      BackgroundFetch.stop();
      BackgroundGeolocation.stop();
    };
  };

  const getScreenStatus = async () => {
    try {
      console.log('[getScreenStatus] Attempting to get screen status.');
      const screenStatus = await ScreenStatusModule.getScreenStatus();
      console.log('[getScreenStatus] screenStatus:', screenStatus);
      return screenStatus ? 'on' : 'off';
    } catch (error) {
      console.error('[getScreenStatus] error:', error);
      Sentry.captureException(error);
      return 'off'; // Default to 'off' in case of error
    }
  };

  const getScreenStatusForFetch = async (appState) => {
    try {
      console.log('[getScreenStatusForFetch] Attempting to get screen status.');
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
      console.error('[getScreenStatusForFetch] error:', error);
      Sentry.captureException(error);
      return 'screen_off'; // Default to 'screen_off' in case of error
    }
  };

  const sendBackgroundRequest = async (screenStatus) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('[sendBackgroundRequest] userToken:', userToken);
      console.log('[sendBackgroundRequest] screenStatus:', screenStatus);

      if (!screenStatus) {
        console.error('Error: Missing required parameter screenStatus.');
        Sentry.captureMessage('Error: Missing required parameter screenStatus.');
        return;
      }

      const requestBody = {
        token: userToken,
        screen_status: screenStatus,
      };

      console.log('[sendBackgroundRequest] Request Body:', requestBody);

      const response = await fetch('https://evonybubble.com/background_online.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseJson = await response.json();
      console.log('Background request response:', responseJson);
    } catch (error) {
      console.error('Background request error:', error);
      Sentry.captureException(error);
    }
  };

  const onLogin = async (token) => {
    await AsyncStorage.setItem('userToken', token);
    setUserToken(token);
  };

  const onLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <PaperProvider settings={{ icon: props => <MaterialCommunityIcons {...props} /> }}>
      <NavigationContainer>
        <StatusBar hidden={true} />
        <View style={styles.container}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken ? (
              <Stack.Screen name="Home">
                {props => <TabNavigator {...props} onLogout={onLogout} />}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="Login">
                  {props => <LoginScreen {...props} onLogin={onLogin} />}
                </Stack.Screen>
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen name="Privacy" component={PrivacyScreen} />
              </>
            )}
          </Stack.Navigator>
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

// Register the headless task
AppRegistry.registerHeadlessTask('BackgroundFetch', () => configureBackgroundFetch);

export default Sentry.wrap(App);
