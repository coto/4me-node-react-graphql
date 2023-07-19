const {Router} = require("express");
const ConfigurationItemController = require("../controllers/ConfigurationItemController");


let defaultRouter = Router();

defaultRouter.get('/api/configurationItems', ConfigurationItemController.Index);
defaultRouter.get('/api/configurationItems/store', ConfigurationItemController.Store);

module.exports = defaultRouter;