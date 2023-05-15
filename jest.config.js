// jest.config.js
const {defaults: tsjPreset} = require('ts-jest/presets')

module.exports = {
    preset: 'react-native',
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.spec.json',
        },
    },
    transform: {
    },
    transformIgnorePatterns: ['node_modules/react-native-paper/lib/commonjs/components/BottomNavigation/BottomNavigation.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
