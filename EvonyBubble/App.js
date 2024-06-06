import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import OnboardingScreen from './screens/OnboardingScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'orange',
    background: 'gray',
  },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const checkUserToken = async () => {
      try {
        let token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (e) {
        console.error('Failed to load user token.', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserToken();
  }, []);

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
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar hidden={true} />
        <View style={styles.container}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken ? (
              <Stack.Screen name="Home">
                {props => <HomeScreen {...props} onLogout={onLogout} />}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="Login">
                  {props => <LoginScreen {...props} onLogin={onLogin} />}
                </Stack.Screen>
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
