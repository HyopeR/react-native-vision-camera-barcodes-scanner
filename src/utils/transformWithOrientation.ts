import type { Barcode } from 'react-native-vision-camera-barcodes-scanner';
import type { BarcodeRect, Orientation, Size } from '../types';

// This is a temporary feature.
// In Swift and Kotlin codes, the device orientation direction is not matched to the coordinates.
// This may be deprecated when this feature is developed on the native side.
export function transformWithOrientation(
  barcode: Barcode,
  size: Size,
  orientation: Orientation
): BarcodeRect {
  switch (orientation) {
    case 'landscape-left':
      return {
        left: (1 - barcode.topRatio - barcode.heightRatio) * size.width,
        top: barcode.leftRatio * size.height,
        width: barcode.heightRatio * size.width,
        height: barcode.widthRatio * size.height,
      };
    case 'portrait-upside-down':
      return {
        left: (1 - barcode.leftRatio - barcode.widthRatio) * size.width,
        top: (1 - barcode.topRatio - barcode.heightRatio) * size.height,
        width: barcode.widthRatio * size.width,
        height: barcode.heightRatio * size.height,
      };
    case 'landscape-right':
      return {
        left: barcode.topRatio * size.width,
        top: (1 - barcode.leftRatio - barcode.widthRatio) * size.height,
        width: barcode.heightRatio * size.width,
        height: barcode.widthRatio * size.height,
      };
    case 'portrait':
    default:
      return {
        left: barcode.leftRatio * size.width,
        top: barcode.topRatio * size.height,
        width: barcode.widthRatio * size.width,
        height: barcode.heightRatio * size.height,
      };
  }
}
