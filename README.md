# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

3. IOS Build Preview for Simulator: eas build -p ios --profile preview

4. Android Build Preview for Simulator: eas build -p android --profile preview

5. Run Android Emulator manually: /Volumes/ExAsh/Library/Android/sdk/emulator/emulator -read-only @Resizable_Experimental_API_UpsideDownCake

6. To create only the ios folder: npx expo prebuild --platform ios

7.1. Build to Expo for submit to Appstore: eas build --platform ios --profile production
eas build --platform ios --profile production --clear-cache

7.2. Submit to App Store: eas submit --platform ios --profile production

8.0. Development build standalone app: eas build --profile development --platform ios

8.1 "googleServicesFile": "./GoogleService-Info.plist", // firebase

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

App UI was developed by testing ios device and everything working fine.
