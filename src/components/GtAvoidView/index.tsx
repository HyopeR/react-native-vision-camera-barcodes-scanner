import React from 'react';
import {KeyboardAvoidingView} from 'react-native';
import {GtAvoidViewProps} from './index.type.ts';

const GtAvoidView = ({children, ...props}: GtAvoidViewProps) => {
  return (
    <KeyboardAvoidingView behavior={'padding'} {...props}>
      {children}
    </KeyboardAvoidingView>
  );
};

export default GtAvoidView;
export type {GtAvoidViewProps};
