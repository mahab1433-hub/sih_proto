/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

// Native module mocks for Jest environment
const mockStorage: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
  setItem: jest.fn((key: string, val: string) => {
    mockStorage[key] = val;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    return Promise.resolve();
  }),
}));

jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevice: () => ({ id: 'back' }),
}));

jest.mock('react-native-permissions', () => ({
  check: jest.fn().mockResolvedValue('granted'),
  request: jest.fn().mockResolvedValue('granted'),
  PERMISSIONS: { ANDROID: { CAMERA: 'CAMERA', ACCESS_FINE_LOCATION: 'ACCESS_FINE_LOCATION' } },
  RESULTS: { GRANTED: 'granted', DENIED: 'denied', BLOCKED: 'blocked' },
}));

jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn((success) =>
    success({ coords: { latitude: 28.6139, longitude: 77.209, accuracy: 5 } })
  ),
}));

jest.mock('react-native-sqlite-storage', () => ({
  enablePromise: jest.fn(),
  openDatabase: jest.fn().mockResolvedValue({
    executeSql: jest.fn().mockResolvedValue([{ rows: { length: 0, item: () => null } }]),
  }),
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
