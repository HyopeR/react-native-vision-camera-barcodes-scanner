package com.visioncamerabarcodesscanner

import android.graphics.Rect

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

data class Size(
    val width: Int = 0,
    val height: Int = 0,
)

data class Ratio(
    val width: Float = 1f,
    val height: Float = 1f,
)

data class BoxRatio(
    val leftRatio: Double,
    val topRatio: Double,
    val widthRatio: Double,
    val heightRatio: Double,
)

enum class Orientation (val value: String) {
    PORTRAIT("portrait"),
    LANDSCAPE_RIGHT("landscape-right"),
    PORTRAIT_UPSIDE_DOWN("portrait-upside-down"),
    LANDSCAPE_LEFT("landscape-left");
}

object ScannerUtils {
    fun getOptionsRatio(options: MutableMap<String, Any>?): Ratio {
        val ratio = options?.get("ratio") as? Map<*, *>
        val width = ((ratio?.get("width") as? Number)?.toFloat() ?: 1f).coerceIn(0f, 1f)
        val height = ((ratio?.get("height") as? Number)?.toFloat() ?: 1f).coerceIn(0f, 1f)
        return Ratio(width, height)
    }

    fun getOptionsOrientation(options: MutableMap<String, Any>?): Orientation {
        return when (options?.get("orientation") as? String) {
            "portrait" -> Orientation.PORTRAIT
            "landscape-left" -> Orientation.LANDSCAPE_LEFT
            "portrait-upside-down" -> Orientation.PORTRAIT_UPSIDE_DOWN
            "landscape-right" -> Orientation.LANDSCAPE_RIGHT
            else -> Orientation.PORTRAIT
        }
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

    fun getImageSizeByRotation(size: Size, rotationDegrees: Int): Size {
        return when (rotationDegrees) {
            90, 270 -> Size(size.height, size.width)
            else -> size
        }
    }

    private fun getBoxRatioByOrientation(box: Rect, size: Size, orientation: Orientation): BoxRatio {
        val imageWidth = size.width.toDouble()
        val imageHeight = size.height.toDouble()

        // Normalizes bounding box to 0–1 range for React Native layout.
        // Default portrait.
        val leftRatio = box.left / imageWidth
        val topRatio = box.top / imageHeight
        val widthRatio = box.width() / imageWidth
        val heightRatio = box.height() / imageHeight

        return when (orientation) {
            Orientation.PORTRAIT -> BoxRatio(leftRatio, topRatio, widthRatio, heightRatio)
            Orientation.LANDSCAPE_RIGHT -> BoxRatio(
                topRatio,
                1 - leftRatio - widthRatio,
                heightRatio,
                widthRatio
            )
            Orientation.PORTRAIT_UPSIDE_DOWN -> BoxRatio(
                1 - leftRatio - widthRatio,
                1- topRatio - heightRatio,
                widthRatio,
                heightRatio
            )
            Orientation.LANDSCAPE_LEFT -> BoxRatio(
                1 - topRatio - heightRatio,
                leftRatio,
                heightRatio,
                widthRatio
            )
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

    fun formatBarcode(barcode: Barcode, size: Size, orientation: Orientation): ReadableNativeMap {
        val map = WritableNativeMap()
        val box = barcode.boundingBox

        if (box != null) {
            val boxRatio = getBoxRatioByOrientation(box, size, orientation)

            // Raw values
            map.putInt("width", box.width())
            map.putInt("height", box.height())
            map.putInt("left", box.left)
            map.putInt("top", box.top)
            map.putInt("right", box.right)
            map.putInt("bottom", box.bottom)

            // Normalized values
            map.putDouble("leftRatio", boxRatio.leftRatio)
            map.putDouble("topRatio", boxRatio.topRatio)
            map.putDouble("widthRatio", boxRatio.widthRatio)
            map.putDouble("heightRatio", boxRatio.heightRatio)
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
