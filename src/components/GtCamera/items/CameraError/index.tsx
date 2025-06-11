import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {CameraErrorProps} from './index.type.ts';

const CameraError = ({title = 'Camera Issue'}: CameraErrorProps) => {
  return (
    <View style={styles.wrapper}>
      <Text>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CameraError;
export type {CameraErrorProps};
