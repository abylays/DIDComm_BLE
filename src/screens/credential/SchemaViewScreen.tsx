import * as React from 'react';
import {useLayoutEffect} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/reducers/rootReducer";
import {List} from "react-native-paper";
import Schema from "../../models/Schema";
import {deleteSchema, selectSchemaById} from "../../redux/reducers/SchemasSlice";
import {Header} from "../../components/Header";

export const SchemaViewScreen = ({route, navigation}: { route: any, navigation: any }) => {
    const schemaId: string = route.params.schemaId;
    const schema: Schema = useSelector((state: RootState) => selectSchemaById(state, schemaId))!
    const dispatch = useDispatch();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <Header title="Delete" icon="delete-outline" onPress={async () => {
                dispatch(deleteSchema(schemaId))
                console.log('Deleted successfully')
                navigation.goBack()
            }}/>
        })
    })

    return (<ScrollView>
        <List.Section>
            <List.Subheader>Schema</List.Subheader>
            <List.Item
                title="Use schema for presentation definition"
                onPress={() => {
                    navigation.navigate('DefinitionCreate', {schemaId: schema.id})
                }}
                right={props => <List.Icon {...props} icon="arrow-right"/>}/>
            <List.Item
                title="Schema id"
                description={schema?.id}
                descriptionNumberOfLines={20}
            />
            <List.Item
                title="Schema name"
                description={schema?.name}
                descriptionNumberOfLines={50}
            />
            <List.Item
                title="Schema version"
                description={schema?.version}
                descriptionNumberOfLines={50}
            />
            <List.Item
                title="Schema description"
                description={schema?.description}
                descriptionNumberOfLines={50}
            />
            <List.Item
                title="Credential types"
                description={JSON.stringify(schema?.credential.type)}
                descriptionNumberOfLines={50}
            />
            <List.Item
                title="Credential contexts"
                description={JSON.stringify(schema?.credential.context)}
                descriptionNumberOfLines={50}
            />
            <List.Item
                title="Credential proof format"
                description={schema?.credential.proofFormat}
                descriptionNumberOfLines={50}
            />
            <List.Subheader>Attributes</List.Subheader>
            {
                schema.attributes.map(attribute =>
                    <List.Item
                        key={attribute}
                        title={attribute}
                        description='Attribute name'
                        descriptionNumberOfLines={20}
                    />
                )
            }
            <List.Subheader>Schema raw</List.Subheader>
            <Text style={styles.container}>{JSON.stringify(schema)}</Text>
        </List.Section>
    </ScrollView>);
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 16,
        marginRight: 16
    }
})
