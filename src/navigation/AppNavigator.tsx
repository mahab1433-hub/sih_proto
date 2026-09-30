import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Colors from '../constants/colors';
import {
  ShieldCheckIcon,
  PlusIcon,
  SearchIcon,
  UserIcon,
} from '../components/Icons';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { NewTestScreen, TestInfoFormData } from '../screens/NewTestScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { ImageReviewScreen } from '../screens/ImageReviewScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { TestHistoryScreen } from '../screens/TestHistoryScreen';
import { TestDetailsScreen } from '../screens/TestDetailsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TestRecord } from '../models/TestRecord';
import { ImageValidationResult } from '../services/imageValidation';

type AppTab = 'DASHBOARD' | 'NEW_TEST' | 'HISTORY' | 'PROFILE';

type ScreenState =
  | { name: 'TAB_ROOT'; tab: AppTab }
  | { name: 'CAMERA_CAPTURE'; testData: TestInfoFormData }
  | {
      name: 'IMAGE_REVIEW';
      testData: TestInfoFormData;
      imageUri: string;
      imageWidth: number;
      imageHeight: number;
      isDemoImage?: boolean;
    }
  | {
      name: 'RESULT_SCREEN';
      testData: TestInfoFormData;
      imageUri: string;
      validation: ImageValidationResult;
    }
  | { name: 'TEST_DETAILS'; record: TestRecord };

export const AppNavigator: React.FC = () => {
  const [operatorId, setOperatorId] = useState<string | null>('OP-FIELD-01');
  const [currentScreen, setCurrentScreen] = useState<ScreenState>({
    name: 'TAB_ROOT',
    tab: 'DASHBOARD',
  });

  // If not logged in, show Login Screen
  if (!operatorId) {
    return (
      <LoginScreen
        onLoginSuccess={(id) => {
          setOperatorId(id);
          setCurrentScreen({ name: 'TAB_ROOT', tab: 'DASHBOARD' });
        }}
      />
    );
  }

  // Render modal / full-screen flows
  if (currentScreen.name === 'CAMERA_CAPTURE') {
    return (
      <CameraScreen
        testData={currentScreen.testData}
        onImageCaptured={(imageUri, imageWidth, imageHeight, isDemoImage) => {
          setCurrentScreen({
            name: 'IMAGE_REVIEW',
            testData: currentScreen.testData,
            imageUri,
            imageWidth,
            imageHeight,
            isDemoImage,
          });
        }}
        onCancel={() => {
          setCurrentScreen({ name: 'TAB_ROOT', tab: 'NEW_TEST' });
        }}
      />
    );
  }

  if (currentScreen.name === 'IMAGE_REVIEW') {
    return (
      <ImageReviewScreen
        testData={currentScreen.testData}
        imageUri={currentScreen.imageUri}
        imageWidth={currentScreen.imageWidth}
        imageHeight={currentScreen.imageHeight}
        isDemoImage={currentScreen.isDemoImage}
        onRetake={() => {
          setCurrentScreen({
            name: 'CAMERA_CAPTURE',
            testData: currentScreen.testData,
          });
        }}
        onProceedToClassification={(validatedUri, validation) => {
          setCurrentScreen({
            name: 'RESULT_SCREEN',
            testData: currentScreen.testData,
            imageUri: validatedUri,
            validation,
          });
        }}
      />
    );
  }

  if (currentScreen.name === 'RESULT_SCREEN') {
    return (
      <ResultScreen
        testData={currentScreen.testData}
        imageUri={currentScreen.imageUri}
        validation={currentScreen.validation}
        onFinishAndGoDashboard={() => {
          setCurrentScreen({ name: 'TAB_ROOT', tab: 'DASHBOARD' });
        }}
        onViewRecordDetails={(record) => {
          setCurrentScreen({ name: 'TEST_DETAILS', record });
        }}
      />
    );
  }

  if (currentScreen.name === 'TEST_DETAILS') {
    return (
      <TestDetailsScreen
        record={currentScreen.record}
        onBack={() => {
          setCurrentScreen({ name: 'TAB_ROOT', tab: 'HISTORY' });
        }}
        onRecordDeleted={() => {
          setCurrentScreen({ name: 'TAB_ROOT', tab: 'HISTORY' });
        }}
      />
    );
  }

  // TAB_ROOT: Render active tab and bottom navigation
  const activeTab = currentScreen.tab;

  return (
    <View style={styles.container}>
      <View style={styles.tabContent}>
        {activeTab === 'DASHBOARD' && (
          <DashboardScreen
            operatorId={operatorId}
            onNavigateNewTest={() => setCurrentScreen({ name: 'TAB_ROOT', tab: 'NEW_TEST' })}
            onNavigateRecordDetails={(record) => setCurrentScreen({ name: 'TEST_DETAILS', record })}
            onNavigateHistory={() => setCurrentScreen({ name: 'TAB_ROOT', tab: 'HISTORY' })}
          />
        )}

        {activeTab === 'NEW_TEST' && (
          <NewTestScreen
            operatorId={operatorId}
            onProceedToCamera={(data) => {
              if (data.isDemo && data.demoScenario) {
                // If demo scenario chosen, proceed with calibrated demo pipeline
                setCurrentScreen({
                  name: 'IMAGE_REVIEW',
                  testData: data,
                  imageUri: `demo://sample_${data.demoScenario.toLowerCase()}.png`,
                  imageWidth: 1920,
                  imageHeight: 1080,
                  isDemoImage: true,
                });
              } else {
                setCurrentScreen({ name: 'CAMERA_CAPTURE', testData: data });
              }
            }}
            onCancel={() => setCurrentScreen({ name: 'TAB_ROOT', tab: 'DASHBOARD' })}
          />
        )}

        {activeTab === 'HISTORY' && (
          <TestHistoryScreen
            onSelectRecord={(record) => setCurrentScreen({ name: 'TEST_DETAILS', record })}
            onNavigateNewTest={() => setCurrentScreen({ name: 'TAB_ROOT', tab: 'NEW_TEST' })}
          />
        )}

        {activeTab === 'PROFILE' && (
          <ProfileScreen
            operatorId={operatorId}
            onLogout={() => {
              setOperatorId(null);
            }}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <SafeAreaView style={styles.bottomBarSafeArea}>
        <View style={styles.bottomBar}>
          {/* Dashboard Tab */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentScreen({ name: 'TAB_ROOT', tab: 'DASHBOARD' })}
            activeOpacity={0.7}
          >
            <ShieldCheckIcon
              size={22}
              color={activeTab === 'DASHBOARD' ? Colors.primaryLight : Colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'DASHBOARD' && styles.navLabelActive,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          {/* New Test Tab (Center highlighted button) */}
          <TouchableOpacity
            style={styles.navItemCenter}
            onPress={() => setCurrentScreen({ name: 'TAB_ROOT', tab: 'NEW_TEST' })}
            activeOpacity={0.8}
          >
            <View style={styles.navCenterButton}>
              <PlusIcon size={24} color="#FFFFFF" />
            </View>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'NEW_TEST' && styles.navLabelActive,
              ]}
            >
              New Test
            </Text>
          </TouchableOpacity>

          {/* History Tab */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentScreen({ name: 'TAB_ROOT', tab: 'HISTORY' })}
            activeOpacity={0.7}
          >
            <SearchIcon
              size={22}
              color={activeTab === 'HISTORY' ? Colors.primaryLight : Colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'HISTORY' && styles.navLabelActive,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>

          {/* Profile Tab */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentScreen({ name: 'TAB_ROOT', tab: 'PROFILE' })}
            activeOpacity={0.7}
          >
            <UserIcon
              size={22}
              color={activeTab === 'PROFILE' ? Colors.primaryLight : Colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'PROFILE' && styles.navLabelActive,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabContent: {
    flex: 1,
  },
  bottomBarSafeArea: {
    backgroundColor: Colors.surface,
  },
  bottomBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  navItemCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -16,
  },
  navCenterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  navLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  navLabelActive: {
    color: Colors.primaryLight,
  },
});

export default AppNavigator;
