import React from 'react';
import { Pressable, Text, TextStyle, ViewStyle } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Button({ title, onPress, style, textStyle }: Props) {
  return (
    <Pressable onPress={onPress} style={[{ backgroundColor: '#0a84ff', padding: 12, borderRadius: 8, alignItems: 'center' }, style]}>
      <Text style={[{ color: 'white', fontWeight: '600' }, textStyle]}>{title}</Text>
    </Pressable>
  );
}
