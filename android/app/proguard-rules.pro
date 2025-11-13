# Firebase - Keep all Firebase classes to prevent crashes
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Firebase Firestore - Critical for database operations
-keep class com.google.firebase.firestore.** { *; }
-keepclassmembers class com.google.firebase.firestore.** { *; }

# Firebase Auth - Critical for authentication
-keep class com.google.firebase.auth.** { *; }
-keepclassmembers class com.google.firebase.auth.** { *; }

# Expo modules - Keep all Expo functionality
-keep class expo.modules.** { *; }
-keep class expo.modules.notifications.** { *; }

# React Native - Keep core functionality
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep native method names for reflection
-keepclasseswithmembernames class * {
    native <methods>;
}

# Preserve line numbers for debugging crashes
-keepattributes SourceFile,LineNumberTable

# Keep custom attributes for annotations
-keepattributes *Annotation*

# AsyncStorage - Keep for data persistence
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep all enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Prevent stripping of model classes used with Firebase
-keepclassmembers class * {
  @com.google.firebase.firestore.PropertyName <fields>;
}
