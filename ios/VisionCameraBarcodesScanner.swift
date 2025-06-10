import Foundation
import VisionCamera
import MLKitVision
import MLKitBarcodeScanning

@objc(VisionCameraBarcodesScanner)
public class VisionCameraBarcodesScanner: FrameProcessorPlugin {
    private var scannerBuilder: BarcodeScannerOptions = BarcodeScannerOptions(formats: .all)
    private var scannerBarcodeFormats: [Any] = []
    private var scannerRatio: Ratio = Ratio(width: 1, height: 1)
    private var scannerOrientation: UIDeviceOrientation = .portrait

    public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
        super.init(proxy: proxy, options: options)

        scannerBarcodeFormats = ScannerUtils.getOptionsBarcodeFormats(options: options)
        scannerRatio = ScannerUtils.getOptionsRatio(options: options)
        scannerOrientation = ScannerUtils.getOptionsOrientation(options: options)

        let barcodeFormats = ScannerUtils.getSafeBarcodeFormats(formats: scannerBarcodeFormats)
        if barcodeFormats.contains(.all) {
            scannerBuilder = BarcodeScannerOptions(formats: .all)
        } else {
            scannerBuilder = BarcodeScannerOptions(formats: BarcodeFormat(barcodeFormats))
        }
    }

    /*
     The iOS camera detects the image as "landscapeRight" by default.
     frame.orientation is a value that tells us how to convert the image to "portrait" mode.
     frame.orientation does not directly reflect the orientation of the image!

     In rotation operations; the device's own "front face" is taken as reference.
     The screen is facing you and the rotation is done by taking the top of the device as reference.

     Image Orientation (Default)    Phone Orientation    Frame Orientation    Description
     landscapeRight                 portrait             .right               Rotate 90° CW
     landscapeRight                 landscapeRight       .up                  Rotate Not
     landscapeRight                 landscapeLeft        .down                Rotate 180°
     landscapeRight                 portraitUpsideDown   .left                Rotate 90° CCW
     */
    public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any {
        let scanner = BarcodeScanner.barcodeScanner(options: scannerBuilder)

        let imageBuffer = frame.buffer
        guard let imagePixelBuffer = CMSampleBufferGetImageBuffer(imageBuffer) else { return [] }

        let image = VisionImage(buffer: imageBuffer)
        image.orientation = ScannerUtils.getSafeRotation(rotation: frame.orientation)
        let imageWidth = CVPixelBufferGetWidth(imagePixelBuffer)
        let imageHeight = CVPixelBufferGetHeight(imagePixelBuffer)

        // Adjusts image size for portrait rotations (.left or .right)
        let imageSizeRaw = Size(width: imageWidth, height: imageHeight)
        let imageSize = ScannerUtils.getImageSizeByRotation(size: imageSizeRaw, rotation: image.orientation)

        var array:[Any] = []
        let dispatchGroup = DispatchGroup()

        dispatchGroup.enter()
        scanner.process(image) { barcodes, error in
            defer { dispatchGroup.leave() }
            guard error == nil, let barcodes = barcodes else { return }

            let barcodesFiltered: [Barcode]
            if self.scannerRatio.width != 1.0 || self.scannerRatio.height != 1.0 {
                barcodesFiltered = ScannerUtils.filterBarcodes(
                    barcodes: barcodes,
                    size: imageSize,
                    ratio: self.scannerRatio,
                    rotation: image.orientation
                )
            } else {
                barcodesFiltered = barcodes
            }

            for barcode in barcodesFiltered {
                let map = ScannerUtils.formatBarcode(
                    barcode: barcode,
                    size: imageSize,
                    orientation: self.scannerOrientation,
                    rotation: image.orientation
                )
                array.append(map)
            }
        }
        dispatchGroup.wait()

        return array
    }
  }
