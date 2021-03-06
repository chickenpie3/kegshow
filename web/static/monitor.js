import AWS from 'aws-sdk';

var iotDevice;
var mqttTopics;
var messageCallback;

function mqttClientConnectHandler() {
	console.log('mqtt connect');
	for (var i = mqttTopics.length - 1; i >= 0; i--) {
		let topic = "flow/" + mqttTopics[i] + "/#";
		console.log('subscribing to ' + topic);
		iotDevice.subscribe(topic);
	}
}

function mqttClientDisconnectHandler(/*packet*/) {
  console.log('mqtt disconnect')
}

function mqttClientReconnectHandler() {
  console.log('mqtt reconnect')
}

function mqttClientMessageHandler(topic, payload) {
    if (messageCallback) {
      messageCallback(JSON.parse(payload));
    }
}

function mqttClientErrorHandler(error) {
  console.log('mqtt error: ' + error)
}

function mqttClientOfflineHandler() {
  console.log('mqtt offline')
}

function mqttClientCloseHandler() {
  console.log('mqtt close')
}

function mqttClientEndHandler() {
  console.log('mqtt end')
}


function generateID(length) {
  let text = ""
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for(let i = 0; i < length; i++)  {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function refreshCredentials() {

  AWS.config.credentials.refresh(function(err) {
    if (err) {
      console.error("Error refreshing iot credentials.", err)
    } else {
      console.log("Refreshing iot credentials.")
  
      iotDevice.updateWebSocketCredentials(AWS.config.credentials.accessKeyId,
        AWS.config.credentials.secretAccessKey,
        AWS.config.credentials.sessionToken,
        AWS.config.credentials.expireTime)
    
      var delay = AWS.config.credentials.expireTime - new Date() - 5*60*1000;

      console.log("iot credentials valid until " + AWS.config.credentials.expireTime + ", next refresh in " + delay)

      setTimeout(refreshCredentials,  delay);
    }
  })
}

export default function monitor(topics, onmessage) {

  messageCallback = onmessage;
	mqttTopics = topics;

	if (!iotDevice) {
    // Initialize the Amazon Cognito credentials provider
    AWS.config.region = 'us-east-1';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:c448a2a8-f739-4915-a594-d9fb157541fd'
    });

    AWS.config.credentials.get(function(){
      var awsIot = require('aws-iot-device-sdk');
      // Credentials will be available when this function is called.            
      iotDevice = awsIot.device({
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
        debug: false,
        accessKeyId: AWS.config.credentials.accessKeyId,
        secretKey: AWS.config.credentials.secretAccessKey,
        sessionToken: AWS.config.credentials.sessionToken
      });
      iotDevice.on('connect', mqttClientConnectHandler);
      iotDevice.on('disconnect', mqttClientDisconnectHandler);
      iotDevice.on('reconnect', mqttClientReconnectHandler);
      iotDevice.on('message', mqttClientMessageHandler);      
      iotDevice.on('error', mqttClientErrorHandler);
      iotDevice.on('offline', mqttClientOfflineHandler);
      iotDevice.on('close', mqttClientCloseHandler);
      iotDevice.on('end', mqttClientEndHandler);

      var delay = AWS.config.credentials.expireTime - new Date() - 5*60*1000;
      console.log("iot credentials valid until " + AWS.config.credentials.expireTime + ", next refresh in " + delay)
      setTimeout(refreshCredentials,  delay);
    });
  }
}