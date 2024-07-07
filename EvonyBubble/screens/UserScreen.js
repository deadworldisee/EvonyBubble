import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Image, Platform, Alert, TextInput, Text, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

function UserScreen({ navigation, onLogout }) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const getEmailAndName = async () => {
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('Retrieved userEmail:', userEmail);
      console.log('Retrieved userToken:', userToken);

      if (userEmail && userToken) {
        setEmail(userEmail);

        try {
          const response = await fetch('https://evonybubble.com/user_data.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'get_user',
              token: userToken,
            }),
          });

          const responseJson = await response.json();
          console.log('Response JSON:', responseJson);

          if (responseJson.success) {
            setPlayerName(responseJson.name);
          } else {
            Alert.alert('Error', responseJson.message);
          }
        } catch (error) {
          console.error('Fetch error: ', error);
          Alert.alert('Error', 'An error occurred while fetching user data.');
        }
      } else {
        console.log('User email or token not found in AsyncStorage.');
      }
    };
    getEmailAndName();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            await onLogout();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            setShowPasswordInput(true);
          }
        }
      ],
      { cancelable: false }
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      const response = await fetch('https://evonybubble.com/signupin.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_account',
          email,
          password,
        }),
      });

      const responseJson = await response.json();
      console.log('Response JSON:', responseJson);

      if (responseJson.success) {
        Alert.alert(
          "Success",
          responseJson.message,
          [
            {
              text: "OK",
              onPress: () => {
                setCountdown(60);
                const countdownInterval = setInterval(() => {
                  setCountdown(prevCountdown => {
                    if (prevCountdown <= 1) {
                      clearInterval(countdownInterval);
                      handleLogout();
                      return 0;
                    }
                    return prevCountdown - 1;
                  });
                }, 1000);
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert("Error", responseJson.message);
      }
    } catch (error) {
      console.error('Fetch error: ', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <ImageBackground source={require('../assets/main6.jpg')} style={styles.background}>
      <View style={styles.headerContainer}>
        <Image source={require('../assets/evony-bubble-back.png')} style={styles.headerImage} />
      </View>
      <Text style={styles.playerText}>Player: {playerName}</Text>
      <View style={styles.container}>
        <Button mode="contained" onPress={handleLogout} style={styles.button} labelStyle={styles.buttonLabel}>
          Logout
        </Button>
        <Button mode="contained" onPress={handleDeleteAccount} style={styles.button} labelStyle={styles.buttonLabel}>
          Delete Account
        </Button>
        {showPasswordInput && (
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor="gray"
              value={password}
              onChangeText={setPassword}
            />
            <View style={styles.confirmCancelContainer}>
              <Button mode="contained" onPress={confirmDeleteAccount} style={styles.confirmButton} labelStyle={styles.buttonLabel}>
                Confirm
              </Button>
              <Button mode="contained" onPress={() => setShowPasswordInput(false)} style={styles.cancelButton} labelStyle={styles.buttonLabel}>
                Cancel
              </Button>
            </View>
          </View>
        )}
        {countdown > 0 && (
          <Text style={styles.countdownText}>You will be logged out in {countdown} seconds</Text>
        )}
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
  playerText: {
    fontSize: 20,
    color: 'white',
    marginTop: 160, // Adjust margin to position the text correctly
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    alignContent: 'center',
    justifyContent: 'center',
    padding: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 1)', // Black shadow with full opacity
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
    borderBottomColor: 'rgba(0, 0, 0, 1)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100, // Ensure content starts below the header
  },
  button: {
    width: width * 0.75, // 75% of screen width
    borderRadius: 25,
    backgroundColor: 'rgba(255, 165, 0, 0.8)', // Match button color to theme
    marginVertical: 10, // Add margin to separate buttons
  },
  buttonLabel: {
    color: 'white',
  },
  passwordContainer: {
    width: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  confirmCancelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: 'red',
    marginRight: 5,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: 'green',
    marginLeft: 5,
  },
  countdownText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
});

export default UserScreen;
