import React, {useCallback, useEffect} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {requestMultiple, PERMISSIONS} from 'react-native-permissions';
import CameraLoading from './items/CameraLoading';
import CameraPermission from './items/CameraPermission';
import {GtCameraContainerProps} from './index.type.ts';

const GtCameraContainer = ({
  style,
  children,
  ...props
}: GtCameraContainerProps) => {
  const [cameraAllow, setCameraAllow] = React.useState(false);
  const [microphoneAllow, setMicrophoneAllow] = React.useState(false);

  const isFocused = true;
  const isAuthorized = cameraAllow && microphoneAllow;

  const permissionRun = useCallback(() => {
    if (Platform.OS === 'android') {
      requestMultiple([
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
      ])
        .then(result => {
          setCameraAllow(result['android.permission.CAMERA'] === 'granted');
          setMicrophoneAllow(
            result['android.permission.RECORD_AUDIO'] === 'granted',
          );
        })
        .catch(() => {
          setCameraAllow(false);
          setMicrophoneAllow(false);
        });
    } else {
      requestMultiple([PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE])
        .then(result => {
          setCameraAllow(result['ios.permission.CAMERA'] === 'granted');
          setMicrophoneAllow(result['ios.permission.MICROPHONE'] === 'granted');
        })
        .catch(() => {
          setCameraAllow(false);
          setMicrophoneAllow(false);
        });
    }
  }, []);

  useEffect(() => {
    if (!cameraAllow || !microphoneAllow) {
      permissionRun();
    }
  }, [permissionRun]);

  if (!isFocused) {
    return (
      <View style={[styles.wrapper, style]} {...props}>
        <CameraLoading />
      </View>
    );
  }

  if (!isAuthorized) {
    return (
      <View style={[styles.wrapper, style]} {...props}>
        <CameraPermission onPress={() => permissionRun()} />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
  },
});

export default GtCameraContainer;
export type {GtCameraContainerProps};
