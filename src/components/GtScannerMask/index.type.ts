import {StyleProp, ViewStyle} from 'react-native';

export type GtScannerMaskProps = {
  width: number;
  height: number;
  pause?: boolean;
  backdropColor?: string;
  backdropOpacity?: number;
  edgeColor?: string;
  edgeWidth?: number;
  lineShow?: boolean;
  lineColor?: string;
  lineWidth?: number;
  lineOffset?: number;
  style?: StyleProp<ViewStyle>;
};
