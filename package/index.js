const utils = require('../utils/index.js');
const dgiotBus = require('@dgiot/dgiotbus');
const iotMqtt = require('../utils/iotMqtt');
const store = require('../store/index.js');
const moment = require('moment');
const { Map2Json, getMqttEventId } = utils;
const reconnect = true;
const maxReconnectNum = 100;
// https://blog.csdn.net/qq_30849965/article/details/109109914
// https://unpkg.com/browse/xhl-mqttx@1.0.2/readme.md
console.log('dgiotBus', dgiotBus);
console.log('dgiot_mqtt');
const dgiotmqtt = {
  name: 'dgiotmqtt',
  data() {
    return {
      consoleTale: [],
      reconnectNum: 0,
      isReconnect: reconnect,
      maxReconnectNum: maxReconnectNum,
      MapTopic: new Map(),
    };
  },
  computed: {
    mapTopic() {
      return store.getters['mqtt/mapTopic'];
    },
  },
  created() {
    const _this = this;
    dgiotBus.$off(`${getMqttEventId('subscribe')}`);
    dgiotBus.$on(`${getMqttEventId('subscribe')}`, (arg, qos = 0) => {
      console.groupCollapsed(
        '%ciotMqtt subscribe arg',
        'color:#009a61; font-size: 28px; font-weight: 300'
      );
      console.table(arg);
      console.groupEnd();
      _this.subscribe(arg, qos);
    });
  },
  mounted() {},
  methods: {
    connectCheckTopic(map) {
      // const map = Map2Json(this.mapTopic)
      for (let topickey in map) {
        if (map[topickey].endtime > Number(moment().format('x')))
          this.subscribe({
            topickey: topickey,
            topic: map[topickey].topic,
            ttl: map[topickey].endtime - Number(moment().format('x')),
          });
        else this.unsubscribe(topickey, map[topickey].topic);
      }
    },
    /**
     *
     * @param topic
     * @param payloadString
     * @return {Vue|*}
     */
    busSendMsg(topic, payloadString, Message) {
      const nowTime = Number(moment().format('x'));
      const map = Map2Json(this.mapTopic);
      for (let topicKey in map) {
        if (this.checkTopic(map[topicKey].topic, topic)) {
          const args = {
            topic: topic,
            msg: payloadString,
            Message: Message,
            timestamp: moment().format('x'),
          };
          dgiotBus.$emit(`${topicKey}`, args);
          console.groupCollapsed(
            '%ciotMqtt SendMsg payloadString',
            'color:#009a61; font-size: 28px; font-weight: 300'
          );
          console.groupEnd();
          console.table({ topic, topicKey, args });
        }
        if (Number(map[topicKey].endtime) < nowTime)
          this.unsubscribe(map[topicKey].topic, topicKey);
      }
      console.groupCollapsed(
        '%ciotMqtt busSendMsg payloadString',
        'color:#009a61; font-size: 28px; font-weight: 300'
      );
      console.warn('%c%s', 'font-size: 24px;', payloadString);
      console.groupEnd();
    },
    /**
     *
     * @param subTopic 订阅的topic  包含#和+ 通配符
     * @param pubTopic 发布的topic 一定不包含通配符
     * @return {boolean}
     */
    checkTopic(subTopic, pubTopic) {
      let length = pubTopic.length < subTopic.length ? pubTopic : subTopic; // 返回短的topic 短的topic 包含#/+
      for (let k in length) {
        if (subTopic[k] == '#' || subTopic == pubTopic) {
          return true;
        } else if (subTopic[k] == '+' || subTopic[k] == subTopic[k]) {
          // return true
        } else {
          return false;
        }
      }
    },
    /**
     *
     * @param options
     * @return {boolean}
     */
    initMqtt(options = {}) {
      options = _.merge(options, {
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS'),
      });
      let _this = this;
      if (_.isEmpty(options.id)) {
        console.info(
          '%c%s',
          'color: green;font-size: 24px;',
          'options 为空 不连接mqtt'
        );
        return false;
      } else {
        console.groupCollapsed(
          '%ciotMqtt connect msg',
          'color:#009a61; font-size: 28px; font-weight: 300'
        );
        console.table(options);
        console.groupEnd();
      }
      iotMqtt.init({
        id: options.id,
        ip: options.ip,
        port: options.port,
        userName: options.userName,
        passWord: options.passWord,
        success: (msg = `clientId为${options.id},iotMqtt连接成功`) => {
          _this.mqttSuccess(msg);
          if (!_.isEmpty(_this.mapTopic))
            _this.connectCheckTopic(Map2Json(this.mapTopic));
        },
        error: function (msg = `iotMqtt接失败,自动重连`) {
          // _this.connectLost()
          _this.mqttError(msg);
        },
        connectLost: function (msg = `iotMqtt连接丢失`) {
          // _this.connectLost()
          _this.mqttError(msg);
        },
        onMessage: function (Message) {
          _this.onMessage(Message);
        },
      });
    },
    /**
     *
     * @param msg
     */
    mqttSuccess(msg = 'success') {
      console.groupCollapsed(
        '%ciotMqtt connection succeeded',
        'color:#009a61; font-size: 28px; font-weight: 300'
      );
      console.info('%c%s', 'color: green;font-size: 24px;', msg);
      console.groupEnd();
      // iotMqtt.subscribe(this.objectId)
      // this.subscribe(this.objectId)
    },
    /**
     *
     * @param msg
     */
    mqttError(msg = 'error') {
      let _this = this;
      console.groupCollapsed(
        '%ciotMqtt Connection failed',
        'color:#009a61; font-size: 28px; font-weight: 300'
      );
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
    connectLost(msg = 'connectLost') {
      console.groupCollapsed(
        '%ciotMqtt Connection lost',
        'color:#009a61; font-size: 28px; font-weight: 300'
      );
      console.error('%c%s', 'color: red;font-size: 24px;', msg);
      console.groupEnd();
    },
    /**
     *
     * @param Message
     */
    onMessage(Message) {
      let _this = this;
      const {
        destinationName = 'destinationName',
        duplicate = 'duplicate',
        payloadBytes = 'payloadBytes',
        payloadString = 'payloadString',
        qos = 0,
        retained = 'retained',
      } = Message;
      const table = {
        destinationName: destinationName,
        duplicate: duplicate,
        payloadBytes: payloadBytes,
        payloadString: payloadString,
        qos: qos,
        retained: retained,
      };
      _this.consoleTale.push(table);
      console.groupCollapsed(
        '%ciotMqtt onMessage',
        'color:#009a61; font-size: 28px; font-weight: 300'
      );
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
    subscribe: function (args, qos = 0) {
      const { topicKey, topic, ttl } = args;
      let _this = this;
      let endTime = Number(moment().format('x')) + ttl;
      _this.MapTopic.set(topicKey, { topic: topic, endtime: endTime });
      // _this.setMapTopic(_this.MapTopic)
      store.dispatch('mqttMsg/setMapTopic', _this.MapTopic);
      if (!_.isEmpty(topic)) {
        iotMqtt.subscribe(topic, qos);
        console.groupCollapsed(
          '%ciotMqtt subscribe',
          'color:#009a61; font-size: 28px; font-weight: 300'
        );
        console.table(args);
        console.groupEnd();
      } else console.error('no topic');
    },
    /**
     *
     * @param topicKey 存储在vuex的key
     * @param topic mqtt subscribe topic
     */
    unsubscribe: function (topicKey, topic) {
      iotMqtt.unsubscribe(topic);
      const map = this.mapTopic;
      if (!_.isEmpty(map)) {
        map.delete(topicKey);
        // this.setMapTopic(map)
        store.dispatch('mqttMsg/setMapTopic', map);
      }
      console.info('%c%s', 'color: green;font-size: 24px;', map);
      console.groupCollapsed(
        '%ciotMqtt unsubscribe',
        'color:#009a61; font-size: 28px; font-weight: 300'
      );
      console.info(
        '%c%s',
        'color: green;font-size: 24px;',
        'unsubscribe: topic' + topic
      );
      console.groupEnd();
    },
    /**
     *
     * @param msg
     */
    reconnect: function (msg = '自动重连mqtt') {
      const _this = this;
      _this.reconnectNum++;
      const maxReconnectNum =
        _this.maxReconnectNum < 4 ? 4 : _this.maxReconnectNum;
      if (_this.reconnectNum < maxReconnectNum) {
        iotMqtt.reconnect();
        console.groupCollapsed(
          '%ciotMqtt reconnect',
          'color:#009a61; font-size: 28px; font-weight: 300'
        );
        console.log(
          '%c%s',
          'color: black; font-size: 24px;',
          '当前重连次数：' + _this.reconnectNum + '次' + msg
        );
        console.groupEnd();
      } else {
        console.error(
          '%c%s',
          'color: black;font-size: 24px;',
          '当前重连次数大于' +
            maxReconnectNum +
            '次,不再自动重连,重连第' +
            _this.reconnectNum +
            '次'
        );
      }
    },
    /**
     *
     * @param topic
     * @param obj
     */
    sendMessage(topic, obj, qos = 0, retained = false) {
      if (_.isEmpty(obj)) {
        console.groupCollapsed(
          '%csendMsg',
          'color:#009a61; font-size: 28px; font-weight: 300'
        );
        console.error(topic, obj, '没有发送消息的内容');
        console.groupEnd();
        return;
      }
      // 数据发送
      try {
        iotMqtt.sendMessage(topic, obj, qos, retained);
        console.groupCollapsed(
          '%csendMsg',
          'color:#009a61; font-size: 28px; font-weight: 300'
        );
        console.log(topic, obj);
        console.groupEnd();
      } catch (err) {
        console.log('error', err);
        console.groupCollapsed(
          '%ciotMqtt sendMessage error',
          'color:#009a61; font-size: 28px; font-weight: 300'
        );
        console.warn('%c%s', 'color: red;font-size: 24px;', err);
        console.groupEnd();
      }
    },
  },
};

window.dgiotmqtt = dgiotmqtt;
export default dgiotmqtt;
