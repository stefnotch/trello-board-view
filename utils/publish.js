var ghpages = require("gh-pages");

ghpages.publish(".", { src: ["index.html", "dist/**/*"] }, (err) => {
  if (err) console.error(err);
  else console.log("Published to GitHub");
});
