import nodemailer from "nodemailer"
import ejs from 'ejs'
import config from '../Config'


export class Mail {
    

    constructor() {}


    public async SendMail(para:string,asunto:string,data:ejs.Data,template:string):Promise<boolean> {


     let plantilla:string = "";

      ejs.renderFile(__dirname + '/Templates/'+template+'.ejs',data, function(err, data)  {
        if (err) 
        {
            console.log('Error en la creacion de la plantilla');
            console.log(err.message)
            plantilla = "error"
        }
        else
        { 
            plantilla = data
        }
        
    })


    let transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        secure: true,
        auth: {
            user: config.mail.user,
            pass: config.mail.pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let optionmail = {
        from: "Alma App"+' <no-reply@alma-app.cl>', // sender address,
        to: para,
        subject: asunto,
        html: plantilla

    }
    if(plantilla != "error"){

        await transporter.sendMail(optionmail,(error) => {
            if (error) 
            {
                console.log('Error al enviar el mensaje');
                console.log(error.message);
                console.log(error);
            }
    
            console.log('Mensaje Enviado!');
        })

        return true
        
    }
    else
    {
        return false
    }


    }

   


}

export default new Mail();