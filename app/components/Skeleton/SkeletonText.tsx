import { memo } from "react";
import { DimensionValue, useColorScheme } from "react-native";
import { Skeleton } from "moti/skeleton";

export type SkeletonTextProps = {
  width?: DimensionValue;
  height: number;
};

const SkeletonText = ({ width = "100%", height }: SkeletonTextProps) => {
  const colorScheme = useColorScheme();
  const colorMode = colorScheme === "dark" ? "dark" : "light";

  return <Skeleton colorMode={colorMode} width={width} height={height} />;
};

export default memo(SkeletonText);
