import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrencyVND = (amount: any) => {
  const formattedAmount = amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
  return formattedAmount;
};

export const sumTotal = (listTransferPerson: any, index: any) => {
  const objectData = listTransferPerson[index];
  const sumValues = Object.entries(objectData).reduce(
    (acc, [key, value]: any) => {
      if (key !== 'mention' && key !== 'amount' && key !== 'discountAmount') {
        return acc + Math.round(parseFloat(value) || 0);
      }
      return acc;
    },
    0
  );
  return sumValues;
};

export const sumTotalBill = (listTransferPerson: any[]) => {
  if (!listTransferPerson) return 0;
  const sumValues = listTransferPerson.reduce((acc: any, objectData: any) => {
    const partialSum = Object.entries(objectData).reduce(
      (subtotal, [key, value]: any) => {
        if (key !== 'mention' && key !== 'amount' && key !== 'discountAmount') {
          return subtotal + Math.round(parseFloat(value) || 0);
        }
        return subtotal;
      },
      0
    );
    return acc + partialSum;
  }, 0);
  return sumValues;
};

export const processString = (input: string): string => {
  const index = input.indexOf(' ');

  if (index === -1) {
    return input;
  }

  return input.substring(0, index);
};

export const getInfoBill = (
  valueNameBill: string,
  idOrder: string,
  mention: string
) => {
  return `ORDER${valueNameBill.toUpperCase().replaceAll(' ', '')}${
    idOrder ?? ''
  } ${processString(mention)}`;
};
