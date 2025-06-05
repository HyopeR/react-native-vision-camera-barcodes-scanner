import Foundation
import VisionCamera
import MLKitVision
import MLKitBarcodeScanning

@objc(VisionCameraBarcodesScanner)
public class VisionCameraBarcodesScanner: FrameProcessorPlugin {
    private var scannerBuilder: BarcodeScannerOptions = BarcodeScannerOptions(formats: .all)
    private var scannerBarcodeFormats: [Any] = []
    private var scannerRatio: Ratio = Ratio(width: 1, height: 1)

    public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
        super.init(proxy: proxy, options: options)

        scannerBarcodeFormats = ScannerUtils.getOptionsBarcodeFormats(options: options)
        scannerRatio = ScannerUtils.getOptionsRatio(options: options)

        let barcodeFormats = ScannerUtils.getSafeBarcodeFormats(formats: scannerBarcodeFormats)
        if barcodeFormats.contains(.all) {
            scannerBuilder = BarcodeScannerOptions(formats: .all)
        } else {
            scannerBuilder = BarcodeScannerOptions(formats: BarcodeFormat(barcodeFormats))
        }
    }

    public override func callback(_ frame: Frame,withArguments arguments: [AnyHashable: Any]?) -> Any {
        let scanner = BarcodeScanner.barcodeScanner(options: scannerBuilder)

        let imageBuffer = frame.buffer
        guard let imagePixelBuffer = CMSampleBufferGetImageBuffer(imageBuffer) else { return [] }

        let image = VisionImage(buffer: imageBuffer)
        image.orientation = ScannerUtils.getSafeOrientation(orientation: frame.orientation)
        let imageWidth = CVPixelBufferGetWidth(imagePixelBuffer)
        let imageHeight = CVPixelBufferGetHeight(imagePixelBuffer)
        let imageSize = Size(width: imageWidth, height: imageHeight)
        // let imageSizeWithRotation = ScannerUtils.getImageSizeWithRotation(size: imageSize, orientation: image.orientation)

        var array:[Any] = []
        let dispatchGroup = DispatchGroup()

        dispatchGroup.enter()
        scanner.process(image) { barcodes, error in
            defer { dispatchGroup.leave() }
            guard error == nil, let barcodes = barcodes else { return }

            let barcodesFiltered: [Barcode]
            if self.scannerRatio.width != 1.0 || self.scannerRatio.height != 1.0 {
                barcodesFiltered = ScannerUtils.filterBarcodes(barcodes: barcodes, size: imageSize, ratio: self.scannerRatio)
            } else {
                barcodesFiltered = barcodes
            }

            for barcode in barcodesFiltered {
                let map = ScannerUtils.formatBarcode(barcode: barcode, size: imageSize)
                array.append(map)
            }
        }
        dispatchGroup.wait()

        return array
    }
  }
