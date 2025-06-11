import React, {useCallback, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Barcode} from 'react-native-vision-camera-barcodes-scanner';
import GtAvoidView from './components/GtAvoidView';
import GtCameraContainer from './components/GtCameraContainer';
import GtScannerPro, {GtScannerProNs} from './components/GtScannerPro';
import {useScreenDimensions} from './hooks';

const App = () => {
  const [stop, setStop] = useState(false);
  const [code, setCode] = useState('');

  const cameraRef = useRef<GtScannerProNs.Ref>(null);

  const {width: cameraWidth, height: cameraHeight} = useScreenDimensions();

  const [orientation, setOrientation] = useState<any>('portrait');

  const opacity = useSharedValue(0);
  const bar = useSharedValue<Barcode>({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    rawValue: '',
    width: 0,
    height: 0,
    leftRatio: 0,
    topRatio: 0,
    widthRatio: 0,
    heightRatio: 0,
  });

  const borderStyle = useAnimatedStyle(() => {
    // In order to be suitable for the user's screen display,
    // coordinates should be visualized using aspect values in this way.
    return {
      left: bar.value.leftRatio * cameraWidth,
      top: bar.value.topRatio * cameraHeight,
      width: bar.value.widthRatio * cameraWidth,
      height: bar.value.heightRatio * cameraHeight,
      opacity: opacity.value,
    };
  }, [bar, cameraWidth, cameraHeight]);

  const onDetectBarcode = useCallback(
    (barcodes: Barcode[]) => {
      console.log(barcodes);

      const barcode = barcodes[0];
      if (barcode) {
        bar.value = barcode;
        opacity.value = 1;

        if (barcode.rawValue !== code) {
          setCode(barcode.rawValue);
        }
      } else {
        opacity.value = 0;
      }
    },
    [bar, code, opacity],
  );

  return (
    <GestureHandlerRootView style={styles.wrapper}>
      <GtAvoidView style={styles.wrapper}>
        {!stop ? (
          <GtCameraContainer>
            <GtScannerPro
              ref={cameraRef}
              code={code}
              barcodeDetector={true}
              barcodeTypes={['code_128', 'qr']}
              onDetectBarcode={onDetectBarcode}
              onPreviewOrientationChanged={previewOrientation => {
                setOrientation(previewOrientation);
              }}
              androidPreviewViewType={'texture-view'}
              orientation={orientation}
              ratio={{width: 0.8, height: 0.5}}
              viewSize={{width: cameraWidth, height: cameraHeight}}
              maskShow={true}
              maskLineShow={true}
              maskProps={{
                backdropColor: 'rgba(0,0,0,0.5)',
                backdropOpacity: 0.5,
              }}>
              <View style={styles.wrapper} pointerEvents={'box-none'}>
                <Animated.View style={[styles.border, borderStyle]} />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setStop(true)}>
                    <Text>Stop</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GtScannerPro>
          </GtCameraContainer>
        ) : (
          <TouchableOpacity
            onPress={() => setStop(prevState => !prevState)}
            style={{
              ...styles.wrapper,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{textTransform: 'uppercase'}}>Stopped</Text>
            <Text>Click to return to camera</Text>
          </TouchableOpacity>
        )}
      </GtAvoidView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  border: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'red',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: 80,
    bottom: 20,
  },
  button: {
    backgroundColor: 'green',
    width: 80,
    height: 80,
    borderRadius: 40,
    bottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
