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

struct BoundingBox {
    var width: CGFloat
    var height: CGFloat
    var left: CGFloat
    var top: CGFloat
    var right: CGFloat
    var bottom: CGFloat
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

    static func getImageSizeWithOrientation(size: Size, orientation: UIImage.Orientation) -> Size {
        switch orientation {
            case .left, .leftMirrored, .right, .rightMirrored:
                return Size(width: size.height, height: size.width)
            default:
                return size
        }
    }

    // This transformation is necessary.
    // Because the default image always comes as landscapeRight.
    // On the Swift side, MLKit does not produce coordinates for a different orientation.
    // This step is done automatically on the Kotlin side.
    static func getFrameRectPortaitCompatible(barcode:Barcode, orientation: UIImage.Orientation, size: Size) -> CGRect {
        let f = barcode.frame

        // By default, the camera captures data in Landscape mode.
        // Here it should always be width > height.
        // imageSize to imageRawSize conversion.
        let imageWidth = CGFloat(max(size.width, size.height))
        let imageHeight = CGFloat(min(size.width, size.height))

        switch orientation {
        case .up:
            return f

        case .left:
            return CGRect(
                x: f.minY,
                y: imageWidth - f.maxX,
                width: f.height,
                height: f.width
            )

        case .right:
            return CGRect(
                x: imageHeight - f.maxY,
                y: f.minX,
                width: f.height,
                height: f.width
            )

        case .down:
            return CGRect(
                x: imageWidth - f.maxX,
                y: imageHeight - f.maxY,
                width: f.width,
                height: f.height
            )

        default:
            return f
        }
    }

    static func getFrameBoxOnRect(rect: CGRect) -> BoundingBox {
        return BoundingBox(
            width: rect.width,
            height: rect.height,
            left: rect.minX,
            top: rect.minY,
            right: rect.maxX,
            bottom: rect.maxY
        )
    }

    static func filterBarcodes(barcodes: [Barcode], size: Size, ratio: Ratio, orientation: UIImage.Orientation) -> [Barcode] {
        let imageWidth = CGFloat(size.width)
        let imageHeight = CGFloat(size.height)

        let scanWidth = ratio.width * imageWidth
        let scanHeight = ratio.height * imageHeight

        let scanLeft = (imageWidth - scanWidth) / 2.0
        let scanTop = (imageHeight - scanHeight) / 2.0
        let scanRight = (imageWidth + scanWidth) / 2.0
        let scanBottom = (imageHeight + scanHeight) / 2.0

        return barcodes.filter { barcode in
            let rect = self.getFrameRectPortaitCompatible(barcode: barcode, orientation: orientation, size: size)
            let box = self.getFrameBoxOnRect(rect: rect)

            return box.left >= scanLeft &&
                   box.top >= scanTop &&
                   box.right <= scanRight &&
                   box.bottom <= scanBottom
        }
    }

    // Normalized for "portrait" mode.
    // If the device is in a different orientation, it should be transformed.
    static func formatBarcode(barcode:Barcode, size: Size, orientation: UIImage.Orientation) -> [String:Any] {
        var map : [String:Any] = [:]
        let rect = self.getFrameRectPortaitCompatible(barcode: barcode, orientation: orientation, size: size)
        let box = self.getFrameBoxOnRect(rect: rect)

        let imageWidth = CGFloat(size.width)
        let imageHeight = CGFloat(size.height)

        let width = box.width
        let height = box.height
        let left = box.left
        let top = box.top
        let right = box.right
        let bottom = box.bottom

        // Raw values
        map["width"] = width
        map["height"] = height
        map["left"] = left
        map["top"] = top
        map["right"] = right
        map["bottom"] = bottom

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
