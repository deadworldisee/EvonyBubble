import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ImageBackground, Image, Platform, ScrollView, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import BackgroundGeolocation from 'react-native-background-geolocation';
import * as Sentry from '@sentry/react-native';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';


function HomeScreen({ navigation, onLogout }) {
  const [locationPermission, setLocationPermission] = useState(false);
  const [batteryOptimization, setBatteryOptimization] = useState(false);

  useEffect(() => {
    const checkPermissionsInstantly = async () => {
      await checkLocationPermission();
      if (Platform.OS === 'android') {
        await checkBatteryOptimization();
      }
    };

    const showPermissionsPopupWithDelay = async () => {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10-second delay
      await requestLocationPermission();
      if (Platform.OS === 'android') {
        await showBatteryOptimizationScreen();
      }
    };

    checkPermissionsInstantly();
    showPermissionsPopupWithDelay();

    const intervalId = setInterval(() => {
      checkPermissionsInstantly();
    }, 10000); // 10000ms = 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  const checkLocationPermission = async () => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });

    const result = await check(permission);
    console.log('Location permission status:', result);
    setLocationPermission(result === RESULTS.GRANTED);
  };

  const requestLocationPermission = async () => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });

    const result = await request(permission);
    console.log('Location permission request result:', result);
    setLocationPermission(result === RESULTS.GRANTED);
  };

  const checkBatteryOptimization = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log('Checking if device is ignoring battery optimizations');
        let isIgnoring = await BackgroundGeolocation.deviceSettings.isIgnoringBatteryOptimizations();
        console.log('Battery optimization status:', isIgnoring);
        setBatteryOptimization(isIgnoring);
      } catch (error) {
        console.error('[BackgroundGeolocation] Battery optimization request error: ', error);
        Sentry.captureException(error);
      }
    }
  };

  const showBatteryOptimizationScreen = async () => {
    if (Platform.OS === 'android') {
      try {
        let isIgnoring = await BackgroundGeolocation.deviceSettings.isIgnoringBatteryOptimizations();
        if (!isIgnoring) {
          BackgroundGeolocation.deviceSettings.showIgnoreBatteryOptimizations().then((request) => {
            console.log(`- Screen seen? ${request.seen} ${request.lastSeenAt}`);
            console.log(`- Device: ${request.manufacturer} ${request.model} ${request.version}`);

            if (request.seen) {
              return;
            }

            showMyConfirmDialog({
              title: "Settings request",
              text: "Please disable battery optimizations for your device"
            }).then((confirmed) => {
              if (confirmed) {
                BackgroundGeolocation.deviceSettings.show(request);
              }
            });
          }).catch((error) => {
            console.warn('Error showing battery optimization screen:', error);
          });
        }
      } catch (error) {
        console.error('[BackgroundGeolocation] Battery optimization request error: ', error);
        Sentry.captureException(error);
      }
    }
  };

  const showMyConfirmDialog = ({ title, text }) => {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        text,
        [
          { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
          { text: 'Confirm', onPress: () => resolve(true) }
        ],
        { cancelable: false }
      );
    });
  };

  const handleBatteryOptimizationButtonPress = async () => {
    if (Platform.OS === 'android') {
      try {
        let isIgnoring = await BackgroundGeolocation.deviceSettings.isIgnoringBatteryOptimizations();
        if (!isIgnoring) {
          BackgroundGeolocation.deviceSettings.showIgnoreBatteryOptimizations().then((request) => {
            console.log(`- Screen seen? ${request.seen} ${request.lastSeenAt}`);
            console.log(`- Device: ${request.manufacturer} ${request.model} ${request.version}`);

            showMyConfirmDialog({
              title: "Settings request",
              text: "Please disable battery optimizations for your device"
            }).then((confirmed) => {
              if (confirmed) {
                BackgroundGeolocation.deviceSettings.show(request);
              }
            });
          }).catch((error) => {
            console.warn('Error showing battery optimization screen:', error);
          });
        } else {
          console.log('Device is already ignoring battery optimizations');
        }
      } catch (error) {
        console.error('[BackgroundGeolocation] Battery optimization request error: ', error);
        Sentry.captureException(error);
      }
    }
  };

  const handleLocationPermissionButtonPress = async () => {
    await requestLocationPermission();
  };

  return (
    <ImageBackground source={require('../assets/main4.jpg')} style={styles.background}>
      <View style={styles.headerContainer}>
        <Image source={require('../assets/evony-bubble-back.png')} style={styles.headerImage} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {!locationPermission && (
            <View style={styles.permissionContainer}>
              <Text style={styles.text}>
                Location Permission: <Text style={locationPermission ? styles.greenText : styles.redText}>{locationPermission ? 'ON' : 'OFF'}</Text>
              </Text>
              <Text style={styles.smallText}>Location permission MUST be ALLOWED ALWAYS!</Text>
              <Button
                mode="contained"
                style={styles.button}
                labelStyle={styles.buttonLabel}
                onPress={handleLocationPermissionButtonPress}
              >
                Enable Location
              </Button>
            </View>
          )}
          {Platform.OS === 'android' && !batteryOptimization && (
            <View style={styles.permissionContainer}>
              <Text style={styles.text}>
                Battery Optimization: <Text style={batteryOptimization ? styles.greenText : styles.redText}>{batteryOptimization ? 'Disabled' : 'Enabled'}</Text>
              </Text>
              <Text style={styles.smallText}>
                Battery optimization MUST be DISABLED!
                {'\n'}
                Go to Settings and disable battery optimization for this app!
              </Text>
              <Button
                mode="contained"
                style={styles.button}
                labelStyle={styles.buttonLabel}
                onPress={handleBatteryOptimizationButtonPress}
              >
                Disable Battery Optimization
              </Button>
            </View>
          )}
          <View style={{ backgroundColor: '#000', height: 200 }}>
            <Text style={{ color: '#fff' }}>awdawdaw</Text>
          </View>
          <View style={{ backgroundColor: '#000', height: 200 }}>
            <Text style={{ color: '#fff' }}>awdawdaw</Text>
          </View>
          <View style={{ backgroundColor: '#000', height: 200 }}>
            <Text style={{ color: '#fff' }}>awdawdaw</Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
  },
  headerImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  permissionContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: 'black',
    borderBottomColor: 'black',
    marginBottom: 20,
    alignItems: 'center',
    width: '90%',
  },
  text: {
    fontSize: 20,
    marginBottom: 5,
    color: 'white',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
  },
  button: {
    width: '80%',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
    marginTop: 20,
  },
  buttonLabel: {
    color: 'white',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  greenText: {
    color: 'green',
    fontWeight: 'bold',
  },
  redText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
