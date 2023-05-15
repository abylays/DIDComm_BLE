import Snackbar from "react-native-snackbar";

export const showSnackBar = (text: string) => {
    Snackbar.show({
        text: text,
        duration: Snackbar.LENGTH_SHORT,
        action: {
            text: 'CLOSE',
            onPress: () => { /* Do something. */
            },
        },
    });
}

export const showGreenSnackBar = (text: string) => {
    Snackbar.show({
        text: text,
        backgroundColor: '#18A73E',
        textColor: '#FFFFFF',
        duration: Snackbar.LENGTH_SHORT,
    });
}

export const showRedSnackBar = (text: string) => {
    Snackbar.show({
        text: text,
        backgroundColor: '#F83434',
        textColor: '#FFFFFF',
        duration: Snackbar.LENGTH_SHORT,
    });
}

export const showOrangeSnackBar = (text: string) => {
    Snackbar.show({
        text: text,
        backgroundColor: '#FFC107',
        textColor: '#FFFFFF',
        duration: Snackbar.LENGTH_SHORT,
    });
}
