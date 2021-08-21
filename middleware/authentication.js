

module.exports = {

    endRequestDueToBeingUnauthorized: (res) => {
        res.status(401).json({ message: "Account is not authorized to perform this action" })
    },

    isAdmin: (user) => {
        return user && typeof user == 'object' &&  user.admin;
    }, 

    getUserIfAdmin: (req) => {
        const user = req.session.user;
        return module.exports.isAdmin(user) ? user : null;
    },


    // Middleware function which hndles validating the user is logged in and an administrator before passing to route handler
    requireAdministratorOrEndRequest: (req, res, next) => {
        const user = module.exports.getUserIfAdmin(req);
        if (user) { 
            next();
            return;
        }

        if(!req.session.user) {
            res.redirect("/");
        } else {
            module.exports.endRequestDueToBeingUnauthorized(res);
        }
    }
}