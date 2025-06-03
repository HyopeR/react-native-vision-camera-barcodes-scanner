package com.visioncamerabarcodesscanner

import android.media.Image
import com.facebook.react.bridge.ReadableNativeMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.android.gms.tasks.Task
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
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

class VisionCameraBarcodesScannerModule(
    proxy: VisionCameraProxy,
    options: MutableMap<String, Any>?
) : FrameProcessorPlugin() {
    private val scannerBuilder: BarcodeScannerOptions.Builder = BarcodeScannerOptions.Builder()
    private val scannerBarcodeFormats = getSafeBarcodeFormats(options)
    private val scannerRatio = getSafeRatio(options)

    init {
        val barcodeFormats = scannerBarcodeFormats.mapNotNull { format ->
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

        if (barcodeFormats.contains(FORMAT_ALL_FORMATS)) {
            scannerBuilder.setBarcodeFormats(FORMAT_ALL_FORMATS)
        } else {
            val firstFormat = barcodeFormats.first()
            val otherFormats = barcodeFormats.drop(1).toIntArray()
            scannerBuilder.setBarcodeFormats(firstFormat, *otherFormats)
        }
    }

    private fun getSafeBarcodeFormats(options: MutableMap<String, Any>?): List<*> {
        val formats = options?.get("formats") as? List<*>
        return if (formats.isNullOrEmpty()) {
            listOf("all")
        } else {
            formats
        }
    }

    private fun getSafeRatio(options: MutableMap<String, Any>?): Ratio {
        val ratio = options?.get("ratio") as? Map<*, *>
        val width = ((ratio?.get("width") as? Number)?.toFloat() ?: 1f).coerceIn(0f, 1f)
        val height = ((ratio?.get("height") as? Number)?.toFloat() ?: 1f).coerceIn(0f, 1f)
        return Ratio(width, height)
    }

    private fun filterBarcodes(barcodes: List<Barcode>, size: Size, ratio: Ratio): List<Barcode> {
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
            box.right <= scanRight &&
            box.top >= scanTop &&
            box.bottom <= scanBottom
        }
    }

    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any {
        try {
            val scanner = BarcodeScanning.getClient(scannerBuilder.build())
            val frameImage: Image = frame.image
            val frameImageRotationDegrees = frame.imageProxy.imageInfo.rotationDegrees;

            val image =
                InputImage.fromMediaImage(frameImage, frameImageRotationDegrees)

            // The default Android camera is landscape.
            // Portrait conversion should be done.
            val imageSize = when (frameImageRotationDegrees) {
                90, 270 -> Size(image.height, image.width)
                else -> Size(image.width, image.height)
            }

            val task: Task<List<Barcode>> = scanner.process(image)
            val array = WritableNativeArray()
            val barcodes: List<Barcode> = Tasks.await(task)

            // Filter barcodes if scanning area is restricted.
            val barcodesFiltered =
                if (scannerRatio.width != 1f || scannerRatio.height != 1f)
                    filterBarcodes(barcodes, imageSize, scannerRatio)
                else
                    barcodes

            for (barcode in barcodesFiltered) {
                val map = processData(barcode, imageSize)
                array.pushMap(map)
            }
            return array.toArrayList()
        } catch (e: Exception) {
            throw Exception("Error processing barcode scanner: $e ")
        }
    }


    companion object {
        fun processData(barcode: Barcode, imageSize: Size): ReadableNativeMap {
            val map = WritableNativeMap()
            val bounds = barcode.boundingBox
            if (bounds != null) {
                val imageWidth = imageSize.width.toFloat()
                val imageHeight = imageSize.height.toFloat()
                val width = bounds.width().toFloat()
                val height = bounds.height().toFloat()
                val left = bounds.left.toFloat()
                val top = bounds.top.toFloat()

                // Raw coordinates
                map.putInt("width", bounds.width())
                map.putInt("height", bounds.height())
                map.putInt("left", bounds.left)
                map.putInt("top", bounds.top)
                map.putInt("right", bounds.right)
                map.putInt("bottom", bounds.bottom)

                // Normalized coordinates
                // boundingBox values must be normalized for use by react-native.
                map.putDouble("x", left.toDouble() / imageWidth)
                map.putDouble("y", top.toDouble() / imageHeight)
                map.putDouble("widthScale", width.toDouble() / imageWidth)
                map.putDouble("heightScale", height.toDouble() / imageHeight)
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
}
