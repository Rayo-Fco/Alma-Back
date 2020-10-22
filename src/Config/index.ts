export default 
{
    port: process.env.PORT || 3001,
    database: {
        URI: 'mongodb://64.225.45.215:27017/alma',
        USER: 'SuperUser',
        PASSWORD: 'Alma2020'
      },
    SECRET_TOKEN: "Alma2020tesis",
    Password_Salt: 10,

 }