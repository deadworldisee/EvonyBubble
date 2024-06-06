import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { Text } from 'react-native-paper';
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
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Home Screen!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default HomeScreen;
