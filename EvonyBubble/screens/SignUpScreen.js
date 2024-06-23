import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, Platform, Image, KeyboardAvoidingView, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';

function SignUpScreen({ navigation }) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleSignUp = async () => {
    if (validate()) {
      try {
        let response = await fetch('https://evonybubble.com/signupin.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'signup',
            name,
            email,
            password,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let responseJson = await response.json();
        console.log(responseJson);
        if (responseJson.success) {
          Alert.alert('Success', 'Account created successfully. You must validate it by clicking on the link received on the registered email. Please check also spam box!', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
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
        <ImageBackground source={require('../assets/main2.jpg')} style={styles.background}>
          <View style={styles.headerContainer}>
            <Image source={require('../assets/evony-bubble-back.png')} style={styles.headerImage} />
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <ScrollView contentContainerStyle={styles.scrollViewContainer} keyboardShouldPersistTaps="always">
              <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.formContainer}>
                  <TextInput
                    label="Name"
                    value={name}
                    onChangeText={text => setName(text)}
                    style={styles.input}
                    textColor="white"
                    theme={{ colors: { text: 'white' } }}
                  />
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
                  <TextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={text => setConfirmPassword(text)}
                    secureTextEntry
                    error={!!errors.confirmPassword}
                    style={styles.input}
                    textColor="white"
                    theme={{ colors: { text: 'white' } }}
                  />
                  {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
                  <Button
                    mode="contained"
                    onPress={handleSignUp}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                  >
                    Sign Up
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.textButton}
                    labelStyle={styles.textButtonLabel}
                  >
                    Already have an account? Login
                  </Button>
                  <TouchableOpacity onPress={() => navigation.navigate('Privacy')} style={styles.footer}>
                    <Text style={styles.link}>Privacy Policy & Terms of Service</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 150, // Ensure the keyboard avoiding view starts below the header
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20, // Ensure there's space for the footer
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    marginBottom: 12,
    width: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderColor: 'black',
    borderWidth: 1,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'left',
    width: '90%',
  },
  button: {
    marginBottom: 20,
    width: '90%',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
  },
  buttonLabel: {
    color: 'white',
  },
  textButton: {
    marginTop: 10,
    width: '90%',
  },
  textButtonLabel: {
    color: 'orange',
    textShadowColor: 'rgba(0, 0, 0, 1)', // Black shadow with full opacity
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

export default SignUpScreen;
