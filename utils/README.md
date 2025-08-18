# Address Utilities

This directory contains utility functions for parsing and formatting addresses in the PiqDrop app.

## Files

- `addressUtils.ts` - Main utility functions for address parsing
- `addressUtils.test.ts` - Test examples showing how the functions work

## Functions

### `getCityAndCountry(fullAddress: string): string`

The main function you'll use in your components. It takes a full address and returns just the city and country.

**Example:**
```typescript
import { getCityAndCountry } from '@/utils/addressUtils';

// Instead of showing the full address:
<Text>{pkg.pickup.address}</Text>

// Show only city and country:
<Text>{getCityAndCountry(pkg.pickup.address)}</Text>
```

**Input:** `"123 Main Street, New York, NY, USA"`
**Output:** `"New York, USA"`

### `extractCityAndCountry(fullAddress: string): { city: string; country: string } | string`

Extracts city and country as separate properties. Returns the original address if parsing fails.

**Example:**
```typescript
const result = extractCityAndCountry("123 Main Street, New York, NY, USA");
if (typeof result === 'object') {
  console.log(result.city);    // "New York"
  console.log(result.country); // "USA"
} else {
  console.log("Failed to parse:", result);
}
```

### `formatCityAndCountry(addressData): string`

Formats the extracted city and country data into a readable string.

## How It Works

The utility uses regex patterns to identify common address formats:

1. **Standard format:** "Street, City, State, Country"
2. **No comma format:** "Street City, Country"  
3. **City-country format:** "Street, City Country"
4. **Fallback:** Takes the last two comma-separated parts

## Supported Address Formats

✅ `"123 Main St, New York, NY, USA"` → `"New York, USA"`
✅ `"456 Oak Ave, London, UK"` → `"London, UK"`
✅ `"789 Pine Rd, Toronto, Canada"` → `"Toronto, Canada"`
✅ `"321 Elm St, Paris, France"` → `"Paris, France"`

## Usage in Components

### Before (showing full address):
```typescript
<Text style={styles.location}>{pkg.pickup.address}</Text>
<Text style={styles.location}>{pkg.drop.address}</Text>
```

### After (showing city and country only):
```typescript
import { getCityAndCountry } from '@/utils/addressUtils';

<Text style={styles.location}>{getCityAndCountry(pkg.pickup.address)}</Text>
<Text style={styles.location}>{getCityAndCountry(pkg.drop.address)}</Text>
```

## Benefits

- **Cleaner UI:** Shows only essential location information
- **Consistent formatting:** All addresses follow "City, Country" format
- **Fallback safe:** If parsing fails, shows the original address
- **Reusable:** Can be used anywhere in the app

## Testing

Run the test file to see examples:
```bash
npx ts-node utils/addressUtils.test.ts
```

## Notes

- The utility is designed to be robust and will fall back to the original address if parsing fails
- It works best with addresses that have clear comma separation
- For more complex address parsing, consider using a geocoding service like Google Maps API
