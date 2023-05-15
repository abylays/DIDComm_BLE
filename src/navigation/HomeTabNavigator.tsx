import React from 'react';
import {ProfileScreen} from "../screens/ProfileScreen";
import {HomeScreen} from "../screens/HomeScreen";
import {MessagesScreen} from "../screens/MessagesScreen";
import {createMaterialBottomTabNavigator} from "@react-navigation/material-bottom-tabs";

const Tab = createMaterialBottomTabNavigator();

const HomeTabNavigator = () => {
    return (
        <Tab.Navigator barStyle={{backgroundColor: '#f6f6f6'}} activeColor={'#FFC107'} shifting={false}>
            <Tab.Screen name="Home" component={HomeScreen} options={{tabBarIcon: 'home-outline'}}/>
            <Tab.Screen name="Messages" component={MessagesScreen} options={{tabBarIcon: 'message-text-outline'}}/>
            <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarIcon: 'account-circle-outline'}}/>
        </Tab.Navigator>
    );
}

export default HomeTabNavigator;
