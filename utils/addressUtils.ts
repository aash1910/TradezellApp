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

  // Split address into parts
  const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
  
  if (parts.length < 2) {
    return fullAddress;
  }

  // Get country (last part)
  const country = parts[parts.length - 1];
  
  // Helper function to check if a string looks like a postal code
  const isPostalCode = (str: string): boolean => {
    // Common postal code patterns: digits, letters, spaces, hyphens
    return /^[\d\s\-A-Z]{3,10}$/i.test(str) && /\d/.test(str);
  };
  
  // Helper function to check if a string looks like a county/state/region
  const isCountyOrState = (str: string): boolean => {
    // Common indicators for counties/states/regions
    const countyIndicators = /\b(county|län|province|state|region|prefecture|oblast|canton)\b/i;
    // US state abbreviations (2 letters)
    const usStateAbbr = /^[A-Z]{2}$/;
    // Common country subdivisions that aren't cities
    const subdivisions = /\b(england|scotland|wales|northern ireland)\b/i;
    
    return countyIndicators.test(str) || usStateAbbr.test(str) || subdivisions.test(str);
  };
  
  // Work backwards from the country to find the city
  let city = '';
  
  // Start from second-to-last part and work backwards
  for (let i = parts.length - 2; i >= 0; i--) {
    const part = parts[i];
    
    // Skip postal codes
    if (isPostalCode(part)) {
      continue;
    }
    
    // Skip obvious counties/states but remember them as fallback
    if (isCountyOrState(part)) {
      if (!city) {
        city = part; // Use as fallback if no better city found
      }
      continue;
    }
    
    // This looks like a city name
    city = part;
    break;
  }
  
  // If no city found, use the second-to-last non-postal-code part
  if (!city) {
    for (let i = parts.length - 2; i >= 0; i--) {
      if (!isPostalCode(parts[i])) {
        city = parts[i];
        break;
      }
    }
  }
  
  // Final fallback - use second-to-last part
  if (!city && parts.length >= 2) {
    city = parts[parts.length - 2];
  }
  
  if (city) {
    return {
      city: city.trim(),
      country: country.trim()
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
  
  return `${addressData.country}, ${addressData.city}`;
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
