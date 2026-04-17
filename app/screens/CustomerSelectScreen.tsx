import { FC, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, TextStyle, View, ViewStyle } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Screen, SearchField, Text } from "@/components";
import { useEvent } from "@/hooks";
import type { AppStackScreenProps } from "@/navigators/navigationTypes";
import { api, BusinessPartner } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { useHeader } from "@/utils/useHeader";

const PAGE_SIZE = 50;

export const CustomerSelectScreen: FC<AppStackScreenProps<"CustomerSelect">> = ({
  navigation,
  route,
}) => {
  const { eventName } = route.params;

  // ========== HOOKS
  const { themed, theme } = useAppTheme();

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number>();
  const [searchText, setSearchText] = useState<string>("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [customers, setCustomers] = useState<BusinessPartner[]>([]);

  const event = useEvent();
  const hasMounted = useRef(false);
  const searchTextRef = useRef(searchText);
  searchTextRef.current = searchText;

  useHeader(
    {
      title: "Select Customer",
      leftIcon: "caretLeft",
      onLeftPress: () => navigation.goBack(),
    },
    [],
  );

  // ========== VARIABLES
  const hasMore = totalPages !== undefined && currentPage < totalPages;

  // ========== EVENTS
  const onGetCustomers = async (page: number, isLoadMore = false, search = searchText) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      const response = await api.getPaginatedCustomers(PAGE_SIZE, page, search);
      if (response.kind !== "ok") throw new Error(response.message);
      setTotalPages(response.result.TotalPages);
      setTotalRecords(response.result.TotalRecords);
      if (page === 1) {
        setCustomers(response.result.Data);
      } else {
        setCustomers((prev) => [...prev, ...response.result.Data]);
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
    onGetCustomers(nextPage, true);
  }, [isLoadingMore, hasMore, currentPage]);

  // ========== EFFECTS
  useFocusEffect(
    useCallback(() => {
      if (!hasMounted.current) {
        hasMounted.current = true;
        return;
      }
      setCurrentPage(1);
      onGetCustomers(1, false, searchTextRef.current);
    }, []),
  );
  useEffect(() => {
    const timer = setTimeout(
      () => {
        setCurrentPage(1);
        onGetCustomers(1, false, searchText);
      },
      searchText ? 400 : 0,
    );
    return () => clearTimeout(timer);
  }, [searchText]);

  const onActionSelect = (item: BusinessPartner) => {
    event.emit(eventName, item);
  };

  // ========== VIEWS
  const renderItem: ListRenderItem<BusinessPartner> = useCallback(
    ({ item }) => {
      return (
        <Pressable style={themed($customerRow)} onPress={() => onActionSelect(item)}>
          <View style={$customerInfo}>
            <Text size="xs" weight="normal" numberOfLines={1}>
              {item.CardName}
            </Text>
            <Text size="xxs" style={themed($dimText)} numberOfLines={1}>
              {item.CardCode}
            </Text>
          </View>
        </Pressable>
      );
    },
    [theme.colors, themed],
  );

  return (
    <Screen preset="fixed" contentContainerStyle={themed($screen)}>
      <View style={themed($searchContainer)}>
        <SearchField
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search customers..."
          containerStyle={$styles.flex1}
        />
      </View>

      {totalRecords > 0 && (
        <Text size="xxs" style={themed($recordsCount)}>
          Showing {customers.length} of {totalRecords}
        </Text>
      )}

      {isLoading && customers.length === 0 ? (
        <View style={$centered}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
        </View>
      ) : (
        <FlashList
          data={customers}
          onEndReachedThreshold={0.3}
          renderItem={renderItem}
          onEndReached={loadMore}
          keyExtractor={(item) => item.CardCode}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={$centered}>
              <Text size="sm" style={themed($dimText)}>
                No customers found
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
};

const $screen: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $searchContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  margin: spacing.md,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.palette.neutral200,
});

const $customerRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $customerInfo: ViewStyle = {
  flex: 1,
  gap: 2,
};

const $dimText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $recordsCount: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xs,
});

const $centered: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingTop: 64,
};
