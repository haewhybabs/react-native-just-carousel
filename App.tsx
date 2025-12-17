import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewToken,
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

const { width } = Dimensions.get("window");

const CarouselComponent = <T extends unknown>({
  items,
  onIndexChanged,
  autoplay = false,
  autoplayInterval = 3000,
  renderItem,
  containerStyle,
  itemStyle,
}: CarouselProps<T>) => {
  const flatListRef = useRef<FlatList>(null);
  const indexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Autoplay
  useEffect(() => {
    if (!autoplay || items.length <= 1) return;

    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % items.length;
      flatListRef.current?.scrollToIndex({ index: indexRef.current, animated: true });
      setCurrentIndex(indexRef.current);
      onIndexChanged?.(indexRef.current);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, items.length, onIndexChanged]);

  // Handle manual scrolling
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index ?? 0;
      indexRef.current = index;
      setCurrentIndex(index);
      onIndexChanged?.(index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        ref={flatListRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.item, itemStyle]}>{renderItem(item, index)}</View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
        snapToInterval={width}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    width,
    flex: 1,
  },
});

export default CarouselComponent;
