import type { CameraProps } from 'react-native-vision-camera';
export type {
  Frame,
  ReadonlyFrameProcessor,
  FrameProcessorPlugin,
} from 'react-native-vision-camera';
import type { Frame } from 'react-native-vision-camera';

export type { ForwardedRef } from 'react';

type BarcodeType = Readonly<{
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

export type ScanRatio = {
  width?: number;
  height?: number;
};

export type ScannerOptions = {
  formats?: Array<keyof BarcodeType>;
  ratio?: ScanRatio;
};

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

export type CameraTypes = {
  callback: (data: Barcode[]) => void;
  options?: ScannerOptions;
} & CameraProps;

export type BarcodeScannerPlugin = {
  scanBarcodes: (frame: Frame) => Barcode[];
};
