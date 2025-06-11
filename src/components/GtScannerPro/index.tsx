import React, {useMemo} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import GtScanner from '../GtScanner';
import GtScannerMask from '../GtScannerMask';
import {GtScannerProNs} from './index.type';
import {useScreenDimensions} from '../../hooks';

const GtScannerPro = (
  {
    code,
    ratio = {width: 0.8, height: 0.5},
    maskPause,
    maskShow,
    maskLineShow,
    maskProps,
    children,
    ...props
  }: GtScannerProNs.Props,
  ref: GtScannerProNs.RefForward,
) => {
  const size = useScreenDimensions();

  const mask = useMemo(() => {
    const wRatio = ratio?.width ?? 1;
    const hRatio = ratio?.height ?? 1;
    const wScale = size.width > size.height ? hRatio : wRatio;
    const hScale = size.height > size.width ? hRatio : wRatio;

    return {
      width: size.width * wScale,
      height: size.height * hScale,
    };
  }, [ratio, size.height, size.width]);

  return (
    <GtScanner ref={ref} ratio={ratio} {...props}>
      <View style={styles.wrapper} pointerEvents={'box-none'}>
        <View style={styles.header} pointerEvents={'box-none'}>
          {code !== '' && (
            <View
              style={{
                ...styles.headerBody,
                width: mask.width,
                backgroundColor: '#CCC',
              }}>
              <Text numberOfLines={1}>{code}</Text>
            </View>
          )}
        </View>

        <GtScannerMask
          pause={maskPause}
          width={mask.width}
          height={mask.height}
          lineShow={maskLineShow}
          style={{...styles.mask, opacity: Number(maskShow || false)}}
          {...maskProps}
        />

        {children}
      </View>
    </GtScanner>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerBody: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mask: StyleSheet.absoluteFill as any,
});

export default React.forwardRef(GtScannerPro);
export type {GtScannerProNs};
