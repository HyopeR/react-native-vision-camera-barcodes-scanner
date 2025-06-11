import React, {useMemo} from 'react';
import {View} from 'react-native';
import {getEdgeStyle} from './utils';
import {ScannerMaskEdgeProps} from './index.type';

const ScannerMaskEdge = ({
  edge,
  color = 'white',
  width = 30,
  height = 30,
  size = 10,
}: ScannerMaskEdgeProps) => {
  const edgeStyle = useMemo<any>(() => {
    return getEdgeStyle({edge, color, width, height, size});
  }, [color, edge, height, size, width]);

  return <View style={edgeStyle} />;
};

export default ScannerMaskEdge;
export type {ScannerMaskEdgeProps};
