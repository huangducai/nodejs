#!/usr/bin/env bash

grunt shell:browserify_nomap
xcodebuild -project "./frameworks/runtime-src/proj.ios_mac/AoYou.xcodeproj" -configuration Release -target "MyJSGame-mobile"  -sdk iphoneos CONFIGURATION_BUILD_DIR="../../../publish/ios"
echo "----------编译完成--------"
rootPath=`pwd`
appPath=$rootPath"/publish/ios/MyJSGame-mobile.app"

echo "----------编译js文件------"
cocos jscompile -s $appPath -d $appPath
find $appPath/script -type f -name "*.js" | xargs rm -v
rm -f $appPath"/main.js" $appPath"/src/app-all.js"

xcrun -sdk iphoneos PackageApplication -v $appPath -o $rootPath"/publish/ios/MyJSGame-mobile.ipa"