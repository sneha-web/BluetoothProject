import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Text
} from 'react-native';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = 100;

const RippleEffect: React.FC = () => {
  const rippleAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRipple = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    startRipple();
  }, [rippleAnimation]);

  const rippleInterpolation = rippleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 4], // Circle starts at scale 1 and expands to scale 4
  });

  const rippleOpacity = rippleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0], // Starts fully visible and fades out
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale: rippleInterpolation }],
            opacity: rippleOpacity,
          },
        ]}
      >
      <Text style={styles.scanningText}>Scanning</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(0, 150, 255, 0.3)',
    justifyContent:"center"
  },
  scanningText:{
    textAlign:"center"
  }
});

export default RippleEffect;