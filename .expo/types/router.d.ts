/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/TabNavigator` | `/(tabs)/calendar` | `/(tabs)/home` | `/(tabs)/profile` | `/TabNavigator` | `/_sitemap` | `/auth/sign-in` | `/auth/sign-up` | `/calendar` | `/home` | `/profile`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
