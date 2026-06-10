import { useState } from "react";
import type { AnchorRect, DiscoveryItem } from "../drawers/DiscoveryDrawer";

export function useDiscoveryPopover() {
  const [selectedDiscovery, setSelectedDiscovery] =
    useState<DiscoveryItem | null>(null);
  const [discoveryAnchor, setDiscoveryAnchor] = useState<AnchorRect | null>(
    null
  );

  const closeDiscovery = () => {
    setSelectedDiscovery(null);
    setDiscoveryAnchor(null);
  };

  return {
    selectedDiscovery,
    setSelectedDiscovery,
    discoveryAnchor,
    setDiscoveryAnchor,
    closeDiscovery,
  };
}
