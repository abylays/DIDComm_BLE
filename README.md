# DIDCommunication using BLE #

The application is built for enabling Bluetooth Low Energy (BLE) support in digital wallets to exchange and verify credentials. It allows messages to be sent between two mobile devices over BLE (only Android is supported as of now), and is made using [React Native](https://reactnative.dev/) and [Veramo](https://veramo.io/) framework to provide the mobile agent. The implemented protocols used for agent-to-agent communication are based on [DIDComm](https://didcomm.org/) and [Aries RFCs](https://github.com/hyperledger/aries-rfcs).

Some of the features includes:
* Sending [DIDComm](https://identity.foundation/didcomm-messaging/spec/) messages between two BLE enabled devices.
* Create [Decentralized identifiers (DIDs)](https://www.w3.org/TR/did-core/) with the did:key method.
* Issuing and requesting [Verifiable credentials (VCs)](https://www.w3.org/TR/vc-data-model/) over BLE.
* Creating presentation definitions and submissions (see [DIF Presentation Exchange](https://identity.foundation/presentation-exchange/)).
* Generate and scan QR-codes / NFC-tags that are used to bootstrap various processes such as connecting the devices and performing access control.

Not all of the protocols and features have been fully implemented. The application includes different tests and functionality to demonstrate a use case for achieving offline access control between two devices using BLE.

The source code for the native module that provides the BLE functionality for Android can be found within `android/app/src/main/java/com/mobileapp`. This module is responsible for establishing and managing a BLE connection between two devices, in addition to handling the sending and receiving of messages over this connection.

## Installation ##
1. Set up the environment for Android development, see https://reactnative.dev/docs/environment-setup
2. Clone this repository and then run `yarn install` to install dependencies.
3. Application can be started using the following command: `npx react-native run-android`

## Usage ##
The application can be used in different ways, e.g. to establish a DID connection between two devices that provides a secure and trusted communication channel, sending end-to-end encrypted messages using this DID connection, issuing credentials, requesting and verifying credentials. These are some of the functionality it aims to deliver.

Disclaimer: The application has not been tested for vulnerabilities and may contain bugs. It should therefore not be used in production builds. Use at your own risk.

### Establishing a DID connection ###
To establish a DID connection with another device, start by creating an invitation to connect a DID using the “connect” button found on the profile tab or identifier view. This will display a QR-code. Then, from another device, use the “scan QR” button located on the home tab to open the camera and scan QR-code in order to establish a DID connection using the default DID. Make sure Bluetooth is enabled on both devices.

### Sending messages ###
Messages can be sent between two devices using an already established DID connection. To manually send a message, select an existing chat in the messaging tab, or create a new chat by selecting a DID connection using the “new chat” button.

Before sending messages, if a BLE connection has not been established yet with the receiver device, the sender device will automatically search for (using the BLE service endpoint that was shared during DID connection establishment) and connect with the receiver device if found.

### Issuing credentials ###
Start by creating and issuing a new credential using a schema from profile → credentials → schemas screen. To send a credential over BLE, go to profile → credentials screen, then select a credential from the list and choose “send credential in chat”.

### Request and verify credentials ###
A device can request and verify credentials from another device using BLE. This process is initiated either from the profile → presentations → definitions screen or the access control module screen. The selected presentation definition defines criterias that must be fulfilled by the submitted credentials.
