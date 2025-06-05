import Foundation
import MLKitBarcodeScanning

struct Ratio {
    let width: CGFloat
    let height: CGFloat
}

struct Size {
    let width: Int
    let height: Int
}

class ScannerUtils {
    static func getOptionsRatio(options: [AnyHashable: Any]?) -> Ratio {
        guard
            let ratio = options?["ratio"] as? [String: Any]
        else {
            return Ratio(width: 1.0, height: 1.0)
        }

        let width = ratio["width"] as? CGFloat ?? 1.0
        let height = ratio["height"] as? CGFloat ?? 1.0
        return Ratio(
            width: min(max(width, 0.0), 1.0),
            height: min(max(height, 0.0), 1.0)
        )
    }

    static func getOptionsBarcodeFormats(options: [AnyHashable: Any]?) -> [Any] {
        if let formats = options?["formats"] as? [Any], !formats.isEmpty {
            return formats
        } else {
            return ["all"]
        }
    }

    static func getSafeBarcodeFormats(formats: [Any]) -> [BarcodeFormat] {
        return formats.compactMap { format -> BarcodeFormat in
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
    }

    static func getSafeOrientation(orientation: UIImage.Orientation) -> UIImage.Orientation {
        switch orientation {
            case .up: return .up
            case .left: return .right
            case .down: return .down
            case .right: return .left
            default: return .up
        }
    }

    static func getImageSizeWithRotation(size: Size, orientation: UIImage.Orientation) -> Size {
        switch orientation {
            case .left, .right, .leftMirrored, .rightMirrored:
                return Size(width: size.height, height: size.width)
            default:
                return size
        }
    }

    static func filterBarcodes(barcodes: [Barcode], size: Size, ratio: Ratio) -> [Barcode] {
        let imageWidth = CGFloat(size.width)
        let imageHeight = CGFloat(size.height)

        let scanWidth = ratio.width * imageWidth
        let scanHeight = ratio.height * imageHeight

        let scanLeft = (imageWidth - scanWidth) / 2.0
        let scanTop = (imageHeight - scanHeight) / 2.0
        let scanRight = (imageWidth + scanWidth) / 2.0
        let scanBottom = (imageHeight + scanHeight) / 2.0

        return barcodes.filter { barcode in
            let frame = barcode.frame
            return frame.minX >= scanLeft &&
                   frame.minY >= scanTop &&
                   frame.maxX <= scanRight &&
                   frame.maxY <= scanBottom
        }
    }

    static func formatBarcode(barcode:Barcode, size: Size) -> [String:Any] {
        var map : [String:Any] = [:]
        let frame = barcode.frame

        let imageWidth = CGFloat(size.width)
        let imageHeight = CGFloat(size.height)
        let left = frame.minX
        let top = frame.minY
        let width = frame.width
        let height = frame.height

        // Raw values
        map["width"] = frame.width
        map["height"] = frame.height
        map["left"] = frame.minX
        map["top"] = frame.minY
        map["right"] = frame.maxX
        map["bottom"] = frame.maxY

        // Normalized values
        // Normalizes bounding box to 0–1 range for React Native layout.
        map["leftRatio"] = left / imageWidth
        map["topRatio"] = top / imageHeight
        map["widthRatio"] = width / imageWidth
        map["heightRatio"] = height / imageHeight

        let displayValue = barcode.displayValue
        map["displayValue"] = displayValue
        let rawValue = barcode.rawValue
        map["rawValue"] = rawValue

        let valueType = barcode.valueType
        switch valueType {
            case .wiFi:
                let ssid = barcode.wifi?.ssid
                map["ssid"] = ssid
                let password = barcode.wifi?.password
                map["password"] = password
                let encryptionType = barcode.wifi?.type
                map["encryptionType"] = encryptionType

            case .URL:
                let title = barcode.url!.title
                map["title"] = title
                let url = barcode.url!.url
                map["url"] = url

            default:
                break;
        }

        return map
    }
}
