

module.exports = {

    // Merge the base handlebar object into the provided object. 
    // The provided object will overwrite any conflicting parameters and neither input object is mutated
    mergeHandleBarObjects: (source, other) => {

        const result = {}
        // Only need to iterate over the object keys provided in the base object. 
        const keys = ["header", "page"]
        for(const key of keys) {
            const otherValue = typeof other[key] === 'object' ? other[key] : {}
            result[key] =  Object.assign({}, source[key], otherValue)
        }

        // Return a new object ensuring the values in result overwrite the existing values in other.
        return Object.assign({}, other, result);
    },

    injectHandlebarsMetadata: (req, res, next) => {
         const data = {
             header: {
                 title: "Bike Shop"
             },
             page: {
                 title: "Bike Shop"
             }

         };
         const user = req.session.user
         if (user != null){
             data.user = user
         }
         req.baseHandlebarData = data
         next()
    }
}