import {GtScannerNs} from '../GtScanner';
import {GtScannerMaskProps} from '../GtScannerMask';

export namespace GtScannerProNs {
  export type Props = {
    code?: string;
    maskPause?: boolean;
    maskShow?: boolean;
    maskLineShow?: boolean;
    maskProps?: Omit<
      GtScannerMaskProps,
      'width' | 'height' | 'pause' | 'style'
    >;
  } & GtScannerNs.Props;

  export type Ref = GtScannerNs.Ref;
  export type RefForward = GtScannerNs.RefForward;
}
