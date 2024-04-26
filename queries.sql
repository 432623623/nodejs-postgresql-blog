CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  postdate DATE,
  editdate DATE,
  title VARCHAR(45),
  posttext TEXT
);

INSERT INTO posts (postdate,title,posttext)VALUES ('2024-01-01','Alien Truth','If there were intelligent beings elsewhere in the universe, they''d share certain truths in common with us. The truths of mathematics would be the same, because they''re true by definition. Ditto for the truths of physics; the mass of a carbon atom would be the same on their planet. But I think we''d share other truths with aliens besides the truths of math and physics, and that it would be worthwhile to think about what these might be.'); 
