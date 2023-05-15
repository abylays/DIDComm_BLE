import React from 'react';
import {IdentifiersScreen} from "../screens/identifier/IdentifiersScreen";
import {InvitationsScreen} from "../screens/invitation/InvitationsScreen";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import HomeTabNavigator from "./HomeTabNavigator";
import {IdentifierViewScreen} from "../screens/identifier/IdentifierViewScreen";
import {ConnectionsScreen} from "../screens/connection/ConnectionsScreen";
import {ChatViewScreen} from "../screens/chat/ChatViewScreen";
import {ChatNewScreen} from "../screens/chat/ChatNewScreen";
import {ChatMessagesScreen} from "../screens/chat/ChatMessagesScreen";
import {ChatMessageViewScreen} from "../screens/chat/ChatMessageViewScreen";
import {InvitationViewScreen} from "../screens/invitation/InvitationViewScreen";
import {ConnectionViewScreen} from "../screens/connection/ConnectionViewScreen";
import {BluetoothCentralScreen} from "../screens/bluetooth/BluetoothCentralScreen";
import {CredentialsScreen} from "../screens/credential/CredentialsScreen";
import {PresentationsScreen} from "../screens/presentation/PresentationsScreen";
import {SchemasScreen} from "../screens/credential/SchemasScreen";
import {SchemaCreateScreen} from "../screens/credential/SchemaCreateScreen";
import {CredentialIssueScreen} from "../screens/credential/CredentialIssueScreen";
import {CredentialViewScreen} from "../screens/credential/CredentialViewScreen";
import {DefinitionCreateScreen} from "../screens/presentation/DefinitionCreateScreen";
import {DefinitionsScreen} from "../screens/presentation/DefinitionsScreen";
import {RequestPresentationScreen} from "../screens/presentation/RequestPresentationScreen";
import {PresentationViewScreen} from "../screens/presentation/PresentationViewScreen";
import {DefinitionViewScreen} from "../screens/presentation/DefinitionViewScreen";
import {SchemaViewScreen} from "../screens/credential/SchemaViewScreen";
import {PresentationConfirmScreen} from "../screens/presentation/PresentationConfirmScreen";
import {createNavigationContainerRef} from "@react-navigation/native";
import {ACMStartScreen} from "../screens/acm/ACMStartScreen";
import {ACMInvitationScreen} from "../screens/acm/ACMInvitationScreen";
import {ACMAwaitingScreen} from "../screens/acm/ACMAwaitingScreen";
import {ACMDeniedScreen} from "../screens/acm/ACMDeniedScreen";
import {ACMVerifiedScreen} from "../screens/acm/ACMVerifiedScreen";
import {AgentEndpointsScreen} from "../screens/AgentEndpointsScreen";
import {SubmissionViewScreen} from "../screens/presentation/SubmissionViewScreen";
import {ScanScreen} from "../screens/ScanScreen";
import {SettingsScreen} from "../screens/SettingsScreen";
import IdentifierDetails from "../models/IdentifierDetails";
import {getDefaultDID} from "../utils/AgentUtils";
import {SetupScreen} from "../screens/SetupScreen";
import {TestsScreen} from "../screens/TestsScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
    const defaultDID: IdentifierDetails | undefined = getDefaultDID()
    return (
        <Stack.Navigator initialRouteName={defaultDID ? 'Home' : 'Setup'}>
            <Stack.Screen name="HomeStack" component={HomeTabNavigator} options={{headerShown: false}}/>
            <Stack.Screen name="Setup" component={SetupScreen} options={{headerShown: false}}/>
            <Stack.Screen name="AgentEndpoints" component={AgentEndpointsScreen}/>
            <Stack.Screen name="Identifiers" component={IdentifiersScreen}/>
            <Stack.Screen name="IdentifierView" component={IdentifierViewScreen}/>
            <Stack.Screen name="ChatNew" component={ChatNewScreen}/>
            <Stack.Screen name="ChatView" component={ChatViewScreen}/>
            <Stack.Screen name="ChatMessages" component={ChatMessagesScreen}/>
            <Stack.Screen name="ChatMessageView" component={ChatMessageViewScreen}/>
            <Stack.Screen name="Scan" component={ScanScreen}/>
            <Stack.Screen name="Connections" component={ConnectionsScreen}/>
            <Stack.Screen name="ConnectionView" component={ConnectionViewScreen}/>
            <Stack.Screen name="Settings" component={SettingsScreen}/>
            <Stack.Screen name="Invitations" component={InvitationsScreen}/>
            <Stack.Screen name="InvitationView" component={InvitationViewScreen}/>
            <Stack.Screen name="BluetoothMessaging" component={BluetoothCentralScreen}/>
            <Stack.Screen name="Credentials" component={CredentialsScreen}/>
            <Stack.Screen name="CredentialView" component={CredentialViewScreen}/>
            <Stack.Screen name="CredentialIssue" component={CredentialIssueScreen}/>
            <Stack.Screen name="Presentations" component={PresentationsScreen}/>
            <Stack.Screen name="PresentationView" component={PresentationViewScreen}/>
            <Stack.Screen name="PresentationConfirm" component={PresentationConfirmScreen}/>
            <Stack.Screen name="SubmissionView" component={SubmissionViewScreen}/>
            <Stack.Screen name="Schemas" component={SchemasScreen}/>
            <Stack.Screen name="SchemaView" component={SchemaViewScreen}/>
            <Stack.Screen name="SchemaCreate" component={SchemaCreateScreen}/>
            <Stack.Screen name="Definitions" component={DefinitionsScreen}/>
            <Stack.Screen name="DefinitionView" component={DefinitionViewScreen}/>
            <Stack.Screen name="DefinitionCreate" component={DefinitionCreateScreen}/>
            <Stack.Screen name="RequestPresentation" component={RequestPresentationScreen}/>
            <Stack.Screen name="ACMStart" component={ACMStartScreen}/>
            <Stack.Screen name="ACMInvitation" component={ACMInvitationScreen}/>
            <Stack.Screen name="ACMAwaiting" component={ACMAwaitingScreen}/>
            <Stack.Screen name="ACMVerified" component={ACMVerifiedScreen}/>
            <Stack.Screen name="ACMDenied" component={ACMDeniedScreen}/>
            <Stack.Screen name="Tests" component={TestsScreen}/>
        </Stack.Navigator>
    );
}

export default StackNavigator;

export const navigationRef = createNavigationContainerRef()

export function navigate(name: any, params: any) {
    if (navigationRef.isReady()) {
        // @ts-ignore
        navigationRef.navigate(name, params);
    }
}

export function goBack() {
    if (navigationRef.isReady()) {
        navigationRef.goBack()
    }
}
