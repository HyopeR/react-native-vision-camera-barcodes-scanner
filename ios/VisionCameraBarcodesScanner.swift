import Foundation
import VisionCamera
import MLKitVision
import MLKitBarcodeScanning


@objc(VisionCameraBarcodesScanner)
public class VisionCameraBarcodesScanner: FrameProcessorPlugin {
    private var barcodeOptionsBuilder: BarcodeScannerOptions = BarcodeScannerOptions(formats: .all)
    private var barcodeOptions: [Any] = []

    public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
        super.init(proxy: proxy, options: options)

        barcodeOptions = getSafeBarcodeOptions(options: options)

        let barcodeFormats = barcodeOptions.compactMap { format -> BarcodeFormat in
            if let format = format as? String {
                switch format {
                case "code_128": return .code128
                case "code_39": return .code39
                case "code_93": return .code93
                case "codabar": return .codaBar
                case "ean_13": return .EAN13
                case "ean_8": return .EAN8
                case "itf": return .ITF
                case "upc_e": return .UPCE
                case "upc_a": return .UPCA
                case "qr": return .qrCode
                case "pdf_417": return .PDF417
                case "aztec": return .aztec
                case "data_matrix": return .dataMatrix
                case "all": return .all
                default: return .all
                }
            } else {
                return .all
            }
        }

        if barcodeFormats.contains(.all) {
            barcodeOptionsBuilder = BarcodeScannerOptions(formats: .all)
        } else {
            barcodeOptionsBuilder = BarcodeScannerOptions(formats: BarcodeFormat(barcodeFormats))
        }
    }

    private func getSafeBarcodeOptions(options: [AnyHashable: Any]?) -> [Any] {
        if let values = options?["options"] as? [Any] {
            if values.isEmpty {
                return ["all"]
            } else {
                return values
            }
        } else {
            return ["all"]
        }
    }

    public override func callback(_ frame: Frame,withArguments arguments: [AnyHashable: Any]?) -> Any {
        var data:[Any] = []
        let buffer = frame.buffer
        let image = VisionImage(buffer: buffer);
        image.orientation = getOrientation(orientation: frame.orientation)
        let barcodeScanner = BarcodeScanner.barcodeScanner(options: barcodeOptionsBuilder)
        let dispatchGroup = DispatchGroup()
        dispatchGroup.enter()

        barcodeScanner.process(image) {
            barcodes,
            error in
            defer {
                dispatchGroup.leave()
            }
            guard error == nil, let barcodes = barcodes else { return }
            for barcode in barcodes {
                let objData = VisionCameraBarcodesScanner.processData(barcode: barcode)
                data.append(objData)
            }
        }
        dispatchGroup.wait()
        return data
    }

    private func getOrientation(orientation: UIImage.Orientation) -> UIImage.Orientation {
        switch orientation {
        case .up:
          return .up
        case .left:
          return .right
        case .down:
          return .down
        case .right:
          return .left
        default:
          return .up
        }
    }

    static func processData(barcode:Barcode) -> [String:Any]{
         var objData : [String:Any] = [:]
            objData["height"] = barcode.frame.height
            objData["width"] = barcode.frame.width
            objData["top"] = barcode.frame.minY
            objData["bottom"] = barcode.frame.maxY
            objData["left"] = barcode.frame.minX
            objData["right"] = barcode.frame.maxX
            let displayValue = barcode.displayValue
            objData["displayValue"] = displayValue
            let rawValue = barcode.rawValue
            objData["rawValue"] = rawValue

            let valueType = barcode.valueType
            switch valueType {
            case .wiFi:
                let ssid = barcode.wifi?.ssid
                objData["ssid"] = ssid
                let password = barcode.wifi?.password
                objData["password"] = password
                let encryptionType = barcode.wifi?.type
                objData["encryptionType"] = encryptionType
            case .URL:
                let title = barcode.url!.title
                objData["title"] = title
                let url = barcode.url!.url
                objData["url"] = url
            default:
                break;
            }
        return objData
    }

  }
