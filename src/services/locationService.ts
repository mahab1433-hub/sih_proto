/**
 * GPS Location Service
 * Handles Android runtime location permissions and coordinates fetching
 * with graceful fallback if GPS is unavailable.
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export interface LocationCoordinates {
  latitude: number | null;
  longitude: number | null;
  accuracy?: number | null;
  isAvailable: boolean;
  message?: string;
}

/**
 * Requests location permission for Android
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const fineLocationPermission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      const status = await check(fineLocationPermission);

      if (status === RESULTS.GRANTED) {
        return true;
      }

      const reqStatus = await request(fineLocationPermission);
      return reqStatus === RESULTS.GRANTED;
    } catch (err) {
      // Fallback to React Native PermissionsAndroid
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This application requires location access to record GPS coordinates for field-test records.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (e) {
        console.warn('Location permission request error:', e);
        return false;
      }
    }
  }
  return true;
}

/**
 * Gets current device GPS coordinates
 * Returns coordinates or graceful fallback
 */
export async function getCurrentCoordinates(): Promise<LocationCoordinates> {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    return {
      latitude: null,
      longitude: null,
      isAvailable: false,
      message: 'Location permission not granted',
    };
  }

  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isAvailable: true,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        // Fallback for prototype or indoor testing
        resolve({
          latitude: null,
          longitude: null,
          isAvailable: false,
          message: 'Location unavailable',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      }
    );
  });
}
