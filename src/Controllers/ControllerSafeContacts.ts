import { Request, Response } from 'express';
import SafeContacts, { ISafeContacts } from '../Models/SafeContacts';
import Joi from '../Middlewares/joi'
import AWS, { CodeStarNotifications } from 'aws-sdk'
import { Schema } from 'mongoose';
import { user } from '../Middlewares/passport';


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
                        region: 'us-east-1',
                        accessKeyId: "ASIA2WHZXT7RGOEU22QN",
                        secretAccessKey: "debU7qRVZEwD49VZs9yWnelOkOGuws11nzVdmxRS",
                        sessionToken: "FwoGZXIvYXdzEJ///////////wEaDGF4Vs8Q8IY8ZCNwfSLPAeFQyujxiwPL8seHzgel2jcfyVdlRDphUr+XK7ahVxQRmlRlyeu01MTqXREqyGfQBTHYWH+4xXBu3jcFZwAg8YNcDIRMJbEZ9Rb4KrPtNSBomtxvPc6vrHpZc8oaDJXCZfZkWXR9j81Pb1vpTuQeaay3/XjtQ6wxG3FQqW+rlRheRM4POWp8uh25GmygJVS9tRHkHF2lwkMHsRsLfKKoQ94eTG0r6IFVd8LmwoHQP8n7JU296Iy786x/J/Gaf1P6PkDDkwz360LhMIH6Q9O8vSik5f79BTIt6QYyQwwTNSR4XRsENdx0EBFP+LepcYBxCwLD1TIpoECxI6uznLabGlDq1zgd",
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







