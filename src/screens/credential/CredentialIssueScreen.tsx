import * as React from 'react';
import {useLayoutEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {List, TextInput} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import Schema from "../../models/Schema";
import {useSelector} from "react-redux";
import {selectSchemaById} from "../../redux/reducers/SchemasSlice";
import {RootState} from "../../redux/reducers/rootReducer";
import DropDown from "react-native-paper-dropdown";
import {selectAllIdentifierDetails} from "../../redux/reducers/identifierDetailsSlice";
import {selectAllConnection} from "../../redux/reducers/connectionsSlice";
import {getDisplayName} from "../../utils/AgentUtils";
import {Header} from "../../components/Header";
import {saveCredential} from "../../utils/CredentialUtils";

export const CredentialIssueScreen = ({route, navigation}: { route: any, navigation: any }) => {
    const schemaId: string = route.params.schemaId;
    const [schema, setSchema] = React.useState<Schema>(useSelector((state: RootState) => selectSchemaById(state, schemaId))!);
    const possibleIssuers: { label: string, value: string }[] = useSelector(selectAllIdentifierDetails).filter((detail) => detail.owned).map((possibleIssuer) => {
        return {
            label: getDisplayName(possibleIssuer.did),
            value: possibleIssuer.did
        }
    })
    const possibleSubjects: { label: string, value: string }[] = useSelector(selectAllConnection).filter((connection) => connection.state == 'completed').map((possibleSubject) => {
        return {
            label: getDisplayName(possibleSubject.theirDID!),
            value: possibleSubject.theirDID!
        }
    })
    const [issuer, setIssuer] = React.useState<string>('');
    const [subject, setSubject] = React.useState("");
    const [attributeValues, setAttributeValues] = React.useState<string[]>(Array(schema.attributes.length).fill(''));
    const [showDropDownIssuer, setShowDropDownIssuer] = useState(false);
    const [showDropDownSubject, setShowDropDownSubject] = useState(false);
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <Header title="Save" onPress={async () => {
                if (issuer && subject) {
                    await saveCredential(schema, issuer, subject, attributeValues)
                    navigation.goBack()
                }
            }}/>
        })
    })
    return (<SafeAreaView>
        <ScrollView>
            <List.Section>
                <List.Subheader>Credential</List.Subheader>
                <View style={styles.container}>
                    <TextInput
                        style={styles.inputfield}
                        mode={'outlined'}
                        label="Schema"
                        disabled={true}
                        value={schema.name}
                    />
                    <View style={styles.inputfield}>
                        <DropDown
                            label={"Issuer"}
                            mode={"outlined"}
                            visible={showDropDownIssuer}
                            showDropDown={() => setShowDropDownIssuer(true)}
                            onDismiss={() => setShowDropDownIssuer(false)}
                            value={issuer}
                            setValue={setIssuer}
                            list={possibleIssuers}
                        />
                    </View>
                    <View style={styles.inputfield}>
                        <DropDown
                            label={"Subject DID"}
                            mode={"outlined"}
                            visible={showDropDownSubject}
                            showDropDown={() => setShowDropDownSubject(true)}
                            onDismiss={() => setShowDropDownSubject(false)}
                            value={subject}
                            setValue={setSubject}
                            list={possibleSubjects}
                        />
                    </View>
                </View>
                <List.Subheader>Attribute values</List.Subheader>
                <View style={styles.container}>
                    {schema.attributes.map((attribute, index) => {
                        return (
                            <TextInput
                                style={styles.inputfield}
                                mode={'outlined'}
                                label={attribute}
                                value={attributeValues[index]}
                                onChangeText={text => {
                                    let updatedAttributeValues = [...attributeValues]
                                    updatedAttributeValues[index] = text
                                    setAttributeValues(updatedAttributeValues)
                                }}
                            />
                        )

                    })}
                </View>
            </List.Section>
        </ScrollView>
    </SafeAreaView>);
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 16,
        marginRight: 16
    },
    inputfield: {
        marginBottom: 8
    }
});
