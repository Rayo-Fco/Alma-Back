export default 
{
    port: process.env.PORT || 3001,
    database: {
        URI: process.env.MONGODB_URI || 'mongodb://localhost/alma',
        USER: process.env.MONGODB_USER,
        PASSWORD: process.env.MONGODB_PASSWORD
      },
    SECRET_TOKEN: "Alma2020tesis",
    Password_Salt: 10,

 }