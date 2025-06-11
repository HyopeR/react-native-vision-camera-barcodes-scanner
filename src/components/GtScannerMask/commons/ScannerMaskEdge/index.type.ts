type ScannerMaskEdge = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export type ScannerMaskEdgeProps = {
  edge: ScannerMaskEdge;
  color?: string;
  width?: number;
  height?: number;
  size?: number;
};
