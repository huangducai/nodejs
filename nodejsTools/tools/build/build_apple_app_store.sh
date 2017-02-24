#!/usr/bin/env bash


grunt shell:browserify_nomap
grunt shell:jsc
xcodebuild -project "./frameworks/runtime-src/proj.ios_mac/AppleAppStore.xcodeproj" -configuration Release -target "MyJSGame-mobile"  -sdk iphoneos CONFIGURATION_BUILD_DIR="../../../publish/ios"  CODE_SIGN_IDENTITY="W8QWS678N2"
echo "----------编译完成--------"
rootPath=`pwd`
xcrun -sdk iphoneos PackageApplication -v $rootPath"/publish/ios/MyJSGame-mobile.app" -o $rootPath"/publish/ios/MyJSGame-mobile.ipa"