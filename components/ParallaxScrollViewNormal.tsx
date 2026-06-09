import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppContentDimensions } from '@/hooks/useAppContentDimensions';
import Svg, { Ellipse } from 'react-native-svg';

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  curveHeight: number;
  maxHeaderHeight?: number;
}>;

export default function ParallaxScrollViewNormal({
  children,
  headerImage,
  headerBackgroundColor,
  curveHeight,
  maxHeaderHeight,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const { width, height } = useAppContentDimensions();
  const headerHeight = maxHeaderHeight ? Math.min((height / 100) * 52, maxHeaderHeight) : (height / 100) * 52;

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-headerHeight, 0, headerHeight],
            [-headerHeight / 2, 0, headerHeight * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-headerHeight, 0, headerHeight], [2, 1, 1]),
        },
      ],
    };
  }, [headerHeight]);

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
            { height: headerHeight, backgroundColor: headerBackgroundColor[colorScheme] },
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
        <ThemedView style={[styles.content, { minHeight: height - headerHeight }]}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    overflow: 'hidden',
  },
  bottomSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
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
