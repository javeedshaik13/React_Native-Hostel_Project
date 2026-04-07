/**
 * Color utility functions for React Native
 * Handles color format conversions and opacity adjustments
 */

/**
 * Converts a hex color to rgba format with specified opacity
 * @param {string} hex - Hex color (e.g., '#1A73E8' or '1A73E8')
 * @param {number} opacity - Opacity value between 0 and 1 (e.g., 0.5 for 50%)
 * @returns {string} - RGBA color string (e.g., 'rgba(26, 115, 232, 0.5)')
 */
export function hexToRgba(hex, opacity = 1) {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Handle 3-digit hex codes (e.g., #FFF)
  let r, g, b;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Converts a two-digit hex opacity value to decimal (0-1)
 * @param {string} hexOpacity - Two-digit hex value (e.g., '55' for ~33%, 'FF' for 100%)
 * @returns {number} - Decimal opacity value between 0 and 1
 */
export function hexOpacityToDecimal(hexOpacity) {
  return parseInt(hexOpacity, 16) / 255;
}

/**
 * Adds opacity to a hex color
 * @param {string} hex - Hex color (e.g., '#1A73E8')
 * @param {string|number} opacity - Either hex opacity ('55') or decimal (0.33)
 * @returns {string} - RGBA color string
 */
export function addOpacity(hex, opacity) {
  // If opacity is a string (hex), convert it
  const decimalOpacity = typeof opacity === 'string' 
    ? hexOpacityToDecimal(opacity) 
    : opacity;
  
  return hexToRgba(hex, decimalOpacity);
}
