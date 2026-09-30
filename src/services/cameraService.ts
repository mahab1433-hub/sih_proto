/**
 * Camera Service
 * Wraps react-native-vision-camera and permissions
 */

import { Platform, PermissionsAndroid } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export interface CameraPermissionState {
  hasPermission: boolean;
  status: 'granted' | 'denied' | 'blocked' | 'not-determined';
}

export async function checkAndRequestCameraPermission(): Promise<CameraPermissionState> {
  try {
    const cameraPermission = Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.CAMERA
      : PERMISSIONS.IOS.CAMERA;

    const checkStatus = await check(cameraPermission);

    if (checkStatus === RESULTS.GRANTED) {
      return { hasPermission: true, status: 'granted' };
    }

    if (checkStatus === RESULTS.BLOCKED) {
      return { hasPermission: false, status: 'blocked' };
    }

    const requestStatus = await request(cameraPermission);

    if (requestStatus === RESULTS.GRANTED) {
      return { hasPermission: true, status: 'granted' };
    }

    // Permission not granted through react-native-permissions
    return {
      hasPermission: false,
      status: requestStatus === RESULTS.BLOCKED ? 'blocked' : 'denied',
    };
  } catch (error) {
    console.warn('Camera permission request error:', error);
    // Android fallback
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'The field test application requires camera access to capture colorimetric reactions.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      return {
        hasPermission: granted === PermissionsAndroid.RESULTS.GRANTED,
        status: granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied',
      };
    } catch (e) {
      return { hasPermission: false, status: 'denied' };
    }
  }
}
