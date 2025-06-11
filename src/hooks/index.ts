import {useEffect, useState} from 'react';
import {Dimensions, ScaledSize} from 'react-native';

export const useScreenDimensions = () => {
  const [size, setSize] = useState(Dimensions.get('screen'));

  useEffect(() => {
    const onChange = ({screen}: {screen: ScaledSize}) => setSize(screen);

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  return size;
};
