import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import Svg, { Ellipse } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');

const HEADER_HEIGHT = height / 100 * 52;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  curveHeight: number;
}>;

export default function ParallaxScrollViewNormal({
  children,
  headerImage,
  headerBackgroundColor,
  curveHeight,  
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
        scrollIndicatorInsets={{ bottom: 0 }}
        contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}>
          <ThemedView style={[styles.contentHeaderImage, { backgroundColor: headerBackgroundColor[colorScheme] }]}>
            {headerImage}
          </ThemedView>
          <ThemedView style={[styles.contentBottomSvg, { height: curveHeight }]}>
            <View style={styles.bottomSvg}>
              <Svg width={width} height={423} viewBox="0 0 375 423" fill="none">
                <Ellipse cx="187.75" cy="74" rx="403.75" ry="349" fill="#55B086" />
              </Svg>
            </View>
          </ThemedView>
        </Animated.View>
        <ThemedView style={styles.content}>
          
          {children}
        </ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  bottomSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    minHeight: height - HEADER_HEIGHT,
    paddingTop: 42,
    gap: 16,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  contentBottomSvg: {
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  contentHeaderImage: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
