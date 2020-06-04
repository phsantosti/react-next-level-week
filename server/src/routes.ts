import express from 'express';
import PointController from "./controllers/PointController";
import ItemController from "./controllers/ItemController";

const routes = express.Router();

const pointController = new PointController();
const itemController = new ItemController();

/**
 * Default Patner Methods:
 * indedx -> List All Items
 * show -> List One Item
 * create -> Create One Item
 * update -> Update One Item
 * delete -> Delete One Item
 */

routes.get('/items', itemController.index);
routes.post('/points', pointController.create);
routes.get('/points/:id', pointController.show);
routes.get('/points', pointController.index);

export default routes;