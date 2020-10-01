import Joi from '@hapi/joi'

class Validacion {
  constructor() {}

  public Register(data:any){
    let Schema = Joi.object().keys({
      'nombre': Joi.string()
      .min(4)
      .max(40)
      .pattern(/^[a-zA-ZñÑ]+$/)
      .required()
      .messages({
          'string.base': 'El nombre tiene que ser solo texto',
          'string.empty': 'El nombre no puede ser un campo vacio',
          'string.min':  'El nombre tiene que tener {#limit} caracteres como minimo ',
          'string.max': 'El nombre tiene que tener {#limit} caracteres como maximo ',
          'string.pattern.base' : 'El nombre tiene que tener solo texto',
          'any.required': 'El nombre es requerido'
        }),

      'apellido': Joi.string()
      .min(4)
      .max(40)
      .pattern(/^[a-zA-ZñÑ  ]+$/)
      .required()
      .messages({
          'string.base': 'El apellido tiene que ser solo texto',
          'string.empty': 'El apellido no puede ser un campo vacio',
          'string.min':  'El apellido tiene que tener {#limit} caracteres como minimo ',
          'string.max': 'El apellido tiene que tener {#limit} caracteres como maximo ',
          'string.pattern.base' : 'El apellido tiene que tener solo texto',
          'any.required': 'El apellido es requerido'
        }),

        'email' : Joi.string()
        .min(6)
        .max(120)
        .email()
        .required()
        .messages({
          'string.base': 'El email tiene que ser solo texto',
          'string.empty': 'El email no puede ser un campo vacio',
          'string.min':  'El email tiene que tener {#limit} caracteres como minimo ',
          'string.max': 'El email tiene que tener {#limit} caracteres como maximo ',
          'string.email' : 'El email tiene que ser valido',
          'any.required': 'El email es requerido'
        }),

        'password': Joi.string()
        .min(6)
        .max(255)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
        .messages({
          'string.base': 'La password tiene que ser solo texto',
          'string.empty': 'La password no puede ser un campo vacio',
          'string.min':  'La password tiene que tener {#limit} caracteres como minimo ',
          'string.max': 'La password tiene que tener {#limit} caracteres como maximo ',
          'string.pattern.base' : 'La password tiene que tener al menos una letra mayuscula, una letra minuscula y un numero',
          'any.required': 'La password es requerido'
        }),

        'rut': Joi.string()
        .empty()
        .trim()
        .required()
        .pattern(/^([1-9]{1}\d{0,1}\.\d{3}\.\d{3})+-[0-9kK]{1}$/)
        .messages({
          'string.base': 'El rut es invalido',
          'string.empty': 'El rut no puede ser un campo vacio',
          'string.pattern.base':'El rut es invalido',
          'any.required': 'El rut es requerido'
        }),

        'telefono': Joi.string()
        .empty()
        .trim()
        .required()
        .pattern(/^[1-9]{1}[0-9]{8}$/)
        .messages({
          'string.base': 'El telefono es invalido',
          'string.empty': 'El telefono no puede ser un campo vacio',
          'string.pattern.base':'El telefono es invalido',
          'any.required': 'El telefono es requerido'
        })
      })
      return Schema.validate(data, { abortEarly: false })

  }

  public Login(data:any){
    let Schema = Joi.object().keys({
      'email' : Joi.string()
        .min(4)
        .max(120)
        .email()
        .required()
        .messages({
          'string.empty': 'El email no puede ser un campo vacio',
          'string.min':  'El email tiene que ser valido',
          'string.max': 'El email tiene que tener {#limit} caracteres como maximo ',
          'string.email' : 'El email tiene que ser valido',
          'any.required': 'El email es requerido'
        }),
  
          'password': Joi.string()
          .min(6)
          .max(255)
          .required()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
          .messages({
            'string.base': 'La password tiene que ser solo texto',
            'string.empty': 'La password no puede ser un campo vacio',
            'string.min':  'La password tiene que tener {#limit} caracteres como minimo ',
            'string.pattern.base' : 'La password tiene que tener al menos una letra mayuscula, una letra minuscula y un numero',
            'string.max': 'La password tiene que tener {#limit} caracteres como maximo ',
            'any.required': 'La password es requerido'
          })     
  
  
    })
    return Schema.validate(data, { abortEarly: false })
  }

  public Marker(data:any){
    let Schema = Joi.object().keys({
      'latitude' : Joi.string()
        .pattern(/^(-?\d+(\d+)?)\.\s*(-?\d+(\d+)?)$/)
        .required()
        .messages({
          'string.empty': 'La latitud no puede ser un campo vacio',
          'string.pattern.base' : 'La latitud tiene que ser valido',
          'any.required': 'La latitud es requerido'
        }),
        'longitude' : Joi.string()
        .pattern(/^(-?\d+(\d+)?)\.\s*(-?\d+(\d+)?)$/)
        .required()
        .messages({
          'string.empty': 'La longitud no puede ser un campo vacio',
          'string.pattern.base' : 'La longitud tiene que ser valido',
          'any.required': 'La longitud es requerido'
        }),
        'category' : Joi.string()
        .empty()
        .trim()
        .required()
        .messages({
          'string.base': 'La categoria es invalida',
          'string.empty': 'La categoria es invalida',
          'any.required': 'La categoria es requerida'
        }),
        'title': Joi.string()
        .min(4)
        .max(40)
        .required()
        .messages({
          'string.base': 'El titulo tiene que ser solo texto',
          'string.empty': 'El titulo no puede ser un campo vacio',
          'string.min':  'El titulo tiene que tener {#limit} caracteres como minimo ',
          'string.max': 'El titulo tiene que tener {#limit} caracteres como maximo ',
          'any.required': 'El titulo es requerido'
        }),

  
  
    })
    return Schema.validate(data, { abortEarly: false })
  }

  public Category(data:any){
    let Schema = Joi.object().keys({
      'name' : Joi.string()
        .empty()
        .trim()
        .required()
        .messages({
          'string.base': 'La categoria es invalida',
          'string.empty': 'La categoria es invalida',
          'any.required': 'La categoria es invalida'
        }),
    })
    return Schema.validate(data, { abortEarly: false })
  }

}


export default new Validacion()