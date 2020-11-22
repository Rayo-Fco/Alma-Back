import { Request, Response } from 'express';
import Comuna from '../Models/Comuna'
import User from '../Models/User'
import Help from '../Models/Help'
import Market from '../Models/Marker'
import Checkin from '../Models/CheckIn'
import mongo from 'mongoose';

export class DashboardController {
    constructor() { }

    public async getDatos(req: Request, res: Response) {
        if (req.user) {
            const n_comuna = await Comuna.countDocuments()
            const n_user = await User.countDocuments()
            //@ts-ignore
            const n_comisaria = await Market.countDocuments({ category: mongo.Types.ObjectId("5f5bc481f5b58a4258f0ec79") })
            //@ts-ignore
            const n_cuartes = await Market.countDocuments({ category: mongo.Types.ObjectId("5f5bc46af5b58a4258f0ec78") })
            const n_checkin = await Checkin.countDocuments()
            const n_help = await Help.aggregate(
                [
                    {
                        $project: {
                            numero_punto: { $size: "$puntos"}
                        }
                    },
                    {
                        "$group": {
                            "_id": null,
                            "total_puntos": {
                                "$sum": "$numero_punto"
                            }
                        }
                    }
                ]
            )
            //@ts-ignore

                return res.status(200).send({ numero_comuna:n_comuna, numero_user:n_user, numero_comisaria:n_comisaria, numero_cuartes:n_cuartes, numero_checkin:n_checkin, numero_help:n_help})


        }
        else {
            return res.status(400).send({ mensaje: 'Usuario invalido' })
        }


    }







}



export default new DashboardController()







