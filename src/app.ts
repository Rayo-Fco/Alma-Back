import express from 'express'
import cors from 'cors';
import morgan from 'morgan';
import config from './Config'
import api from './Routes'
import { Database } from './database'
import passport from 'passport';
import { user, admin, multi} from './Middlewares/passport'

class App{
  public express: express.Application;

  constructor(){
    this.express = express()
    this.middleware()
    this.routes()
    this.config()
    this.database()
  }

  
  private config():void {
    this.express.set('port', config.port)
  }

  private middleware(): void {
    this.express.use(morgan('dev'));
    this.express.use(cors());
    this.express.use(express.json());
    this.express.use(express.urlencoded({extended: false}));
    passport.use('user', user)
    passport.use('admin',admin)
    passport.use('multi',multi)
  }

  private routes(): void {
    this.express.use(api)
  }
  private database(): void {
    let iniciar = new Database()
    
  }

}

export default new App().express;
