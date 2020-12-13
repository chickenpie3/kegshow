

var mqttClient;
var mqttTopics;
var messageCallback;

function mqttClientConnectHandler() {
	console.log('connect');
	for (var i = mqttTopics.length - 1; i >= 0; i--) {
		let topic = "flow/" + mqttTopics[i] + "/#";
		console.log('subscribing to ' + topic);
		mqttClient.subscribe(topic);
	}
}

function mqttClientMessageHandler(topic, payload) {
    console.log('message');
    console.log(topic);

    if (messageCallback) {
    	messageCallback(JSON.parse(payload));
    }
}


function generateID(length) {
    let text = ""
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for(let i = 0; i < length; i++)  {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
}


function monitor(topics, onmessage) {

	messageCallback = onmessage;
	mqttTopics = topics;

	if (!mqttClient) {
        // Initialize the Amazon Cognito credentials provider
        AWS.config.region = 'us-east-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:c448a2a8-f739-4915-a594-d9fb157541fd'
        });

        AWS.config.credentials.get(function(){

            // Credentials will be available when this function is called.

            awsIot = require('aws-iot-device-sdk');
            mqttClient = awsIot.device({
                //
                // Set the AWS region we will operate in.
                //
                region: 'us-east-1',
                //
                ////Set the AWS IoT Host Endpoint
                host:'a3tkzsco97gkug-ats.iot.us-east-1.amazonaws.com',
                //
                // Use the clientId created earlier.
                //
                clientId: generateID(32),
                //
                // Connect via secure WebSocket
                //
                protocol: 'wss',
                //
                // Set the maximum reconnect time to 8 seconds; this is a browser application
                // so we don't want to leave the user waiting too long for reconnection after
                // re-connecting to the network/re-opening their laptop/etc...
                //
                maximumReconnectTimeMs: 8000,
                //
                // Enable console debugging information (optional)
                //
                debug: true,
                accessKeyId: AWS.config.credentials.accessKeyId,
                secretKey: AWS.config.credentials.secretAccessKey,
                sessionToken: AWS.config.credentials.sessionToken
            });
            mqttClient.on('connect', mqttClientConnectHandler);
            mqttClient.on('message', mqttClientMessageHandler);
        });
    }
}

module.exports = {
   monitor: monitor
}