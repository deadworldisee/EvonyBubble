import React from 'react';
import { View, StyleSheet, ImageBackground, Image, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';

function HomeScreen({ navigation, onLogout }) {
  const handleLogout = async () => {
    await onLogout();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };

  return (
    <ImageBackground source={require('../assets/main4.jpg')} style={styles.background}>
      <View style={styles.headerContainer}>
        <Image source={require('../assets/evony-bubble-back.png')} style={styles.headerImage} />
      </View>
      <View style={styles.container}>
    
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', // To ensure it covers the whole screen
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 200, // Ensure content starts below the header
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
    color: 'white', // Match text color to theme
  },
  button: {
    width: '80%',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 165, 0, 0.8)', // Match button color to theme
  },
  buttonLabel: {
    color: 'white',
  },
});

export default HomeScreen;
