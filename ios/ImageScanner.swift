import Foundation
import React
import MLKitBarcodeScanning
import MLKitVision

@objc(ImageScanner)
class ImageScanner: NSObject {
    private var scannerBuilder: BarcodeScannerOptions = BarcodeScannerOptions(formats: .all)

    @objc(process:options:withResolver:withRejecter:)
    private func process(
        uri: String,
        options: [AnyHashable: Any]! = [:],
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        let scannerBarcodeFormats = ScannerUtils.getOptionsBarcodeFormats(options: options)
        let scannerRatio = ScannerUtils.getOptionsRatio(options: options)
        let scannerOrientation = ScannerUtils.getOptionsOrientation(options: options)

        let barcodeFormats = ScannerUtils.getSafeBarcodeFormats(formats: scannerBarcodeFormats)
        if barcodeFormats.contains(.all) {
            scannerBuilder = BarcodeScannerOptions(formats: .all)
        } else {
            scannerBuilder = BarcodeScannerOptions(formats: BarcodeFormat(barcodeFormats))
        }

        var array: [Any] = []
        let scanner = BarcodeScanner.barcodeScanner(options: scannerBuilder)

        guard let imageUI = UIImage(contentsOfFile: uri) else {
            reject("Error", "Can't find photo.", nil)
            return
        }

        guard let imageCG = imageUI.cgImage else {
            reject("Error", "Couldn't get CGImage from UIImage.", nil)
            return
        }

        let image = VisionImage(image: imageUI)
        image.orientation = imageUI.imageOrientation
        let imageSize = Size(width: imageCG.width, height: imageCG.height)

        do {
            let barcodes = try scanner.results(in: image)
            let barcodesFiltered: [Barcode]
            if scannerRatio.width != 1.0 || scannerRatio.height != 1.0 {
                barcodesFiltered = ScannerUtils.filterBarcodes(
                    barcodes: barcodes,
                    size: imageSize,
                    ratio: scannerRatio,
                    rotation: image.orientation
                )
            } else {
                barcodesFiltered = barcodes
            }

            for barcode in barcodesFiltered {
                let map = ScannerUtils.formatBarcode(
                    barcode: barcode,
                    size: imageSize,
                    orientation: scannerOrientation,
                    rotation: image.orientation
                )
                array.append(map)
            }
            resolve(array)
        } catch {
            reject("Error", "Image processing failed.", nil)
        }
    }
}
