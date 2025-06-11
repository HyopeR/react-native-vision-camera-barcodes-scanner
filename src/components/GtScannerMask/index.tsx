import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import ScannerMaskLine from './commons/ScannerMaskLine';
import ScannerMaskEdge from './commons/ScannerMaskEdge';
import {GtScannerMaskProps} from './index.type';

const GtScannerMask = ({
  width,
  height,
  pause,
  backdropColor = 'rgba(50, 100, 200, 0.3)',
  backdropOpacity = 1,
  edgeColor = '#FFF',
  edgeWidth = 5,
  lineShow = true,
  lineColor = '#FFF',
  lineWidth = 2,
  lineOffset = 5,
  style,
}: GtScannerMaskProps) => {
  const backdropStyle = useMemo<any>(() => {
    return StyleSheet.flatten([
      styles.backdrop,
      backdropColor && {backgroundColor: backdropColor},
      backdropOpacity && {opacity: backdropOpacity},
    ]);
  }, [backdropColor, backdropOpacity]);

  return (
    <View
      style={StyleSheet.compose(styles.wrapper, style)}
      pointerEvents={'none'}>
      <View style={backdropStyle} />

      <View style={styles.body}>
        <View style={backdropStyle} />

        <View style={{...styles.mask, width, height}}>
          <View
            style={{
              ...styles.maskBody,
              marginTop: edgeWidth + lineOffset,
              marginBottom: edgeWidth + lineWidth + lineOffset,
              marginHorizontal: edgeWidth + lineOffset,
            }}>
            <ScannerMaskLine
              show={lineShow}
              pause={pause}
              color={lineColor}
              width={'100%'}
              height={lineWidth}
            />
          </View>

          <ScannerMaskEdge
            edge={'topLeft'}
            color={edgeColor}
            size={edgeWidth}
          />
          <ScannerMaskEdge
            edge={'topRight'}
            color={edgeColor}
            size={edgeWidth}
          />
          <ScannerMaskEdge
            edge={'bottomLeft'}
            color={edgeColor}
            size={edgeWidth}
          />
          <ScannerMaskEdge
            edge={'bottomRight'}
            color={edgeColor}
            size={edgeWidth}
          />
        </View>

        <View style={backdropStyle} />
      </View>

      <View style={backdropStyle} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  body: {
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
  },
  mask: {
    position: 'relative',
  },
  maskBody: {
    flex: 1,
    alignItems: 'center',
  },
});

export default GtScannerMask;
export type {GtScannerMaskProps};
