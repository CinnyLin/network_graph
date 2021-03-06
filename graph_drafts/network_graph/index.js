// THINGS TO WORK ON
// 1. make layout wider
// 2. highlight that network
// 3. can also click name
// 4. for the color scale we added 0 to the data
// {"name": "", "group": 0, "size": 0},

//Constants for the SVG
var width = 1000,
  height = 800;

//Set up the colour scale
var color = d3.scale.category20b();

//Set up the force layout
var force = d3.layout
  .force()
  .charge(-480)
  .linkDistance(100)
  .size([width, height]);

//Append a SVG to the body of the html page. Assign this SVG as an object to svg
var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//Read the data from data.json
d3.json("data.json", function (data) {
  force.nodes(data.nodes).links(data.links).start();

  var link = svg
    .selectAll(".link")
    .data(data.links)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke-width", function (d) {
      return Math.sqrt(d.value);
    });

  var node = svg
    .selectAll(".node")
    .data(data.nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(force.drag);

  node
    .append("circle")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("r", function (d) {
      //return d.size / 10;
      return Math.sqrt(d.size) * 3;
    })
    .style("fill", function (d) {
      return color(d.group);
    });

  node
    .append("text")
    .attr("dx", 10)
    .attr("dy", ".35em")
    .text(function (d) {
      return d.name;
    });

  // var text = svg
  //   .selectAll("text")
  //   .data(data.nodes)
  //   //.enter()
  //   .append("g")
  //   .text(function (d) {
  //     return d.name;
  //   })
  //   .attr("dx", 10)
  //   .attr("dy", ".35em")
  //   .attr("font-size", 10);
  // // .call(drag(simulation))
  // // .on("mouseover.fade", fade(0.1))
  // // .on("mouseout.fade", fade(1));

  // highlight
  // node
  //   .on("mouseover", (d) => {
  //     link.style("stroke-opacity", function (l) {
  //       if (d === l.source) return 1;
  //       else return 0.5;
  //     });
  //     // NEED FIX
  //     node.style("opacity", function (l) {
  //       if (d === l.source) return 1;
  //       else return 0.5;
  //     });
  //   })
  //   .on("mouseout", (d) => {
  //     link.style("stroke-opacity", 1);
  //     node.style("opacity", 1);
  //   });

  force.on("tick", function () {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    //Changed

    d3.selectAll("circle")
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });

    d3.selectAll("text")
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y;
      });

    //End Changed
  });
});
