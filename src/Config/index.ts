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
    sns:{
      region: 'us-east-1',
      accessKeyId: "ASIA2WHZXT7RK55MRP7J",
      secretAccessKey: "FUCOrqabppuS2lD97QUKGuUgc0kPkDnWMebDaCvR",
      sessionToken: "FwoGZXIvYXdzEBUaDA6FZodJSPbrwIpnJyLPAQxnIqplUpqykikjoa1QsZRXtJP83+4eNUCa84/7W9p8ulRELVw6aDDyHwb+ro160xL9ExZG8MQ8jg20it8z0uf8SGFEbO1wP0Ore9ndPwClzV122IeEl1dbqHgoXzKdOh/d36DfYusTrp5SgpvLWr2as17E+OnKIQUT2rbFneRN4NLDfnK7LAPjtPMcuA3wgNIJGcKX1euc8VpRnEy8RhYuUDnOR3F6odfuJBQ5HCdaaF4W0O5KDWSkSpUwqaTI1LavSXiiAsVEM6r73582RCjh59D+BTItGWAgpUOL3LGz3FIt9mpNYBTaXn/95daxmDn3IRdUvMygVdnBYbPALEw6fJNP",
    },
    url:"https://alma-app.cl",
    mail:{
      host: 'mail.alma-app.cl',
      port: 465,
      user: 'contacto@alma-app.cl',
      pass: 'SAN5LZQ4vsUP'
    },

 }