import { Request, Response } from 'express';
import SafeContacts from '../Models/SafeContacts';
import Joi from '../Middlewares/joi'
import AWS from 'aws-sdk'
import { Schema } from 'mongoose';
import Config from '../Config'


interface contacts {
    nombre: string,
    telefono: Number,
    date: Date
}

export class SafeContactsController {
    constructor() { }

    public async addContact(req: Request, res: Response) {
        if (req.user) {
            const { error } = Joi.SafeContact(req.body)
            if (error) return res.status(400).send({ error: [{ message: error.details }] })
            //@ts-ignore
            const user_id = req.user._id
            const contacts = await SafeContacts.findOne({ user: user_id })
            if (contacts) {
                console.log('Entro antiguo contacts')
                if (contacts.contacts.length < 3) {
                    let encontro = false
                    let telefono: Number = 0
                    contacts.contacts.map((contacto) => {
                        console.log(contacto);
                        if (contacto.telefono.toString() === req.body.telefono) {
                            encontro = true
                            telefono = contacto.telefono
                        }
                    })
                    if (encontro) {
                        return res.status(400).send({ error: [{ message: `El numero ${telefono} ya se encuentra registrado` }] })
                    }
                    else {
                        contacts.contacts.push({
                            nombre: req.body.nombre,
                            telefono: req.body.telefono,
                            date: new Date(Date.now())
                        })

                        await contacts.save((err) => {
                            if (err) return res.status(500).send({ error: [{ message: `Error al guardar el contacto: ${err}` }] })

                            return res.status(200).send({ mensaje: `Se ha guardo con exito a : ${req.body.nombre}` })
                        })
                    }
                }
                else {
                    return res.status(400).send({ error: [{ message: 'Solo se pueden guardar a 3 contactos de seguridad' }] })
                }
            }
            else {
                console.log('Entro nuevo contacts')
                const new_contact = new SafeContacts({
                    //@ts-ignore
                    user: user_id,
                    contacts: [{
                        nombre: req.body.nombre,
                        telefono: req.body.telefono
                    }]
                })

                await new_contact.save((err) => {
                    if (err) return res.status(500).send({ error: [{ message: `Error al guardar el contacto: ${err}` }] })

                    return res.status(200).send({ mensaje: `Se ha guardo con exito a : ${new_contact.contacts[0].nombre}` })
                })
            }
        }
        else {
            return res.status(400).send({ error: "Usuario invalido" })
        }
    }

    public async sendSMS(contactos: contacts[], token: string, url: string, nombre_apellido: string) {
        var TinyURL = require('tinyurl');
        TinyURL.shorten(`${url}/needhelp/${token}`, function (res: any, err: any) {
            if (res) {
                contactos.map((contacto) => {
                    var params = {
                        Message: `Hola, ${nombre_apellido} tiene un problema siguela aqui ${res}`, /* required */
                        PhoneNumber: `+56${contacto.telefono}`,
                    };

                    console.log(params);

                    var publishTextPromise = new AWS.SNS({
                        region: Config.sns.region,
                        accessKeyId: Config.sns.accessKeyId,
                        secretAccessKey: Config.sns.secretAccessKey,
                        sessionToken: Config.sns.sessionToken,
                        apiVersion: '2010-03-31'
                    }).publish(params).promise();

                    // Handle promise's fulfilled/rejected states
                    publishTextPromise.then(
                        function (data) {
                            console.log("MessageID is " + data.MessageId);
                        }).catch(
                            function (err) {
                                console.error(err, err.stack);
                            });
                })
                console.log(res);
            }


        });


        // Create publish parameters


        // Create promise and SNS service object

    }

    public async getContactos(id: Schema.Types.ObjectId) {
        const contactos = await SafeContacts.findOne({ user: id })
        if (contactos) {
            if (contactos.contacts.length > 0) {
                return contactos.contacts
            }
            else {
                return undefined
            }
        }
        else {
            return undefined
        }
    }

    public async getContactosID(req: Request, res: Response) {
        if (req.user) {
            //@ts-ignore
            const contactos = await SafeContacts.findOne({ user: req.user._id })
            if (contactos) return res.status(200).send(contactos.contacts)
            return res.status(200).send()
        }
        else {
            return res.status(400).send({ error: "Usuario invalido" })
        }
    }

    public async deleteContact(req: Request, res: Response) {
        if (req.user){
            const { error} = Joi.ValidIndex(req.body)
            if (error) return res.status(400).send({ error: [{ message: error.details }] })
            //@ts-ignore
            const contactos = await SafeContacts.findOne({ user: req.user._id })
            if (contactos) {
                contactos.contacts.splice(req.body.index, 1)
                await contactos.save((err) => {
                    if (err) return res.status(500).send({ error: [{ message: `Error al eliminar el contacto: ${err}` }] })
                    return res.status(200).send({ mensaje: `Se ha eliminado exitosamente` })
                })
            }
            else
            {
                return res.status(400).send({ error: [{ message: "Tiene que agregar un contacto primero" }] })
            }

            
        }
        else {
            return res.status(400).send({ error: "Usuario invalido" })
        }
    }




}



export default new SafeContactsController()







