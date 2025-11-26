const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Remove AD_ID permission from AndroidManifest.xml
 * This ensures the app doesn't request advertising ID permission
 */
const withoutAdId = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
    // Find and remove AD_ID permission if it exists
    if (androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = 
        androidManifest.manifest['uses-permission'].filter(
          (perm) => perm.$['android:name'] !== 'com.google.android.gms.permission.AD_ID'
        );
    }
    
    // Also add tools:node="remove" for AD_ID to prevent any SDK from adding it
    if (!androidManifest.manifest.$) {
      androidManifest.manifest.$ = {};
    }
    
    // Add tools namespace if not present
    if (!androidManifest.manifest.$['xmlns:tools']) {
      androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }
    
    // Add the permission with tools:node="remove"
    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }
    
    androidManifest.manifest['uses-permission'].push({
      '$': {
        'android:name': 'com.google.android.gms.permission.AD_ID',
        'tools:node': 'remove'
      }
    });
    
    return config;
  });
};

module.exports = withoutAdId;

