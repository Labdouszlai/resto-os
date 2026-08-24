import { describe, it, expect } from "@jest/globals";
import { formatCurrency, formatNumber } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats positive numbers as currency", () => {
    const result = formatCurrency(1234.56);
    expect(result).toMatch(/\$1,234\.56/);
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toMatch(/\$0\.00/);
  });

  it("formats negative numbers", () => {
    const result = formatCurrency(-50);
    expect(result).toMatch(/-\$50\.00/);
  });
});

describe("formatNumber", () => {
  it("formats integers with commas", () => {
    const result = formatNumber(1234567);
    expect(result).toBe("1,234,567");
  });

  it("formats small numbers", () => {
    const result = formatNumber(42);
    expect(result).toBe("42");
  });
});
