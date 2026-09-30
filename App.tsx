/**
 * Mobile Computer-Vision System for Automated Interpretation
 * and Tamper-Evident Digital Recording of Colorimetric Field Test Results
 *
 * Bare React Native CLI + TypeScript
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Colors from './src/constants/colors';
import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default App;
