import {Router} from 'express'
import CtrlUser from '../Controllers/ControllerUser'
import CtrlMarker from '../Controllers/ControllerMarker'
import CtrlCategory from '../Controllers/ControllerCategory'
import CtrlComuna from '../Controllers/ControllerComuna'
import CtrlAdmin from '../Controllers/ControllerAdmin'
import CtrlCheckin from '../Controllers/ControllerCheckin'
import CtrlHelp from '../Controllers/ControllerHelp'
import CtrlDashboard from '../Controllers/ControllerDashboard'
import CtrlSafeContacts from '../Controllers/ControllerSafeContacts'
import CtrlResetPassword from '../Controllers/ControllerResetPassword'
import Passport from 'passport'
const api = Router()


api.post('/register', CtrlUser.RegisterUser)
api.post('/login', CtrlUser.LoginIn)
api.get('/user',Passport.authenticate('multi',{session: false}), CtrlUser.getUserToken)

api.get('/markers', Passport.authenticate('user',{session: false}), CtrlMarker.getMarker)
api.get('/markers/pdi', Passport.authenticate('multi',{session: false}), CtrlMarker.getMarkerPDI)
api.get('/markers/comisaria', Passport.authenticate('multi',{session: false}), CtrlMarker.getMarkerComisaria) 
api.post('/markers/add', Passport.authenticate('admin',{session: false}), CtrlMarker.addMarker)

api.get('/categories', Passport.authenticate('admin',{session: false}), CtrlCategory.getCategory)
api.post('/categories/add', Passport.authenticate('admin',{session: false}), CtrlCategory.addCategory)

api.post('/checkpoint', Passport.authenticate('user',{session: false}), CtrlComuna.CheckPoint)

api.post('/comuna/add', Passport.authenticate('admin',{session: false}),CtrlComuna.addComuna)
api.get('/comuna/all', Passport.authenticate('admin',{session: false}), CtrlComuna.getComuna)
api.post('/comuna/coordinates',Passport.authenticate('admin',{session: false}), CtrlComuna.getCoordinates)

api.post('/admin/add', Passport.authenticate('admin',{session: false}),CtrlAdmin.RegisterAdmin)
api.post('/admin/login',CtrlAdmin.LoginIn)

api.post('/checkin', Passport.authenticate('user',{session: false}), CtrlCheckin.addCheckin)
api.get('/checkin/user', Passport.authenticate('user',{session: false}), CtrlCheckin.getCheckin)

api.get('/checkin/user/:id',Passport.authenticate('admin',{session: false}), CtrlCheckin.getCheckinUser)
api.get('/checkin/all', Passport.authenticate('admin',{session: false}),CtrlCheckin.getallCheckin)

api.post('/updateuser',Passport.authenticate('user',{session: false}), CtrlUser.updateUser)

api.post('/safecontact/add',Passport.authenticate('user',{session:false}), CtrlSafeContacts.addContact)
api.get('/safecontact',Passport.authenticate('user',{session:false}),CtrlSafeContacts.getContactosID)
api.post('/safecontact/delete',Passport.authenticate('user',{session:false}),CtrlSafeContacts.deleteContact)

api.post('/helpSOS',Passport.authenticate('user',{session:false}), CtrlHelp.addHelp)
api.get('/helpSOS/valid',Passport.authenticate('user',{session:false}), CtrlHelp.ValidHelp)
api.get('/gethelp', CtrlHelp.getHelp)

api.get('/helpSOS/user/:id',Passport.authenticate('admin',{session:false}), CtrlHelp.getHelRut)
api.get('/helpSOS/all', Passport.authenticate('admin',{session: false}),CtrlHelp.getHelpAll)

api.get('/dashboard', Passport.authenticate('admin',{session: false}),CtrlDashboard.getDatos)

api.post('/login/reset', CtrlResetPassword.SendLink) // enviar el correo de recuperacion
api.post('/login/reset_password', CtrlResetPassword.UpdatePassword)  // validar password y cambio de la misma
api.get('/login/reset_password', CtrlResetPassword.ResetPassword) // ingresar a la url

export default api;
