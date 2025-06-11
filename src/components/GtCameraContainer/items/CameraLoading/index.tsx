import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {CameraLoadingProps} from './index.type.ts';

const CameraLoading = ({style, ...props}: CameraLoadingProps) => {
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.text, style]} {...props}>
        Loading
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
  },
});

export default CameraLoading;
export type {CameraLoadingProps};
