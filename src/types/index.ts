import type {
  CameraProps as CameraVisionProps,
  Frame,
  Orientation,
} from 'react-native-vision-camera';

export type {
  Frame,
  FrameProcessorPlugin,
  Orientation,
  ReadonlyFrameProcessor,
} from 'react-native-vision-camera';

export type { ForwardedRef } from 'react';

export type CameraProps = {
  callback: (data: Barcode[]) => void;
  options?: ScannerOptions;
} & CameraVisionProps;

export type ScannerPlugin = {
  scanBarcodes: (frame: Frame) => Barcode[];
};

export type ScannerOptions = {
  formats?: Array<keyof BarcodeType>;
  ratio?: Ratio;
  orientation?: Orientation;
};

export type BarcodeType = Readonly<{
  aztec: string;
  code_128: string;
  code_39: string;
  code_93: string;
  codabar: string;
  ean_13: string;
  ean_8: string;
  pdf_417: string;
  qr: string;
  upc_e: string;
  upc_a: string;
  itf: string;
  data_matrix: string;
  all: string;
}>;

export type Barcode = {
  rawValue: string;
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  leftRatio: number;
  topRatio: number;
  widthRatio: number;
  heightRatio: number;
};

export type Ratio = {
  width?: number;
  height?: number;
};

export type Size = {
  width: number;
  height: number;
};
