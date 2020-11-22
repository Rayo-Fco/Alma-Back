import { Request, Response } from 'express';
import Help from '../Models/Help'
import Joi from '../Middlewares/joi'
import jwt from 'jsonwebtoken';
import { Schema } from 'mongoose';
import CtrlComuna from './ControllerComuna'

export class HelpController {
    constructor() { }

    public async addHelp(req: Request, res: Response) {
        if (req.user) {
            const { error } = Joi.Help(req.body)
            if (error) return res.status(400).send({ error: error.details })
            const fecha = new Date(Date.now())
            //@ts-ignore
            const id_user = req.user._id
            const validhelp = await Help.findOne({ user: id_user })
            if (validhelp) {
                let existe = false
                validhelp.puntos.map((puntos) => {
                    console.log((fecha.getTime() - puntos.date.getTime()) / 1000 / 60 / 60)
                    if (((fecha.getTime() - puntos.date.getTime()) / 1000 / 60 / 60) < 8) {
                        console.log("encontro el dia");
                        existe = true
                        puntos.coordinates.push({
                            latitude: req.body.latitude,
                            longitude: req.body.longitude
                        })
                    }
                })
                if (!existe) {
                    console.log("no Existe dia");
                    const token = CreateToken(id_user)
                    const comuna = await CtrlComuna.valid_comuna(req.body.latitude,req.body.longitude)
                    console.log("A"+comuna.comuna);
                    validhelp.puntos.push({
                        date: fecha,
                        token: token,
                        comuna: comuna.comuna,
                        coordinates: [{
                            latitude: req.body.latitude,
                            longitude: req.body.longitude
                        }]
                    })
                }
                await validhelp.save((err) => {
                    if (err) return res.status(500).send({ error: [{ message: `Error al crear la Alerta SOS: ${err}` }] })
                    return res.status(200).send({ mensaje: `La alerta se ha creado exitosamente` })
                })
            }
            else {

                const token = CreateToken(id_user)
                const comuna = await CtrlComuna.valid_comuna(req.body.latitude,req.body.longitude)
                console.log("B"+comuna.comuna);
                const newhelp = new Help({
                    user: id_user,
                    puntos: [{
                        token: token,
                        date: fecha,
                        comuna: comuna.comuna,
                        coordinates: [{
                            latitude: req.body.latitude,
                            longitude: req.body.longitude
                        }]
                    }]
                })
                await newhelp.save((err) => {
                    if (err) return res.status(500).send({ error: [{ message: `Error al crear la Alerta SOS: ${err}` }] })
                    return res.status(200).send({
                        mensaje: `La alerta se ha creado exitosamente`,
                        token: token
                    })
                })
            }

        }
        else {
            return res.status(400).send({ error: [{ message: `Usuario Invalido` }] })
        }

    }

    public async getHelp(req: Request, res: Response) {
        if (!req.query.token) return res.status(400).send({ error: 'Link invalido o Ya ha expirado el seguimiento' })
        const { error } = Joi.Token(req.query)
        if (error) return res.status(400).send({ error: error.details })

        if (!VerifyToken(req.query.token.toString())) return res.status(400).send({ error: "Link ya expirado duracion maxima 8 horas_" })

        const valid_toke = await Help.aggregate([
            {
                $lookup:
                {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            }, {
                $project:
                {
                    user: { nombre: 1, apellido: 1, rut: 1, telefono: 1 },
                    puntos: {
                        $filter: {
                            input: "$puntos",
                            as: "punto",
                            cond: { $gte: ["$$punto.token", req.query.token] }
                        },
                    },
                }
            },
            {
                $match:
                {
                    "puntos.token": req.query.token
                }
            }
        ]);
        if (valid_toke.length > 0) {
            let array: any = []
            let comuna = ""
            const fecha = new Date(Date.now())
            valid_toke[0].puntos.map((puntos: any) => {
                if (((fecha.getTime() - puntos.date.getTime()) / 1000 / 60 / 60) < 8) {
                    array = puntos.coordinates
                    comuna = puntos.comuna
                }
            })
            if (array.length > 0) return res.status(200).json({ user: valid_toke[0].user,comuna:comuna, coordinates: array })

            return res.status(400).send({ error: "Link ya expirado duracion maxima 8 horas" })
        }
        return res.status(400).send({ error: "Link invalido" })

    }
    public async getHelRut(req: Request, res: Response) {
        if (req.user) {
            console.log("object");
            let rut = req.params.id
            console.log(rut);
            if (!rut) res.status(400).send({ mensaje: 'usuario invalido' })
            if (!ValidRut(rut)) res.status(400).send({ mensaje: 'usuario invalido' })

            const user = await Help.aggregate([
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user"
                    }
                }, {
                    $project:
                    {
                        u_id: 0,
                        user: { _id: 0, password: 0, fecha_registro: 0 }
                    }
                },
                {
                    $match:
                    {
                        "user.rut": rut
                    }
                }
            ])

            return res.status(200).send(user)
        }
        else {
            return res.status(400).send({ mensaje: 'Usuario invalido' })
        }
    }

    public async getHelpAll(req: Request, res: Response) {
        if (req.user) {
            const users = await Help.aggregate([
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user"
                    }
                }, {
                    $project:
                    {
                        u_id: 0,
                        user: { _id: 0, password: 0, fecha_registro: 0 }
                    }
                }
            ])

            return res.status(200).send(users)
        }
        else {
            return res.status(400).send({ mensaje: 'Usuario invalido' })
        }
    }






}


function VerifyToken(token: string) {
    let bo: boolean = false
    const valido = jwt.verify(token, "Alerta_Alma", (err, decoded) => {
        if (!err) bo = true
    });
    return bo
}

function CreateToken(id: Schema.Types.ObjectId) {
    const token = jwt.sign({
        id: id,
    },
        "Alerta_Alma",
        {
            algorithm: 'HS256', // Base de Codificacion
            expiresIn: '8h', // Tiempo de Duracion
        });
    return token
}
const ValidRut = (rut: string) => {
    let valor, cuerpo, dv, suma, multiplo, index, dvEsperado
    valor = rut.replace('.', '');
    valor = valor.replace('.', '');
    valor = valor.replace('-', '');
    cuerpo = valor.slice(0, -1);
    dv = valor.slice(-1).toUpperCase();
    rut = cuerpo + '-' + dv
    if (cuerpo.length < 7) { return false; }
    suma = 0;
    multiplo = 2;
    for (let i = 1; i <= cuerpo.length; i++) {
        index = multiplo * parseInt(valor.charAt(cuerpo.length - i))
        suma = suma + index;
        if (multiplo < 7) { multiplo = multiplo + 1; } else { multiplo = 2; }
    }
    dvEsperado = 11 - (suma % 11);
    dv = (dv == 'K') ? 10 : dv;
    dv = (dv == 0) ? 11 : dv;
    if (dvEsperado != dv) { return false; }
    return true

}


export default new HelpController()