import { memo, useState } from "react";
import { Image, ImageStyle, Pressable, TextStyle, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Skeleton } from "moti/skeleton";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { SkeletonText } from "./Skeleton";
import { Text } from "./Text";

export interface ProductCardProps {
  name: string;
  code: string;
  group: string;
  image: string;
  isGrid: boolean;
  isLeftColumn: boolean;
  onPress?: () => void;
}

const ProductImage = ({ uri, style }: { uri: string; style: ImageStyle }) => {
  const { theme } = useAppTheme();
  const [hasError, setHasError] = useState(false);

  if (!uri || hasError) {
    return (
      <View style={[style, $productImagePlaceholder]}>
        <Ionicons name="image-outline" size={24} color={theme.colors.palette.neutral400} />
      </View>
    );
  }

  return (
    <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setHasError(true)} />
  );
};

export const ProductCard = memo(function ProductCard({
  name,
  code,
  group,
  image,
  isGrid,
  isLeftColumn,
  onPress,
}: ProductCardProps) {
  const { themed } = useAppTheme();
  const cardStyle = isGrid ? (isLeftColumn ? $gridCardLeft : $gridCardRight) : undefined;

  if (isGrid) {
    return (
      <Pressable onPress={onPress}>
        <Card
          style={cardStyle}
          HeadingComponent={
            <View>
              <ProductImage uri={image} style={$productImageGrid} />
              <Text weight="bold" size="xs" numberOfLines={2} style={$gridItemName}>
                {code}
              </Text>
              <Text size="xxs" style={themed($itemCode)} numberOfLines={2}>
                {name}
              </Text>
              <Badge label={group} />
            </View>
          }
        />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress}>
      <Card
        style={cardStyle}
        verticalAlignment="center"
        LeftComponent={<ProductImage uri={image} style={$productImageList} />}
        HeadingComponent={
          <View style={$listItemContent}>
            <Text weight="bold" size="xs" numberOfLines={1}>
              {code}
            </Text>
            <Text size="xxs" style={themed($itemCode)} numberOfLines={2}>
              {name}
            </Text>
            <Badge label={group} />
          </View>
        }
      />
    </Pressable>
  );
});

export const ProductCardSkeleton = memo(function ProductCardSkeleton({
  isGrid,
  isLeftColumn,
}: {
  isGrid: boolean;
  isLeftColumn: boolean;
}) {
  const { themed } = useAppTheme();
  const cardStyle = isGrid ? (isLeftColumn ? $gridCardLeft : $gridCardRight) : undefined;

  if (isGrid) {
    return (
      <Skeleton>
        <View style={[themed($skeletonCard), cardStyle]}>
          <SkeletonText height={20} width="60%" />
          <SkeletonText width="40%" height={16} />
        </View>
      </Skeleton>
    );
  }

  return (
    <Skeleton>
      <View style={themed($skeletonCard)}>
        <SkeletonText height={20} width="60%" />
        <SkeletonText width="40%" height={16} />
      </View>
    </Skeleton>
  );
});

// ─── Shared card layout ───────────────────────────────────────────────────────

const $gridCardLeft: ViewStyle = { flex: 1, marginRight: 6 };
const $gridCardRight: ViewStyle = { flex: 1, marginLeft: 6 };

// ─── ProductImage styles ──────────────────────────────────────────────────────

const $productImageList: ImageStyle = {
  width: 64,
  height: 64,
  borderRadius: 8,
  marginRight: 4,
  alignSelf: "center",
};

const $productImageGrid: ImageStyle = {
  width: "100%",
  height: 120,
  borderRadius: 6,
  marginBottom: 8,
};

const $productImagePlaceholder: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#E2E8F0",
};

// ─── ProductCard styles ───────────────────────────────────────────────────────

const $listItemContent: ViewStyle = { flex: 1, gap: 4 };
const $gridItemName: ViewStyle = { marginTop: 8 };

const $itemCode: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral500,
});

const $skeletonCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 10,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  padding: spacing.sm,
  overflow: "hidden",
  gap: 8,
  marginBottom: spacing.sm,
});
