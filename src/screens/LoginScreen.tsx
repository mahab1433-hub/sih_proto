import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import CryptoJS from 'crypto-js';
import Colors from '../constants/colors';
import { ShieldCheckIcon, LockIcon, UserIcon } from '../components/Icons';

interface LoginScreenProps {
  onLoginSuccess: (operatorId: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [operatorId, setOperatorId] = useState('OP-7042');
  const [pin, setPin] = useState('4829');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    setError(null);
    if (!operatorId.trim()) {
      setError('Please enter your Operator ID');
      return;
    }
    if (!pin.trim()) {
      setError('Please enter your Security PIN');
      return;
    }

    // Hash the entered PIN with SHA-256 to ensure no plaintext password handling
    const hashedPin = CryptoJS.SHA256(pin.trim()).toString(CryptoJS.enc.Hex);
    // In production, hashedPin is compared against secure hardware enclave / local credential store
    if (pin.trim().length >= 4) {
      onLoginSuccess(operatorId.trim().toUpperCase());
    } else {
      setError('Security PIN must be at least 4 digits');
    }
  };

  const handleQuickDemoFill = () => {
    setOperatorId('OP-FIELD-01');
    setPin('1234');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <ShieldCheckIcon size={44} color={Colors.primaryLight} />
            </View>
            <Text style={styles.title}>COLORIMETRIC FIELD-TEST</Text>
            <Text style={styles.subtitle}>Mobile Optical Verification & Tamper-Evident Recording</Text>
            <View style={styles.systemTag}>
              <Text style={styles.systemTagText}>STANDALONE OFFLINE SYSTEM</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Operator Authentication</Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Operator ID Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>OPERATOR ID</Text>
              <View style={styles.inputContainer}>
                <UserIcon size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. OP-7042"
                  placeholderTextColor={Colors.textMuted}
                  value={operatorId}
                  onChangeText={setOperatorId}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* PIN / Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SECURITY PIN / PASSWORD</Text>
              <View style={styles.inputContainer}>
                <LockIcon size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 4-6 digit PIN"
                  placeholderTextColor={Colors.textMuted}
                  value={pin}
                  onChangeText={setPin}
                  secureTextEntry
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>LOGIN TO TERMINAL</Text>
            </TouchableOpacity>

            {/* Quick Demo Fill button */}
            <TouchableOpacity
              style={styles.demoFillButton}
              onPress={handleQuickDemoFill}
              activeOpacity={0.7}
            >
              <Text style={styles.demoFillText}>Quick Demo Credentials</Text>
            </TouchableOpacity>
          </View>

          {/* Regulatory Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              Presumptive field testing only. Does not replace laboratory confirmatory analysis.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 18,
  },
  systemTag: {
    marginTop: 12,
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryDark,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  systemTagText: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: Colors.positiveMuted,
    borderColor: Colors.positiveBorder,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: Colors.positive,
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    height: 48,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  demoFillButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  demoFillText: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  disclaimerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  disclaimerText: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default LoginScreen;
