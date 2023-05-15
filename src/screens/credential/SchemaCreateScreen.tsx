import * as React from 'react';
import {useLayoutEffect} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Chip, Text, TextInput} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import Schema from "../../models/Schema";
import {v4 as uuidv4} from "uuid";
import {useDispatch} from "react-redux";
import {addSchema} from "../../redux/reducers/SchemasSlice";
import {Header} from "../../components/Header";

export const SchemaCreateScreen = ({navigation}: { navigation: any }) => {
    const [name, setName] = React.useState("");
    const [version, setVersion] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [attributes, setAttributes] = React.useState<string[]>(['name', 'role']);
    let dispatch = useDispatch()
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <Header title="Save" onPress={async () => {
                let schema: Schema = {
                    attributes: attributes,
                    description: description,
                    id: uuidv4(),
                    name: name,
                    version: version,
                    credential: {
                        context: ['https://www.w3.org/2018/credentials/v1', 'https://example.com/contexts/acvc/v1'],
                        type: ['VerifiableCredential', 'AccessControl'],
                        proofFormat: 'lds'
                    }
                }
                dispatch(addSchema(schema))
                console.log('Saved schema: ' + JSON.stringify(schema))
                navigation.goBack()
            }}/>
        })
    })

    return (<SafeAreaView>
        <ScrollView>
            <View style={styles.container}>
                <TextInput
                    style={styles.inputfield}
                    mode={'outlined'}
                    label="Schema name"
                    value={name}
                    onChangeText={text => setName(text)}
                />
                <TextInput
                    style={styles.inputfield}
                    mode={'outlined'}
                    label="Schema version"
                    value={version}
                    onChangeText={text => setVersion(text)}
                />
                <TextInput
                    style={styles.inputfield}
                    mode={'outlined'}
                    label="Schema description"
                    value={description}
                    onChangeText={text => setDescription(text)}
                />
                <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                    <Text>Attribute fields</Text>
                    <Chip disabled={true} icon="plus-circle-outline" onPress={() => {
                        let attrArray = [...attributes]
                        attrArray.push('')
                        setAttributes(attrArray)
                    }}>Add attribute</Chip>
                </View>
                {attributes.map((attribute, index) => {
                    return (
                        <TextInput
                            disabled={true}
                            style={styles.inputfield}
                            mode={'outlined'}
                            label="Attribute name"
                            value={attribute}
                            right={<TextInput.Icon disabled={true} name="delete-outline" onPress={() => {
                                let updatedAttributes = [...attributes]
                                updatedAttributes.splice(index, 1);
                                setAttributes(updatedAttributes)
                            }}/>}
                            onChangeText={text => {
                                let updatedAttributes = [...attributes]
                                updatedAttributes[index] = text
                                setAttributes(updatedAttributes)
                            }}
                        />
                    )

                })}
            </View>
        </ScrollView>
    </SafeAreaView>);
}

const styles = StyleSheet.create({
    container: {
        padding: 16
    },
    inputfield: {
        marginBottom: 8
    }
});
