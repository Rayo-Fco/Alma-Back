import { Request, Response } from 'express';
import Checkin from '../Models/CheckIn';
import Joi from '../Middlewares/joi'

export class CheckinController {
    constructor(){}

    public async addCheckin(req:Request, res:Response){
 
    }
    
}


export default new CheckinController()