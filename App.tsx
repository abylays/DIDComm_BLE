import React from 'react'
import {persistStore} from "redux-persist";
import {PersistGate} from "redux-persist/lib/integration/react";
import store from "./src/redux/store/Store";
import {Provider} from "react-redux";
import {NavigationContainer} from "@react-navigation/native";
import StackNavigator, {navigationRef} from "./src/navigation/StackNavigator";

/**
 * App
 * @constructor
 */
const App = () => {
    if (!__DEV__) {
        console.log = () => {};
    }
    let persistor = persistStore(store)
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <NavigationContainer  ref={navigationRef}>
                    <StackNavigator/>
                </NavigationContainer>
            </PersistGate>
        </Provider>
    );
}
export default App
