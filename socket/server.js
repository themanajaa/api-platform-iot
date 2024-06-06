var SerialPort = require('serialport');
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
//var storage = require("./storage")
require('dotenv').config()

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org');
let isConnected = false;

client.on('connect', function() {
  client.subscribe('esiee_it-RGB1', function (err) {
    if(!err) {
      client.publish('esiee_it-RGB1', 'Server connected')
    }
  })
})

client.on('disconnect', () => {
  console.log('Disconnected from MQTT broker');
  isConnected = false;
});

client.on('reconnect', () => {
  console.log('Reconnecting to MQTT broker...');
});

frame_obj_led = (pin, value) => { // AT Request to be sent
  return {
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination64: "0013A20041642063",
    command: pin,
    commandParameter: [value]
  }
};

var led = (color, value) => {
  if (typeof value === 'undefined') {
    console.error('Invalid arguments provided');
    return;
  }
  client.publish(color, value.toString())
  console.log(color, value)
}

var led_change = (message) => {
  value = parseInt(message)
  if(value <= 600){
    xbeeAPI.builder.write(frame_obj_led("D0", "04"));
    xbeeAPI.builder.write(frame_obj_led("D1", "05"));
    xbeeAPI.builder.write(frame_obj_led("D2", "05"));
  }else if(value > 600 && value < 1200){
    xbeeAPI.builder.write(frame_obj_led("D0", "05"));
    xbeeAPI.builder.write(frame_obj_led("D1", "04"));
    xbeeAPI.builder.write(frame_obj_led("D2", "05"));
  }else if(value >= 1200){
    xbeeAPI.builder.write(frame_obj_led("D0", "05"));
    xbeeAPI.builder.write(frame_obj_led("D1", "05"));
    xbeeAPI.builder.write(frame_obj_led("D2", "04"));
  }
}

client.on('message', function(topic, message) {
  if(topic == "esiee_it-RGB1"){
    led_change(message)
  }
  console.log(topic, message.toString())
  //client.end()
})


const SERIAL_PORT = process.env.SERIAL_PORT;

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

let serialport = new SerialPort(SERIAL_PORT, {
  baudRate: parseInt(process.env.SERIAL_BAUDRATE) || 9600,
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message)
  }
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

serialport.on("open", function () {
  var frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "NI",
    commandParameter: [],
  };

  xbeeAPI.builder.write(frame_obj);

  frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination64: "FFFFFFFFFFFFFFFF",
    command: "NI",
    commandParameter: [],
  };
  xbeeAPI.builder.write(frame_obj);

});

// All frames parsed by the XBee will be emitted here

// storage.listSensors().then((sensors) => sensors.forEach((sensor) => console.log(sensor.data())))
let lastValue;

xbeeAPI.parser.on("data", function (frame) {

  //on new device is joined, register it

  //on packet received, dispatch event
  //let dataReceived = String.fromCharCode.apply(null, frame.data);
  if (C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET === frame.type) {
    console.log("C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET");
    let dataReceived = String.fromCharCode.apply(null, frame.data);
    console.log(">> ZIGBEE_RECEIVE_PACKET >", dataReceived);

  }

  if (C.FRAME_TYPE.NODE_IDENTIFICATION === frame.type) {
    // let dataReceived = String.fromCharCode.apply(null, frame.nodeIdentifier);
    console.log("NODE_IDENTIFICATION");
    //storage.registerSensor(frame.remote64)

  } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {

    console.log("ZIGBEE_IO_DATA_SAMPLE_RX")
    console.log(frame.analogSamples.AD1)
    //storage.registerSample(frame.remote64,frame.analogSamples.AD0 )
    led("esiee_it-RGB1", frame.analogSamples.AD1)

  } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {
    console.log("REMOTE_COMMAND_RESPONSE")
  } else {
    console.debug(frame);
    let dataReceived = String.fromCharCode.apply(null, frame.commandData)
    console.log(dataReceived);
  }

});