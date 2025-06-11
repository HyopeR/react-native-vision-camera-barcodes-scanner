import React from 'react';
import {Camera, CameraProps} from 'react-native-vision-camera';
import {
  GestureStateChangeEvent,
  TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

export namespace GtCameraNs {
  export type Props = {
    type?: 'back' | 'front';
    flash?: 'on' | 'off';
    focusable?: boolean;
    events?: Events;
    style?: any;
    children?: any;
  } & Omit<CameraProps, 'device' | 'isActive'>;

  export type RefForward = React.ForwardedRef<Camera>;
  export type Ref = React.ElementRef<typeof Camera>;

  export type Events = {
    onPress?: (
      event: GestureStateChangeEvent<TapGestureHandlerEventPayload>,
    ) => void;
  };
}
