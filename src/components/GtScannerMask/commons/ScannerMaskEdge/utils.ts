import {StyleSheet} from 'react-native';
import {ScannerMaskEdgeProps} from './index.type';

export const getEdgeStyle = ({
  edge,
  color,
  width,
  height,
  size,
}: Required<ScannerMaskEdgeProps>) => {
  return StyleSheet.flatten([
    {position: 'absolute'},
    {width},
    {height},
    color && {borderColor: color},
    styles[edge as keyof typeof styles](size || 10),
  ]);
};

const styles = {
  topRight: (size: number) => ({
    borderRightWidth: size,
    borderTopWidth: size,
    top: 0,
    right: 0,
  }),
  topLeft: (size: number) => ({
    borderLeftWidth: size,
    borderTopWidth: size,
    top: 0,
    left: 0,
  }),
  bottomRight: (size: number) => ({
    borderRightWidth: size,
    borderBottomWidth: size,
    bottom: 0,
    right: 0,
  }),
  bottomLeft: (size: number) => ({
    borderLeftWidth: size,
    borderBottomWidth: size,
    bottom: 0,
    left: 0,
  }),
};
