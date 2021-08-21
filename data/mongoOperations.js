module.exports = {
    // reduce the array in form `[{key0: value0}, {key1: value1}]` to an object of form `{key0: count0, key1: count1} to expose a dictionary with constant time look-up
    resultsToSet: (array, objectKey, propertyKey) => {
        return array.reduce( (acc, curr) => ({ ...acc, [curr[objectKey].toString()]:  curr[propertyKey]}), {})
    }
}