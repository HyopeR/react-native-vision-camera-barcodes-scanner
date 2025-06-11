import React, {useEffect, useRef} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {CameraFocusPointProps} from './index.type.ts';

const CameraFocusPoint = ({x, y}: CameraFocusPointProps) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  const mountRef = useRef(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!mountRef.current) {
      mountRef.current = true;
    } else {
      opacity.value = 1;
      scale.value = 1;
      timeout = setTimeout(() => {
        opacity.value = 0;
        scale.value = 0.5;
      }, 750);
    }

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [x, y]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(opacity.value, {
        damping: 10,
        stiffness: 100,
      }),
      transform: [
        {
          scale: withSpring(scale.value, {
            damping: 10,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: 'rgba(255,255,255,0.4)',
          borderColor: 'rgb(255,255,255)',
          borderWidth: 2,
          position: 'absolute',
          width: 50,
          height: 50,
          borderRadius: 50 / 2,
          left: x - 25,
          top: y - 25,
        },
        animatedStyle,
      ]}
    />
  );
};

export default CameraFocusPoint;
export type {CameraFocusPointProps};
