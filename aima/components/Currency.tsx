import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ICurrencyProps {
  value?: string | number;
  currency?: string | null;
}

const Currency: React.FC<ICurrencyProps> = ({
  value = 0,
  currency = "USD",
}) => {
  const { t } = useTranslation();
  const _value = useMemo(() => {
    if (isNaN(+value)) {
      return value;
    }
    return t("currency", { value: +value / 100, currency });
  }, [currency, value]);

  return <span>{_value}</span>;
};

export default Currency;
