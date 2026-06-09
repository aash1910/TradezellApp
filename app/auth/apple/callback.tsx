import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function AppleCallbackScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completing Apple Sign-In</Text>
      <Text style={styles.subtitle}>
        {Platform.OS === 'web'
          ? 'You can close this window if it does not close automatically.'
          : 'Returning to app...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
  },
});
