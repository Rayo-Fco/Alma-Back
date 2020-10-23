import {Router} from 'express'
import CtrlUser from '../Controllers/ControllerUser'
import CtrlMarker from '../Controllers/ControllerMarker'
import CtrlCategory from '../Controllers/ControllerCategory'
import CtrlComuna from '../Controllers/ControllerComuna'
const api = Router()


api.post('/register', CtrlUser.RegisterUser)
api.post('/login', CtrlUser.LoginIn)

api.get('/markers', CtrlMarker.getMarker)
api.get('/markers/pdi', CtrlMarker.getMarkerPDI)
api.get('/markers/comisaria', CtrlMarker.getMarkerComisaria) 
api.post('/markers/add', CtrlMarker.addMarker)

api.get('/categories', CtrlCategory.getCategory)
api.post('/categories/add', CtrlCategory.addCategory)

api.post('/checkpoint', CtrlComuna.CheckPoint)

api.post('/comuna/add',CtrlComuna.addComuna)
api.post('/validrut', CtrlUser.validrut)

export default api;
