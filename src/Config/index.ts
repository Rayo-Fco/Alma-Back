export default 
{
    port: process.env.PORT || 3001,
    database: {
        URI: '',
        USER: '',
        PASSWORD: ''
      },
    SECRET_TOKEN: "Alma2020tesis",
    Password_Salt: 10,
    aws:{
      ACCESSKEY_ID: '',
      SECRETACCESS_KEY: '',
    },
    sns:{
      region: 'us-east-1',
      accessKeyId: "",
      secretAccessKey: "",
      sessionToken: "",
    },
    url:"",
    mail:{
      host: '',
      port: 465,
      user: '',
      pass: 'P'
    },

 }
