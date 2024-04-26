import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  user:"postgres",
  host:"localhost",
  database:"blog",
  password:"edmonton",
  port:5432,
});

db.connect();


const currDate = new Date();
const yr = currDate.getFullYear();
const mn = currDate.getMonth() + 1;
const dy = currDate.getDate();
/*
const post1 = {
  
  title: "first post",
  date: "2024-2-10",
  content: "It’s easy to analyze your way out of taking the first step. It’s something we see a lot, particularly when founders try to choose what to build based on what they think VCs will like.<p>These founders will find a great problem that they could solve, only to convince themselves it’s not “venture scale.” Before they’ve written a line of code or even talked to a single person about it, they’re trying to predict market opportunities and exit strategies a decade down the road. That’s just not how early stage startups work.<p>In this episode of Dalton & Michael, we’ll talk about the risks of “thinking like a VC”, how to know when you’re stuck in this mindset, and how to unlearn it (spoiler: stop reading so much about who’s raising what.) We’ll also cover a short list of things that we’ve found actually matter when starting a company — it’s simpler than a lot of people think."    
};  

const post2 = {

  title: "second post",
  date: "2024-2-24",
  content: "Alien Truth<p>October 2022<p>If there were intelligent beings elsewhere in the universe, they'd share certain truths in common with us. The truths of mathematics would be the same, because they're true by definition. Ditto for the truths of physics; the mass of a carbon atom would be the same on their planet. But I think we'd share other truths with aliens besides the truths of math and physics, and that it would be worthwhile to think about what these might be.<p>For example, I think we'd share the principle that a controlled experiment testing some hypothesis entitles us to have proportionally increased belief in it. It seems fairly likely, too, that it would be true for aliens that one can get better at something by practicing. We'd probably share Occam's razor. There doesn't seem anything specifically human about any of these ideas.<p>We can only guess, of course. We can't say for sure what forms intelligent life might take. Nor is it my goal here to explore that question, interesting though it is. The point of the idea of alien truth is not that it gives us a way to speculate about what forms intelligent life might take, but that it gives us a threshold, or more precisely a target, for truth. If you're trying to find the most general truths short of those of math or physics, then presumably they'll be those we'd share in common with other forms of intelligent life."    
};  
*/
let items = [];
let post = '';

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

async function getPosts(){
  try{
    const res = await db.query("SELECT id, title, to_char(postdate, 'YYYY-MM-DD') AS postdate, to_char(editdate, 'YYYY-MM-DD') AS editdate FROM posts;");
    items = res.rows;
    return items;  
  }catch(err){
    console.error(err);  
  }  
}

async function getPost(id){
  try{
    const res = await db.query("SELECT id, title, to_char(postdate, 'YYYY-MM-DD') AS postdate, to_char(editdate, 'YYYY-MM-DD') AS editdate, posttext FROM posts WHERE id = $1",[id]);
    post = res.rows;
    console.log('getPost:',post);
    return post[0];
  }catch(err){
    console.error(err);
  }
}

async function addPost(title,posttext){
  let date = `${yr}-${mn}-${dy}`;
  try{
    await db.query("INSERT INTO posts (postdate, title, posttext) VALUES ($1,$2,$3)",[date,title,posttext]);
  }catch(err){
    console.error(err);
  }
}

async function editPost(id,title,posttext){
  try{
    let date = `${yr}-${mn}-${dy}`;
    await db.query("UPDATE posts SET editdate=$2, title=$3, posttext=$4 WHERE id=$1",[id,date,title,posttext]);
  }catch(err){
    console.error(err);
  }
}

async function deletePost(id){
  try{
    await db.query("DELETE FROM posts WHERE id = $1", [id]);
  }catch(err){
    console.error(err);
  }
}

async function searchPosts(st){
  try{
    const res = await db.query("SELECT id, title, to_char(postdate, 'YYYY-MM-DD') AS postdate, to_char(editdate, 'YYYY-MM-DD') AS editdate FROM posts WHERE title LIKE '%' || $1 || '%' OR posttext LIKE '%' || $1 || '%';", [st]);
    items = res.rows;
    return items;  
  }catch(err){
    console.error(err);  
  }  
}

app.get("/", async (req,res)=>{  
  items = await getPosts();
  const data = {
    title: "",
    items: items,
  };
  res.render("index.ejs", data);
});

app.get("/new",(req,res)=>{  
  const title= "new post";
  res.render("newpost.ejs", {title:title});
});

app.post("/new", async (req,res)=>{  
  const title = req.body.title;
  const content = req.body.text;
  await addPost(title,content);
  res.redirect("/");
});

app.get("/post/:id", async (req,res)=>{
  const postId = req.params.id;
  const post = await getPost(postId);
  if(post){
    let title = post.title;
    console.log('title:',title);
    console.log('post id:', parseInt(post.id));
    res.render("post.ejs", {post, title});
  }else{
    res.status(404).send("post not found");
  }
});

app.get("/edit/:id", async (req,res)=>{
  const postId = req.params.id;
  console.log('editpost id:', postId);
  const post = await getPost(postId);
  console.log('editpost post:', post);
  let title="edit post";  
  let edited = " ";
  if(post){
    res.render("edit.ejs",{post, title, edited});
  }else{
    res.status(404).send("post not found");
  }
});

app.post("/edit/:id", async (req,res)=>{
  const postId = req.params.id;
  const post = await getPost(postId);
  console.log('editpost:',post);
  if(post){
    if (req.body.text != req.body.text){
      let title = "edit post";
      let edited = "text not edited";
      res.render("edit.ejs",{post,title, edited});
    } else {
    
      let postTitle = req.body.title;
      let content = req.body.text;
      await editPost(postId,postTitle,content);
      res.redirect("/");
    }
  }else{
    res.status(404).send("post not found");
  }
});

app.get("/delete/:id", async (req,res)=>{
  const postId = req.params.id;
  await deletePost(postId);
  res.redirect("/");  
});

app.get("/back",(req,res)=>{
  res.redirect("/");
});

app.post("/search", async (req,res)=>{  
  console.log("search term:",req.body.search_term);
  let st = req.body.search_term.toLowerCase();
  let title = "search results for \"" + st + "\"";
  let sRes = await searchPosts(st);
  console.log('search:',sRes);
  res.render("search.ejs", {title, sRes});
});

app.listen(port,()=>{
  console.log(`server running on port ${port}`);
});
