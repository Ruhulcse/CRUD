'use strict';
     
const Hapi = require('@hapi/hapi');
 
var knex = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: {
      host : '127.0.0.1',
      port: '5433',
      user : 'postgres',
      password : 'postgres',
      database : 'sfs'
    }
  });
 
 
const init = async () => {
 
    const server = Hapi.server({
        port: 7001,
        host: 'localhost'
    });
    server.bind({knex : knex})

   //Show all data using GET Request
    server.route({
        method: 'GET',
        path: '/user',
        config: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['X-Data-Offset', 'X-Data-Limit']
            }
        },
        handler: async (request, h) => {
            console.log("requested");
            console.log(h.context.knex);
            let data = [];
            try{
                data = await h.context.knex.select("*").from("student");
                console.log(data);
            }catch(error){
                console.log(error);
                throw error;
            }
            return data;
        }
    });

    //Insert Data using POST Request
    server.route({
        method: 'POST',
        path: '/user',
        handler: async (request, h) => {
            let input = "";
            try{
               input = await h.context.knex('student').insert(request.payload).returning("name");
            }catch(error){
                console.log(error);
                throw error;
            }
            return h.response({name : input}).code(200);
        }
    });

    //UPDATE DATA using PUT request 
    server.route({
        method: 'PUT',
        path:'/user/{id}',
        handler: async (request, h) => {
            let id=request.params.id;
            let data=request.payload;
            console.log(data);
            let update="";
            try{
               update = await h.context.knex('student').where('id',id).update(data).returning("id");
            }catch(error){
                console.log(error);
                throw error;
            }
            return h.response({id : update}).code(200);
        }
    });

    //Delete data using DEL Request
    server.route({
        method: 'DELETE',
        path:'/user/{id}',
        handler: async (request, h) => {
            let id=request.params.id;
            let result;
            try{
               result = await h.context.knex('student').where('id',id).del().returning("id");
            }catch(error){
                console.log(error);
                throw error;
            }
            return h.response({id : result}).code(200);
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};
 
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});
 
init();