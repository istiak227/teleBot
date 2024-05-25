const ObjectId = require("mongodb").ObjectId;
module.exports = function (db) {
  return {
    create: async function create(collection, data) {
      try {
        if (data.files != null && data.files.file) {
          let fileBuffer;

          let file = data.files.file;

          let encodedPic = file.data.toString("base64");
          fileBuffer = Buffer.from(encodedPic, "base64");
          // delete data['files']
          data = {
            ...data,
            files: { data: fileBuffer },
          };
          // console.log("data in middleware",data)
        } else {
          // console.log("data in middleware fault",data )
        }
        delete data._id;
        // console.log("Checking Middleware ", data)
        let model = await db.collection(collection).insertOne(data);

        return model;
      } catch (e) {
        console.log(e);
        return {
          status: 500,
          message: "model creation failed",
        };
      }
    },

    update: async function update(collection, param, data) {
      try {
        let key = "";
        let updateData = {};
        try {
          key = { _id: ObjectId(param) };
          delete data["_id"];
          data.updated = true;
          data.updateDate = new Date();
          updateData = { $set: { ...data } };
        } catch (e) {
          console.log(e);
          return {
            status: 500,
            message: "model updateing failed (1)",
          };
        }

        let model = await db.collection(collection).updateOne(key, updateData);
        return model;
      } catch (e) {
        console.log(e);
        return {
          status: 500,
          message: "model updateing failed (2)",
        };
      }
    },

    updateByKey: async function updateByKey(collection, key, data) {
      try {
        let updateData = {};
        try {
          delete data["_id"];
          data.updated = true;
          data.updateDate = new Date();
          updateData = { $set: { ...data } };
        } catch (e) {
          console.log(e);
          return {
            status: 500,
            message: "model updateing failed (1)",
          };
        }

        let model = await db.collection(collection).updateOne(key, updateData);
        return model;
      } catch (e) {
        console.log(e);
        return {
          status: 500,
          message: "model updateing failed (2)",
        };
      }
    },

    fetchById: function fetchById(collection, param) {
      try {
        let key = "";
        try {
          key = { _id: ObjectId(param) };
        } catch (e) {
          // console.log(e)
          return {
            status: 500,
            message: "model fetch by ID  failed (1)",
          };
        }

        let model = db.collection(collection).findOne(key);
        return model;
      } catch (e) {
        console.log(e);
        return {
          status: 500,
          message: "model fetch by ID failed (2)",
        };
      }
    },

    fetchByKey: async function fetchByKey(
      collection,
      params,
      view,
      skip,
      limit,
      sort
    ) {
      try {
        // console.log("Testing database data middleware", collection, params);
        // params.delete = false
        if (!skip) {
          skip = 0;
        }
        if (!limit) {
          limit = 0;
        }
        if (!sort) {
          sort = { _id: 1 };
        }
        let arrayCheck = Array.isArray(params);
        (model = {}), (ids = []);

        // params.delete = false

        if (arrayCheck) {
          if (params.length == 0) {
            return {
              status: 500,
              message: "model updateing failed (2)",
            };
          }
          params.forEach((param) => {
            ids.push(ObjectId(param));
          });

          // delete data['_id']

          // console.log(ids)\
          model = await db
            .collection(collection)
            .find({ _id: { $in: ids } })
            .skip(skip)
            .limit(limit)
            .project({ ...view })
            .sort({ ...sort })
            .toArray();
        } else {
          delete params.delete;
          model = await db
            .collection(collection)
            .find(params)
            .skip(skip)
            .limit(limit)
            .project({ ...view })
            .sort({ ...sort })
            .toArray();
        }
        // return model
        // model = db.collection(collection).find(key).skip(skip).limit(limit).project({...view}).sort({...sort}).toArray()
        // data = model
        // console.log("DB middleware", params, collection);
        return model;
      } catch (e) {
        console.log(e);
        return {
          status: 500,
          message: "model fetching by Key failed (1)",
        };
      }
    },

    fetchBytext: async function fetchByKey(
      collection,
      params,
      view,
      skip,
      limit,
      sort
    ) {
      try {
        if (!skip) {
          skip = 0;
        }
        if (!limit) {
          limit = 0;
        }
        if (!sort) {
          sort = { _id: 1 };
        }

        let model = {};

        // let params = {delete : false}
        // console.log("Testing Parameters", params)

        // await db.collection('articles').createIndex({ subject: "text" })
        // model = await db.collection('articles').find({...params, $text: {$search: "coffee"}}).skip(skip).limit(limit).project({ ...view }).sort({ ...sort }).toArray()
        let text = params.text;
        delete params.text;
        // console.log("params", params, text)
        model = await db
          .collection(collection)
          .find({ ...params, $text: { $search: text } })
          .skip(skip)
          .limit(limit)
          .project({ ...view })
          .sort({ ...sort })
          .toArray();
        // console.log(model)

        // return model
        // model = db.collection(collection).find(key).skip(skip).limit(limit).project({...view}).sort({...sort}).toArray()
        // data = model
        // console.log("DB middleware", data)
        return model;
      } catch (e) {
        console.log(e);
        return {
          status: 500,
          message: "model fetching by Key failed (1)",
        };
      }
    },

    remove: async function remove(collection, param) {
      try {
        let key = "";
        let updateData = {};
        try {
          key = { _id: ObjectId(param) };
        } catch (e) {
          console.log(e);
          return {
            status: 500,
            message: "model deleting failed (1)",
          };
        }
        let model = await db.collection(collection).deleteOne(key);
        return model;
      } catch (e) {
        console.log(e);
        return {
          status: 500,
          message: "model deleting failed (2)",
        };
      }
    },

    removeByKey: async function remove(collection, key) {
      try {
        let model = await db.collection(collection).deleteOne(key);
        return model;
      } catch (e) {
        console.log(e);
        return {
          status: 500,
          message: "model deleting failed (2)",
        };
      }
    },

    removeAllByKey: async function remove(collection, key) {
      try {
        let model = await db.collection(collection).deleteMany(key);
        return model;
      } catch (e) {
        console.log(e);
        return {
          status: 500,
          message: "model deleting failed (2)",
        };
      }
    },

    fetchAll: async function fetchAll(collection, data, view, skip, limit) {
      try {
        if (!skip) {
          skip = 0;
        }
        if (!limit) {
          limit = 0;
        }
        let model = await db
          .collection(collection)
          .find()
          .skip(skip)
          .limit(limit)
          .project({ ...view })
          .toArray();
        return model;
      } catch (e) {
        console.log(e);
        return {
          status: 500,
          message: "fetch all data failed",
        };
      }
    },

    createIndexes: async function createIndexs() {
      try {
        await db
          .collection("ClinicalCode")
          .createIndex({ clinicalName: "text" });
        await db.collection("articles").createIndex({ subject: "text" });

        return {
          status: 200,
          data: { success: true },
          message: "db index creation failed",
        };
      } catch (err) {
        console.log(err);
        return {
          status: 500,
          data: null,
          message: "db index creation failed",
        };
      }
    },

    dropIndexes: async function createIndexs() {
      try {
        await db.collection("ClinicalCode").dropIndexes();

        return {
          status: 200,
          data: { success: true },
          message: "db index creation failed",
        };
      } catch (err) {
        console.log(err);
        return {
          status: 500,
          data: null,
          message: "db index creation failed",
        };
      }
    },
  };
};
