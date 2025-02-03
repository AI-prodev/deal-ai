import React from "react";
import FunnelProductCard from "./FunnelProductCard";
import { IAccountProducts } from "@/interfaces/IIntegrations";

const FunnelProductsList: React.FC<{
  products: IAccountProducts[];
  pageId: string;
  onChange: () => void;
  isLightMode?: boolean;
}> = ({ products, pageId, onChange, isLightMode = false }) => (
  <div className="mb-5 mt-6 grid gap-4 grid-cols-1 max-w-[780px]">
    {products.map(product => (
      <FunnelProductCard
        key={product.id}
        product={product}
        pageId={pageId}
        onChange={onChange}
        isLightMode={isLightMode}
      />
    ))}
  </div>
);

export default FunnelProductsList;
