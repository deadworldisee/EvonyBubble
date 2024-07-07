import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, Platform, Image, KeyboardAvoidingView, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

function LoginScreen({ navigation, onLogin }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    let valid = true;
    let errors = {};

    if (!email.match(/\S+@\S+\.\S+/)) {
      errors.email = 'Email is invalid';
      valid = false;
    }

    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleLogin = async () => {
    if (validate()) {
      try {
        let response = await fetch('https://evonybubble.com/signupin.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'login',
            email,
            password,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let responseJson = await response.json();
        console.log('Response JSON:', responseJson); // Log the response JSON to check if token is received
        if (responseJson.success) {
          if (responseJson.token) {
            await AsyncStorage.setItem('userToken', responseJson.token);
            await AsyncStorage.setItem('userEmail', email); // Save email in AsyncStorage
            onLogin(responseJson.token);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              })
            );
          } else {
            Alert.alert('Error', 'Token is missing from the response.');
          }
        } else {
          Alert.alert('Error', responseJson.message);
        }
      } catch (error) {
        console.error('Fetch error: ', error);
        Alert.alert('Error', 'An error occurred. Please try again.');
      }
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <ImageBackground source={require('../assets/main5.jpg')} style={styles.background}>
          <View style={styles.headerContainer}>
            <Image source={require('../assets/evony-bubble-back.png')} style={styles.headerImage} />
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            style={styles.keyboardAvoidingContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <ScrollView contentContainerStyle={styles.scrollViewContainer} keyboardShouldPersistTaps="handled">
              <View style={styles.overlay}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={text => setEmail(text)}
                  error={!!errors.email}
                  style={styles.input}
                  textColor="white"
                  theme={{ colors: { text: 'white' } }}
                />
                {errors.email && <Text style={styles.error}>{errors.email}</Text>}
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={text => setPassword(text)}
                  secureTextEntry
                  error={!!errors.password}
                  style={styles.input}
                  textColor="white"
                  theme={{ colors: { text: 'white' } }}
                />
                {errors.password && <Text style={styles.error}>{errors.password}</Text>}
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  Login
                </Button>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('SignUp')}
                  style={styles.textButton}
                  labelStyle={styles.textButtonLabel}
                >
                  Don't have an account? Sign Up
                </Button>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('ResetPassword')}
                  style={[styles.textButton, { marginBottom: 10 }]} // Add marginBottom to separate from Sign Up button
                  labelStyle={styles.textButtonLabel}
                >
                  Forgot Password?
                </Button>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <TouchableOpacity onPress={() => navigation.navigate('Privacy')} style={styles.footer}>
            <Text style={styles.link}>Privacy Policy & Terms of Service</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
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
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 10, // Ensure the keyboard avoiding view starts below the header
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20, // Ensure there's space for the footer
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: 0, // Ensure padding at the top for the header
  },
  headerImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  overlay: {
    padding: 0,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: '90%',
    maxWidth: 400,
  },
  input: {
    marginBottom: 12,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderColor: 'black',
    borderWidth: 1,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'left',
    width: '100%',
  },
  button: {
    marginBottom: 20,
    width: '100%',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
  },
  buttonLabel: {
    color: 'white',
  },
  textButton: {
    marginTop: 10,
    width: '100%',
  },
  textButtonLabel: {
    color: 'orange',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 10,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginTop: 20, // Ensure there's space from the previous element
  },
  link: {
    color: 'black',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
