const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({ region: 'us-east-1', apiVersion: '2012-08-10' });
const CONFIG_TABLE_NAME = 'crypto-bot-config';

class ConfigStore {
  static get(key) {
    const params = {
      TableName: CONFIG_TABLE_NAME,
      Key: {
        key: { S: key },
      },
    };

    return dynamodb.getItem(params).promise()
      .then(data => data.Item.key.S, (error) => {
        console.log(error);
        return null;
      });
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

    return dynamodb.putItem(params).promise()
      .then(data => console.log(data), error => console.log(error));
  }

  static del(key) {
    const params = {
      TableName: CONFIG_TABLE_NAME,
      Key: {
        key: { S: key },
      },
    };

    return dynamodb.deleteItem(params).promise()
      .then(data => console.log(data), error => console.log(error));
  }
}

module.exports = {
  ConfigStore,
};
