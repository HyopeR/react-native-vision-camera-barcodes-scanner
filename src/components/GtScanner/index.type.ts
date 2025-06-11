import {ISharedValue} from 'react-native-worklets-core';
import {
  Barcode,
  BarcodeType,
  Orientation,
  Size,
} from 'react-native-vision-camera-barcodes-scanner';
import {GtCameraNs} from '../GtCamera';

export namespace GtScannerNs {
  export type Props = {
    fps?: number;
    ratio?: {width?: number; height?: number};
    orientation?: Orientation;
    viewSize?: Size;

    pattern?: RegExp;

    barcodeDetector?: boolean;
    barcodeTypes?: Array<keyof BarcodeType>;
    onDetectBarcode?: (barcodes: Barcode[]) => void;
  } & GtCameraNs.Props;

  export type RefForward = GtCameraNs.RefForward;
  export type Ref = GtCameraNs.Ref & {
    scanStart: () => void;
    scanPause: () => void;
    pause: ISharedValue<boolean>;
  };
}
