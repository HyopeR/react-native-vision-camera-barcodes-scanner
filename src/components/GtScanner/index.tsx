import React, {useCallback, useImperativeHandle} from 'react';
import {useRunOnJS, useSharedValue} from 'react-native-worklets-core';
import {useFrameProcessor} from 'react-native-vision-camera';
import {useBarcodeScanner} from 'react-native-vision-camera-barcodes-scanner';
import GtCamera from '../GtCamera';
import {GtScannerNs} from './index.type';

const GtScanner = (
  {
    fps = 30,
    ratio = {},
    orientation = 'portrait',
    viewSize,
    pattern,
    barcodeDetector,
    barcodeTypes,
    onDetectBarcode,
    children,
    ...props
  }: GtScannerNs.Props,
  ref: GtScannerNs.RefForward,
) => {
  const {scanBarcodes} = useBarcodeScanner({
    formats: barcodeTypes,
    ratio,
    orientation,
    viewSize,
  });

  const pause = useSharedValue(false);

  const scanStart = useCallback(() => {
    pause.value = false;
  }, [pause]);

  const scanPause = useCallback(() => {
    pause.value = true;
  }, [pause]);

  useImperativeHandle(
    ref,
    () => {
      // @ts-ignore
      return Object.assign(ref.current || {}, {scanStart, scanPause, pause});
    },
    [ref, scanPause, scanStart, pause],
  );

  const handleDetectBarcode = useRunOnJS(
    barcodes => {
      onDetectBarcode && onDetectBarcode(barcodes);
    },
    [onDetectBarcode],
  );

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (barcodeDetector) {
        const barcodes = scanBarcodes(frame);
        const barcodesFiltered = pattern
          ? barcodes.filter(barcode => barcode.rawValue.match(pattern))
          : barcodes;

        handleDetectBarcode(barcodesFiltered);
      }

      // runAtTargetFps(fps, () => {
      //   'worklet';
      //   if (barcodeDetector) {
      //     const barcodes = scanBarcodes(frame);
      //     const barcodesFiltered = pattern
      //       ? barcodes.filter(barcode => barcode.rawValue.match(pattern))
      //       : barcodes;
      //
      //     handleDetectBarcode(barcodesFiltered);
      //   }
      // });
    },
    [barcodeDetector, barcodeTypes, fps, pattern],
  );

  return (
    <GtCamera ref={ref} frameProcessor={frameProcessor} {...props}>
      {children}
    </GtCamera>
  );
};

export default React.forwardRef(GtScanner);
export type {GtScannerNs};
