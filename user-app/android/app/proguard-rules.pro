# Flutter Proguard Rules
-keep class io.flutter.** { *; }
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.embedding.** { *; }

# Flutter Plugins
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-dontwarn io.flutter.embedding.**
-dontwarn androidx.**

# Razorpay
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}

# Desugaring
-dontwarn java.time.**
