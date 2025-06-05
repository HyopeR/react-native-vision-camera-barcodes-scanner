package com.visioncamerabarcodesscanner

import com.facebook.react.bridge.ReadableNativeMap
import com.facebook.react.bridge.WritableNativeMap

import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_ALL_FORMATS
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_AZTEC
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_CODABAR
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_CODE_128
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_CODE_39
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_CODE_93
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_DATA_MATRIX
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_EAN_13
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_EAN_8
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_ITF
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_PDF417
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_QR_CODE
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_UPC_A
import com.google.mlkit.vision.barcode.common.Barcode.FORMAT_UPC_E

data class Ratio(
    val width: Float = 1f,
    val height: Float = 1f,
)

data class Size(
    val width: Int = 0,
    val height: Int = 0,
)

object ScannerUtils {
    fun getOptionsRatio(options: MutableMap<String, Any>?): Ratio {
        val ratio = options?.get("ratio") as? Map<*, *>
        val width = ((ratio?.get("width") as? Number)?.toFloat() ?: 1f).coerceIn(0f, 1f)
        val height = ((ratio?.get("height") as? Number)?.toFloat() ?: 1f).coerceIn(0f, 1f)
        return Ratio(width, height)
    }

    fun getOptionsBarcodeFormats(options: MutableMap<String, Any>?): List<*> {
        val formats = options?.get("formats") as? List<*>
        return if (formats.isNullOrEmpty()) {
            listOf("all")
        } else {
            formats
        }
    }

    fun getSafeBarcodeFormats(formats: List<*>): List<Int> {
        return formats.mapNotNull { format ->
            if (format is String) {
                when (format) {
                    "code_128" -> FORMAT_CODE_128
                    "code_39" -> FORMAT_CODE_39
                    "code_93" -> FORMAT_CODE_93
                    "codabar" -> FORMAT_CODABAR
                    "ean_13" -> FORMAT_EAN_13
                    "ean_8" -> FORMAT_EAN_8
                    "itf" -> FORMAT_ITF
                    "upc_e" -> FORMAT_UPC_E
                    "upc_a" -> FORMAT_UPC_A
                    "qr" -> FORMAT_QR_CODE
                    "pdf_417" -> FORMAT_PDF417
                    "aztec" -> FORMAT_AZTEC
                    "data_matrix" -> FORMAT_DATA_MATRIX
                    "all" -> FORMAT_ALL_FORMATS
                    else -> FORMAT_ALL_FORMATS
                }
            } else {
                FORMAT_ALL_FORMATS
            }
        }
    }

    fun getImageSizeWithRotation(size: Size, rotationDegrees: Int): Size {
        return when (rotationDegrees) {
            90, 270 -> Size(size.height, size.width)
            else -> size
        }
    }

    fun filterBarcodes(barcodes: List<Barcode>, size: Size, ratio: Ratio): List<Barcode> {
        val imageWidth = size.width
        val imageHeight = size.height

        val scanWidth = ratio.width * imageWidth
        val scanHeight = ratio.height * imageHeight

        val scanLeft = ((imageWidth - scanWidth) / 2f).toInt()
        val scanTop = ((imageHeight - scanHeight) / 2f).toInt()
        val scanRight = ((imageWidth + scanWidth) / 2f).toInt()
        val scanBottom = ((imageHeight + scanHeight) / 2f).toInt()

        return barcodes.filter { barcode ->
            val box = barcode.boundingBox
            box != null &&
            box.left >= scanLeft &&
            box.top >= scanTop &&
            box.right <= scanRight &&
            box.bottom <= scanBottom
        }
    }

    fun formatBarcode(barcode: Barcode, size: Size): ReadableNativeMap {
        val map = WritableNativeMap()
        val bounds = barcode.boundingBox
        if (bounds != null) {
            val imageWidth = size.width.toFloat()
            val imageHeight = size.height.toFloat()
            val width = bounds.width().toFloat()
            val height = bounds.height().toFloat()
            val left = bounds.left.toFloat()
            val top = bounds.top.toFloat()

            // Raw values
            map.putInt("width", bounds.width())
            map.putInt("height", bounds.height())
            map.putInt("left", bounds.left)
            map.putInt("top", bounds.top)
            map.putInt("right", bounds.right)
            map.putInt("bottom", bounds.bottom)

            // Normalized values
            // Normalizes bounding box to 0–1 range for React Native layout.
            map.putDouble("leftRatio", left.toDouble() / imageWidth)
            map.putDouble("topRatio", top.toDouble() / imageHeight)
            map.putDouble("widthRatio", width.toDouble() / imageWidth)
            map.putDouble("heightRatio", height.toDouble() / imageHeight)
        }
        val rawValue = barcode.rawValue
        map.putString("rawValue", rawValue)
        val displayValue = barcode.displayValue
        map.putString("displayValue", displayValue)
        val valueType = barcode.valueType

        when (valueType) {
            Barcode.TYPE_WIFI -> {
                val ssid = barcode.wifi!!.ssid
                map.putString("ssid", ssid)
                val password = barcode.wifi!!.password
                map.putString("password", password)
                val encryptionType = barcode.wifi!!.encryptionType
                map.putInt("encryptionType", encryptionType)
            }

            Barcode.TYPE_URL -> {
                val title = barcode.url!!.title
                map.putString("title", title)
                val url = barcode.url!!.url
                map.putString("url", url)
            }
        }

        return map
    }
}
