import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {ScannerMaskLineProps} from './index.type';

const Limit = {start: 0, end: 100};
const Movement = {down: 0, up: 1};

const ScannerMaskLine = ({
  show = true,
  pause = false,
  color = 'white',
  width = '100%',
  height = 4,
  duration = 4000,
}: ScannerMaskLineProps) => {
  const top = useSharedValue(Limit.start);
  const paused = useSharedValue(pause);
  const movement = useSharedValue(Movement.down);

  const mountRef = useRef(false);

  const config = useMemo(() => {
    return {duration: duration, easing: Easing.linear};
  }, [duration]);

  const startAnimation = useCallback(() => {
    const input = [Limit.start, Limit.end];
    const output = [Limit.end, Limit.start];
    const interpol = interpolate(top.value, input, output);
    top.value = withRepeat(
      withTiming(interpol, config, finished => {
        if (finished) {
          movement.value = movement.value === Movement.down ? 1 : 0;
        }
      }),
      -1,
      true,
    );
  }, [config, movement, top]);

  useEffect(() => {
    startAnimation();
    return () => {
      cancelAnimation(top);
    };
  }, [startAnimation, top]);

  useEffect(() => {
    if (!mountRef.current) {
      mountRef.current = true;
    } else {
      pause ? pauseAnimation() : continueAnimation();
    }
  }, [pause]);

  const pauseAnimation = () => {
    paused.value = true;
    cancelAnimation(top);
  };

  const continueAnimation = () => {
    paused.value = false;

    const target = movement.value === Movement.down ? Limit.end : Limit.start;
    const diffDistance = Math.abs(target - top.value);
    const diffDuration = (diffDistance * config.duration) / Limit.end;
    const diffConfig = {...config, duration: diffDuration};

    top.value = withTiming(target, diffConfig, finished => {
      if (finished) {
        movement.value = movement.value === Movement.down ? 1 : 0;
        runOnJS(startAnimation)();
      }
    });
  };

  const lineStyle = useMemo(() => {
    return StyleSheet.flatten([
      {position: 'absolute'},
      {opacity: Number(show || false)},
      color && {backgroundColor: color},
      height && {height},
      width && {width},
    ]) as any;
  }, [color, height, show, width]);

  const lineAnimStyle = useAnimatedStyle(() => ({top: `${top.value}%`}), []);

  return <Animated.View style={[lineStyle, lineAnimStyle]} />;
};

export default ScannerMaskLine;
export type {ScannerMaskLineProps};
