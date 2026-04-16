import { FC, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, TextStyle, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import {
  CatalogFilterSheet,
  CatalogFilters,
  Flex,
  ProductCard,
  ProductCardSkeleton,
  Screen,
  SearchField,
  Text,
} from "@/components";
import { useCart } from "@/contexts/cartContext";
import type { CatalogStackScreenProps } from "@/navigators/navigationTypes";
import { api, ItemGroup, ItemMaster } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { useHeader } from "@/utils/useHeader";

type Layout = "list" | "grid";

const PAGE_SIZE = 50;
const DEFAULT_FILTERS: CatalogFilters = { groups: [] };

export const CatalogScreen: FC<CatalogStackScreenProps<"CatalogList">> = ({ navigation }) => {
  // ========== STATES
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ItemMaster[]>([]);
  const [totalPages, setTotalPages] = useState<number>();
  const [layout, setLayout] = useState<Layout>("list");
  const [searchText, setSearchText] = useState<string>("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);

  // ========== VARIABLES
  const hasMore = totalPages !== undefined && currentPage < totalPages;
  const isGrid = layout === "grid";
  const hasActiveFilters = appliedFilters.groups.length > 0;

  // ========== HOOKS
  const { themed, theme } = useAppTheme();
  const { totalItems } = useCart();

  const filtersRef = useRef(appliedFilters);
  filtersRef.current = appliedFilters;

  const searchTextRef = useRef(searchText);
  searchTextRef.current = searchText;

  const hasMounted = useRef(false);

  const toggleLayout = useCallback(() => {
    setLayout((prev) => (prev === "list" ? "grid" : "list"));
  }, []);

  const openFilter = useCallback(() => setFilterVisible(true), []);
  const closeFilter = useCallback(() => setFilterVisible(false), []);

  useHeader(
    {
      title: "Catalog",
      RightActionComponent: (
        <View style={$headerActions}>
          <Pressable onPress={toggleLayout} style={themed($headerButton)}>
            <Ionicons
              size={22}
              color={theme.colors.text}
              name={isGrid ? "list-outline" : "grid-outline"}
            />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Cart")} style={themed($headerButton)}>
            <Ionicons size={22} color={theme.colors.text} name="cart-outline" />
            {totalItems > 0 && (
              <View style={themed($cartBadge)}>
                <Text size="xxs" style={$cartBadgeText}>
                  {totalItems > 99 ? "99+" : totalItems}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      ),
    },
    [isGrid, toggleLayout, theme.colors.text, totalItems],
  );

  // ========== EVENTS
  const onGetItems = async (
    page: number,
    isLoadMore = false,
    search = searchText,
    filters = filtersRef.current,
  ) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      const group = filters.groups.length > 0 ? filters.groups.join(",") : undefined;
      const response = await api.getPaginatedItems(PAGE_SIZE, page, search, group);
      if (response.kind !== "ok") throw new Error(response.message);
      setTotalPages(response.result.TotalPages);
      setTotalRecords(response.result.TotalRecords);
      if (page === 1) {
        setItems(response.result.Data);
      } else {
        setItems((prev) => [...prev, ...response.result.Data]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert("Error", message);
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    onGetItems(nextPage, true);
  }, [isLoadingMore, hasMore, currentPage]);

  const handleApplyFilters = useCallback(
    (filters: CatalogFilters) => {
      setAppliedFilters(filters);
      setCurrentPage(1);
      onGetItems(1, false, searchText, filters);
    },
    [searchText],
  );

  // ========== EFFECTS
  useFocusEffect(
    useCallback(() => {
      if (!hasMounted.current) {
        hasMounted.current = true;
        return;
      }
      setCurrentPage(1);
      onGetItems(1, false, searchTextRef.current);
    }, []),
  );

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setCurrentPage(1);
        onGetItems(1, false, searchText);
      },
      searchText ? 400 : 0,
    );
    return () => clearTimeout(timer);
  }, [searchText]);

  useFocusEffect(
    useCallback(() => {
      api.getItemGroups().then((res) => {
        if (res.kind === "ok") setItemGroups(res.groups);
      });
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        setAppliedFilters(DEFAULT_FILTERS);
      };
    }, []),
  );

  // ========== VIEWS
  const renderItem: ListRenderItem<ItemMaster> = useCallback(
    ({ item, index }) => (
      <ProductCard
        name={item.ItemName}
        code={item.ItemCode}
        group={item.ItmsGrpNam}
        image={item.Image}
        isGrid={isGrid}
        isLeftColumn={index % 2 === 0}
        onPress={() => navigation.navigate("ItemDetail", { item })}
      />
    ),
    [isGrid, navigation],
  );

  const renderSeparator = useCallback(() => <View style={$styles.separator} />, []);

  const renderFooter = useCallback(
    () =>
      isLoadingMore ? (
        <ActivityIndicator style={themed($loader)} color={theme.colors.tint} size="small" />
      ) : null,
    [isLoadingMore, theme.colors.tint, themed],
  );

  const keyExtractor = useCallback((item: ItemMaster) => item.ItemCode, []);

  return (
    <Screen preset="fixed" contentContainerStyle={themed($screen)}>
      {totalRecords > 0 && (
        <Text size="xxs" style={themed($recordCount)}>
          {items.length} / {totalRecords}
        </Text>
      )}

      <Flex.Row gutter={4} align="center" style={themed($searchRow)}>
        <Flex.Col flex="1">
          <SearchField
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search items..."
            containerStyle={$styles.flex1}
          />
        </Flex.Col>
        <Flex.Col>
          <Pressable onPress={openFilter} style={themed($filterButton)}>
            <Ionicons name="filter-outline" size={18} color={theme.colors.tint} />
            <Text text="Filter" size="xs" style={themed($filterText)} />
            {hasActiveFilters && <View style={themed($filterDot)} />}
          </Pressable>
        </Flex.Col>
      </Flex.Row>

      {hasActiveFilters && (
        <View style={$activeFilters}>
          {appliedFilters.groups.map((group) => (
            <Pressable
              key={group}
              onPress={() =>
                handleApplyFilters({
                  ...appliedFilters,
                  groups: appliedFilters.groups.filter((g) => g !== group),
                })
              }
              style={themed($activeChip)}
            >
              <Text text={group} size="xxs" style={themed($filterText)} />
              <Ionicons name="close" size={12} color={theme.colors.tint} />
            </Pressable>
          ))}
        </View>
      )}

      {isLoading ? (
        <View style={isGrid ? $skeletonGrid : undefined}>
          {Array.from({ length: isGrid ? 12 : 7 }).map((_, index) => (
            <View key={index} style={isGrid ? $skeletonGridItem : undefined}>
              <ProductCardSkeleton isGrid={isGrid} isLeftColumn={index % 2 === 0} />
            </View>
          ))}
        </View>
      ) : (
        <FlashList
          key={layout}
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={isGrid ? 2 : 1}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ItemSeparatorComponent={renderSeparator}
          contentContainerStyle={themed($listContent)}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CatalogFilterSheet
        visible={filterVisible}
        onClose={closeFilter}
        onApply={handleApplyFilters}
        initialFilters={appliedFilters}
        itemGroups={itemGroups}
      />
    </Screen>
  );
};

const $searchRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
});

const $filterButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xs,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: colors.tint,
});

const $filterText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
});

const $filterDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: colors.tint,
});

const $activeFilters: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 6,
  marginBottom: 8,
};

const $activeChip: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xxxs,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.tint,
  backgroundColor: colors.palette.primary100,
});

const $recordCount: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "right",
  marginBottom: spacing.xs,
});

const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "flex-start",
  paddingHorizontal: spacing.lg,
});

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xl,
});

const $loader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.md,
});

const $headerActions: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const $headerButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingRight: spacing.lg,
  position: "relative",
});

const $cartBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  top: -2,
  right: spacing.lg - 4,
  minWidth: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: colors.tint,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 3,
});

const $cartBadgeText: TextStyle = {
  color: "white",
  fontSize: 9,
  fontWeight: "bold",
  lineHeight: 12,
};

const $skeletonGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
};

const $skeletonGridItem: ViewStyle = {
  width: "50%",
};
