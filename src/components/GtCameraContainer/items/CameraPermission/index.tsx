import React from 'react';
import {TouchableOpacity, View, StyleSheet, Text} from 'react-native';
import {CameraPermissionProps} from './index.type.ts';

const CameraPermission = ({style, ...props}: CameraPermissionProps) => {
  return (
    <TouchableOpacity style={[styles.touch, style]} {...props}>
      <View style={styles.container}>
        <Text style={styles.text}>Camera & Audio Permission need.</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touch: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
  },
});

export default CameraPermission;
export type {CameraPermissionProps};
