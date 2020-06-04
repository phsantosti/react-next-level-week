import {Request, Response} from "express";
import knex from "../database/connection";

class PointController {
    async index(request: Request, response: Response){
        const {city, state, items} = request.query;
        const parseItems = String(items).split(',').map(item => Number(item.trim()));
        const points = await knex('points')
            .join('points_items', 'points.id', '=', 'points_items.point_id')
            .whereIn('points_items.item_id', parseItems)
            .where('city', String(city))
            .where('state', String(state)).distinct().select('points.*');

        return response.json(points);

    }

    async create(request: Request, response: Response){
        const {name, email, whatsapp, latitude, longitude, city, state, items} = request.body;
        const trx = await knex.transaction();
        const point = {
            image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name,email,whatsapp,latitude,longitude,city, state
        };
        const insertedIds = await trx('points').insert(point);
        const point_id = insertedIds[0];
        const pointsItems = items.map((item_id: number) => {
            return {item_id, point_id};
        });
        await trx('points_items').insert(pointsItems);
        await trx.commit();
        return response.json({
            id: point_id,
            ...point
        });
    }

    async show(request: Request, response: Response){
        const {id} = request.params;
        const point = await knex('points').where('id', id).first();
        if(!point){
            return response.status(400).json({message: 'Point not found'});
        }

        /**
         * SELECT * FROM items
         * JOIN points_items ON items.id = points_items.item_id
         * WHERE point_items.point_id = {id}
         */
        const items = await knex('items')
            .join('points_items', 'items.id', '=', 'points_items.item_id')
            .where('points_items.point_id', id).select('items.title');

        return response.json({point, items});
    }
}

export default PointController;