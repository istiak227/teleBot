const { db } = require("../../database");
const { cloneDeep, has } = require("lodash/fp");

const _ = require("lodash");

module.exports = {
  duplicate: (function () {
    return {
      has: async function (collection, key) {
        let result = await db.collection(collection).findOne(key);
        if (_.isEmpty(result.data)) {
          return false;
        }
        return true;
      },
    };
  })(),
};
