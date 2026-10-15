import { MetalType, PriceBreakdown, Product, RateSettings } from '../types';

export const DEFAULT_RATES: RateSettings = {
  gold_22k_rate: 6720,
  gold_24k_rate: 7330,
  silver_925_rate: 94,
  updated_at: new Date().toISOString()
};

export function getRatePerGram(metalType: MetalType, rates: RateSettings): number {
  switch (metalType) {
    case '22k_gold':
      return rates.gold_22k_rate || DEFAULT_RATES.gold_22k_rate;
    case '24k_gold':
      return rates.gold_24k_rate || DEFAULT_RATES.gold_24k_rate;
    case '925_silver':
      return rates.silver_925_rate || DEFAULT_RATES.silver_925_rate;
    default:
      return rates.gold_22k_rate || DEFAULT_RATES.gold_22k_rate;
  }
}

export function calculatePriceBreakdown(
  netWeight: number,
  metalType: MetalType,
  wastagePercent: number,
  makingCharges: number,
  rates: RateSettings
): PriceBreakdown {
  const ratePerGram = getRatePerGram(metalType, rates);
  const metalValue = netWeight * ratePerGram;
  const wastageValue = metalValue * (wastagePercent / 100);
  const subtotal = metalValue + wastageValue + makingCharges;
  const gstPercent = 3; // 3% GST on Jewellery in India
  const gstAmount = subtotal * (gstPercent / 100);
  const finalPrice = Math.round(subtotal + gstAmount);

  return {
    rate_per_gram: ratePerGram,
    metal_value: Math.round(metalValue),
    wastage_percent: wastagePercent,
    wastage_value: Math.round(wastageValue),
    making_charges: Math.round(makingCharges),
    subtotal: Math.round(subtotal),
    gst_percent: gstPercent,
    gst_amount: Math.round(gstAmount),
    final_price: finalPrice
  };
}

export function getProductPrice(product: Product, rates: RateSettings): number {
  const breakdown = calculatePriceBreakdown(
    product.net_weight,
    product.metal_type,
    product.wastage_percent,
    product.making_charges,
    rates
  );
  return breakdown.final_price;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
