import type {
  CameraProps as CameraVisionProps,
  Frame,
} from 'react-native-vision-camera';

export type {
  Frame,
  ReadonlyFrameProcessor,
  FrameProcessorPlugin,
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
  x: number;
  y: number;
  widthScale: number;
  heightScale: number;
};

export type Ratio = {
  width?: number;
  height?: number;
};
