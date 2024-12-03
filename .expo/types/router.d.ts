/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/Account` | `/(tabs)/AddEventScreen` | `/(tabs)/Appearance` | `/(tabs)/CarouselComponent` | `/(tabs)/ConcludedEventsScreen` | `/(tabs)/EventContext` | `/(tabs)/EventCreationScreen` | `/(tabs)/FriendsScreen` | `/(tabs)/IconButtonsComponent` | `/(tabs)/MyEventsScreen` | `/(tabs)/Notifications` | `/(tabs)/ResultsScreen` | `/(tabs)/SearchComponent` | `/(tabs)/Settings` | `/(tabs)/TabNavigator` | `/(tabs)/TeamEventifyScreen` | `/(tabs)/TrashBinScreen` | `/(tabs)/WeekViewTab` | `/(tabs)/YearViewTab` | `/(tabs)/calendar` | `/(tabs)/home` | `/(tabs)/profile` | `/(tabs)/theme` | `/Account` | `/AddEventScreen` | `/Appearance` | `/CarouselComponent` | `/ConcludedEventsScreen` | `/EventContext` | `/EventCreationScreen` | `/FriendsScreen` | `/IconButtonsComponent` | `/MyEventsScreen` | `/Notifications` | `/ResultsScreen` | `/SearchComponent` | `/Settings` | `/TabNavigator` | `/TeamEventifyScreen` | `/TrashBinScreen` | `/WeekViewTab` | `/YearViewTab` | `/_sitemap` | `/auth/sign-in` | `/auth/sign-up` | `/calendar` | `/home` | `/profile` | `/theme`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
