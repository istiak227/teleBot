



module.exports = //{dbHelper: 
async  (...args) => {
    let [dataPipe, collection, operation, params, data, view, skip, limit, sort ] = [...args]
    if(operation == 'create'){
        data = await dataPipe.create(collection, data)
        // console.log("db helper",data)
        return data
    }
    else if(operation == 'update'){
        data = await dataPipe.update(collection, params, data)
        // console.log(data)
        return data
    }
    else if(operation == 'updateByKey'){
        data = await dataPipe.updateByKey (collection, params, data)
        // console.log(data)
        return data
    }
    else if(operation == 'getById'){
        data = await dataPipe.fetchById(collection, params, data, view)
        // console.log(data)
        return data

    }
    else if(operation == 'get'){
        data = await dataPipe.fetchAll(collection, data, view, skip, limit)
        // console.log("index", data)
        return data
    }
    else if (operation == 'getByKey'){
       
        data = await dataPipe.fetchByKey(collection, params, view, skip, limit, sort)
        // console.log( data)
        return await data
    }
    else if (operation == 'remove'){
        // console.log("index", params)
        data = await dataPipe.remove(collection, params)
        // console.log( data)
        return await data
    }
    else if (operation == 'removeByKey'){
        // console.log("index", params)
        data = await dataPipe.removeByKey(collection, params)
        // console.log( data)
        return await data
    }
    else if (operation == 'removeAllByKey'){
        // console.log("index", params)
        data = await dataPipe.removeAllByKey(collection, params)
        // console.log( data)
        return await data
    }
    else if (operation == 'getByText'){
        // console.log("index", params)
        data = await dataPipe.fetchBytext(collection, params, view, skip, limit, sort)
        // console.log( data)
        return await data
    }
    else if (operation == 'createIndexes'){
        // console.log("index", params)
        data = await dataPipe.createIndexes()
        // console.log( data)
        return await data
    }
    else if (operation == 'dropIndexes'){
        // console.log("index", params)
        data = await dataPipe.dropIndexes()
        // console.log( data)
        return await data
    }
    



}
// }