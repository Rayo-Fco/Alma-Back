import {Router} from 'express'
import CtrlUser from '../Controllers/ControllerUser'
const api = Router()


api.post('/register', CtrlUser.RegisterUser)
api.post('/login', CtrlUser.LoginIn)


export default api;
