/**
 * @format
 */

import 'react-native-get-random-values';
import {AppRegistry} from 'react-native';
import * as React from 'react';
import App from './App';
import {name as appName} from './app.json';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';

import './shim';
import '@ethersproject/shims';
import 'text-encoding';
import PolyfillCrypto from "react-native-webview-crypto";
import {agent} from "./src/veramo/setup";

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#FFC107',
        accent: '#FFC107',
    },
};

export const SQLite = require('react-native-sqlite-storage')

/**
 * Main function
 * @returns {JSX.Element}
 * @constructor
 */
export default function Main() {
    const initAgent = agent
    return (
        <PaperProvider theme={theme}>
            <PolyfillCrypto/>
            <App/>
        </PaperProvider>
    );
}

AppRegistry.registerComponent(appName, () => Main);
