import { Request, Response } from 'express';
import Checkin from '../Models/CheckIn';
import Joi from '../Middlewares/joi'
import CtrlComuna from './ControllerComuna'
import CheckIn from '../Models/CheckIn';
import multer from 'multer';
import path from 'path'
import { v4 as uuid } from 'uuid'
import multerS3 from 'multer-s3'
import aws from 'aws-sdk'
import config from '../Config/'
export class CheckinController {
    constructor() { }

    public async addCheckin(req: Request, res: Response) {
        if (req.user) {
           
            let comu: string = ''
            const cantidadfoto = 1;
            let CargaFotoProducto = multer({
                storage, limits: { fileSize: 25 * 1024 * 1024 }, fileFilter: async function (req, file, cb) {
                    const { error } = Joi.Checkin(req.body)
                    if (error) return res.status(400).send({ error: error.details })
                    
                    let fecha = new Date(new Date().setDate(new Date().getDate() - 1))
                    //@ts-ignore
                    let user = req.user._id
                    const check = await Checkin.find({
                        user: user,
                        "date": {
                            $lt: new Date(),
                            $gte: fecha
                        }
                    }, {})
                    if (check.length > 4) return res.status(400).send({ error: [{ message: 'Solo puede hacer 5 Check-in por dia, Gracias' }] })
                  
                    const comuna = await CtrlComuna.valid_comuna(req.body.latitude, req.body.longitude)
                    if (!comuna) return res.status(400).send({ error: [{ message: 'Error, Contactar a soporte' }] })
                    comu = comuna.comuna
                    if ((file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png")) {
                        return cb(null, true);
                    } else {
                        return cb(new Error("formato"));
                    }
                }
            }).array('foto', cantidadfoto);
            CargaFotoProducto(req, res, async function (err: any) {
                console.log(err);
                // Validar Parametros //  
                if (err != undefined && err.message == 'formato') return res.status(400).send({ error: `Solo se pueden subir Fotos con formato JPG, PNG y JPEG` })
                if (err != undefined && err.code == 'LIMIT_UNEXPECTED_FILE') return res.status(400).send({ error: `Solo se pueden subir ${cantidadfoto} Fotos` })
                if (err != undefined && err.code == 'LIMIT_FILE_SIZE') return res.status(400).send({ error: 'El Archivo no puede superar los 5 MB' })
                const foto: any = []
                if (req.files) {
                    //@ts-ignore
                    req.files.map((p: any) => {
                        console.log(p.location);
                        foto.push(p.location)
                    })
                }
                const checkin_new = new Checkin({
                    //@ts-ignore
                    user: req.user._id,
                    comuna: comu,
                    info: {
                        numero_depto: req.body.numero_depto,
                        numero_piso: req.body.numero_piso,
                        extra: req.body.extra
                    },
                    coordinates: {
                        latitude: req.body.latitude,
                        longitude: req.body.longitude
                    },
                    fotos: foto
                })
                await checkin_new.save((err) => {
                    if (err) return res.status(500).send({ error: [{ message: `Error al crear el Check in: ${err}` }] })
                    return res.status(200).send({ mensaje: 'Check in Exitoso' })
                })
            })
        }
        else {
            return res.status(400).send({ error: [{ message: 'Error, Usuario invalido' }] })
        }

    }

    public async getallCheckin(req: Request, res: Response) {
        if (req.user) {
            let check = await Checkin.aggregate([
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
                        _id: 0,
                        user: { _id: 0, password: 0, fecha_registro: 0 }
                    }
                }
            ]);
            return res.status(200).send(check)
        }
        else {
            return res.status(400).send({ mensaje: 'Usuario invalido' })
        }
    }
    public async getCheckin(req: Request, res: Response) {
        if (req.user) {
            //@ts-ignore
            let check = await CheckIn.find({ user: req.user._id }).sort({ date: -1 }).limit(5)
            if (check.length == 0) return res.status(200).send({ mensaje: 'No han realidado Check In' })
            return res.status(200).json(check)
        }
        else {
            return res.status(400).send({ mensaje: 'Usuario invalido' })
        }
    }

    public async getCheckinUser(req: Request, res: Response) {
        if (req.user) {
            console.log("object");
            let rut = req.params.id
            console.log(rut);
            if (!rut) res.status(400).send({ mensaje: 'usuario invalido' })

            if (!ValidRut(rut)) res.status(400).send({ mensaje: 'usuario invalido' })
            console.log("ssa")
            let usercheckin = await CheckIn.aggregate([
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
                        _id: 0,
                        user: { password: 0, _id: 0, fecha_actualizacion: 0, fecha_registro: 0 }
                    }
                },
                {
                    $match:
                    {
                        'user.rut': rut
                    }
                }
            ]);
            return res.status(200).send(usercheckin)

        }
        else {
            return res.status(400).send({ mensaje: 'Usuario invalido' })
        }
    }
    public async getallCheckin2(req: Request, res: Response) {
        let check = await Checkin.aggregate([
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
                    _id: 0,
                    user: { _id: 0, password: 0, fecha_registro: 0 }
                }
            }
        ]);
        return res.status(200).send(check)
    }
}

const s3 = new aws.S3({
    accessKeyId: config.aws.ACCESSKEY_ID,
    secretAccessKey: config.aws.SECRETACCESS_KEY,
    region: 'us-east-1'
});

const storage = multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: 'alma-app',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: uuid() + path.extname(file.originalname) })
    },
    key: function (req, file, cb) {
        cb(null, uuid() + path.extname(file.originalname))
    }
})

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


export default new CheckinController()