const express = require('express');
const router = express.Router();
const Post = require('../models/Post')


// GET
// HOME
//ROUTER WITH PAGINATION.

router.get('', async (req, res) => {
    try {
      const locals = {
        title: "NodeJs Blog",
        description: "Simple Blog created with NodeJs, Express & MongoDb.",
      }
  
      let perPage = 5;
      let page = req.query.page || 1;
  
      const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
      if (!data || data.length === 0) {
        console.log("No data found");
        // Optionally, you can return a message or render an error page
        return res.status(404).send("No data found");
    }
      console.log(data);
  
      // Count is deprecated - please use countDocuments
      // const count = await Post.count();
      const count = await Post.countDocuments({});
      const nextPage = parseInt(page) + 1;
      const hasNextPage = nextPage <= Math.ceil(count / perPage);

  
      res.render('index', { 
        locals,
        data,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });
  
// GET
// POST  :id

         router.get('/post/:id', async (req, res) => {

             try{
        
            //catch ID
            let slug = req.params.id;


                const data = await Post.findById({_id: slug});
                
                const locals = {
                    title: data.title,
                    description: "Simple Blog created with NodeJS, Express & MongoDb.",
                }
                
                res.render('post', {locals, data});
            }catch(error){
                console.log(error);
            }
        });


// GET
// POST  -searchTerm

      router.post('/search', async (req, res) => {

        try{
          const locals = {
              title: "Search",
              description: "Simple Blog created with NodeJS, Express & MongoDb."
          }

          let searchTerm = req.body.searchTerm;
          const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

          console.log(searchTerm);


          const data = await Post.find({
            $or: [
              {title: { $regex: new RegExp(searchNoSpecialChar, 'i')}},
              {body: { $regex: new RegExp(searchNoSpecialChar, 'i')}}
              
            ]
          });

          res.render("search", {
            data,
            locals
          });

          }catch(error){
              console.log(error);
          }
      });


      

      router.get('/about', (req, res) => {
        res.render('about', {
        });
      })





module.exports = router;










//THIS S THE ROUTER.GET WITHOUT A PAGINATION:
        // router.get('', async (req, res) => {

        //     const locals = {
        //         title: "NodeJs Blog",
        //         description: "Simple Blog created with NodeJS, Express & MongoDb."
        //     }
        //     try{
        //         const data = await Post.find();
        //         res.render('index', {locals, data});

        //     }catch(error){
        //         console.log(error);
        //     }
        // });



//JUST TO TRY IF ITS WORKING AND PUT SOME DATA IN THE DB.

        // function insertPostData(){
        //     Post.insertMany([
        //         {
        //             title:"Building a Blog to Learn",
        //             body: "This is the body text."
        //         },
        //         {
        //             title:"Building a Blog to Learn",
        //             body: "This is the body text. Num2"
        //         }
        //     ])
        // }
        // insertPostData();

