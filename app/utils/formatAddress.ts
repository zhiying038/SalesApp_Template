export const formatAddress = (address?: CustomerAddress): string => {
  if (!address) return "";
  const parts = [
    address.Street,
    address.Block,
    [address.ZipCode, address.City].filter(Boolean).join(" "),
    address.State,
    address.Country,
  ].filter((x) => !!x && x.trim().length > 0);
  return parts.join(", ");
};
