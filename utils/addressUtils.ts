/**
 * Utility functions for address parsing and formatting
 */

/**
 * Extracts city and country from a full address string
 * This function attempts to parse common address formats to extract just city and country
 * 
 * @param fullAddress - The complete address string
 * @returns Object containing city and country, or the original address if parsing fails
 */
export const extractCityAndCountry = (fullAddress: string): { city: string; country: string } | string => {
  if (!fullAddress || typeof fullAddress !== 'string') {
    return fullAddress;
  }

  // Remove extra whitespace and normalize
  const address = fullAddress.trim().replace(/\s+/g, ' ');

  // Common patterns for address parsing
  // Pattern 1: "Street, City, State, Country" or "Street, City, Country"
  const commaPattern = /^.*?,\s*([^,]+?)(?:\s*,\s*[^,]+?)?\s*,\s*([^,]+?)$/;
  
  // Pattern 2: "Street City, Country" (no commas between street and city)
  const noCommaPattern = /^.*?\s+([^,]+?)\s*,\s*([^,]+?)$/;
  
  // Pattern 3: "Street, City Country" (no comma between city and country)
  const cityCountryPattern = /^.*?,\s*([^,]+?)\s+([^,]+?)$/;

  let match = address.match(commaPattern);
  if (match) {
    return {
      city: match[1].trim(),
      country: match[2].trim()
    };
  }

  match = address.match(noCommaPattern);
  if (match) {
    return {
      city: match[1].trim(),
      country: match[2].trim()
    };
  }

  match = address.match(cityCountryPattern);
  if (match) {
    return {
      city: match[1].trim(),
      country: match[2].trim()
    };
  }

  // If no pattern matches, try to extract the last two parts as city and country
  const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
  if (parts.length >= 2) {
    return {
      city: parts[parts.length - 2],
      country: parts[parts.length - 1]
    };
  }

  // If all else fails, return the original address
  return fullAddress;
};

/**
 * Formats the extracted city and country into a readable string
 * 
 * @param addressData - Result from extractCityAndCountry function
 * @returns Formatted string or original address
 */
export const formatCityAndCountry = (addressData: ReturnType<typeof extractCityAndCountry>): string => {
  if (typeof addressData === 'string') {
    return addressData;
  }
  
  return `${addressData.city}, ${addressData.country}`;
};

/**
 * Convenience function that combines extraction and formatting
 * 
 * @param fullAddress - The complete address string
 * @returns Formatted city and country string, or original address if parsing fails
 */
export const getCityAndCountry = (fullAddress: string): string => {
  const extracted = extractCityAndCountry(fullAddress);
  return formatCityAndCountry(extracted);
};
