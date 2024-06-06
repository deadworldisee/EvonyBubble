import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';

function PrivacyScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <IconButton
        icon="arrow-left"
        size={24}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />
      <Text style={styles.header}>Privacy Policy</Text>
      <Text style={styles.content}>
        {/* Add your privacy policy content here */}
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla auctor nisl vitae dui hendrerit, in porta est tincidunt. Cras vulputate purus at urna pharetra, id lacinia justo varius. Donec auctor metus non leo sagittis, a placerat turpis aliquet.
      </Text>
      <Text style={styles.footer}>Terms and Conditions</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
  },
  content: {
    fontSize: 16,
    color: 'white',
  },
  footer: {
    fontSize: 14,
    marginTop: 20,
    color: 'white',
    textAlign: 'center',
  },
});

export default PrivacyScreen;
