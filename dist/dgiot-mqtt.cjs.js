/*!
 * dgiot-mqtt.js v1.0.0
 * (c) 2021/9/10  18:11:16 h7ml(h7ml@qq.com)
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('../utils/index.js');

var dgiotBus = require('@dgiot/dgiotbus');

var iotMqtt = require('../utils/iotMqtt');

var store = require('../store/index.js');

var moment = require('moment');

var Map2Json = utils.Map2Json,
    getMqttEventId = utils.getMqttEventId;
var reconnect = true;
var maxReconnectNum = 100; // https://blog.csdn.net/qq_30849965/article/details/109109914
// https://unpkg.com/browse/xhl-mqttx@1.0.2/readme.md

console.log('dgiotBus', dgiotBus);
console.log('dgiot_mqtt');
var dgiotmqtt = {
  name: 'dgiotmqtt',
  data: function data() {
    return {
      consoleTale: [],
      reconnectNum: 0,
      isReconnect: reconnect,
      maxReconnectNum: maxReconnectNum,
      MapTopic: new Map()
    };
  },
  computed: {
    mapTopic: function mapTopic() {
      return store.getters['mqtt/mapTopic'];
    }
  },
  created: function created() {
    var _this = this;

    dgiotBus.$off("".concat(getMqttEventId('subscribe')));
    dgiotBus.$on("".concat(getMqttEventId('subscribe')), function (arg) {
      var qos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      console.groupCollapsed('%ciotMqtt subscribe arg', 'color:#009a61; font-size: 28px; font-weight: 300');
      console.table(arg);
      console.groupEnd();

      _this.subscribe(arg, qos);
    });
  },
  mounted: function mounted() {},
  methods: {
    connectCheckTopic: function connectCheckTopic(map) {
      // const map = Map2Json(this.mapTopic)
      for (var topickey in map) {
        if (map[topickey].endtime > Number(moment().format('x'))) this.subscribe({
          topickey: topickey,
          topic: map[topickey].topic,
          ttl: map[topickey].endtime - Number(moment().format('x'))
        });else this.unsubscribe(topickey, map[topickey].topic);
      }
    },

    /**
     *
     * @param topic
     * @param payloadString
     * @return {Vue|*}
     */
    busSendMsg: function busSendMsg(topic, payloadString, Message) {
      var nowTime = Number(moment().format('x'));
      var map = Map2Json(this.mapTopic);

      for (var topicKey in map) {
        if (this.checkTopic(map[topicKey].topic, topic)) {
          var args = {
            topic: topic,
            msg: payloadString,
            Message: Message,
            timestamp: moment().format('x')
          };
          dgiotBus.$emit("".concat(topicKey), args);
          console.groupCollapsed('%ciotMqtt SendMsg payloadString', 'color:#009a61; font-size: 28px; font-weight: 300');
          console.groupEnd();
          console.table({
            topic: topic,
            topicKey: topicKey,
            args: args
          });
        }

        if (Number(map[topicKey].endtime) < nowTime) this.unsubscribe(map[topicKey].topic, topicKey);
      }

      console.groupCollapsed('%ciotMqtt busSendMsg payloadString', 'color:#009a61; font-size: 28px; font-weight: 300');
      console.warn('%c%s', 'font-size: 24px;', payloadString);
      console.groupEnd();
    },

    /**
     *
     * @param subTopic 订阅的topic  包含#和+ 通配符
     * @param pubTopic 发布的topic 一定不包含通配符
     * @return {boolean}
     */
    checkTopic: function checkTopic(subTopic, pubTopic) {
      var length = pubTopic.length < subTopic.length ? pubTopic : subTopic; // 返回短的topic 短的topic 包含#/+

      for (var k in length) {
        if (subTopic[k] == '#' || subTopic == pubTopic) {
          return true;
        } else if (subTopic[k] == '+' || subTopic[k] == subTopic[k]) ; else {
          return false;
        }
      }
    },

    /**
     *
     * @param options
     * @return {boolean}
     */
    initMqtt: function initMqtt() {
      var _this2 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      options = _.merge(options, {
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS')
      });

      var _this = this;

      if (_.isEmpty(options.id)) {
        console.info('%c%s', 'color: green;font-size: 24px;', 'options 为空 不连接mqtt');
        return false;
      } else {
        console.groupCollapsed('%ciotMqtt connect msg', 'color:#009a61; font-size: 28px; font-weight: 300');
        console.table(options);
        console.groupEnd();
      }

      iotMqtt.init({
        id: options.id,
        ip: options.ip,
        port: options.port,
        userName: options.userName,
        passWord: options.passWord,
        success: function success() {
          var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "clientId\u4E3A".concat(options.id, ",iotMqtt\u8FDE\u63A5\u6210\u529F");

          _this.mqttSuccess(msg);

          if (!_.isEmpty(_this.mapTopic)) _this.connectCheckTopic(Map2Json(_this2.mapTopic));
        },
        error: function error() {
          var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "iotMqtt\u63A5\u5931\u8D25,\u81EA\u52A8\u91CD\u8FDE";

          // _this.connectLost()
          _this.mqttError(msg);
        },
        connectLost: function connectLost() {
          var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "iotMqtt\u8FDE\u63A5\u4E22\u5931";

          // _this.connectLost()
          _this.mqttError(msg);
        },
        onMessage: function onMessage(Message) {
          _this.onMessage(Message);
        }
      });
    },

    /**
     *
     * @param msg
     */
    mqttSuccess: function mqttSuccess() {
      var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'success';
      console.groupCollapsed('%ciotMqtt connection succeeded', 'color:#009a61; font-size: 28px; font-weight: 300');
      console.info('%c%s', 'color: green;font-size: 24px;', msg);
      console.groupEnd(); // iotMqtt.subscribe(this.objectId)
      // this.subscribe(this.objectId)
    },

    /**
     *
     * @param msg
     */
    mqttError: function mqttError() {
      var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'error';

      var _this = this;

      console.groupCollapsed('%ciotMqtt Connection failed', 'color:#009a61; font-size: 28px; font-weight: 300');
      console.error('%c%s', 'color: red;font-size: 24px;', msg);
      console.groupEnd();

      if (this.isReconnect) {
        _this.reconnect();
      } else console.info('reconnect 为' + reconnect, '不自動重連');
    },

    /**
     *
     * @param msg
     */
    connectLost: function connectLost() {
      var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'connectLost';
      console.groupCollapsed('%ciotMqtt Connection lost', 'color:#009a61; font-size: 28px; font-weight: 300');
      console.error('%c%s', 'color: red;font-size: 24px;', msg);
      console.groupEnd();
    },

    /**
     *
     * @param Message
     */
    onMessage: function onMessage(Message) {
      var _this = this;

      var _Message$destinationN = Message.destinationName,
          destinationName = _Message$destinationN === void 0 ? 'destinationName' : _Message$destinationN,
          _Message$duplicate = Message.duplicate,
          duplicate = _Message$duplicate === void 0 ? 'duplicate' : _Message$duplicate,
          _Message$payloadBytes = Message.payloadBytes,
          payloadBytes = _Message$payloadBytes === void 0 ? 'payloadBytes' : _Message$payloadBytes,
          _Message$payloadStrin = Message.payloadString,
          payloadString = _Message$payloadStrin === void 0 ? 'payloadString' : _Message$payloadStrin,
          _Message$qos = Message.qos,
          qos = _Message$qos === void 0 ? 0 : _Message$qos,
          _Message$retained = Message.retained,
          retained = _Message$retained === void 0 ? 'retained' : _Message$retained;
      var table = {
        destinationName: destinationName,
        duplicate: duplicate,
        payloadBytes: payloadBytes,
        payloadString: payloadString,
        qos: qos,
        retained: retained
      };

      _this.consoleTale.push(table);

      console.groupCollapsed('%ciotMqtt onMessage', 'color:#009a61; font-size: 28px; font-weight: 300');
      console.table(_this.consoleTale);
      console.groupEnd();
      this.busSendMsg(destinationName, payloadString, Message);
    },

    /**
     *
     * @param topickey
     * @param topic
     * @param ttl
     */
    subscribe: function subscribe(args) {
      var qos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var topicKey = args.topicKey,
          topic = args.topic,
          ttl = args.ttl;

      var _this = this;

      var endTime = Number(moment().format('x')) + ttl;

      _this.MapTopic.set(topicKey, {
        topic: topic,
        endtime: endTime
      }); // _this.setMapTopic(_this.MapTopic)


      store.dispatch('mqttMsg/setMapTopic', _this.MapTopic);

      if (!_.isEmpty(topic)) {
        iotMqtt.subscribe(topic, qos);
        console.groupCollapsed('%ciotMqtt subscribe', 'color:#009a61; font-size: 28px; font-weight: 300');
        console.table(args);
        console.groupEnd();
      } else console.error('no topic');
    },

    /**
     *
     * @param topicKey 存储在vuex的key
     * @param topic mqtt subscribe topic
     */
    unsubscribe: function unsubscribe(topicKey, topic) {
      iotMqtt.unsubscribe(topic);
      var map = this.mapTopic;

      if (!_.isEmpty(map)) {
        map["delete"](topicKey); // this.setMapTopic(map)

        store.dispatch('mqttMsg/setMapTopic', map);
      }

      console.info('%c%s', 'color: green;font-size: 24px;', map);
      console.groupCollapsed('%ciotMqtt unsubscribe', 'color:#009a61; font-size: 28px; font-weight: 300');
      console.info('%c%s', 'color: green;font-size: 24px;', 'unsubscribe: topic' + topic);
      console.groupEnd();
    },

    /**
     *
     * @param msg
     */
    reconnect: function reconnect() {
      var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '自动重连mqtt';

      var _this = this;

      _this.reconnectNum++;
      var maxReconnectNum = _this.maxReconnectNum < 4 ? 4 : _this.maxReconnectNum;

      if (_this.reconnectNum < maxReconnectNum) {
        iotMqtt.reconnect();
        console.groupCollapsed('%ciotMqtt reconnect', 'color:#009a61; font-size: 28px; font-weight: 300');
        console.log('%c%s', 'color: black; font-size: 24px;', '当前重连次数：' + _this.reconnectNum + '次' + msg);
        console.groupEnd();
      } else {
        console.error('%c%s', 'color: black;font-size: 24px;', '当前重连次数大于' + maxReconnectNum + '次,不再自动重连,重连第' + _this.reconnectNum + '次');
      }
    },

    /**
     *
     * @param topic
     * @param obj
     */
    sendMessage: function sendMessage(topic, obj) {
      var qos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var retained = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (_.isEmpty(obj)) {
        console.groupCollapsed('%csendMsg', 'color:#009a61; font-size: 28px; font-weight: 300');
        console.error(topic, obj, '没有发送消息的内容');
        console.groupEnd();
        return;
      } // 数据发送


      try {
        iotMqtt.sendMessage(topic, obj, qos, retained);
        console.groupCollapsed('%csendMsg', 'color:#009a61; font-size: 28px; font-weight: 300');
        console.log(topic, obj);
        console.groupEnd();
      } catch (err) {
        console.log('error', err);
        console.groupCollapsed('%ciotMqtt sendMessage error', 'color:#009a61; font-size: 28px; font-weight: 300');
        console.warn('%c%s', 'color: red;font-size: 24px;', err);
        console.groupEnd();
      }
    }
  }
};
window.dgiotmqtt = dgiotmqtt;

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': dgiotmqtt
});

exports.dgiotmqtt = index;
//# sourceMappingURL=dgiot-mqtt.cjs.js.map
