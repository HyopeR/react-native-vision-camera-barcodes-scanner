import { VisionCameraProxy } from 'react-native-vision-camera';
import type {
  Frame,
  ScannerOptions,
  BarcodeScannerPlugin,
  Barcode,
} from './types';

const LINKING_ERROR = `Can't load plugin scanBarcodes.Try cleaning cache or reinstall plugin.`;

export function createBarcodeScannerPlugin(
  options?: ScannerOptions
): BarcodeScannerPlugin {
  const optionsSafe = options || {} as ScannerOptions;

  const plugin = VisionCameraProxy.initFrameProcessorPlugin('scanBarcodes', optionsSafe);
  if (!plugin) {
    throw new Error(LINKING_ERROR);
  }

  return {
    scanBarcodes: (frame: Frame): Barcode[] => {
      'worklet';
      // @ts-ignore
      return plugin.call(frame) as Barcode[];
    },
  };
}
