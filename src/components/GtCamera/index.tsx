import React, {useState, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {runOnJS} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {Camera, Point, useCameraDevice} from 'react-native-vision-camera';
import CameraError from './items/CameraError';
import CameraFocusPoint from './items/CameraFocusPoint';
import {GtCameraNs} from './index.type.ts';

const GtCamera = (
  {
    type = 'back',
    focusable = true,
    events,
    style,
    children,
    ...props
  }: GtCameraNs.Props,
  ref: GtCameraNs.RefForward,
) => {
  const device = useCameraDevice(type);

  const [focusPoint, setFocusPoint] = useState({x: 0, y: 0});
  const focus = useCallback(
    (point: Point) => {
      if (ref && 'current' in ref && focusable) {
        ref.current?.focus(point);
        setFocusPoint({x: point.x, y: point.y});
      }
    },
    [focusable, ref],
  );

  const gesture = Gesture.Tap()
    .onStart(event => {
      if (events?.onPress) {
        runOnJS(events.onPress)(event);
      }
    })
    .onEnd(({x, y}) => {
      runOnJS(focus)({x, y});
    });

  if (!device) {
    return (
      <View style={[styles.wrapper, style]}>
        <CameraError />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <GestureDetector gesture={gesture}>
        <Camera
          ref={ref}
          device={device}
          isActive={true}
          style={StyleSheet.absoluteFill}
          {...props}
        />
      </GestureDetector>
      {children}
      <CameraFocusPoint {...focusPoint} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
});

export default React.forwardRef(GtCamera);
export type {GtCameraNs};
