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

 }