import Nodemail from '../Services/nodemail';
import config from '../Config'

export class MailController {
    constructor() {}

    

    public async ResetPassword(email:string,nombre:string,apellido:string,token:string):Promise<boolean>{

        let datos = {
            nombre: nombre+' '+apellido,
            url: config.url+"/login/reset_password?email="+email+'&token='+token,
            tienda: "Alma-App"
        }

        let correo:string = email
        let asunto:string = "Recuperar Contraseña"
        let template:string = "ResetPassword"

        const mail = await Nodemail.SendMail(correo,asunto,datos,template)
        return mail

    }
    public async UpdatePassword(email:string,nombre:string,apellido:string){

        let datos = {
            nombre: nombre+' '+apellido,
            tienda: "Alma-App"
        }

        let correo:string = email
        let asunto:string = "Contraseña Se Ha Actualizado!"
        let template:string = "UpdatePassword"

        const mail = await Nodemail.SendMail(correo,asunto,datos,template)

        return mail

    }
    

    
}


export default new MailController()