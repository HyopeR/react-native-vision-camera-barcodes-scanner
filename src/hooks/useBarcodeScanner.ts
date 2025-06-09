import { useMemo } from 'react';
import { createPlugin } from '../utils/createPlugin';
import type { ScannerPlugin, ScannerOptions } from '../types';

export function useBarcodeScanner(options?: ScannerOptions): ScannerPlugin {
  return useMemo(() => createPlugin(options), [options]);
}
