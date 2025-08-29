module.exports = {
  dependencies: {
    'react-native-mmkv': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-mmkv/android',
          packageImportPath: 'import com.reactnativemmkv.MmkvPackage;',
          packageInstance: 'new MmkvPackage()',
        },
        ios: {
          sourceDir: '../node_modules/react-native-mmkv/ios',
          project: 'MMKV.xcodeproj',
        },
      },
    },
  },
};
