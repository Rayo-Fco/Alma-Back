export default 
{
    port: process.env.PORT || 3001,
    database: {
        URI: 'mongodb://167.71.159.163:27018/alma',
        USER: 'usuario',
        PASSWORD: 'alma2020'
      },
    SECRET_TOKEN: "Alma2020tesis",
    Password_Salt: 10,
    aws:{
      ACCESSKEY_ID: 'AKIAYU6BFCY7DOYESCKZ',
      SECRETACCESS_KEY: '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',
    },
    url:"http://localhost:3000"

 }