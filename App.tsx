import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

interface CarouselProps<T> {
  items: T[];
  onIndexChanged?: (index: number) => void;
  autoplay?: boolean;
  autoplayInterval?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerStyle?: object;
  itemStyle?: object;
}

const CarouselComponent = <T extends unknown>({
  items,
  onIndexChanged,
  autoplay = false,
  autoplayInterval = 3000,
  renderItem,
  containerStyle,
  itemStyle,
}: CarouselProps<T>) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    if (scrollViewRef.current) {
      const offsetX = index * Dimensions.get("window").width;
      scrollViewRef.current.scrollTo({ x: offsetX, animated: true });
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoplay) {
      interval = setInterval(() => {
        scrollToIndex((currentIndex + 1) % items.length);
      }, autoplayInterval);
    }

    return () => clearInterval(interval);
  }, [currentIndex, items.length, autoplay, autoplayInterval, scrollToIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x; // <-- add nativeEvent
    const index = Math.round(contentOffsetX / Dimensions.get("window").width);
    setCurrentIndex(index);
    if (onIndexChanged) {
      onIndexChanged(index);
    }
  };
  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) =>
          handleScroll(event)
        }
        scrollEventThrottle={16}
      >
        {items.map((item, index) => (
          <View key={index} style={[styles.item, itemStyle]}>
            {renderItem(item, index)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    width: Dimensions.get("window").width,
    flex: 1,
  },
});

export default CarouselComponent;
