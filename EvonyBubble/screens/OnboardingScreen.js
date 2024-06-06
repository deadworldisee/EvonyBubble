import React from 'react';
import { View, StyleSheet, ImageBackground, Image, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

function OnboardingScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <ImageBackground source={require('../assets/main1.jpg')} style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.headerContainer}>
          <Image source={require('../assets/evony-bubble-back.png')} style={styles.headerImage} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.overlay}>
            <View style={styles.textContainer}>
              <Text style={styles.infoText}>
                Never lose your Bubble in SvS or Kill Event! You can forget about putting it up, losing internet connection, having your phone battery discharged, losing your account credentials, or falling asleep. We will handle it for you so you can live another day to play Evony!
              </Text>
              <Text style={styles.message}>Welcome to Evony Bubble!</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Get Started
            </Button>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Privacy')} style={styles.footer}>
          <Text style={styles.link}>Privacy Policy & Terms of Service</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: 40,
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '90%',
    maxWidth: 400,
  },
  textContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  message: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
  },
  buttonLabel: {
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  link: {
    color: 'black',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;
