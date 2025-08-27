type Props = {
  value: number | string;
  isAmount?: boolean;
  currency?: string;
  locale?: string;
  showDecimals?: boolean;
  decimalPlaces?: number;
};

const FormattedNumber = ({
  value,
  isAmount = false,
  currency = 'DOP',
  locale = 'es-DO',
  showDecimals = true,
  decimalPlaces = 2,
}: Props) => {
  const number = typeof value === 'string' ? parseFloat(value) : value;

  const formatter = new Intl.NumberFormat(locale, {
    style: isAmount ? 'currency' : 'decimal',
    currency: isAmount ? currency : undefined,
    minimumFractionDigits: isAmount || showDecimals ? decimalPlaces : 0,
    maximumFractionDigits: isAmount || showDecimals ? decimalPlaces : 0,
  });

  return <span>{formatter.format(number)}</span>;
};



export default FormattedNumber;
