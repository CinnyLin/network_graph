// https://observablehq.com/@jett/bubble-chart-split-my-running-by-year@531
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([
    [
      "scores@6.csv",
      new URL(
        //"./files/41a9706d13fe392b0fa421b4658b9f9b57c5b2bcedd95d61223fb2db5c3276679e5cfda21c9c01babd803e251e498b3b94057b2b0ef2291b154237c17ef898fe",
        "data",
        import.meta.url
      ),
    ],
  ]);
  main.builtin(
    "FileAttachment",
    runtime.fileAttachments((name) => fileAttachments.get(name))
  );
  //   main.variable(observer()).define(["md"], function (md) {
  //     return md`
  // # Bubble Chart - Split Olympics Shot put Scores by Year`;
  //   });
  //   main.variable(observer()).define(["md"], function (md) {
  //     return md`
  // Data:https://www.olympic.org/athletics/shot-put-men</br>
  // origin:https://observablehq.com/@ch-bu/bubble-chart-split-my-running-by-year.

  // The chart visualizes how far atheletics shot put in history.`;
  //   });
  //   main.variable(observer()).define(["md"], function (md) {
  //     return md`
  // size: Gold, Sliver, Bronze, Others</br>
  // x axis: distance</br>
  // y axis: [year]`;
  //   });
  main
    .variable(observer("viewof split"))
    .define("viewof split", ["html"], function (html) {
      // https://observablehq.com/@mbostock/form-input
      const form = html`<form>
        <label
          ><input name="split" type="radio" value="0" checked />
          <small>All throws</small></label
        >
        <label
          ><input name="split" type="radio" value="1" />
          <small>Split by year</small></label
        >
      </form>`;
      form.oninput = () =>
        (form.value =
          Array.from(form.querySelectorAll("input")).find((d) => d.checked)
            .value === "1");
      form.oninput();
      return form;
    });
  main
    .variable(observer("split"))
    .define("split", ["Generators", "viewof split"], (G, _) => G.input(_));
  main
    .variable(observer("chart"))
    .define(
      "chart",
      [
        "d3",
        "width",
        "noSplitHeight",
        "margin",
        "xAxis",
        "x",
        "median",
        "throwing",
        "r",
        "color",
        "y",
        "force",
        "invalidation",
        "splitHeight",
        "yearGroups",
        "yAxis",
      ],
      function (
        d3,
        width,
        noSplitHeight,
        margin,
        xAxis,
        x,
        median,
        throwing,
        r,
        color,
        y,
        force,
        invalidation,
        splitHeight,
        yearGroups,
        yAxis
      ) {
        const svg = d3
          .select(".asvg")
          .attr("viewBox", [
            0,
            0,
            width,
            noSplitHeight + margin.top + margin.bottom,
          ]);

        const wrapper = svg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Add x-Axis
        wrapper.append("g").call(xAxis);

        // Add median distance
        const medianLine = wrapper
          .append("line")
          .attr("x1", x(median))
          .attr("x2", x(median))
          .attr("y1", 10)
          .attr("y2", noSplitHeight)
          .attr("stroke", "#ccc");

        // Add median text
        const medianText = wrapper
          .append("text")
          .attr("x", x(median) - 90)
          .attr("y", 25)
          .attr("font-size", "11px")
          .text("Median distance");

        // add yAxis
        const yAxisContainer = wrapper
          .append("g")
          .attr("transform", `translate(-10,0)`);

        const circles = wrapper
          .append("g")
          .attr("className", "circles")
          .selectAll("circle")
          .data(throwing)
          .join("circle")
          .attr("r", (d) => r(d.size))
          .attr("fill", (d) => color(d.distance))
          .attr("x", (d) => x(d.distance))
          .attr("y", (d) => y(d.year) + y.bandwidth() / 2);
        // .attr('stroke', 'purple');

        //   d3.timeout(() => {
        //     for (var i = 0, n = Math.ceil(Math.log(force.alphaMin()) /
        //                                     Math.log(1 - force.alphaDecay())); i < n; ++i) {
        //       force.tick();

        //       circles
        //         .attr('cx', d => d.x)
        //         .attr('cy', d => d.y);
        //     }
        //   })

        force.on("tick", () => {
          circles
            .transition()
            .ease(d3.easeLinear)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
        });

        invalidation.then(() => force.stop());

        return Object.assign(svg.node(), {
          update(split) {
            let height = split ? splitHeight : noSplitHeight;
            let years = [...yearGroups.keys()].sort();

            // Update height of svg object
            const t = d3.transition().duration(750);
            svg.transition(t).attr("viewBox", [0, 0, width, height]);

            // Update domain of y-Axis
            y.domain(split ? years : ["All"]);
            y.range(
              split
                ? [splitHeight - margin.top - margin.bottom, 0]
                : [noSplitHeight - margin.top - margin.bottom, 0]
            );
            yAxisContainer
              .call(yAxis, y, split ? years : ["All"])
              .call((g) => g.select(".domain").remove())
              .call((g) => g.selectAll(".tick line").remove());

            // Update simulation
            force.force(
              "y",
              split
                ? d3.forceY((d) => y(d.year) + y.bandwidth() / 2) // If split by year align by year
                : d3.forceY((noSplitHeight - margin.top - margin.bottom) / 2)
            ); // If not split align to middle
            //force.nodes(throwing);
            force.alpha(1).restart();

            // Update median line
            medianLine
              .transition(t)
              .attr("y2", split ? splitHeight - 20 : noSplitHeight);
          },
        });
      }
    );
  main
    .variable(observer("median"))
    .define("median", ["d3", "throwing"], function (d3, throwing) {
      return d3.median(throwing, (d) => d.distance);
    });
  //   main.variable(observer()).define(["md"], function (md) {
  //     return md`
  // Height of wrapper of bubble chart when not split.`;
  //   });
  main.variable(observer("noSplitHeight")).define("noSplitHeight", function () {
    return 500;
  });
  //   main.variable(observer()).define(["md"], function (md) {
  //     return md`
  // Height of wrapper of bubble chart when split`;
  //   });
  main.variable(observer("splitHeight")).define("splitHeight", function () {
    return 900;
  });
  //   main.variable(observer()).define(["md"], function (md) {
  //     return md`
  // The update function is called whenever a user changes between the split and the non-split format (see radio buttons above).`;
  //   });
  main.variable(observer()).define(["chart", "split"], function (chart, split) {
    return chart.update(split);
  });
  main
    .variable(observer("force"))
    .define(
      "force",
      ["d3", "throwing", "x", "y", "r"],
      function (d3, throwing, x, y, r) {
        return d3
          .forceSimulation(throwing)
          .force("charge", d3.forceManyBody().strength(0))
          .force(
            "x",
            d3.forceX().x((d) => x(d.distance))
          )
          .force(
            "y",
            d3.forceY((d) => y(d.year))
          )
          .force(
            "collision",
            d3.forceCollide().radius((d) => r(d.size) + 1)
          );
      }
    );
  //   main.variable(observer()).define(["md"], function (md) {
  //     return md`
  // We need groups in order to change the values of the y-axis. If we split the bubbles, the y-axis displays these years: [...yearGroups.keys()].sort().`;
  //   });
  main
    .variable(observer("groups"))
    .define("groups", ["d3", "throwing"], function (d3, throwing) {
      return d3.group(throwing, (d) => d.year);
    });
  main
    .variable(observer("x"))
    .define(
      "x",
      ["d3", "throwing", "innerWidth"],
      function (d3, throwing, innerWidth) {
        return d3
          .scaleLinear()
          .domain(d3.extent(throwing, (d) => d.distance))
          .range([0, innerWidth]);
      }
    );
  main
    .variable(observer("y"))
    .define("y", ["d3", "noSplitHeight"], function (d3, noSplitHeight) {
      return d3.scaleBand().domain(["All"]).range([noSplitHeight, 0]);
    });
  main
    .variable(observer("r"))
    .define("r", ["d3", "throwing"], function (d3, throwing) {
      return d3
        .scaleSqrt()
        .domain(d3.extent(throwing, (d) => d.size))
        .range([4, 10]);
    });
  main
    .variable(observer("xAxis"))
    .define("xAxis", ["d3", "x"], function (d3, x) {
      return (g) =>
        g
          .call(d3.axisTop(x).tickFormat((d) => `${d} m`))
          .call((g) => g.select(".domain").remove())
          .call((g) =>
            g
              .append("text")
              .attr("x", 150)
              .attr("y", 20)
              .attr("font-weight", "bold")
              .attr("fill", "currentColor")
              .attr("text-anchor", "end")
              .text("How far atheletics scores →")
          );
    });
  main
    .variable(observer("yAxis"))
    .define("yAxis", ["d3", "y"], function (d3, y) {
      return (g) =>
        g
          .call(d3.axisLeft(y).ticks(8))
          .call((g) => g.select(".domain").remove())
          .call((g) => g.selectAll(".tick line").remove());
    });
  main
    .variable(observer("color"))
    .define("color", ["d3", "throwing"], function (d3, throwing) {
      return d3.scaleSequential(
        d3.extent(throwing, (d) => d.distance),
        d3.interpolatePuBuGn
      );
    });
  main
    .variable(observer("innerWidth"))
    .define("innerWidth", ["width", "margin"], function (width, margin) {
      return width - margin.left - margin.right;
    });
  main.variable(observer("margin")).define("margin", function () {
    return { top: 30, right: 30, left: 120, bottom: 30 };
  });
  //   main.variable(observer()).define(["md"], function (md) {
  //     return md`
  // ## Libraries and data`;
  //   });
  main
    .variable(observer("yearGroups"))
    .define("yearGroups", ["d3", "throwing"], function (d3, throwing) {
      return d3.group(throwing, (d) => d.year);
    });
  main
    .variable(observer("throwing"))
    .define(
      "throwing",
      ["d3", "FileAttachment"],
      async function (d3, FileAttachment) {
        return d3.csvParse(await FileAttachment("scores@6.csv").text(), (d) => {
          return {
            year: +d.year,
            size: +d.size,
            distance: +d.distance,
          };
        });
      }
    );
  main.variable(observer("d3")).define("d3", ["require"], function (require) {
    return require("d3@5", "d3-array@^2.2");
  });
  return main;
}
