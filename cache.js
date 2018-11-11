const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({ region: 'us-east-1', apiVersion: '2012-08-10' });
const CONFIG_TABLE_NAME = 'crypto-bot-config';

class Cache {
  static get(key) {
    const params = {
      TableName: CONFIG_TABLE_NAME,
      Key: {
        key: { S: key },
      },
    };

    return dynamodb.getItem(params).promise;
  }

  static put(key, value) {
    const params = {
      Item: {
        key: {
          S: key,
        },
        value: {
          S: value,
        },
      },
      TableName: CONFIG_TABLE_NAME,
    };

    return dynamodb.putItem(params).promise;
  }

  static del(key) {
    const params = {
      TableName: CONFIG_TABLE_NAME,
      Key: {
        key: { S: key },
      },
    };

    return dynamodb.deleteItem(params).promise;
  }
}

module.exports = {
  Cache,
};
