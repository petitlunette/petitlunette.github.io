./3ff9fa2c6593d814@3087.js                                                                          000644  000000  000000  00000025016 14462206250 012601  0                                                                                                    ustar 00                                                                000000  000000                                                                                                                                                                         function _1(md){return(
md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">Bar Chart Race</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>

# Bar Chart Race

This chart animates the value (in $M) of the top global brands from 2000 to 2019. Color indicates sector. See [the explainer](/d/e9e3929cf7c50b45) for more. Data: [Interbrand](https://www.interbrand.com/best-brands/)`
)}

function _data(FileAttachment){return(
FileAttachment("category-brands.csv").csv({typed: true})
)}

function _replay(html){return(
html`<button>Replay`
)}

async function* _chart(replay,d3,width,height,bars,axis,labels,ticker,keyframes,duration,x,invalidation)
{
  replay;

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");

  const updateBars = bars(svg);
  const updateAxis = axis(svg);
  const updateLabels = labels(svg);
  const updateTicker = ticker(svg);

  yield svg.node();

  for (const keyframe of keyframes) {
    const transition = svg.transition()
        .duration(duration)
        .ease(d3.easeLinear);

    // Extract the top bar’s value.
    x.domain([0, keyframe[1][0].value]);

    updateAxis(keyframe, transition);
    updateBars(keyframe, transition);
    updateLabels(keyframe, transition);
    updateTicker(keyframe, transition);

    invalidation.then(() => svg.interrupt());
    await transition.end();
  }
}


function _duration(){return(
250
)}

function _n(){return(
12
)}

function _names(data){return(
new Set(data.map(d => d.name))
)}

function _datevalues(d3,data){return(
Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
  .map(([date, data]) => [new Date(date), data])
  .sort(([a], [b]) => d3.ascending(a, b))
)}

function _rank(names,d3,n){return(
function rank(value) {
  const data = Array.from(names, name => ({name, value: value(name)}));
  data.sort((a, b) => d3.descending(a.value, b.value));
  for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
  return data;
}
)}

function _k(){return(
10
)}

function _keyframes(d3,datevalues,k,rank)
{
  const keyframes = [];
  let ka, a, kb, b;
  for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
    for (let i = 0; i < k; ++i) {
      const t = i / k;
      keyframes.push([
        new Date(ka * (1 - t) + kb * t),
        rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
      ]);
    }
  }
  keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);
  return keyframes;
}


function _nameframes(d3,keyframes){return(
d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
)}

function _prev(nameframes,d3){return(
new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
)}

function _next(nameframes,d3){return(
new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))
)}

function _bars(n,color,y,x,prev,next){return(
function bars(svg) {
  let bar = svg.append("g")
      .attr("fill-opacity", 0.6)
    .selectAll("rect");

  return ([date, data], transition) => bar = bar
    .data(data.slice(0, n), d => d.name)
    .join(
      enter => enter.append("rect")
        .attr("fill", color)
        .attr("height", y.bandwidth())
        .attr("x", x(0))
        .attr("y", d => y((prev.get(d) || d).rank))
        .attr("width", d => x((prev.get(d) || d).value) - x(0)),
      update => update,
      exit => exit.transition(transition).remove()
        .attr("y", d => y((next.get(d) || d).rank))
        .attr("width", d => x((next.get(d) || d).value) - x(0))
    )
    .call(bar => bar.transition(transition)
      .attr("y", d => y(d.rank))
      .attr("width", d => x(d.value) - x(0)));
}
)}

function _labels(n,x,prev,y,next,textTween){return(
function labels(svg) {
  let label = svg.append("g")
      .style("font", "bold 12px var(--sans-serif)")
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
    .selectAll("text");

  return ([date, data], transition) => label = label
    .data(data.slice(0, n), d => d.name)
    .join(
      enter => enter.append("text")
        .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
        .attr("y", y.bandwidth() / 2)
        .attr("x", -6)
        .attr("dy", "-0.25em")
        .text(d => d.name)
        .call(text => text.append("tspan")
          .attr("fill-opacity", 0.7)
          .attr("font-weight", "normal")
          .attr("x", -6)
          .attr("dy", "1.15em")),
      update => update,
      exit => exit.transition(transition).remove()
        .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
        .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
    )
    .call(bar => bar.transition(transition)
      .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
      .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))));
}
)}

function _textTween(d3,formatNumber){return(
function textTween(a, b) {
  const i = d3.interpolateNumber(a, b);
  return function(t) {
    this.textContent = formatNumber(i(t));
  };
}
)}

function _formatNumber(d3){return(
d3.format(",d")
)}

function _tickFormat(){return(
undefined
)}

function _axis(marginTop,d3,x,width,tickFormat,barSize,n,y){return(
function axis(svg) {
  const g = svg.append("g")
      .attr("transform", `translate(0,${marginTop})`);

  const axis = d3.axisTop(x)
      .ticks(width / 160, tickFormat)
      .tickSizeOuter(0)
      .tickSizeInner(-barSize * (n + y.padding()));

  return (_, transition) => {
    g.transition(transition).call(axis);
    g.select(".tick:first-of-type text").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    g.select(".domain").remove();
  };
}
)}

function _ticker(barSize,width,marginTop,n,formatDate,keyframes){return(
function ticker(svg) {
  const now = svg.append("text")
      .style("font", `bold ${barSize}px var(--sans-serif)`)
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
      .attr("x", width - 6)
      .attr("y", marginTop + barSize * (n - 0.45))
      .attr("dy", "0.32em")
      .text(formatDate(keyframes[0][0]));

  return ([date], transition) => {
    transition.end().then(() => now.text(formatDate(date)));
  };
}
)}

function _formatDate(d3){return(
d3.utcFormat("%Y")
)}

function _color(d3,data)
{
  const scale = d3.scaleOrdinal(d3.schemeTableau10);
  if (data.some(d => d.category !== undefined)) {
    const categoryByName = new Map(data.map(d => [d.name, d.category]))
    scale.domain(categoryByName.values());
    return d => scale(categoryByName.get(d.name));
  }
  return d => scale(d.name);
}


function _x(d3,marginLeft,width,marginRight){return(
d3.scaleLinear([0, 1], [marginLeft, width - marginRight])
)}

function _y(d3,n,marginTop,barSize){return(
d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([marginTop, marginTop + barSize * (n + 1 + 0.1)])
    .padding(0.1)
)}

function _height(marginTop,barSize,n,marginBottom){return(
marginTop + barSize * n + marginBottom
)}

function _barSize(){return(
48
)}

function _marginTop(){return(
16
)}

function _marginRight(){return(
6
)}

function _marginBottom(){return(
6
)}

function _marginLeft(){return(
0
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["category-brands.csv", {url: new URL("./files/aec3792837253d4c6168f9bbecdf495140a5f9bb1cdb12c7c8113cec26332634a71ad29b446a1e8236e0a45732ea5d0b4e86d9d1568ff5791412f093ec06f4f1.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("viewof replay")).define("viewof replay", ["html"], _replay);
  main.variable(observer("replay")).define("replay", ["Generators", "viewof replay"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["replay","d3","width","height","bars","axis","labels","ticker","keyframes","duration","x","invalidation"], _chart);
  main.variable(observer("duration")).define("duration", _duration);
  main.variable(observer("n")).define("n", _n);
  main.variable(observer("names")).define("names", ["data"], _names);
  main.variable(observer("datevalues")).define("datevalues", ["d3","data"], _datevalues);
  main.variable(observer("rank")).define("rank", ["names","d3","n"], _rank);
  main.variable(observer("k")).define("k", _k);
  main.variable(observer("keyframes")).define("keyframes", ["d3","datevalues","k","rank"], _keyframes);
  main.variable(observer("nameframes")).define("nameframes", ["d3","keyframes"], _nameframes);
  main.variable(observer("prev")).define("prev", ["nameframes","d3"], _prev);
  main.variable(observer("next")).define("next", ["nameframes","d3"], _next);
  main.variable(observer("bars")).define("bars", ["n","color","y","x","prev","next"], _bars);
  main.variable(observer("labels")).define("labels", ["n","x","prev","y","next","textTween"], _labels);
  main.variable(observer("textTween")).define("textTween", ["d3","formatNumber"], _textTween);
  main.variable(observer("formatNumber")).define("formatNumber", ["d3"], _formatNumber);
  main.variable(observer("tickFormat")).define("tickFormat", _tickFormat);
  main.variable(observer("axis")).define("axis", ["marginTop","d3","x","width","tickFormat","barSize","n","y"], _axis);
  main.variable(observer("ticker")).define("ticker", ["barSize","width","marginTop","n","formatDate","keyframes"], _ticker);
  main.variable(observer("formatDate")).define("formatDate", ["d3"], _formatDate);
  main.variable(observer("color")).define("color", ["d3","data"], _color);
  main.variable(observer("x")).define("x", ["d3","marginLeft","width","marginRight"], _x);
  main.variable(observer("y")).define("y", ["d3","n","marginTop","barSize"], _y);
  main.variable(observer("height")).define("height", ["marginTop","barSize","n","marginBottom"], _height);
  main.variable(observer("barSize")).define("barSize", _barSize);
  main.variable(observer("marginTop")).define("marginTop", _marginTop);
  main.variable(observer("marginRight")).define("marginRight", _marginRight);
  main.variable(observer("marginBottom")).define("marginBottom", _marginBottom);
  main.variable(observer("marginLeft")).define("marginLeft", _marginLeft);
  return main;
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  PaxHeader                                                                                           000644  000000  000000  00000000226 14462206250 011121  x                                                                                                    ustar 00                                                                000000  000000                                                                                                                                                                         150 path=./files/aec3792837253d4c6168f9bbecdf495140a5f9bb1cdb12c7c8113cec26332634a71ad29b446a1e8236e0a45732ea5d0b4e86d9d1568ff5791412f093ec06f4f1.csv
                                                                                                                                                                                                                                                                                                                                                                          PaxHeader                                                                                           000644  000000  000000  00000210275 14462206250 011020  0                                                                                                    ustar 00                                                                000000  000000                                                                                                                                                                         date,name,category,value
2000-01-01,Coca-Cola,Beverages,72537
2000-01-01,Microsoft,Technology,70196
2000-01-01,IBM,Business Services,53183
2000-01-01,Intel,Technology,39048
2000-01-01,Nokia,Technology,38528
2000-01-01,GE,Diversified,38127
2000-01-01,Ford,Automotive,36368
2000-01-01,Disney,Media,33553
2000-01-01,McDonald's,Restaurants,27859
2000-01-01,AT&T,Telecommunications,25548
2000-01-01,Marlboro,Tobacco,22110
2000-01-01,Mercedes-Benz,Automotive,21104
2000-01-01,HP,Electronics,20572
2000-01-01,Cisco,Business Services,20067
2000-01-01,Toyota,Automotive,18823
2000-01-01,Citi,Financial Services,18809
2000-01-01,Gillette,FMCG,17358
2000-01-01,Sony,Electronics,16409
2000-01-01,American Express,Financial Services,16122
2000-01-01,Honda,Automotive,15244
2000-01-01,Compaq,Technology,14602
2000-01-01,NESCAFÉ,Beverages,13680
2000-01-01,BMW,Automotive,12969
2000-01-01,Kodak,Electronics,11822
2000-01-01,Heinz,FMCG,11742
2000-01-01,Budweiser,Alcohol,10684
2000-01-01,Xerox,Business Services,9699
2000-01-01,Dell,Electronics,9476
2000-01-01,Gap,Apparel,9316
2000-01-01,Nike,Sporting Goods,8015
2000-01-01,Volkswagen,Automotive,7834
2000-01-01,Ericsson,Electronics,7805
2000-01-01,Kellogg's,FMCG,7357
2000-01-01,Louis Vuitton,Luxury,6887
2000-01-01,Pepsi,Beverages,6636
2000-01-01,Apple,Technology,6594
2000-01-01,MTV,Media,6411
2000-01-01,Yahoo!,Media,6299
2000-01-01,SAP,Business Services,6135
2000-01-01,IKEA,Retail,6031
2000-01-01,Duracell,FMCG,5885
2000-01-01,Philips,Electronics,5481
2000-01-01,Samsung,Technology,5223
2000-01-01,Gucci,Luxury,5149
2000-01-01,Kleenex,FMCG,5144
2000-01-01,Reuters,Media,4876
2000-01-01,AOL,Media,4531
2000-01-01,Amazon,Technology,4528
2000-01-01,Motorola,Electronics,4445
2000-01-01,Colgate,FMCG,4417
2000-01-01,Wrigley,FMCG,4324
2000-01-01,Chanel,Luxury,4141
2000-01-01,adidas,Sporting Goods,3791
2000-01-01,Panasonic,Electronics,3734
2000-01-01,Rolex,Luxury,3561
2000-01-01,Hertz,Automotive,3438
2000-01-01,Bacardi,Alcohol,3187
2000-01-01,BP,Energy,3066
2000-01-01,Moët & Chandon,Alcohol,2799
2000-01-01,Shell,Energy,2786
2000-01-01,Burger King,Restaurants,2701
2000-01-01,Smirnoff,Alcohol,2443
2000-01-01,Barbie,Toys & Games,2315
2000-01-01,Heineken,Alcohol,2218
2000-01-01,Wall Street Journal,Media,2184
2000-01-01,Ralph Lauren,Apparel,1834
2000-01-01,Johnnie Walker,Alcohol,1541
2000-01-01,Hilton,Hospitality,1483
2000-01-01,Jack Daniel's,Alcohol,1480
2000-01-01,Armani,Luxury,1456
2000-01-01,Pampers,FMCG,1400
2000-01-01,Starbucks,Restaurants,1329
2000-01-01,Guinness,Alcohol,1224
2000-01-01,Financial Times,Media,1148
2000-01-01,Benetton,Apparel,1008
2001-01-01,Coca-Cola,Beverages,68945
2001-01-01,Microsoft,Technology,65068
2001-01-01,IBM,Business Services,52752
2001-01-01,GE,Diversified,42396
2001-01-01,Nokia,Technology,35035
2001-01-01,Intel,Technology,34665
2001-01-01,Disney,Media,32591
2001-01-01,Ford,Automotive,30092
2001-01-01,McDonald's,Restaurants,25289
2001-01-01,AT&T,Telecommunications,22828
2001-01-01,Marlboro,Tobacco,22053
2001-01-01,Mercedes-Benz,Automotive,21728
2001-01-01,Citi,Financial Services,19005
2001-01-01,Toyota,Automotive,18578
2001-01-01,HP,Electronics,17983
2001-01-01,Cisco,Business Services,17209
2001-01-01,American Express,Financial Services,16919
2001-01-01,Gillette,FMCG,15298
2001-01-01,Merrill Lynch,Financial Services,15015
2001-01-01,Sony,Electronics,15005
2001-01-01,Honda,Automotive,14638
2001-01-01,BMW,Automotive,13858
2001-01-01,NESCAFÉ,Beverages,13250
2001-01-01,Compaq,Technology,12354
2001-01-01,Oracle,Business Services,12224
2001-01-01,Budweiser,Alcohol,10838
2001-01-01,Kodak,Electronics,10801
2001-01-01,"Merck & Co., Inc.",Pharmaceuticals,9672
2001-01-01,Nintendo,Electronics,9460
2001-01-01,Pfizer,Pharmaceuticals,8951
2001-01-01,Gap,Apparel,8746
2001-01-01,Dell,Electronics,8269
2001-01-01,Goldman Sachs,Financial Services,7862
2001-01-01,Nike,Sporting Goods,7589
2001-01-01,Volkswagen,Automotive,7338
2001-01-01,Ericsson,Electronics,7069
2001-01-01,Heinz,FMCG,7062
2001-01-01,Louis Vuitton,Luxury,7053
2001-01-01,Kellogg's,FMCG,7005
2001-01-01,MTV,Media,6599
2001-01-01,Canon,Electronics,6580
2001-01-01,Samsung,Technology,6374
2001-01-01,SAP,Business Services,6307
2001-01-01,Pepsi,Beverages,6214
2001-01-01,Xerox,Business Services,6019
2001-01-01,IKEA,Retail,6005
2001-01-01,Pizza Hut,Restaurants,5978
2001-01-01,Harley-Davidson,Automotive,5532
2001-01-01,Apple,Technology,5464
2001-01-01,Gucci,Luxury,5363
2001-01-01,KFC,Restaurants,5261
2001-01-01,Reuters,Media,5236
2001-01-01,Sun Microsystems,Business Services,5149
2001-01-01,Kleenex,FMCG,5085
2001-01-01,Philips,Electronics,4900
2001-01-01,Colgate,FMCG,4572
2001-01-01,Wrigley,FMCG,4530
2001-01-01,AOL,Media,4495
2001-01-01,Yahoo!,Media,4378
2001-01-01,Avon,FMCG,4369
2001-01-01,Chanel,Luxury,4265
2001-01-01,Duracell,FMCG,4140
2001-01-01,Boeing,Diversified,4060
2001-01-01,Texas Instruments,Technology,4041
2001-01-01,Kraft,FMCG,4032
2001-01-01,Motorola,Electronics,3761
2001-01-01,Levi's,Apparel,3747
2001-01-01,Time,Media,3724
2001-01-01,Rolex,Luxury,3701
2001-01-01,adidas,Sporting Goods,3650
2001-01-01,Hertz,Automotive,3617
2001-01-01,Panasonic,Electronics,3490
2001-01-01,Tiffany & Co.,Luxury,3483
2001-01-01,BP,Energy,3247
2001-01-01,Bacardi,Alcohol,3204
2001-01-01,Amazon,Technology,3130
2001-01-01,Shell,Energy,2844
2001-01-01,Smirnoff,Alcohol,2594
2001-01-01,Moët & Chandon,Alcohol,2470
2001-01-01,Burger King,Restaurants,2426
2001-01-01,Mobil,Energy,2415
2001-01-01,Heineken,Alcohol,2266
2001-01-01,Wall Street Journal,Media,2184
2001-01-01,Barbie,Toys & Games,2037
2001-01-01,Ralph Lauren,Apparel,1910
2001-01-01,FedEx,Logistics,1885
2001-01-01,Nivea,FMCG,1782
2001-01-01,Starbucks,Restaurants,1757
2001-01-01,Johnnie Walker,Alcohol,1649
2001-01-01,Jack Daniel's,Alcohol,1583
2001-01-01,Armani,Luxury,1490
2001-01-01,Pampers,FMCG,1410
2001-01-01,Absolut,Alcohol,1378
2001-01-01,Guinness,Alcohol,1357
2001-01-01,Financial Times,Media,1310
2001-01-01,Hilton,Hospitality,1235
2001-01-01,Carlsberg,Alcohol,1075
2001-01-01,Siemens,Diversified,1029
2001-01-01,Swatch,FMCG,1004
2001-01-01,Benetton,Apparel,1002
2002-01-01,Coca-Cola,Beverages,69637
2002-01-01,Microsoft,Technology,64091
2002-01-01,IBM,Business Services,51188
2002-01-01,GE,Diversified,41311
2002-01-01,Intel,Technology,30861
2002-01-01,Nokia,Technology,29970
2002-01-01,Disney,Media,29256
2002-01-01,McDonald's,Restaurants,26375
2002-01-01,Marlboro,Tobacco,24151
2002-01-01,Mercedes-Benz,Automotive,21010
2002-01-01,Ford,Automotive,20403
2002-01-01,Toyota,Automotive,19448
2002-01-01,Citi,Financial Services,18066
2002-01-01,HP,Electronics,16776
2002-01-01,American Express,Financial Services,16287
2002-01-01,Cisco,Business Services,16222
2002-01-01,AT&T,Telecommunications,16059
2002-01-01,Honda,Automotive,15064
2002-01-01,Gillette,FMCG,14959
2002-01-01,BMW,Automotive,14425
2002-01-01,Sony,Electronics,13899
2002-01-01,NESCAFÉ,Beverages,12843
2002-01-01,Oracle,Business Services,11510
2002-01-01,Budweiser,Alcohol,11349
2002-01-01,Merrill Lynch,Financial Services,11230
2002-01-01,Morgan Stanley,Financial Services,11205
2002-01-01,Compaq,Technology,9803
2002-01-01,Pfizer,Pharmaceuticals,9770
2002-01-01,J.P. Morgan,Financial Services,9693
2002-01-01,Kodak,Electronics,9671
2002-01-01,Dell,Electronics,9237
2002-01-01,Nintendo,Electronics,9219
2002-01-01,"Merck & Co., Inc.",Pharmaceuticals,9138
2002-01-01,Samsung,Technology,8310
2002-01-01,Nike,Sporting Goods,7724
2002-01-01,Gap,Apparel,7406
2002-01-01,Heinz,FMCG,7347
2002-01-01,Volkswagen,Automotive,7209
2002-01-01,Goldman Sachs,Financial Services,7194
2002-01-01,Kellogg's,FMCG,7191
2002-01-01,Louis Vuitton,Luxury,7054
2002-01-01,SAP,Business Services,6775
2002-01-01,Canon,Electronics,6721
2002-01-01,IKEA,Retail,6545
2002-01-01,Pepsi,Beverages,6394
2002-01-01,Harley-Davidson,Automotive,6266
2002-01-01,MTV,Media,6078
2002-01-01,Pizza Hut,Restaurants,6046
2002-01-01,KFC,Restaurants,5346
2002-01-01,Apple,Technology,5316
2002-01-01,Xerox,Business Services,5308
2002-01-01,Gucci,Luxury,5304
2002-01-01,Accenture,Business Services,5182
2002-01-01,L'Oréal,FMCG,5079
2002-01-01,Kleenex,FMCG,5039
2002-01-01,Sun Microsystems,Business Services,4773
2002-01-01,Wrigley,FMCG,4747
2002-01-01,Reuters,Media,4611
2002-01-01,Colgate,FMCG,4602
2002-01-01,Philips,Electronics,4561
2002-01-01,Nestlé,FMCG,4430
2002-01-01,Avon,FMCG,4399
2002-01-01,AOL,Media,4326
2002-01-01,Chanel,Luxury,4272
2002-01-01,Kraft,FMCG,4079
2002-01-01,Danone,FMCG,4054
2002-01-01,Yahoo!,Media,3855
2002-01-01,adidas,Sporting Goods,3690
2002-01-01,Rolex,Luxury,3686
2002-01-01,Time,Media,3682
2002-01-01,Ericsson,Electronics,3589
2002-01-01,Tiffany & Co.,Luxury,3482
2002-01-01,Levi's,Apparel,3454
2002-01-01,Motorola,Electronics,3416
2002-01-01,Duracell,FMCG,3409
2002-01-01,BP,Energy,3390
2002-01-01,Hertz,Automotive,3362
2002-01-01,Bacardi,Alcohol,3341
2002-01-01,Caterpillar,Diversified,3218
2002-01-01,Amazon,Technology,3175
2002-01-01,Panasonic,Electronics,3141
2002-01-01,Boeing,Diversified,2973
2002-01-01,Shell,Energy,2810
2002-01-01,Smirnoff,Alcohol,2723
2002-01-01,Johnson & Johnson,FMCG,2509
2002-01-01,Prada,Luxury,2489
2002-01-01,Moët & Chandon,Alcohol,2445
2002-01-01,Heineken,Alcohol,2396
2002-01-01,Mobil,Energy,2358
2002-01-01,Burger King,Restaurants,2163
2002-01-01,Nivea,FMCG,2059
2002-01-01,Wall Street Journal,Media,1961
2002-01-01,Starbucks,Restaurants,1961
2002-01-01,Barbie,Toys & Games,1937
2002-01-01,Ralph Lauren,Apparel,1928
2002-01-01,FedEx,Logistics,1919
2002-01-01,Johnnie Walker,Alcohol,1654
2002-01-01,Jack Daniel's,Alcohol,1580
2002-01-01,3M,Diversified,1579
2002-01-01,Armani,Luxury,1509
2003-01-01,Coca-Cola,Beverages,70453
2003-01-01,Microsoft,Technology,65174
2003-01-01,IBM,Business Services,51767
2003-01-01,GE,Diversified,42340
2003-01-01,Intel,Technology,31112
2003-01-01,Nokia,Technology,29440
2003-01-01,Disney,Media,28036
2003-01-01,McDonald's,Restaurants,24699
2003-01-01,Marlboro,Tobacco,22183
2003-01-01,Mercedes-Benz,Automotive,21371
2003-01-01,Toyota,Automotive,20784
2003-01-01,HP,Electronics,19860
2003-01-01,Citi,Financial Services,18571
2003-01-01,Ford,Automotive,17066
2003-01-01,American Express,Financial Services,16833
2003-01-01,Gillette,FMCG,15978
2003-01-01,Cisco,Business Services,15789
2003-01-01,Honda,Automotive,15625
2003-01-01,BMW,Automotive,15106
2003-01-01,Sony,Electronics,13153
2003-01-01,NESCAFÉ,Beverages,12336
2003-01-01,Budweiser,Alcohol,11894
2003-01-01,Pepsi,Beverages,11777
2003-01-01,Oracle,Business Services,11263
2003-01-01,Samsung,Technology,10846
2003-01-01,Morgan Stanley,Financial Services,10691
2003-01-01,Merrill Lynch,Financial Services,10521
2003-01-01,Pfizer,Pharmaceuticals,10455
2003-01-01,Dell,Electronics,10367
2003-01-01,"Merck & Co., Inc.",Pharmaceuticals,9407
2003-01-01,J.P. Morgan,Financial Services,9120
2003-01-01,Nintendo,Electronics,8190
2003-01-01,Nike,Sporting Goods,8167
2003-01-01,Kodak,Electronics,7826
2003-01-01,SAP,Business Services,7714
2003-01-01,Gap,Apparel,7688
2003-01-01,HSBC,Financial Services,7565
2003-01-01,Kellogg's,FMCG,7438
2003-01-01,Canon,Electronics,7192
2003-01-01,Heinz,FMCG,7097
2003-01-01,Goldman Sachs,Financial Services,7039
2003-01-01,Volkswagen,Automotive,6938
2003-01-01,IKEA,Retail,6918
2003-01-01,Harley-Davidson,Automotive,6775
2003-01-01,Louis Vuitton,Luxury,6708
2003-01-01,MTV,Media,6278
2003-01-01,L'Oréal,FMCG,5600
2003-01-01,Xerox,Business Services,5578
2003-01-01,KFC,Restaurants,5576
2003-01-01,Apple,Technology,5554
2003-01-01,Pizza Hut,Restaurants,5312
2003-01-01,Accenture,Business Services,5301
2003-01-01,Gucci,Luxury,5100
2003-01-01,Kleenex,FMCG,5057
2003-01-01,Wrigley,FMCG,5057
2003-01-01,Colgate,FMCG,4686
2003-01-01,Avon,FMCG,4631
2003-01-01,Sun Microsystems,Business Services,4465
2003-01-01,Philips,Electronics,4464
2003-01-01,Nestlé,FMCG,4460
2003-01-01,Chanel,Luxury,4315
2003-01-01,Danone,FMCG,4237
2003-01-01,Kraft,FMCG,4171
2003-01-01,AOL,Media,3961
2003-01-01,Yahoo!,Media,3895
2003-01-01,Time,Media,3784
2003-01-01,adidas,Sporting Goods,3679
2003-01-01,Rolex,Luxury,3673
2003-01-01,BP,Energy,3582
2003-01-01,Tiffany & Co.,Luxury,3540
2003-01-01,Duracell,FMCG,3438
2003-01-01,Bacardi,Alcohol,3431
2003-01-01,Hermès,Luxury,3416
2003-01-01,Amazon,Technology,3403
2003-01-01,Caterpillar,Diversified,3363
2003-01-01,Reuters,Media,3300
2003-01-01,Levi's,Apparel,3298
2003-01-01,Hertz,Automotive,3288
2003-01-01,Panasonic,Electronics,3257
2003-01-01,Ericsson,Electronics,3153
2003-01-01,Motorola,Electronics,3103
2003-01-01,Hennessy,Alcohol,2996
2003-01-01,Shell,Energy,2983
2003-01-01,Boeing,Diversified,2864
2003-01-01,Smirnoff,Alcohol,2806
2003-01-01,Johnson & Johnson,FMCG,2706
2003-01-01,Prada,Luxury,2535
2003-01-01,Moët & Chandon,Alcohol,2524
2003-01-01,Nissan,Automotive,2495
2003-01-01,Heineken,Alcohol,2431
2003-01-01,Mobil,Energy,2407
2003-01-01,Nivea,FMCG,2221
2003-01-01,Starbucks,Restaurants,2136
2003-01-01,Burger King,Restaurants,2121
2003-01-01,Ralph Lauren,Apparel,2048
2003-01-01,FedEx,Logistics,2032
2003-01-01,Barbie,Toys & Games,1873
2003-01-01,Wall Street Journal,Media,1763
2003-01-01,Johnnie Walker,Alcohol,1724
2003-01-01,Jack Daniel's,Alcohol,1612
2004-01-01,Coca-Cola,Beverages,67394
2004-01-01,Microsoft,Technology,61372
2004-01-01,IBM,Business Services,53791
2004-01-01,GE,Diversified,44111
2004-01-01,Intel,Technology,33499
2004-01-01,Disney,Media,27113
2004-01-01,McDonald's,Restaurants,25001
2004-01-01,Nokia,Technology,24041
2004-01-01,Toyota,Automotive,22673
2004-01-01,Marlboro,Tobacco,22128
2004-01-01,Mercedes-Benz,Automotive,21331
2004-01-01,HP,Electronics,20978
2004-01-01,Citi,Financial Services,19971
2004-01-01,American Express,Financial Services,17683
2004-01-01,Gillette,FMCG,16723
2004-01-01,Cisco,Business Services,15948
2004-01-01,BMW,Automotive,15886
2004-01-01,Honda,Automotive,14874
2004-01-01,Ford,Automotive,14475
2004-01-01,Sony,Electronics,12759
2004-01-01,Samsung,Technology,12553
2004-01-01,Pepsi,Beverages,12066
2004-01-01,NESCAFÉ,Beverages,11892
2004-01-01,Budweiser,Alcohol,11846
2004-01-01,Dell,Electronics,11500
2004-01-01,Merrill Lynch,Financial Services,11499
2004-01-01,Morgan Stanley,Financial Services,11498
2004-01-01,Oracle,Business Services,10935
2004-01-01,Pfizer,Pharmaceuticals,10635
2004-01-01,J.P. Morgan,Financial Services,9782
2004-01-01,Nike,Sporting Goods,9260
2004-01-01,"Merck & Co., Inc.",Pharmaceuticals,8811
2004-01-01,HSBC,Financial Services,8671
2004-01-01,SAP,Business Services,8323
2004-01-01,Canon,Electronics,8055
2004-01-01,Kellogg's,FMCG,8029
2004-01-01,Goldman Sachs,Financial Services,7954
2004-01-01,Gap,Apparel,7873
2004-01-01,Siemens,Diversified,7470
2004-01-01,IKEA,Retail,7182
2004-01-01,Harley-Davidson,Automotive,7057
2004-01-01,Heinz,FMCG,7026
2004-01-01,Apple,Technology,6871
2004-01-01,Louis Vuitton,Luxury,6602
2004-01-01,UBS,Financial Services,6526
2004-01-01,Nintendo,Electronics,6479
2004-01-01,MTV,Media,6456
2004-01-01,Volkswagen,Automotive,6410
2004-01-01,L'Oréal,FMCG,5902
2004-01-01,Accenture,Business Services,5772
2004-01-01,Xerox,Business Services,5696
2004-01-01,Wrigley,FMCG,5424
2004-01-01,Kodak,Electronics,5231
2004-01-01,KFC,Restaurants,5118
2004-01-01,Pizza Hut,Restaurants,5050
2004-01-01,Colgate,FMCG,4929
2004-01-01,Kleenex,FMCG,4881
2004-01-01,Avon,FMCG,4849
2004-01-01,Gucci,Luxury,4715
2004-01-01,eBay,Retail,4700
2004-01-01,Yahoo!,Media,4545
2004-01-01,Nestlé,FMCG,4529
2004-01-01,Danone,FMCG,4488
2004-01-01,Chanel,Luxury,4416
2004-01-01,Philips,Electronics,4378
2004-01-01,Amazon,Technology,4156
2004-01-01,Kraft,FMCG,4112
2004-01-01,Caterpillar,Diversified,3801
2004-01-01,adidas,Sporting Goods,3740
2004-01-01,Rolex,Luxury,3720
2004-01-01,Reuters,Media,3691
2004-01-01,BP,Energy,3662
2004-01-01,Time,Media,3651
2004-01-01,Porsche,Automotive,3646
2004-01-01,Tiffany & Co.,Luxury,3638
2004-01-01,Motorola,Electronics,3483
2004-01-01,Panasonic,Electronics,3480
2004-01-01,Hertz,Automotive,3411
2004-01-01,Hermès,Luxury,3376
2004-01-01,Duracell,FMCG,3362
2004-01-01,Audi,Automotive,3288
2004-01-01,AOL,Media,3248
2004-01-01,Hennessy,Alcohol,3084
2004-01-01,Shell,Energy,2985
2004-01-01,Levi's,Apparel,2979
2004-01-01,Smirnoff,Alcohol,2975
2004-01-01,Johnson & Johnson,FMCG,2952
2004-01-01,ING,Financial Services,2864
2004-01-01,Moët & Chandon,Alcohol,2861
2004-01-01,Nissan,Automotive,2833
2004-01-01,Cartier,Luxury,2749
2004-01-01,Estee Lauder,FMCG,2634
2004-01-01,Armani,Luxury,2613
2004-01-01,Boeing,Diversified,2576
2004-01-01,Prada,Luxury,2568
2004-01-01,Mobil,Energy,2492
2004-01-01,Nivea,FMCG,2409
2004-01-01,Starbucks,Restaurants,2400
2004-01-01,Heineken,Alcohol,2380
2004-01-01,Ralph Lauren,Apparel,2147
2005-01-01,Coca-Cola,Beverages,67525
2005-01-01,Microsoft,Technology,59941
2005-01-01,IBM,Business Services,53376
2005-01-01,GE,Diversified,46996
2005-01-01,Intel,Technology,35588
2005-01-01,Nokia,Technology,26452
2005-01-01,Disney,Media,26441
2005-01-01,McDonald's,Restaurants,26014
2005-01-01,Toyota,Automotive,24837
2005-01-01,Marlboro,Tobacco,21189
2005-01-01,Mercedes-Benz,Automotive,20006
2005-01-01,Citi,Financial Services,19967
2005-01-01,HP,Electronics,18866
2005-01-01,American Express,Financial Services,18559
2005-01-01,Gillette,FMCG,17534
2005-01-01,BMW,Automotive,17126
2005-01-01,Cisco,Business Services,16592
2005-01-01,Louis Vuitton,Luxury,16077
2005-01-01,Honda,Automotive,15788
2005-01-01,Samsung,Technology,14956
2005-01-01,Dell,Electronics,13231
2005-01-01,Ford,Automotive,13159
2005-01-01,Pepsi,Beverages,12399
2005-01-01,NESCAFÉ,Beverages,12241
2005-01-01,Merrill Lynch,Financial Services,12018
2005-01-01,Budweiser,Alcohol,11878
2005-01-01,Oracle,Business Services,10887
2005-01-01,Sony,Electronics,10754
2005-01-01,HSBC,Financial Services,10429
2005-01-01,Nike,Sporting Goods,10114
2005-01-01,Pfizer,Pharmaceuticals,9981
2005-01-01,UPS,Logistics,9923
2005-01-01,Morgan Stanley,Financial Services,9777
2005-01-01,J.P. Morgan,Financial Services,9455
2005-01-01,Canon,Electronics,9044
2005-01-01,SAP,Business Services,9006
2005-01-01,Goldman Sachs,Financial Services,8495
2005-01-01,Google,Technology,8461
2005-01-01,Kellogg's,FMCG,8306
2005-01-01,Gap,Apparel,8195
2005-01-01,Apple,Technology,7985
2005-01-01,IKEA,Retail,7817
2005-01-01,Novartis,Pharmaceuticals,7746
2005-01-01,UBS,Financial Services,7565
2005-01-01,Siemens,Diversified,7507
2005-01-01,Harley-Davidson,Automotive,7346
2005-01-01,Heinz,FMCG,6932
2005-01-01,MTV,Media,6647
2005-01-01,Gucci,Luxury,6619
2005-01-01,Nintendo,Electronics,6470
2005-01-01,Accenture,Business Services,6142
2005-01-01,L'Oréal,FMCG,6005
2005-01-01,Philips,Electronics,5901
2005-01-01,Xerox,Business Services,5705
2005-01-01,eBay,Retail,5701
2005-01-01,Volkswagen,Automotive,5617
2005-01-01,Wrigley,FMCG,5543
2005-01-01,Yahoo!,Media,5256
2005-01-01,Avon,FMCG,5213
2005-01-01,Colgate,FMCG,5186
2005-01-01,KFC,Restaurants,5112
2005-01-01,Kodak,Electronics,4979
2005-01-01,Pizza Hut,Restaurants,4963
2005-01-01,Kleenex,FMCG,4922
2005-01-01,Chanel,Luxury,4778
2005-01-01,Nestlé,FMCG,4744
2005-01-01,Danone,FMCG,4513
2005-01-01,Amazon,Technology,4248
2005-01-01,Kraft,FMCG,4238
2005-01-01,Caterpillar,Diversified,4085
2005-01-01,adidas,Sporting Goods,4033
2005-01-01,Rolex,Luxury,3906
2005-01-01,Motorola,Electronics,3877
2005-01-01,Reuters,Media,3866
2005-01-01,BP,Energy,3802
2005-01-01,Porsche,Automotive,3777
2005-01-01,Zara,Apparel,3730
2005-01-01,Panasonic,Electronics,3714
2005-01-01,Audi,Automotive,3686
2005-01-01,Duracell,FMCG,3679
2005-01-01,Tiffany & Co.,Luxury,3618
2005-01-01,Hermès,Luxury,3540
2005-01-01,Hertz,Automotive,3521
2005-01-01,Hyundai,Automotive,3480
2005-01-01,Nissan,Automotive,3203
2005-01-01,Hennessy,Alcohol,3201
2005-01-01,ING,Financial Services,3177
2005-01-01,Smirnoff,Alcohol,3097
2005-01-01,Cartier,Luxury,3050
2005-01-01,Shell,Energy,3048
2005-01-01,Johnson & Johnson,FMCG,3040
2005-01-01,Moët & Chandon,Alcohol,2991
2005-01-01,Prada,Luxury,2760
2005-01-01,Bulgari,Luxury,2715
2005-01-01,Armani,Luxury,2677
2005-01-01,Levi's,Apparel,2655
2005-01-01,LG,Electronics,2645
2005-01-01,Nivea,FMCG,2576
2005-01-01,Starbucks,Restaurants,2576
2005-01-01,Heineken,Alcohol,2357
2006-01-01,Coca-Cola,Beverages,67000
2006-01-01,Microsoft,Technology,56926
2006-01-01,IBM,Business Services,56201
2006-01-01,GE,Diversified,48907
2006-01-01,Intel,Technology,32319
2006-01-01,Nokia,Technology,30131
2006-01-01,Toyota,Automotive,27941
2006-01-01,Disney,Media,27848
2006-01-01,McDonald's,Restaurants,27501
2006-01-01,Mercedes-Benz,Automotive,21795
2006-01-01,Citi,Financial Services,21458
2006-01-01,Marlboro,Tobacco,21350
2006-01-01,HP,Electronics,20458
2006-01-01,American Express,Financial Services,19641
2006-01-01,BMW,Automotive,19617
2006-01-01,Gillette,FMCG,19579
2006-01-01,Louis Vuitton,Luxury,17606
2006-01-01,Cisco,Business Services,17532
2006-01-01,Honda,Automotive,17049
2006-01-01,Samsung,Technology,16169
2006-01-01,Merrill Lynch,Financial Services,13001
2006-01-01,Pepsi,Beverages,12690
2006-01-01,NESCAFÉ,Beverages,12507
2006-01-01,Google,Technology,12376
2006-01-01,Dell,Electronics,12256
2006-01-01,Sony,Electronics,11695
2006-01-01,Budweiser,Alcohol,11662
2006-01-01,HSBC,Financial Services,11622
2006-01-01,Oracle,Business Services,11459
2006-01-01,Ford,Automotive,11056
2006-01-01,Nike,Sporting Goods,10897
2006-01-01,UPS,Logistics,10712
2006-01-01,J.P. Morgan,Financial Services,10205
2006-01-01,SAP,Business Services,10007
2006-01-01,Canon,Electronics,9968
2006-01-01,Morgan Stanley,Financial Services,9762
2006-01-01,Goldman Sachs,Financial Services,9640
2006-01-01,Pfizer,Pharmaceuticals,9591
2006-01-01,Apple,Technology,9130
2006-01-01,Kellogg's,FMCG,8776
2006-01-01,IKEA,Retail,8763
2006-01-01,UBS,Financial Services,8734
2006-01-01,Novartis,Pharmaceuticals,7880
2006-01-01,Siemens,Diversified,7828
2006-01-01,Harley-Davidson,Automotive,7739
2006-01-01,Gucci,Luxury,7158
2006-01-01,eBay,Retail,6755
2006-01-01,Philips,Electronics,6730
2006-01-01,Accenture,Business Services,6728
2006-01-01,MTV,Media,6627
2006-01-01,Nintendo,Electronics,6559
2006-01-01,Gap,Apparel,6416
2006-01-01,L'Oréal,FMCG,6392
2006-01-01,Heinz,FMCG,6223
2006-01-01,Yahoo!,Media,6056
2006-01-01,Volkswagen,Automotive,6032
2006-01-01,Xerox,Business Services,5918
2006-01-01,Colgate,FMCG,5633
2006-01-01,Wrigley,FMCG,5449
2006-01-01,KFC,Restaurants,5350
2006-01-01,Chanel,Luxury,5156
2006-01-01,Avon,FMCG,5040
2006-01-01,Nestlé,FMCG,4932
2006-01-01,Kleenex,FMCG,4842
2006-01-01,Amazon,Technology,4707
2006-01-01,Pizza Hut,Restaurants,4694
2006-01-01,Danone,FMCG,4638
2006-01-01,Caterpillar,Diversified,4580
2006-01-01,Motorola,Electronics,4569
2006-01-01,Kodak,Electronics,4406
2006-01-01,adidas,Sporting Goods,4290
2006-01-01,Rolex,Luxury,4237
2006-01-01,Zara,Apparel,4235
2006-01-01,Audi,Automotive,4165
2006-01-01,Hyundai,Automotive,4078
2006-01-01,BP,Energy,4010
2006-01-01,Panasonic,Electronics,3977
2006-01-01,Reuters,Media,3961
2006-01-01,Kraft,FMCG,3943
2006-01-01,Porsche,Automotive,3927
2006-01-01,Hermès,Luxury,3854
2006-01-01,Tiffany & Co.,Luxury,3819
2006-01-01,Hennessy,Alcohol,3576
2006-01-01,Duracell,FMCG,3576
2006-01-01,ING,Financial Services,3474
2006-01-01,Cartier,Luxury,3360
2006-01-01,Moët & Chandon,Alcohol,3257
2006-01-01,Johnson & Johnson,FMCG,3193
2006-01-01,Shell,Energy,3173
2006-01-01,Nissan,Automotive,3108
2006-01-01,Starbucks,Restaurants,3099
2006-01-01,Lexus,Automotive,3070
2006-01-01,Smirnoff,Alcohol,3032
2006-01-01,LG,Electronics,3010
2006-01-01,Bulgari,Luxury,2875
2006-01-01,Prada,Luxury,2874
2006-01-01,Armani,Luxury,2783
2006-01-01,Burberry,Luxury,2783
2006-01-01,Nivea,FMCG,2692
2006-01-01,Levi's,Apparel,2689
2007-01-01,Coca-Cola,Beverages,65324
2007-01-01,Microsoft,Technology,58709
2007-01-01,IBM,Business Services,57090
2007-01-01,GE,Diversified,51569
2007-01-01,Nokia,Technology,33696
2007-01-01,Toyota,Automotive,32070
2007-01-01,Intel,Technology,30954
2007-01-01,McDonald's,Restaurants,29398
2007-01-01,Disney,Media,29210
2007-01-01,Mercedes-Benz,Automotive,23568
2007-01-01,Citi,Financial Services,23442
2007-01-01,HP,Electronics,22197
2007-01-01,BMW,Automotive,21612
2007-01-01,Marlboro,Tobacco,21282
2007-01-01,American Express,Financial Services,20827
2007-01-01,Gillette,FMCG,20415
2007-01-01,Louis Vuitton,Luxury,20321
2007-01-01,Cisco,Business Services,19099
2007-01-01,Honda,Automotive,17998
2007-01-01,Google,Technology,17837
2007-01-01,Samsung,Technology,16853
2007-01-01,Merrill Lynch,Financial Services,14343
2007-01-01,HSBC,Financial Services,13563
2007-01-01,NESCAFÉ,Beverages,12950
2007-01-01,Sony,Electronics,12907
2007-01-01,Pepsi,Beverages,12888
2007-01-01,Oracle,Business Services,12448
2007-01-01,UPS,Logistics,12013
2007-01-01,Nike,Sporting Goods,12003
2007-01-01,Budweiser,Alcohol,11652
2007-01-01,Dell,Electronics,11554
2007-01-01,J.P. Morgan,Financial Services,11433
2007-01-01,Apple,Technology,11037
2007-01-01,SAP,Business Services,10850
2007-01-01,Goldman Sachs,Financial Services,10663
2007-01-01,Canon,Electronics,10581
2007-01-01,Morgan Stanley,Financial Services,10340
2007-01-01,IKEA,Retail,10087
2007-01-01,UBS,Financial Services,9838
2007-01-01,Kellogg's,FMCG,9341
2007-01-01,Ford,Automotive,8982
2007-01-01,Philips,Electronics,7741
2007-01-01,Siemens,Diversified,7737
2007-01-01,Nintendo,Electronics,7730
2007-01-01,Harley-Davidson,Automotive,7718
2007-01-01,Gucci,Luxury,7697
2007-01-01,AIG,Financial Services,7490
2007-01-01,eBay,Retail,7456
2007-01-01,AXA,Financial Services,7327
2007-01-01,Accenture,Business Services,7296
2007-01-01,L'Oréal,FMCG,7045
2007-01-01,MTV,Media,6907
2007-01-01,Heinz,FMCG,6544
2007-01-01,Volkswagen,Automotive,6511
2007-01-01,Yahoo!,Media,6067
2007-01-01,Xerox,Business Services,6050
2007-01-01,Colgate,FMCG,6025
2007-01-01,Chanel,Luxury,5830
2007-01-01,Wrigley,FMCG,5777
2007-01-01,KFC,Restaurants,5682
2007-01-01,Gap,Apparel,5481
2007-01-01,Amazon,Technology,5411
2007-01-01,Nestlé,FMCG,5314
2007-01-01,Zara,Apparel,5165
2007-01-01,Avon,FMCG,5103
2007-01-01,Caterpillar,Diversified,5059
2007-01-01,Danone,FMCG,5019
2007-01-01,Audi,Automotive,4866
2007-01-01,adidas,Sporting Goods,4767
2007-01-01,Kleenex,FMCG,4600
2007-01-01,Rolex,Luxury,4589
2007-01-01,Hyundai,Automotive,4453
2007-01-01,Hermès,Luxury,4255
2007-01-01,Pizza Hut,Restaurants,4254
2007-01-01,Porsche,Automotive,4235
2007-01-01,Reuters,Media,4197
2007-01-01,Motorola,Electronics,4149
2007-01-01,Panasonic,Electronics,4135
2007-01-01,Tiffany & Co.,Luxury,4003
2007-01-01,Allianz,Financial Services,3957
2007-01-01,ING,Financial Services,3880
2007-01-01,Kodak,Electronics,3874
2007-01-01,Cartier,Luxury,3852
2007-01-01,BP,Energy,3794
2007-01-01,Moët & Chandon,Alcohol,3739
2007-01-01,Kraft,FMCG,3732
2007-01-01,Hennessy,Alcohol,3638
2007-01-01,Starbucks,Restaurants,3631
2007-01-01,Duracell,FMCG,3605
2007-01-01,Johnson & Johnson,FMCG,3445
2007-01-01,Smirnoff,Alcohol,3379
2007-01-01,Lexus,Automotive,3354
2007-01-01,Shell,Energy,3331
2007-01-01,Prada,Luxury,3286
2007-01-01,Burberry,Luxury,3221
2007-01-01,Nivea,FMCG,3116
2007-01-01,LG,Electronics,3100
2007-01-01,Nissan,Automotive,3072
2007-01-01,Ralph Lauren,Apparel,3046
2007-01-01,Hertz,Automotive,3026
2008-01-01,Coca-Cola,Beverages,66667
2008-01-01,IBM,Business Services,59031
2008-01-01,Microsoft,Technology,59007
2008-01-01,GE,Diversified,53086
2008-01-01,Nokia,Technology,35942
2008-01-01,Toyota,Automotive,34050
2008-01-01,Intel,Technology,31261
2008-01-01,McDonald's,Restaurants,31049
2008-01-01,Disney,Media,29251
2008-01-01,Google,Technology,25590
2008-01-01,Mercedes-Benz,Automotive,25577
2008-01-01,HP,Electronics,23509
2008-01-01,BMW,Automotive,23298
2008-01-01,Gillette,FMCG,22689
2008-01-01,American Express,Financial Services,21940
2008-01-01,Louis Vuitton,Luxury,21602
2008-01-01,Cisco,Business Services,21306
2008-01-01,Marlboro,Tobacco,21300
2008-01-01,Citi,Financial Services,20174
2008-01-01,Honda,Automotive,19079
2008-01-01,Samsung,Technology,17689
2008-01-01,H&M,Apparel,13840
2008-01-01,Oracle,Business Services,13831
2008-01-01,Apple,Technology,13724
2008-01-01,Sony,Electronics,13583
2008-01-01,Pepsi,Beverages,13249
2008-01-01,HSBC,Financial Services,13143
2008-01-01,NESCAFÉ,Beverages,13056
2008-01-01,Nike,Sporting Goods,12672
2008-01-01,UPS,Logistics,12621
2008-01-01,SAP,Business Services,12228
2008-01-01,Dell,Electronics,11695
2008-01-01,Budweiser,Alcohol,11438
2008-01-01,Merrill Lynch,Financial Services,11399
2008-01-01,IKEA,Retail,10913
2008-01-01,Canon,Electronics,10876
2008-01-01,J.P. Morgan,Financial Services,10773
2008-01-01,Goldman Sachs,Financial Services,10331
2008-01-01,Kellogg's,FMCG,9710
2008-01-01,Nintendo,Electronics,8772
2008-01-01,UBS,Financial Services,8740
2008-01-01,Morgan Stanley,Financial Services,8696
2008-01-01,Philips,Electronics,8325
2008-01-01,Thomson Reuters,Media,8313
2008-01-01,Gucci,Luxury,8254
2008-01-01,eBay,Retail,7991
2008-01-01,Accenture,Business Services,7948
2008-01-01,Siemens,Diversified,7943
2008-01-01,Ford,Automotive,7896
2008-01-01,Harley-Davidson,Automotive,7609
2008-01-01,L'Oréal,FMCG,7508
2008-01-01,MTV,Media,7193
2008-01-01,Volkswagen,Automotive,7047
2008-01-01,AIG,Financial Services,7022
2008-01-01,AXA,Financial Services,7001
2008-01-01,Heinz,FMCG,6646
2008-01-01,Colgate,FMCG,6437
2008-01-01,Amazon,Technology,6434
2008-01-01,Xerox,Business Services,6393
2008-01-01,Chanel,Luxury,6355
2008-01-01,Wrigley,FMCG,6105
2008-01-01,Zara,Apparel,5955
2008-01-01,Nestlé,FMCG,5592
2008-01-01,KFC,Restaurants,5582
2008-01-01,Yahoo!,Media,5496
2008-01-01,Danone,FMCG,5408
2008-01-01,Audi,Automotive,5407
2008-01-01,Caterpillar,Diversified,5288
2008-01-01,Avon,FMCG,5264
2008-01-01,adidas,Sporting Goods,5072
2008-01-01,Rolex,Luxury,4956
2008-01-01,Hyundai,Automotive,4846
2008-01-01,BlackBerry,Electronics,4802
2008-01-01,Kleenex,FMCG,4636
2008-01-01,Porsche,Automotive,4603
2008-01-01,Hermès,Luxury,4575
2008-01-01,Gap,Apparel,4357
2008-01-01,Panasonic,Electronics,4281
2008-01-01,Cartier,Luxury,4236
2008-01-01,Tiffany & Co.,Luxury,4208
2008-01-01,Pizza Hut,Restaurants,4097
2008-01-01,Allianz,Financial Services,4033
2008-01-01,Moët & Chandon,Alcohol,3951
2008-01-01,BP,Energy,3911
2008-01-01,Starbucks,Restaurants,3879
2008-01-01,ING,Financial Services,3768
2008-01-01,Motorola,Electronics,3721
2008-01-01,Duracell,FMCG,3682
2008-01-01,Smirnoff,Alcohol,3590
2008-01-01,Lexus,Automotive,3588
2008-01-01,Prada,Luxury,3585
2008-01-01,Johnson & Johnson,FMCG,3582
2008-01-01,Ferrari,Automotive,3527
2008-01-01,Armani,Luxury,3526
2008-01-01,Hennessy,Alcohol,3513
2008-01-01,Marriott,Hospitality,3502
2008-01-01,Shell,Energy,3471
2008-01-01,Nivea,FMCG,3401
2008-01-01,FedEx,Logistics,3359
2008-01-01,Visa,Financial Services,3338
2009-01-01,Coca-Cola,Beverages,68734
2009-01-01,IBM,Business Services,60211
2009-01-01,Microsoft,Technology,56647
2009-01-01,GE,Diversified,47777
2009-01-01,Nokia,Technology,34864
2009-01-01,McDonald's,Restaurants,32275
2009-01-01,Google,Technology,31980
2009-01-01,Toyota,Automotive,31330
2009-01-01,Intel,Technology,30636
2009-01-01,Disney,Media,28447
2009-01-01,HP,Electronics,24096
2009-01-01,Mercedes-Benz,Automotive,23867
2009-01-01,Gillette,FMCG,22841
2009-01-01,Cisco,Business Services,22030
2009-01-01,BMW,Automotive,21671
2009-01-01,Louis Vuitton,Luxury,21120
2009-01-01,Marlboro,Tobacco,19010
2009-01-01,Honda,Automotive,17803
2009-01-01,Samsung,Technology,17518
2009-01-01,Apple,Technology,15433
2009-01-01,H&M,Apparel,15375
2009-01-01,American Express,Financial Services,14971
2009-01-01,Pepsi,Beverages,13706
2009-01-01,Oracle,Business Services,13699
2009-01-01,NESCAFÉ,Beverages,13317
2009-01-01,Nike,Sporting Goods,13179
2009-01-01,SAP,Business Services,12106
2009-01-01,IKEA,Retail,12004
2009-01-01,Sony,Electronics,11953
2009-01-01,Budweiser,Alcohol,11833
2009-01-01,UPS,Logistics,11594
2009-01-01,HSBC,Financial Services,10510
2009-01-01,Canon,Electronics,10441
2009-01-01,Kellogg's,FMCG,10428
2009-01-01,Dell,Electronics,10291
2009-01-01,Citi,Financial Services,10254
2009-01-01,J.P. Morgan,Financial Services,9550
2009-01-01,Goldman Sachs,Financial Services,9248
2009-01-01,Nintendo,Electronics,9210
2009-01-01,Thomson Reuters,Media,8434
2009-01-01,Gucci,Luxury,8182
2009-01-01,Philips,Electronics,8121
2009-01-01,Amazon,Technology,7858
2009-01-01,L'Oréal,FMCG,7748
2009-01-01,Accenture,Business Services,7710
2009-01-01,eBay,Retail,7350
2009-01-01,Siemens,Diversified,7308
2009-01-01,Heinz,FMCG,7244
2009-01-01,Ford,Automotive,7005
2009-01-01,Zara,Apparel,6789
2009-01-01,Wrigley,FMCG,6731
2009-01-01,Colgate,FMCG,6550
2009-01-01,AXA,Financial Services,6525
2009-01-01,MTV,Media,6523
2009-01-01,Volkswagen,Automotive,6484
2009-01-01,Xerox,Business Services,6431
2009-01-01,Morgan Stanley,Financial Services,6399
2009-01-01,Nestlé,FMCG,6319
2009-01-01,Chanel,Luxury,6040
2009-01-01,Danone,FMCG,5960
2009-01-01,KFC,Restaurants,5722
2009-01-01,adidas,Sporting Goods,5397
2009-01-01,BlackBerry,Electronics,5138
2009-01-01,Yahoo!,Media,5111
2009-01-01,Audi,Automotive,5010
2009-01-01,Caterpillar,Diversified,5004
2009-01-01,Avon,FMCG,4917
2009-01-01,Rolex,Luxury,4609
2009-01-01,Hyundai,Automotive,4604
2009-01-01,Hermès,Luxury,4598
2009-01-01,Kleenex,FMCG,4404
2009-01-01,UBS,Financial Services,4370
2009-01-01,Harley-Davidson,Automotive,4337
2009-01-01,Porsche,Automotive,4234
2009-01-01,Panasonic,Electronics,4225
2009-01-01,Tiffany & Co.,Luxury,4000
2009-01-01,Cartier,Luxury,3968
2009-01-01,Gap,Apparel,3922
2009-01-01,Pizza Hut,Restaurants,3876
2009-01-01,Johnson & Johnson,FMCG,3847
2009-01-01,Allianz,Financial Services,3831
2009-01-01,Moët & Chandon,Alcohol,3754
2009-01-01,BP,Energy,3716
2009-01-01,Smirnoff,Alcohol,3698
2009-01-01,Duracell,FMCG,3563
2009-01-01,Nivea,FMCG,3557
2009-01-01,Prada,Luxury,3530
2009-01-01,Ferrari,Automotive,3527
2009-01-01,Armani,Luxury,3303
2009-01-01,Starbucks,Restaurants,3263
2009-01-01,Lancôme,FMCG,3235
2009-01-01,Shell,Energy,3228
2009-01-01,Burger King,Restaurants,3223
2009-01-01,Visa,Financial Services,3170
2009-01-01,Adobe,Business Services,3161
2009-01-01,Lexus,Automotive,3158
2009-01-01,Puma,Sporting Goods,3154
2009-01-01,Burberry,Luxury,3095
2009-01-01,Ralph Lauren,Apparel,3094
2009-01-01,Campbell's,FMCG,3081
2010-01-01,Coca-Cola,Beverages,70452
2010-01-01,IBM,Business Services,64727
2010-01-01,Microsoft,Technology,60895
2010-01-01,Google,Technology,43557
2010-01-01,GE,Diversified,42808
2010-01-01,McDonald's,Restaurants,33578
2010-01-01,Intel,Technology,32015
2010-01-01,Nokia,Technology,29495
2010-01-01,Disney,Media,28731
2010-01-01,HP,Electronics,26867
2010-01-01,Toyota,Automotive,26192
2010-01-01,Mercedes-Benz,Automotive,25179
2010-01-01,Gillette,FMCG,23298
2010-01-01,Cisco,Business Services,23219
2010-01-01,BMW,Automotive,22322
2010-01-01,Louis Vuitton,Luxury,21860
2010-01-01,Apple,Technology,21143
2010-01-01,Marlboro,Tobacco,19961
2010-01-01,Samsung,Technology,19491
2010-01-01,Honda,Automotive,18506
2010-01-01,H&M,Apparel,16136
2010-01-01,Oracle,Business Services,14881
2010-01-01,Pepsi,Beverages,14061
2010-01-01,American Express,Financial Services,13944
2010-01-01,Nike,Sporting Goods,13706
2010-01-01,SAP,Business Services,12756
2010-01-01,NESCAFÉ,Beverages,12753
2010-01-01,IKEA,Retail,12487
2010-01-01,J.P. Morgan,Financial Services,12314
2010-01-01,Budweiser,Alcohol,12252
2010-01-01,UPS,Logistics,11826
2010-01-01,HSBC,Financial Services,11561
2010-01-01,Canon,Electronics,11485
2010-01-01,Sony,Electronics,11356
2010-01-01,Kellogg's,FMCG,11041
2010-01-01,Amazon,Technology,9665
2010-01-01,Goldman Sachs,Financial Services,9372
2010-01-01,Nintendo,Electronics,8990
2010-01-01,Thomson Reuters,Media,8976
2010-01-01,Citi,Financial Services,8887
2010-01-01,Dell,Electronics,8880
2010-01-01,Philips,Electronics,8696
2010-01-01,eBay,Retail,8453
2010-01-01,Gucci,Luxury,8346
2010-01-01,L'Oréal,FMCG,7981
2010-01-01,Heinz,FMCG,7534
2010-01-01,Accenture,Business Services,7481
2010-01-01,Zara,Apparel,7468
2010-01-01,Siemens,Diversified,7315
2010-01-01,Ford,Automotive,7195
2010-01-01,Colgate,FMCG,6919
2010-01-01,Morgan Stanley,Financial Services,6911
2010-01-01,Volkswagen,Automotive,6892
2010-01-01,BlackBerry,Electronics,6762
2010-01-01,MTV,Media,6719
2010-01-01,AXA,Financial Services,6694
2010-01-01,Nestlé,FMCG,6548
2010-01-01,Danone,FMCG,6363
2010-01-01,Xerox,Business Services,6109
2010-01-01,KFC,Restaurants,5844
2010-01-01,Sprite,Beverages,5777
2010-01-01,adidas,Sporting Goods,5495
2010-01-01,Audi,Automotive,5461
2010-01-01,Avon,FMCG,5072
2010-01-01,Hyundai,Automotive,5033
2010-01-01,Yahoo!,Media,4958
2010-01-01,Allianz,Financial Services,4904
2010-01-01,Banco Santander,Financial Services,4846
2010-01-01,Hermès,Luxury,4782
2010-01-01,Caterpillar,Diversified,4704
2010-01-01,Kleenex,FMCG,4536
2010-01-01,Porsche,Automotive,4404
2010-01-01,Panasonic,Electronics,4351
2010-01-01,BARCLAYS,Financial Services,4218
2010-01-01,Johnson & Johnson,FMCG,4155
2010-01-01,Tiffany & Co.,Luxury,4127
2010-01-01,Cartier,Luxury,4052
2010-01-01,Jack Daniel's,Alcohol,4036
2010-01-01,Moët & Chandon,Alcohol,4021
2010-01-01,Credit Suisse,Financial Services,4010
2010-01-01,Shell,Energy,4003
2010-01-01,Visa,Financial Services,3998
2010-01-01,Pizza Hut,Restaurants,3973
2010-01-01,Gap,Apparel,3961
2010-01-01,Corona,Alcohol,3847
2010-01-01,UBS,Financial Services,3812
2010-01-01,Nivea,FMCG,3734
2010-01-01,Adobe,Business Services,3626
2010-01-01,Smirnoff,Alcohol,3624
2010-01-01,3M,Diversified,3586
2010-01-01,Ferrari,Automotive,3562
2010-01-01,Johnnie Walker,Alcohol,3557
2010-01-01,Heineken,Alcohol,3516
2010-01-01,ZURICH,Financial Services,3496
2010-01-01,Armani,Luxury,3443
2010-01-01,Lancôme,FMCG,3403
2010-01-01,Starbucks,Restaurants,3339
2010-01-01,Harley-Davidson,Automotive,3281
2010-01-01,Campbell's,FMCG,3241
2010-01-01,Burberry,Luxury,3110
2011-01-01,Coca-Cola,Beverages,71861
2011-01-01,IBM,Business Services,69905
2011-01-01,Microsoft,Technology,59087
2011-01-01,Google,Technology,55317
2011-01-01,GE,Diversified,42808
2011-01-01,McDonald's,Restaurants,35593
2011-01-01,Intel,Technology,35217
2011-01-01,Apple,Technology,33492
2011-01-01,Disney,Media,29018
2011-01-01,HP,Electronics,28479
2011-01-01,Toyota,Automotive,27764
2011-01-01,Mercedes-Benz,Automotive,27445
2011-01-01,Cisco,Business Services,25309
2011-01-01,Nokia,Technology,25071
2011-01-01,BMW,Automotive,24554
2011-01-01,Gillette,FMCG,23997
2011-01-01,Samsung,Technology,23430
2011-01-01,Louis Vuitton,Luxury,23172
2011-01-01,Honda,Automotive,19431
2011-01-01,Oracle,Business Services,17262
2011-01-01,H&M,Apparel,16459
2011-01-01,Pepsi,Beverages,14590
2011-01-01,American Express,Financial Services,14572
2011-01-01,SAP,Business Services,14542
2011-01-01,Nike,Sporting Goods,14528
2011-01-01,Amazon,Technology,12758
2011-01-01,UPS,Logistics,12536
2011-01-01,J.P. Morgan,Financial Services,12437
2011-01-01,Budweiser,Alcohol,12252
2011-01-01,NESCAFÉ,Beverages,12115
2011-01-01,IKEA,Retail,11863
2011-01-01,HSBC,Financial Services,11792
2011-01-01,Canon,Electronics,11715
2011-01-01,Kellogg's,FMCG,11372
2011-01-01,Sony,Electronics,9880
2011-01-01,eBay,Retail,9805
2011-01-01,Thomson Reuters,Media,9515
2011-01-01,Goldman Sachs,Financial Services,9091
2011-01-01,Gucci,Luxury,8763
2011-01-01,L'Oréal,FMCG,8699
2011-01-01,Philips,Electronics,8658
2011-01-01,Citi,Financial Services,8620
2011-01-01,Dell,Electronics,8347
2011-01-01,Zara,Apparel,8065
2011-01-01,Accenture,Business Services,8005
2011-01-01,Siemens,Diversified,7900
2011-01-01,Volkswagen,Automotive,7857
2011-01-01,Nintendo,Electronics,7731
2011-01-01,Heinz,FMCG,7609
2011-01-01,Ford,Automotive,7483
2011-01-01,Colgate,FMCG,7127
2011-01-01,Danone,FMCG,6936
2011-01-01,AXA,Financial Services,6694
2011-01-01,Morgan Stanley,Financial Services,6634
2011-01-01,Nestlé,FMCG,6613
2011-01-01,BlackBerry,Electronics,6424
2011-01-01,Xerox,Business Services,6414
2011-01-01,MTV,Media,6383
2011-01-01,Audi,Automotive,6171
2011-01-01,adidas,Sporting Goods,6154
2011-01-01,Hyundai,Automotive,6005
2011-01-01,KFC,Restaurants,5902
2011-01-01,Sprite,Beverages,5604
2011-01-01,Caterpillar,Diversified,5598
2011-01-01,Avon,FMCG,5376
2011-01-01,Hermès,Luxury,5356
2011-01-01,Allianz,Financial Services,5345
2011-01-01,Banco Santander,Financial Services,5088
2011-01-01,Panasonic,Electronics,5047
2011-01-01,Cartier,Luxury,4781
2011-01-01,Kleenex,FMCG,4672
2011-01-01,Porsche,Automotive,4580
2011-01-01,Tiffany & Co.,Luxury,4498
2011-01-01,Shell,Energy,4483
2011-01-01,Visa,Financial Services,4478
2011-01-01,Yahoo!,Media,4413
2011-01-01,Moët & Chandon,Alcohol,4383
2011-01-01,Jack Daniel's,Alcohol,4319
2011-01-01,BARCLAYS,Financial Services,4259
2011-01-01,Adobe,Business Services,4170
2011-01-01,Pizza Hut,Restaurants,4092
2011-01-01,Credit Suisse,Financial Services,4090
2011-01-01,Johnson & Johnson,FMCG,4072
2011-01-01,Gap,Apparel,4040
2011-01-01,3M,Diversified,3945
2011-01-01,Corona,Alcohol,3924
2011-01-01,Nivea,FMCG,3883
2011-01-01,Johnnie Walker,Alcohol,3842
2011-01-01,Smirnoff,Alcohol,3841
2011-01-01,Nissan,Automotive,3819
2011-01-01,Heineken,Alcohol,3809
2011-01-01,UBS,Financial Services,3799
2011-01-01,Armani,Luxury,3794
2011-01-01,ZURICH,Financial Services,3769
2011-01-01,Burberry,Luxury,3732
2011-01-01,Starbucks,Restaurants,3663
2011-01-01,John Deere,Diversified,3651
2011-01-01,HTC,Electronics,3605
2011-01-01,Ferrari,Automotive,3591
2011-01-01,Harley-Davidson,Automotive,3512
2012-01-01,Coca-Cola,Beverages,77839
2012-01-01,Apple,Technology,76568
2012-01-01,IBM,Business Services,75532
2012-01-01,Google,Technology,69726
2012-01-01,Microsoft,Technology,57853
2012-01-01,GE,Diversified,43682
2012-01-01,McDonald's,Restaurants,40062
2012-01-01,Intel,Technology,39385
2012-01-01,Samsung,Technology,32893
2012-01-01,Toyota,Automotive,30280
2012-01-01,Mercedes-Benz,Automotive,30097
2012-01-01,BMW,Automotive,29052
2012-01-01,Disney,Media,27438
2012-01-01,Cisco,Business Services,27197
2012-01-01,HP,Electronics,26087
2012-01-01,Gillette,FMCG,24898
2012-01-01,Louis Vuitton,Luxury,23577
2012-01-01,Oracle,Business Services,22126
2012-01-01,Nokia,Technology,21009
2012-01-01,Amazon,Technology,18625
2012-01-01,Honda,Automotive,17280
2012-01-01,Pepsi,Beverages,16594
2012-01-01,H&M,Apparel,16571
2012-01-01,American Express,Financial Services,15702
2012-01-01,SAP,Business Services,15641
2012-01-01,Nike,Sporting Goods,15126
2012-01-01,UPS,Logistics,13088
2012-01-01,IKEA,Retail,12808
2012-01-01,Kellogg's,FMCG,12068
2012-01-01,Canon,Electronics,12029
2012-01-01,Budweiser,Alcohol,11872
2012-01-01,J.P. Morgan,Financial Services,11471
2012-01-01,HSBC,Financial Services,11378
2012-01-01,Pampers,FMCG,11296
2012-01-01,NESCAFÉ,Beverages,11089
2012-01-01,eBay,Retail,10947
2012-01-01,Zara,Apparel,9488
2012-01-01,Gucci,Luxury,9446
2012-01-01,Volkswagen,Automotive,9252
2012-01-01,Sony,Electronics,9111
2012-01-01,Philips,Electronics,9066
2012-01-01,L'Oréal,FMCG,8821
2012-01-01,Accenture,Business Services,8745
2012-01-01,Thomson Reuters,Media,8444
2012-01-01,Ford,Automotive,7958
2012-01-01,Heinz,FMCG,7722
2012-01-01,Colgate,FMCG,7643
2012-01-01,Goldman Sachs,Financial Services,7599
2012-01-01,Dell,Electronics,7591
2012-01-01,Citi,Financial Services,7570
2012-01-01,Siemens,Diversified,7534
2012-01-01,Danone,FMCG,7498
2012-01-01,Hyundai,Automotive,7473
2012-01-01,Morgan Stanley,Financial Services,7218
2012-01-01,Audi,Automotive,7196
2012-01-01,Nintendo,Electronics,7082
2012-01-01,Nestlé,FMCG,6916
2012-01-01,AXA,Financial Services,6748
2012-01-01,Xerox,Business Services,6714
2012-01-01,adidas,Sporting Goods,6699
2012-01-01,Caterpillar,Diversified,6306
2012-01-01,Allianz,Financial Services,6184
2012-01-01,Hermès,Luxury,6182
2012-01-01,KFC,Restaurants,5994
2012-01-01,Panasonic,Electronics,5765
2012-01-01,Sprite,Beverages,5709
2012-01-01,MTV,Media,5648
2012-01-01,Cartier,Luxury,5495
2012-01-01,Facebook,Technology,5421
2012-01-01,Tiffany & Co.,Luxury,5159
2012-01-01,Avon,FMCG,5151
2012-01-01,Porsche,Automotive,5149
2012-01-01,Nissan,Automotive,4969
2012-01-01,Visa,Financial Services,4944
2012-01-01,Shell,Energy,4788
2012-01-01,Banco Santander,Financial Services,4771
2012-01-01,3M,Diversified,4656
2012-01-01,Adobe,Business Services,4557
2012-01-01,Johnson & Johnson,FMCG,4378
2012-01-01,Kleenex,FMCG,4360
2012-01-01,Jack Daniel's,Alcohol,4352
2012-01-01,Burberry,Luxury,4342
2012-01-01,Johnnie Walker,Alcohol,4301
2012-01-01,Prada,Luxury,4271
2012-01-01,John Deere,Diversified,4221
2012-01-01,Pizza Hut,Restaurants,4193
2012-01-01,Kia,Automotive,4089
2012-01-01,Starbucks,Restaurants,4062
2012-01-01,Corona,Alcohol,4061
2012-01-01,Smirnoff,Alcohol,4050
2012-01-01,Ralph Lauren,Apparel,4038
2012-01-01,Heineken,Alcohol,3939
2012-01-01,BlackBerry,Electronics,3922
2012-01-01,Mastercard,Financial Services,3896
2012-01-01,Credit Suisse,Financial Services,3866
2012-01-01,Harley-Davidson,Automotive,3857
2012-01-01,Yahoo!,Media,3851
2012-01-01,Moët & Chandon,Alcohol,3824
2012-01-01,Ferrari,Automotive,3770
2012-01-01,Gap,Apparel,3731
2013-01-01,Apple,Technology,98316
2013-01-01,Google,Technology,93291
2013-01-01,Coca-Cola,Beverages,79213
2013-01-01,IBM,Business Services,78808
2013-01-01,Microsoft,Technology,59546
2013-01-01,GE,Diversified,46947
2013-01-01,McDonald's,Restaurants,41992
2013-01-01,Samsung,Technology,39610
2013-01-01,Intel,Technology,37257
2013-01-01,Toyota,Automotive,35346
2013-01-01,Mercedes-Benz,Automotive,31904
2013-01-01,BMW,Automotive,31839
2013-01-01,Cisco,Business Services,29053
2013-01-01,Disney,Media,28147
2013-01-01,HP,Electronics,25843
2013-01-01,Gillette,FMCG,25105
2013-01-01,Louis Vuitton,Luxury,24893
2013-01-01,Oracle,Business Services,24088
2013-01-01,Amazon,Technology,23620
2013-01-01,Honda,Automotive,18490
2013-01-01,H&M,Apparel,18168
2013-01-01,Pepsi,Beverages,17892
2013-01-01,American Express,Financial Services,17646
2013-01-01,Nike,Sporting Goods,17085
2013-01-01,SAP,Business Services,16676
2013-01-01,IKEA,Retail,13818
2013-01-01,UPS,Logistics,13763
2013-01-01,eBay,Retail,13162
2013-01-01,Pampers,FMCG,13035
2013-01-01,Kellogg's,FMCG,12987
2013-01-01,Budweiser,Alcohol,12614
2013-01-01,HSBC,Financial Services,12183
2013-01-01,J.P. Morgan,Financial Services,11456
2013-01-01,Volkswagen,Automotive,11120
2013-01-01,Canon,Electronics,10989
2013-01-01,Zara,Apparel,10821
2013-01-01,NESCAFÉ,Beverages,10651
2013-01-01,Gucci,Luxury,10151
2013-01-01,L'Oréal,FMCG,9874
2013-01-01,Philips,Electronics,9813
2013-01-01,Accenture,Business Services,9471
2013-01-01,Ford,Automotive,9181
2013-01-01,Hyundai,Automotive,9004
2013-01-01,Goldman Sachs,Financial Services,8536
2013-01-01,Siemens,Diversified,8503
2013-01-01,Sony,Electronics,8408
2013-01-01,Thomson Reuters,Media,8103
2013-01-01,Citi,Financial Services,7973
2013-01-01,Danone,FMCG,7968
2013-01-01,Colgate,FMCG,7833
2013-01-01,Audi,Automotive,7767
2013-01-01,Facebook,Technology,7732
2013-01-01,Heinz,FMCG,7648
2013-01-01,Hermès,Luxury,7616
2013-01-01,adidas,Sporting Goods,7535
2013-01-01,Nestlé,FMCG,7527
2013-01-01,Nokia,Technology,7444
2013-01-01,Caterpillar,Diversified,7125
2013-01-01,AXA,Financial Services,7096
2013-01-01,Cartier,Luxury,6897
2013-01-01,Dell,Electronics,6845
2013-01-01,Xerox,Business Services,6779
2013-01-01,Allianz,Financial Services,6710
2013-01-01,Porsche,Automotive,6471
2013-01-01,Nissan,Automotive,6203
2013-01-01,KFC,Restaurants,6192
2013-01-01,Nintendo,Electronics,6086
2013-01-01,Panasonic,Electronics,5821
2013-01-01,Sprite,Beverages,5811
2013-01-01,Discovery,Media,5756
2013-01-01,Morgan Stanley,Financial Services,5724
2013-01-01,Prada,Luxury,5570
2013-01-01,Shell,Energy,5535
2013-01-01,Visa,Financial Services,5465
2013-01-01,Tiffany & Co.,Luxury,5440
2013-01-01,3M,Diversified,5413
2013-01-01,Burberry,Luxury,5189
2013-01-01,MTV,Media,4980
2013-01-01,Adobe,Business Services,4899
2013-01-01,John Deere,Diversified,4865
2013-01-01,Johnson & Johnson,FMCG,4777
2013-01-01,Johnnie Walker,Alcohol,4745
2013-01-01,Kia,Automotive,4708
2013-01-01,Banco Santander,Financial Services,4660
2013-01-01,Duracell,FMCG,4645
2013-01-01,Jack Daniel's,Alcohol,4642
2013-01-01,Avon,FMCG,4610
2013-01-01,Ralph Lauren,Apparel,4584
2013-01-01,Chevrolet,Automotive,4578
2013-01-01,Kleenex,FMCG,4428
2013-01-01,Starbucks,Restaurants,4399
2013-01-01,Heineken,Alcohol,4331
2013-01-01,Corona,Alcohol,4276
2013-01-01,Pizza Hut,Restaurants,4269
2013-01-01,Smirnoff,Alcohol,4262
2013-01-01,Harley-Davidson,Automotive,4230
2013-01-01,Mastercard,Financial Services,4206
2013-01-01,Ferrari,Automotive,4013
2013-01-01,Moët & Chandon,Alcohol,3943
2013-01-01,Gap,Apparel,3920
2014-01-01,Apple,Technology,118863
2014-01-01,Google,Technology,107439
2014-01-01,Coca-Cola,Beverages,81563
2014-01-01,IBM,Business Services,72244
2014-01-01,Microsoft,Technology,61154
2014-01-01,GE,Diversified,45480
2014-01-01,Samsung,Technology,45462
2014-01-01,Toyota,Automotive,42392
2014-01-01,McDonald's,Restaurants,42254
2014-01-01,Mercedes-Benz,Automotive,34338
2014-01-01,BMW,Automotive,34214
2014-01-01,Intel,Technology,34153
2014-01-01,Disney,Media,32223
2014-01-01,Cisco,Business Services,30936
2014-01-01,Amazon,Technology,29478
2014-01-01,Oracle,Business Services,25980
2014-01-01,HP,Electronics,23758
2014-01-01,Gillette,FMCG,22845
2014-01-01,Louis Vuitton,Luxury,22552
2014-01-01,Honda,Automotive,21673
2014-01-01,H&M,Apparel,21083
2014-01-01,Nike,Sporting Goods,19875
2014-01-01,American Express,Financial Services,19510
2014-01-01,Pepsi,Beverages,19119
2014-01-01,SAP,Business Services,17340
2014-01-01,IKEA,Retail,15885
2014-01-01,UPS,Logistics,14470
2014-01-01,eBay,Retail,14358
2014-01-01,Facebook,Technology,14349
2014-01-01,Pampers,FMCG,14078
2014-01-01,Volkswagen,Automotive,13716
2014-01-01,Kellogg's,FMCG,13442
2014-01-01,HSBC,Financial Services,13142
2014-01-01,Budweiser,Alcohol,13024
2014-01-01,J.P. Morgan,Financial Services,12456
2014-01-01,Zara,Apparel,12126
2014-01-01,Canon,Electronics,11702
2014-01-01,NESCAFÉ,Beverages,11406
2014-01-01,Ford,Automotive,10876
2014-01-01,Hyundai,Automotive,10409
2014-01-01,Gucci,Luxury,10385
2014-01-01,Philips,Electronics,10264
2014-01-01,L'Oréal,FMCG,10162
2014-01-01,Accenture,Business Services,9882
2014-01-01,Audi,Automotive,9831
2014-01-01,Hermès,Luxury,8977
2014-01-01,Goldman Sachs,Financial Services,8758
2014-01-01,Citi,Financial Services,8737
2014-01-01,Siemens,Diversified,8672
2014-01-01,Colgate,FMCG,8215
2014-01-01,Danone,FMCG,8205
2014-01-01,Sony,Electronics,8133
2014-01-01,AXA,Financial Services,8120
2014-01-01,Nestlé,FMCG,8000
2014-01-01,Allianz,Financial Services,7702
2014-01-01,Nissan,Automotive,7623
2014-01-01,Thomson Reuters,Media,7472
2014-01-01,Cartier,Luxury,7449
2014-01-01,adidas,Sporting Goods,7378
2014-01-01,Porsche,Automotive,7171
2014-01-01,Caterpillar,Diversified,6812
2014-01-01,Xerox,Business Services,6641
2014-01-01,Morgan Stanley,Financial Services,6334
2014-01-01,Panasonic,Electronics,6303
2014-01-01,Shell,Energy,6288
2014-01-01,3M,Diversified,6177
2014-01-01,Discovery,Media,6143
2014-01-01,KFC,Restaurants,6059
2014-01-01,Visa,Financial Services,5998
2014-01-01,Prada,Luxury,5977
2014-01-01,Tiffany & Co.,Luxury,5936
2014-01-01,Sprite,Beverages,5646
2014-01-01,Burberry,Luxury,5594
2014-01-01,Kia,Automotive,5396
2014-01-01,Banco Santander,Financial Services,5382
2014-01-01,Starbucks,Restaurants,5382
2014-01-01,Adobe,Business Services,5333
2014-01-01,Johnson & Johnson,FMCG,5194
2014-01-01,John Deere,Diversified,5124
2014-01-01,MTV,Media,5102
2014-01-01,DHL,Logistics,5084
2014-01-01,Chevrolet,Automotive,5036
2014-01-01,Ralph Lauren,Apparel,4979
2014-01-01,Duracell,FMCG,4935
2014-01-01,Jack Daniel's,Alcohol,4884
2014-01-01,Johnnie Walker,Alcohol,4842
2014-01-01,Harley-Davidson,Automotive,4772
2014-01-01,Mastercard,Financial Services,4758
2014-01-01,Kleenex,FMCG,4643
2014-01-01,Smirnoff,Alcohol,4609
2014-01-01,Land Rover,Automotive,4473
2014-01-01,FedEx,Logistics,4414
2014-01-01,Corona,Alcohol,4387
2014-01-01,Huawei,Technology,4313
2014-01-01,Heineken,Alcohol,4221
2014-01-01,Pizza Hut,Restaurants,4196
2014-01-01,Hugo Boss,Apparel,4143
2014-01-01,Nokia,Technology,4138
2014-01-01,Gap,Apparel,4122
2014-01-01,Nintendo,Electronics,4103
2015-01-01,Apple,Technology,170276
2015-01-01,Google,Technology,120314
2015-01-01,Coca-Cola,Beverages,78423
2015-01-01,Microsoft,Technology,67670
2015-01-01,IBM,Business Services,65095
2015-01-01,Toyota,Automotive,49048
2015-01-01,Samsung,Technology,45297
2015-01-01,GE,Diversified,42267
2015-01-01,McDonald's,Restaurants,39809
2015-01-01,Amazon,Technology,37948
2015-01-01,BMW,Automotive,37212
2015-01-01,Mercedes-Benz,Automotive,36711
2015-01-01,Disney,Media,36514
2015-01-01,Intel,Technology,35415
2015-01-01,Cisco,Business Services,29854
2015-01-01,Oracle,Business Services,27283
2015-01-01,Nike,Sporting Goods,23070
2015-01-01,HP,Electronics,23056
2015-01-01,Honda,Automotive,22975
2015-01-01,Louis Vuitton,Luxury,22250
2015-01-01,H&M,Apparel,22222
2015-01-01,Gillette,FMCG,22218
2015-01-01,Facebook,Technology,22029
2015-01-01,Pepsi,Beverages,19622
2015-01-01,American Express,Financial Services,18922
2015-01-01,SAP,Business Services,18768
2015-01-01,IKEA,Retail,16541
2015-01-01,Pampers,FMCG,15267
2015-01-01,UPS,Logistics,14723
2015-01-01,Zara,Apparel,14031
2015-01-01,Budweiser,Alcohol,13943
2015-01-01,eBay,Retail,13940
2015-01-01,J.P. Morgan,Financial Services,13749
2015-01-01,Kellogg's,FMCG,12637
2015-01-01,Volkswagen,Automotive,12545
2015-01-01,NESCAFÉ,Beverages,12257
2015-01-01,HSBC,Financial Services,11656
2015-01-01,Ford,Automotive,11578
2015-01-01,Hyundai,Automotive,11293
2015-01-01,Canon,Electronics,11278
2015-01-01,Hermès,Luxury,10944
2015-01-01,Accenture,Business Services,10800
2015-01-01,L'Oréal,FMCG,10798
2015-01-01,Audi,Automotive,10328
2015-01-01,Citi,Financial Services,9784
2015-01-01,Goldman Sachs,Financial Services,9526
2015-01-01,Philips,Electronics,9400
2015-01-01,AXA,Financial Services,9254
2015-01-01,Nissan,Automotive,9082
2015-01-01,Gucci,Luxury,8882
2015-01-01,Danone,FMCG,8632
2015-01-01,Nestlé,FMCG,8588
2015-01-01,Siemens,Diversified,8553
2015-01-01,Allianz,Financial Services,8498
2015-01-01,Colgate,FMCG,8464
2015-01-01,Porsche,Automotive,8055
2015-01-01,Cartier,Luxury,7924
2015-01-01,Sony,Electronics,7702
2015-01-01,3M,Diversified,7243
2015-01-01,Morgan Stanley,Financial Services,7083
2015-01-01,Visa,Financial Services,6870
2015-01-01,adidas,Sporting Goods,6811
2015-01-01,Thomson Reuters,Media,6583
2015-01-01,Discovery,Media,6509
2015-01-01,Panasonic,Electronics,6436
2015-01-01,Tiffany & Co.,Luxury,6306
2015-01-01,Starbucks,Restaurants,6266
2015-01-01,Adobe,Business Services,6257
2015-01-01,Prada,Luxury,6222
2015-01-01,Banco Santander,Financial Services,6097
2015-01-01,Xerox,Business Services,6033
2015-01-01,Caterpillar,Diversified,5976
2015-01-01,Burberry,Luxury,5873
2015-01-01,Kia,Automotive,5666
2015-01-01,KFC,Restaurants,5639
2015-01-01,Mastercard,Financial Services,5551
2015-01-01,Johnson & Johnson,FMCG,5533
2015-01-01,Shell,Energy,5530
2015-01-01,Harley-Davidson,Automotive,5460
2015-01-01,DHL,Logistics,5391
2015-01-01,Sprite,Beverages,5365
2015-01-01,LEGO,FMCG,5362
2015-01-01,John Deere,Diversified,5208
2015-01-01,Jack Daniel's,Alcohol,5161
2015-01-01,Chevrolet,Automotive,5133
2015-01-01,FedEx,Logistics,5130
2015-01-01,Land Rover,Automotive,5109
2015-01-01,Huawei,Technology,4952
2015-01-01,Heineken,Alcohol,4822
2015-01-01,MTV,Media,4763
2015-01-01,Ralph Lauren,Apparel,4629
2015-01-01,Johnnie Walker,Alcohol,4540
2015-01-01,Corona,Alcohol,4456
2015-01-01,Smirnoff,Alcohol,4407
2015-01-01,Kleenex,FMCG,4330
2015-01-01,Hugo Boss,Apparel,4270
2015-01-01,PayPal,Financial Services,4251
2015-01-01,MINI,Automotive,4243
2015-01-01,Moët & Chandon,Alcohol,4131
2015-01-01,Lenovo,Technology,4114
2016-01-01,Apple,Technology,178119
2016-01-01,Google,Technology,133252
2016-01-01,Coca-Cola,Beverages,73102
2016-01-01,Microsoft,Technology,72795
2016-01-01,Toyota,Automotive,53580
2016-01-01,IBM,Business Services,52500
2016-01-01,Samsung,Technology,51808
2016-01-01,Amazon,Technology,50338
2016-01-01,Mercedes-Benz,Automotive,43490
2016-01-01,GE,Diversified,43130
2016-01-01,BMW,Automotive,41535
2016-01-01,McDonald's,Restaurants,39381
2016-01-01,Disney,Media,38790
2016-01-01,Intel,Technology,36952
2016-01-01,Facebook,Technology,32593
2016-01-01,Cisco,Business Services,30948
2016-01-01,Oracle,Business Services,26552
2016-01-01,Nike,Sporting Goods,25034
2016-01-01,Louis Vuitton,Luxury,23998
2016-01-01,H&M,Apparel,22681
2016-01-01,Honda,Automotive,22106
2016-01-01,SAP,Business Services,21293
2016-01-01,Pepsi,Beverages,20265
2016-01-01,Gillette,FMCG,19950
2016-01-01,American Express,Financial Services,18358
2016-01-01,IKEA,Retail,17834
2016-01-01,Zara,Apparel,16766
2016-01-01,Pampers,FMCG,16134
2016-01-01,UPS,Logistics,15333
2016-01-01,Budweiser,Alcohol,15099
2016-01-01,J.P. Morgan,Financial Services,14227
2016-01-01,eBay,Retail,13136
2016-01-01,Ford,Automotive,12962
2016-01-01,Hermès,Luxury,12833
2016-01-01,Hyundai,Automotive,12547
2016-01-01,NESCAFÉ,Beverages,12517
2016-01-01,Accenture,Business Services,12033
2016-01-01,Audi,Automotive,11799
2016-01-01,Kellogg's,FMCG,11711
2016-01-01,Volkswagen,Automotive,11436
2016-01-01,Philips,Electronics,11336
2016-01-01,Canon,Electronics,11081
2016-01-01,Nissan,Automotive,11066
2016-01-01,Hewlett Packard Enterprise,Business Services,11027
2016-01-01,L'Oréal,FMCG,10930
2016-01-01,AXA,Financial Services,10579
2016-01-01,HSBC,Financial Services,10458
2016-01-01,HP,Electronics,10386
2016-01-01,Citi,Financial Services,10276
2016-01-01,Porsche,Automotive,9537
2016-01-01,Allianz,Financial Services,9528
2016-01-01,Siemens,Diversified,9415
2016-01-01,Gucci,Luxury,9385
2016-01-01,Goldman Sachs,Financial Services,9378
2016-01-01,Danone,FMCG,9197
2016-01-01,Nestlé,FMCG,8708
2016-01-01,Colgate,FMCG,8413
2016-01-01,Sony,Electronics,8315
2016-01-01,3M,Diversified,8199
2016-01-01,adidas,Sporting Goods,7885
2016-01-01,Visa,Financial Services,7747
2016-01-01,Cartier,Luxury,7738
2016-01-01,Adobe,Business Services,7586
2016-01-01,Starbucks,Restaurants,7490
2016-01-01,Morgan Stanley,Financial Services,7200
2016-01-01,Thomson Reuters,Media,6830
2016-01-01,LEGO,FMCG,6691
2016-01-01,Panasonic,Electronics,6365
2016-01-01,Kia,Automotive,6326
2016-01-01,Banco Santander,Financial Services,6223
2016-01-01,Discovery,Media,5944
2016-01-01,Huawei,Technology,5835
2016-01-01,Johnson & Johnson,FMCG,5790
2016-01-01,Tiffany & Co.,Luxury,5761
2016-01-01,KFC,Restaurants,5742
2016-01-01,Mastercard,Financial Services,5736
2016-01-01,DHL,Logistics,5708
2016-01-01,Land Rover,Automotive,5696
2016-01-01,FedEx,Logistics,5579
2016-01-01,Harley-Davidson,Automotive,5527
2016-01-01,Prada,Luxury,5504
2016-01-01,Caterpillar,Diversified,5425
2016-01-01,Burberry,Luxury,5362
2016-01-01,Xerox,Business Services,5290
2016-01-01,Jack Daniel's,Alcohol,5193
2016-01-01,Sprite,Beverages,5148
2016-01-01,Heineken,Alcohol,5123
2016-01-01,MINI,Automotive,4986
2016-01-01,Dior,Luxury,4909
2016-01-01,PayPal,Financial Services,4839
2016-01-01,John Deere,Diversified,4815
2016-01-01,Shell,Energy,4599
2016-01-01,Corona,Alcohol,4509
2016-01-01,MTV,Media,4320
2016-01-01,Johnnie Walker,Alcohol,4317
2016-01-01,Smirnoff,Alcohol,4252
2016-01-01,Moët & Chandon,Alcohol,4118
2016-01-01,Ralph Lauren,Apparel,4092
2016-01-01,Lenovo,Technology,4045
2016-01-01,Tesla,Automotive,4011
2017-01-01,Apple,Technology,184154
2017-01-01,Google,Technology,141703
2017-01-01,Microsoft,Technology,79999
2017-01-01,Coca-Cola,Beverages,69733
2017-01-01,Amazon,Technology,64796
2017-01-01,Samsung,Technology,56249
2017-01-01,Toyota,Automotive,50291
2017-01-01,Facebook,Technology,48188
2017-01-01,Mercedes-Benz,Automotive,47829
2017-01-01,IBM,Business Services,46829
2017-01-01,GE,Diversified,44208
2017-01-01,McDonald's,Restaurants,41533
2017-01-01,BMW,Automotive,41521
2017-01-01,Disney,Media,40772
2017-01-01,Intel,Technology,39459
2017-01-01,Cisco,Business Services,31930
2017-01-01,Oracle,Business Services,27466
2017-01-01,Nike,Sporting Goods,27021
2017-01-01,Louis Vuitton,Luxury,22919
2017-01-01,Honda,Automotive,22696
2017-01-01,SAP,Business Services,22635
2017-01-01,Pepsi,Beverages,20491
2017-01-01,H&M,Apparel,20488
2017-01-01,Zara,Apparel,18573
2017-01-01,IKEA,Retail,18472
2017-01-01,Gillette,FMCG,18200
2017-01-01,American Express,Financial Services,17787
2017-01-01,Pampers,FMCG,16416
2017-01-01,UPS,Logistics,16387
2017-01-01,J.P. Morgan,Financial Services,15749
2017-01-01,Budweiser,Alcohol,15375
2017-01-01,Hermès,Luxury,14210
2017-01-01,Ford,Automotive,13643
2017-01-01,eBay,Retail,13224
2017-01-01,Hyundai,Automotive,13193
2017-01-01,NESCAFÉ,Beverages,12661
2017-01-01,Accenture,Business Services,12471
2017-01-01,Audi,Automotive,12023
2017-01-01,Nissan,Automotive,11534
2017-01-01,Volkswagen,Automotive,11522
2017-01-01,Philips,Electronics,11519
2017-01-01,AXA,Financial Services,11073
2017-01-01,Kellogg's,FMCG,10972
2017-01-01,Goldman Sachs,Financial Services,10864
2017-01-01,L'Oréal,FMCG,10674
2017-01-01,Citi,Financial Services,10599
2017-01-01,HSBC,Financial Services,10534
2017-01-01,Porsche,Automotive,10129
2017-01-01,Allianz,Financial Services,10059
2017-01-01,Siemens,Diversified,9982
2017-01-01,Gucci,Luxury,9969
2017-01-01,Canon,Electronics,9788
2017-01-01,HP,Electronics,9541
2017-01-01,Danone,FMCG,9322
2017-01-01,adidas,Sporting Goods,9216
2017-01-01,Adobe,Business Services,9060
2017-01-01,Hewlett Packard Enterprise,Business Services,8951
2017-01-01,3M,Diversified,8947
2017-01-01,Nestlé,FMCG,8728
2017-01-01,Starbucks,Restaurants,8704
2017-01-01,Sony,Electronics,8474
2017-01-01,Colgate,FMCG,8325
2017-01-01,Morgan Stanley,Financial Services,8205
2017-01-01,Visa,Financial Services,7815
2017-01-01,Cartier,Luxury,7547
2017-01-01,Thomson Reuters,Media,7100
2017-01-01,LEGO,FMCG,7024
2017-01-01,Banco Santander,Financial Services,6702
2017-01-01,Kia,Automotive,6683
2017-01-01,Huawei,Technology,6676
2017-01-01,Mastercard,Financial Services,6350
2017-01-01,FedEx,Logistics,6255
2017-01-01,Land Rover,Automotive,6095
2017-01-01,Johnson & Johnson,FMCG,6041
2017-01-01,Panasonic,Electronics,5983
2017-01-01,DHL,Logistics,5715
2017-01-01,Harley-Davidson,Automotive,5671
2017-01-01,Netflix,Media,5592
2017-01-01,Discovery,Media,5411
2017-01-01,PayPal,Financial Services,5408
2017-01-01,Tiffany & Co.,Luxury,5394
2017-01-01,Jack Daniel's,Alcohol,5332
2017-01-01,KFC,Restaurants,5313
2017-01-01,Salesforce.com,Business Services,5224
2017-01-01,Heineken,Alcohol,5181
2017-01-01,Burberry,Luxury,5135
2017-01-01,MINI,Automotive,5114
2017-01-01,Ferrari,Automotive,4876
2017-01-01,Caterpillar,Diversified,4868
2017-01-01,Sprite,Beverages,4842
2017-01-01,Shell,Energy,4823
2017-01-01,John Deere,Diversified,4783
2017-01-01,Corona,Alcohol,4776
2017-01-01,Prada,Luxury,4716
2017-01-01,Dior,Luxury,4587
2017-01-01,Johnnie Walker,Alcohol,4405
2017-01-01,Smirnoff,Alcohol,4288
2017-01-01,Tesla,Automotive,4009
2017-01-01,Moët & Chandon,Alcohol,4006
2017-01-01,Lenovo,Technology,4004
2018-01-01,Apple,Technology,214480
2018-01-01,Google,Technology,155506
2018-01-01,Amazon,Technology,100764
2018-01-01,Microsoft,Technology,92715
2018-01-01,Coca-Cola,Beverages,66341
2018-01-01,Samsung,Technology,59890
2018-01-01,Toyota,Automotive,53404
2018-01-01,Mercedes-Benz,Automotive,48601
2018-01-01,Facebook,Technology,45168
2018-01-01,McDonald's,Restaurants,43417
2018-01-01,Intel,Technology,43293
2018-01-01,IBM,Business Services,42972
2018-01-01,BMW,Automotive,41006
2018-01-01,Disney,Media,39874
2018-01-01,Cisco,Business Services,34575
2018-01-01,GE,Diversified,32757
2018-01-01,Nike,Sporting Goods,30120
2018-01-01,Louis Vuitton,Luxury,28152
2018-01-01,Oracle,Business Services,26133
2018-01-01,Honda,Automotive,23682
2018-01-01,SAP,Business Services,22885
2018-01-01,Pepsi,Beverages,20798
2018-01-01,Chanel,Luxury,20005
2018-01-01,American Express,Financial Services,19139
2018-01-01,Zara,Apparel,17712
2018-01-01,J.P. Morgan,Financial Services,17567
2018-01-01,IKEA,Retail,17458
2018-01-01,Gillette,FMCG,16864
2018-01-01,UPS,Logistics,16849
2018-01-01,H&M,Apparel,16826
2018-01-01,Pampers,FMCG,16617
2018-01-01,Hermès,Luxury,16372
2018-01-01,Budweiser,Alcohol,15627
2018-01-01,Accenture,Business Services,14214
2018-01-01,Ford,Automotive,13995
2018-01-01,Hyundai,Automotive,13535
2018-01-01,NESCAFÉ,Beverages,13053
2018-01-01,eBay,Retail,13017
2018-01-01,Gucci,Luxury,12942
2018-01-01,Nissan,Automotive,12213
2018-01-01,Volkswagen,Automotive,12201
2018-01-01,Audi,Automotive,12187
2018-01-01,Philips,Electronics,12104
2018-01-01,Goldman Sachs,Financial Services,11769
2018-01-01,Citi,Financial Services,11577
2018-01-01,HSBC,Financial Services,11208
2018-01-01,AXA,Financial Services,11118
2018-01-01,L'Oréal,FMCG,11102
2018-01-01,Allianz,Financial Services,10821
2018-01-01,adidas,Sporting Goods,10772
2018-01-01,Adobe,Business Services,10748
2018-01-01,Porsche,Automotive,10707
2018-01-01,Kellogg's,FMCG,10634
2018-01-01,HP,Electronics,10433
2018-01-01,Canon,Electronics,10380
2018-01-01,Siemens,Diversified,10132
2018-01-01,Starbucks,Restaurants,9615
2018-01-01,Danone,FMCG,9533
2018-01-01,Sony,Electronics,9316
2018-01-01,3M,Diversified,9104
2018-01-01,Visa,Financial Services,9021
2018-01-01,Nestlé,FMCG,8938
2018-01-01,Morgan Stanley,Financial Services,8802
2018-01-01,Colgate,FMCG,8659
2018-01-01,Hewlett Packard Enterprise,Business Services,8157
2018-01-01,Netflix,Media,8111
2018-01-01,Cartier,Luxury,7646
2018-01-01,Huawei,Technology,7578
2018-01-01,Banco Santander,Financial Services,7547
2018-01-01,Mastercard,Financial Services,7545
2018-01-01,Kia,Automotive,6925
2018-01-01,FedEx,Logistics,6890
2018-01-01,PayPal,Financial Services,6621
2018-01-01,LEGO,FMCG,6533
2018-01-01,Salesforce.com,Business Services,6432
2018-01-01,Panasonic,Electronics,6293
2018-01-01,Johnson & Johnson,FMCG,6231
2018-01-01,Land Rover,Automotive,6221
2018-01-01,DHL,Logistics,5881
2018-01-01,Ferrari,Automotive,5760
2018-01-01,Discovery,Media,5755
2018-01-01,Caterpillar,Diversified,5730
2018-01-01,Tiffany & Co.,Luxury,5642
2018-01-01,Jack Daniel's,Alcohol,5641
2018-01-01,Corona,Alcohol,5517
2018-01-01,KFC,Restaurants,5481
2018-01-01,Heineken,Alcohol,5393
2018-01-01,John Deere,Diversified,5375
2018-01-01,Shell,Energy,5276
2018-01-01,MINI,Automotive,5254
2018-01-01,Dior,Luxury,5223
2018-01-01,Spotify,Media,5176
2018-01-01,Harley-Davidson,Automotive,5161
2018-01-01,Burberry,Luxury,4989
2018-01-01,Prada,Luxury,4812
2018-01-01,Sprite,Beverages,4733
2018-01-01,Johnnie Walker,Alcohol,4731
2018-01-01,Hennessy,Alcohol,4722
2018-01-01,Nintendo,Electronics,4696
2018-01-01,Subaru,Automotive,4214
2019-01-01,Apple,Technology,234241
2019-01-01,Google,Technology,167713
2019-01-01,Amazon,Technology,125263
2019-01-01,Microsoft,Technology,108847
2019-01-01,Coca-Cola,Beverages,63365
2019-01-01,Samsung,Technology,61098
2019-01-01,Toyota,Automotive,56246
2019-01-01,Mercedes-Benz,Automotive,50832
2019-01-01,McDonald's,Restaurants,45362
2019-01-01,Disney,Media,44352
2019-01-01,BMW,Automotive,41440
2019-01-01,IBM,Business Services,40381
2019-01-01,Intel,Technology,40197
2019-01-01,Facebook,Technology,39857
2019-01-01,Cisco,Business Services,35559
2019-01-01,Nike,Sporting Goods,32376
2019-01-01,Louis Vuitton,Luxury,32223
2019-01-01,Oracle,Business Services,26288
2019-01-01,GE,Diversified,25566
2019-01-01,SAP,Business Services,25092
2019-01-01,Honda,Automotive,24422
2019-01-01,Chanel,Luxury,22134
2019-01-01,American Express,Financial Services,21629
2019-01-01,Pepsi,Beverages,20488
2019-01-01,J.P. Morgan,Financial Services,19044
2019-01-01,IKEA,Retail,18407
2019-01-01,UPS,Logistics,18072
2019-01-01,Hermès,Luxury,17920
2019-01-01,Zara,Apparel,17175
2019-01-01,H&M,Apparel,16345
2019-01-01,Accenture,Business Services,16205
2019-01-01,Budweiser,Alcohol,16018
2019-01-01,Gucci,Luxury,15949
2019-01-01,Pampers,FMCG,15773
2019-01-01,Ford,Automotive,14325
2019-01-01,Hyundai,Automotive,14156
2019-01-01,Gillette,FMCG,13753
2019-01-01,NESCAFÉ,Beverages,13605
2019-01-01,Adobe,Business Services,12937
2019-01-01,Volkswagen,Automotive,12921
2019-01-01,Citi,Financial Services,12697
2019-01-01,Audi,Automotive,12689
2019-01-01,Allianz,Financial Services,12078
2019-01-01,eBay,Retail,12010
2019-01-01,adidas,Sporting Goods,11992
2019-01-01,AXA,Financial Services,11830
2019-01-01,HSBC,Financial Services,11816
2019-01-01,Starbucks,Restaurants,11798
2019-01-01,Philips,Electronics,11661
2019-01-01,Porsche,Automotive,11652
2019-01-01,L'Oréal,FMCG,11589
2019-01-01,Nissan,Automotive,11502
2019-01-01,Goldman Sachs,Financial Services,11352
2019-01-01,HP,Electronics,10891
2019-01-01,Visa,Financial Services,10756
2019-01-01,Sony,Electronics,10514
2019-01-01,Kellogg's,FMCG,10419
2019-01-01,Siemens,Diversified,10259
2019-01-01,Danone,FMCG,9915
2019-01-01,Nestlé,FMCG,9534
2019-01-01,Canon,Electronics,9482
2019-01-01,Mastercard,Financial Services,9430
2019-01-01,Dell,Electronics,9086
2019-01-01,3M,Diversified,9035
2019-01-01,Netflix,Media,8963
2019-01-01,Colgate,FMCG,8824
2019-01-01,Banco Santander,Financial Services,8521
2019-01-01,Cartier,Luxury,8192
2019-01-01,Morgan Stanley,Financial Services,8185
2019-01-01,Salesforce.com,Business Services,8004
2019-01-01,Hewlett Packard Enterprise,Business Services,7909
2019-01-01,PayPal,Financial Services,7604
2019-01-01,FedEx,Logistics,6998
2019-01-01,Huawei,Technology,6887
2019-01-01,LEGO,FMCG,6884
2019-01-01,Caterpillar,Diversified,6791
2019-01-01,Ferrari,Automotive,6458
2019-01-01,Kia,Automotive,6428
2019-01-01,Corona,Alcohol,6369
2019-01-01,Jack Daniel's,Alcohol,6347
2019-01-01,Panasonic,Electronics,6189
2019-01-01,Dior,Luxury,6045
2019-01-01,DHL,Logistics,5987
2019-01-01,John Deere,Diversified,5883
2019-01-01,Land Rover,Automotive,5855
2019-01-01,Johnson & Johnson,FMCG,5720
2019-01-01,Uber,Technology,5714
2019-01-01,Heineken,Alcohol,5626
2019-01-01,Nintendo,Electronics,5550
2019-01-01,MINI,Automotive,5532
2019-01-01,Discovery,Media,5525
2019-01-01,Spotify,Media,5516
2019-01-01,KFC,Restaurants,5509
2019-01-01,Tiffany & Co.,Luxury,5335
2019-01-01,Hennessy,Alcohol,5297
2019-01-01,Burberry,Luxury,5205
2019-01-01,Shell,Energy,5105
2019-01-01,LinkedIn,Media,4836
2019-01-01,Harley-Davidson,Automotive,4793
2019-01-01,Prada,Luxury,4781
                                                                                                                                                                                                                                                                                                                                   ./index.js                                                                                          000644  000000  000000  00000000064 14462206250 011027  0                                                                                                    ustar 00                                                                000000  000000                                                                                                                                                                         export {default} from "./3ff9fa2c6593d814@3087.js";
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ./index.html                                                                                        000644  000000  000000  00000000555 14462206250 011364  0                                                                                                    ustar 00                                                                000000  000000                                                                                                                                                                         <!DOCTYPE html>
<meta charset="utf-8">
<title>Bar Chart Race</title>
<link rel="stylesheet" type="text/css" href="./inspector.css">
<body>
<script type="module">

import define from "./index.js";
import {Runtime, Library, Inspector} from "./runtime.js";

const runtime = new Runtime();
const main = runtime.module(define, Inspector.into(document.body));

</script>
                                                                                                                                                   ./inspector.css                                                                                     000644  000000  000000  00000003017 14462206250 012103  0                                                                                                    ustar 00                                                                000000  000000                                                                                                                                                                         :root{--syntax_normal:#1b1e23;--syntax_comment:#a9b0bc;--syntax_number:#20a5ba;--syntax_keyword:#c30771;--syntax_atom:#10a778;--syntax_string:#008ec4;--syntax_error:#ffbedc;--syntax_unknown_variable:#838383;--syntax_known_variable:#005f87;--syntax_matchbracket:#20bbfc;--syntax_key:#6636b4;--mono_fonts:82%/1.5 Menlo,Consolas,monospace}.observablehq--collapsed,.observablehq--expanded,.observablehq--function,.observablehq--gray,.observablehq--import,.observablehq--string:after,.observablehq--string:before{color:var(--syntax_normal)}.observablehq--collapsed,.observablehq--inspect a{cursor:pointer}.observablehq--field{text-indent:-1em;margin-left:1em}.observablehq--empty{color:var(--syntax_comment)}.observablehq--blue,.observablehq--keyword{color:#3182bd}.observablehq--forbidden,.observablehq--pink{color:#e377c2}.observablehq--orange{color:#e6550d}.observablehq--boolean,.observablehq--null,.observablehq--undefined{color:var(--syntax_atom)}.observablehq--bigint,.observablehq--date,.observablehq--green,.observablehq--number,.observablehq--regexp,.observablehq--symbol{color:var(--syntax_number)}.observablehq--index,.observablehq--key{color:var(--syntax_key)}.observablehq--prototype-key{color:#aaa}.observablehq--empty{font-style:oblique}.observablehq--purple,.observablehq--string{color:var(--syntax_string)}.observablehq--error,.observablehq--red{color:#e7040f}.observablehq--inspect{font:var(--mono_fonts);overflow-x:auto;display:block;white-space:pre}.observablehq--error .observablehq--inspect{word-break:break-all;white-space:pre-wrap}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ./runtime.js                                                                                        000644  000000  000000  00000207634 14462206250 011417  0                                                                                                    ustar 00                                                                000000  000000                                                                                                                                                                         // @observablehq/runtime v5.9.5 Copyright 2023 Observable, Inc.
function e(e,t,n){n=n||{};var r=e.ownerDocument,a=r.defaultView.CustomEvent;"function"==typeof a?a=new a(t,{detail:n}):((a=r.createEvent("Event")).initEvent(t,!1,!1),a.detail=n),e.dispatchEvent(a)}function t(e){return Array.isArray(e)||e instanceof Int8Array||e instanceof Int16Array||e instanceof Int32Array||e instanceof Uint8Array||e instanceof Uint8ClampedArray||e instanceof Uint16Array||e instanceof Uint32Array||e instanceof Float32Array||e instanceof Float64Array}function n(e){return e===(0|e)+""}function r(e){const t=document.createElement("span");return t.className="observablehq--cellname",t.textContent=`${e} = `,t}const a=Symbol.prototype.toString;function o(e){return a.call(e)}const{getOwnPropertySymbols:i,prototype:{hasOwnProperty:s}}=Object,{toStringTag:c}=Symbol,l={},u=i;function f(e,t){return s.call(e,t)}function d(e){return e[c]||e.constructor&&e.constructor.name||"Object"}function p(e,t){try{const n=e[t];return n&&n.constructor,n}catch(e){return l}}const m=[{symbol:"@@__IMMUTABLE_INDEXED__@@",name:"Indexed",modifier:!0},{symbol:"@@__IMMUTABLE_KEYED__@@",name:"Keyed",modifier:!0},{symbol:"@@__IMMUTABLE_LIST__@@",name:"List",arrayish:!0},{symbol:"@@__IMMUTABLE_MAP__@@",name:"Map"},{symbol:"@@__IMMUTABLE_ORDERED__@@",name:"Ordered",modifier:!0,prefix:!0},{symbol:"@@__IMMUTABLE_RECORD__@@",name:"Record"},{symbol:"@@__IMMUTABLE_SET__@@",name:"Set",arrayish:!0,setish:!0},{symbol:"@@__IMMUTABLE_STACK__@@",name:"Stack",arrayish:!0}];function h(e){try{let t=m.filter((({symbol:t})=>!0===e[t]));if(!t.length)return;const n=t.find((e=>!e.modifier)),r="Map"===n.name&&t.find((e=>e.modifier&&e.prefix)),a=t.some((e=>e.arrayish)),o=t.some((e=>e.setish));return{name:`${r?r.name:""}${n.name}`,symbols:t,arrayish:a&&!o,setish:o}}catch(e){return null}}const{getPrototypeOf:b,getOwnPropertyDescriptors:w}=Object,v=b({});function y(n,a,o,i){let s,c,l,u,f=t(n);n instanceof Map?n instanceof n.constructor?(s=`Map(${n.size})`,c=_):(s="Map()",c=T):n instanceof Set?n instanceof n.constructor?(s=`Set(${n.size})`,c=g):(s="Set()",c=T):f?(s=`${n.constructor.name}(${n.length})`,c=C):(u=h(n))?(s=`Immutable.${u.name}${"Record"===u.name?"":`(${n.size})`}`,f=u.arrayish,c=u.arrayish?N:u.setish?E:A):i?(s=d(n),c=x):(s=d(n),c=T);const p=document.createElement("span");p.className="observablehq--expanded",o&&p.appendChild(r(o));const m=p.appendChild(document.createElement("a"));m.innerHTML="<svg width=8 height=8 class='observablehq--caret'>\n    <path d='M4 7L0 1h8z' fill='currentColor' />\n  </svg>",m.appendChild(document.createTextNode(`${s}${f?" [":" {"}`)),m.addEventListener("mouseup",(function(e){e.stopPropagation(),ie(p,L(n,null,o,i))})),c=c(n);for(let e=0;!(l=c.next()).done&&e<20;++e)p.appendChild(l.value);if(!l.done){const t=p.appendChild(document.createElement("a"));t.className="observablehq--field",t.style.display="block",t.appendChild(document.createTextNode("  … more")),t.addEventListener("mouseup",(function(t){t.stopPropagation(),p.insertBefore(l.value,p.lastChild.previousSibling);for(let e=0;!(l=c.next()).done&&e<19;++e)p.insertBefore(l.value,p.lastChild.previousSibling);l.done&&p.removeChild(p.lastChild.previousSibling),e(p,"load")}))}return p.appendChild(document.createTextNode(f?"]":"}")),p}function*_(e){for(const[t,n]of e)yield S(t,n);yield*T(e)}function*g(e){for(const t of e)yield q(t);yield*T(e)}function*E(e){for(const t of e)yield q(t)}function*C(e){for(let t=0,n=e.length;t<n;++t)t in e&&(yield $(t,p(e,t),"observablehq--index"));for(const t in e)!n(t)&&f(e,t)&&(yield $(t,p(e,t),"observablehq--key"));for(const t of u(e))yield $(o(t),p(e,t),"observablehq--symbol")}function*N(e){let t=0;for(const n=e.size;t<n;++t)yield $(t,e.get(t),!0)}function*x(e){for(const t in w(e))yield $(t,p(e,t),"observablehq--key");for(const t of u(e))yield $(o(t),p(e,t),"observablehq--symbol");const t=b(e);t&&t!==v&&(yield j(t))}function*T(e){for(const t in e)f(e,t)&&(yield $(t,p(e,t),"observablehq--key"));for(const t of u(e))yield $(o(t),p(e,t),"observablehq--symbol");const t=b(e);t&&t!==v&&(yield j(t))}function*A(e){for(const[t,n]of e)yield $(t,n,"observablehq--key")}function j(e){const t=document.createElement("div"),n=t.appendChild(document.createElement("span"));return t.className="observablehq--field",n.className="observablehq--prototype-key",n.textContent="  <prototype>",t.appendChild(document.createTextNode(": ")),t.appendChild(oe(e,void 0,void 0,void 0,!0)),t}function $(e,t,n){const r=document.createElement("div"),a=r.appendChild(document.createElement("span"));return r.className="observablehq--field",a.className=n,a.textContent=`  ${e}`,r.appendChild(document.createTextNode(": ")),r.appendChild(oe(t)),r}function S(e,t){const n=document.createElement("div");return n.className="observablehq--field",n.appendChild(document.createTextNode("  ")),n.appendChild(oe(e)),n.appendChild(document.createTextNode(" => ")),n.appendChild(oe(t)),n}function q(e){const t=document.createElement("div");return t.className="observablehq--field",t.appendChild(document.createTextNode("  ")),t.appendChild(oe(e)),t}function O(e){const t=window.getSelection();return"Range"===t.type&&(t.containsNode(e,!0)||t.anchorNode.isSelfOrDescendant(e)||t.focusNode.isSelfOrDescendant(e))}function L(e,n,a,o){let i,s,c,l,u=t(e);if(e instanceof Map?e instanceof e.constructor?(i=`Map(${e.size})`,s=k):(i="Map()",s=U):e instanceof Set?e instanceof e.constructor?(i=`Set(${e.size})`,s=M):(i="Set()",s=U):u?(i=`${e.constructor.name}(${e.length})`,s=R):(l=h(e))?(i=`Immutable.${l.name}${"Record"===l.name?"":`(${e.size})`}`,u=l.arrayish,s=l.arrayish?P:l.setish?I:D):(i=d(e),s=U),n){const t=document.createElement("span");return t.className="observablehq--shallow",a&&t.appendChild(r(a)),t.appendChild(document.createTextNode(i)),t.addEventListener("mouseup",(function(n){O(t)||(n.stopPropagation(),ie(t,L(e)))})),t}const f=document.createElement("span");f.className="observablehq--collapsed",a&&f.appendChild(r(a));const p=f.appendChild(document.createElement("a"));p.innerHTML="<svg width=8 height=8 class='observablehq--caret'>\n    <path d='M7 4L1 8V0z' fill='currentColor' />\n  </svg>",p.appendChild(document.createTextNode(`${i}${u?" [":" {"}`)),f.addEventListener("mouseup",(function(t){O(f)||(t.stopPropagation(),ie(f,y(e,0,a,o)))}),!0),s=s(e);for(let e=0;!(c=s.next()).done&&e<20;++e)e>0&&f.appendChild(document.createTextNode(", ")),f.appendChild(c.value);return c.done||f.appendChild(document.createTextNode(", …")),f.appendChild(document.createTextNode(u?"]":"}")),f}function*k(e){for(const[t,n]of e)yield z(t,n);yield*U(e)}function*M(e){for(const t of e)yield oe(t,!0);yield*U(e)}function*I(e){for(const t of e)yield oe(t,!0)}function*P(e){let t=-1,n=0;for(const r=e.size;n<r;++n)n>t+1&&(yield F(n-t-1)),yield oe(e.get(n),!0),t=n;n>t+1&&(yield F(n-t-1))}function*R(e){let t=-1,r=0;for(const n=e.length;r<n;++r)r in e&&(r>t+1&&(yield F(r-t-1)),yield oe(p(e,r),!0),t=r);r>t+1&&(yield F(r-t-1));for(const t in e)!n(t)&&f(e,t)&&(yield B(t,p(e,t),"observablehq--key"));for(const t of u(e))yield B(o(t),p(e,t),"observablehq--symbol")}function*U(e){for(const t in e)f(e,t)&&(yield B(t,p(e,t),"observablehq--key"));for(const t of u(e))yield B(o(t),p(e,t),"observablehq--symbol")}function*D(e){for(const[t,n]of e)yield B(t,n,"observablehq--key")}function F(e){const t=document.createElement("span");return t.className="observablehq--empty",t.textContent=1===e?"empty":`empty × ${e}`,t}function B(e,t,n){const r=document.createDocumentFragment(),a=r.appendChild(document.createElement("span"));return a.className=n,a.textContent=e,r.appendChild(document.createTextNode(": ")),r.appendChild(oe(t,!0)),r}function z(e,t){const n=document.createDocumentFragment();return n.appendChild(oe(e,!0)),n.appendChild(document.createTextNode(" => ")),n.appendChild(oe(t,!0)),n}function W(e,t){if(e instanceof Date||(e=new Date(+e)),isNaN(e))return"function"==typeof t?t(e):t;const n=e.getUTCHours(),r=e.getUTCMinutes(),a=e.getUTCSeconds(),o=e.getUTCMilliseconds();return`${i=e.getUTCFullYear(),i<0?`-${H(-i,6)}`:i>9999?`+${H(i,6)}`:H(i,4)}-${H(e.getUTCMonth()+1,2)}-${H(e.getUTCDate(),2)}${n||r||a||o?`T${H(n,2)}:${H(r,2)}${a||o?`:${H(a,2)}${o?`.${H(o,3)}`:""}`:""}Z`:""}`;var i}function H(e,t){return`${e}`.padStart(t,"0")}var V=Error.prototype.toString;var G=RegExp.prototype.toString;function Y(e){return e.replace(/[\\`\x00-\x09\x0b-\x19]|\${/g,Z)}function Z(e){var t=e.charCodeAt(0);switch(t){case 8:return"\\b";case 9:return"\\t";case 11:return"\\v";case 12:return"\\f";case 13:return"\\r"}return t<16?"\\x0"+t.toString(16):t<32?"\\x"+t.toString(16):"\\"+e}function J(e,t){for(var n=0;t.exec(e);)++n;return n}var K=Function.prototype.toString,X={prefix:"async ƒ"},Q={prefix:"async ƒ*"},ee={prefix:"class"},te={prefix:"ƒ"},ne={prefix:"ƒ*"};function re(e,t,n){var a=document.createElement("span");a.className="observablehq--function",n&&a.appendChild(r(n));var o=a.appendChild(document.createElement("span"));return o.className="observablehq--keyword",o.textContent=e.prefix,a.appendChild(document.createTextNode(t)),a}const{prototype:{toString:ae}}=Object;function oe(e,t,n,a,i){let s=typeof e;switch(s){case"boolean":case"undefined":e+="";break;case"number":e=0===e&&1/e<0?"-0":e+"";break;case"bigint":e+="n";break;case"symbol":e=o(e);break;case"function":return function(e,t){var n,r,a=K.call(e);switch(e.constructor&&e.constructor.name){case"AsyncFunction":n=X;break;case"AsyncGeneratorFunction":n=Q;break;case"GeneratorFunction":n=ne;break;default:n=/^class\b/.test(a)?ee:te}return n===ee?re(n,"",t):(r=/^(?:async\s*)?(\w+)\s*=>/.exec(a))?re(n,"("+r[1]+")",t):(r=/^(?:async\s*)?\(\s*(\w+(?:\s*,\s*\w+)*)?\s*\)/.exec(a))||(r=/^(?:async\s*)?function(?:\s*\*)?(?:\s*\w+)?\s*\(\s*(\w+(?:\s*,\s*\w+)*)?\s*\)/.exec(a))?re(n,r[1]?"("+r[1].replace(/\s*,\s*/g,", ")+")":"()",t):re(n,"(…)",t)}(e,a);case"string":return function(e,t,n,a){if(!1===t){if(J(e,/["\n]/g)<=J(e,/`|\${/g)){const t=document.createElement("span");a&&t.appendChild(r(a));const n=t.appendChild(document.createElement("span"));return n.className="observablehq--string",n.textContent=JSON.stringify(e),t}const o=e.split("\n");if(o.length>20&&!n){const n=document.createElement("div");a&&n.appendChild(r(a));const i=n.appendChild(document.createElement("span"));i.className="observablehq--string",i.textContent="`"+Y(o.slice(0,20).join("\n"));const s=n.appendChild(document.createElement("span")),c=o.length-20;return s.textContent=`Show ${c} truncated line${c>1?"s":""}`,s.className="observablehq--string-expand",s.addEventListener("mouseup",(function(r){r.stopPropagation(),ie(n,oe(e,t,!0,a))})),n}const i=document.createElement("span");a&&i.appendChild(r(a));const s=i.appendChild(document.createElement("span"));return s.className="observablehq--string"+(n?" observablehq--expanded":""),s.textContent="`"+Y(e)+"`",i}const o=document.createElement("span");a&&o.appendChild(r(a));const i=o.appendChild(document.createElement("span"));return i.className="observablehq--string",i.textContent=JSON.stringify(e.length>100?`${e.slice(0,50)}…${e.slice(-49)}`:e),o}(e,t,n,a);default:if(null===e){s=null,e="null";break}if(e instanceof Date){s="date",e=W(e,"Invalid Date");break}if(e===l){s="forbidden",e="[forbidden]";break}switch(ae.call(e)){case"[object RegExp]":s="regexp",e=function(e){return G.call(e)}(e);break;case"[object Error]":case"[object DOMException]":s="error",e=function(e){return e.stack||V.call(e)}(e);break;default:return(n?y:L)(e,t,a,i)}}const c=document.createElement("span");a&&c.appendChild(r(a));const u=c.appendChild(document.createElement("span"));return u.className=`observablehq--${s}`,u.textContent=e,c}function ie(t,n){t.classList.contains("observablehq--inspect")&&n.classList.add("observablehq--inspect"),t.parentNode.replaceChild(n,t),e(n,"load")}const se=/\s+\(\d+:\d+\)$/m;class Inspector{constructor(e){if(!e)throw new Error("invalid node");this._node=e,e.classList.add("observablehq")}pending(){const{_node:e}=this;e.classList.remove("observablehq--error"),e.classList.add("observablehq--running")}fulfilled(t,n){const{_node:r}=this;if((!function(e){return(e instanceof Element||e instanceof Text)&&e instanceof e.constructor}(t)||t.parentNode&&t.parentNode!==r)&&(t=oe(t,!1,r.firstChild&&r.firstChild.classList&&r.firstChild.classList.contains("observablehq--expanded"),n)).classList.add("observablehq--inspect"),r.classList.remove("observablehq--running","observablehq--error"),r.firstChild!==t)if(r.firstChild){for(;r.lastChild!==r.firstChild;)r.removeChild(r.lastChild);r.replaceChild(t,r.firstChild)}else r.appendChild(t);e(r,"update")}rejected(t,n){const{_node:a}=this;for(a.classList.remove("observablehq--running"),a.classList.add("observablehq--error");a.lastChild;)a.removeChild(a.lastChild);var o=document.createElement("div");o.className="observablehq--inspect",n&&o.appendChild(r(n)),o.appendChild(document.createTextNode((t+"").replace(se,""))),a.appendChild(o),e(a,"error",{error:t})}}Inspector.into=function(e){if("string"==typeof e&&null==(e=document.querySelector(e)))throw new Error("container not found");return function(){return new Inspector(e.appendChild(document.createElement("div")))}};var ce={},le={};function ue(e){return new Function("d","return {"+e.map((function(e,t){return JSON.stringify(e)+": d["+t+'] || ""'})).join(",")+"}")}function fe(e){var t=Object.create(null),n=[];return e.forEach((function(e){for(var r in e)r in t||n.push(t[r]=r)})),n}function de(e,t){var n=e+"",r=n.length;return r<t?new Array(t-r+1).join(0)+n:n}function pe(e){var t,n=e.getUTCHours(),r=e.getUTCMinutes(),a=e.getUTCSeconds(),o=e.getUTCMilliseconds();return isNaN(e)?"Invalid Date":((t=e.getUTCFullYear())<0?"-"+de(-t,6):t>9999?"+"+de(t,6):de(t,4))+"-"+de(e.getUTCMonth()+1,2)+"-"+de(e.getUTCDate(),2)+(o?"T"+de(n,2)+":"+de(r,2)+":"+de(a,2)+"."+de(o,3)+"Z":a?"T"+de(n,2)+":"+de(r,2)+":"+de(a,2)+"Z":r||n?"T"+de(n,2)+":"+de(r,2)+"Z":"")}function me(e){var t=new RegExp('["'+e+"\n\r]"),n=e.charCodeAt(0);function r(e,t){var r,a=[],o=e.length,i=0,s=0,c=o<=0,l=!1;function u(){if(c)return le;if(l)return l=!1,ce;var t,r,a=i;if(34===e.charCodeAt(a)){for(;i++<o&&34!==e.charCodeAt(i)||34===e.charCodeAt(++i););return(t=i)>=o?c=!0:10===(r=e.charCodeAt(i++))?l=!0:13===r&&(l=!0,10===e.charCodeAt(i)&&++i),e.slice(a+1,t-1).replace(/""/g,'"')}for(;i<o;){if(10===(r=e.charCodeAt(t=i++)))l=!0;else if(13===r)l=!0,10===e.charCodeAt(i)&&++i;else if(r!==n)continue;return e.slice(a,t)}return c=!0,e.slice(a,o)}for(10===e.charCodeAt(o-1)&&--o,13===e.charCodeAt(o-1)&&--o;(r=u())!==le;){for(var f=[];r!==ce&&r!==le;)f.push(r),r=u();t&&null==(f=t(f,s++))||a.push(f)}return a}function a(t,n){return t.map((function(t){return n.map((function(e){return i(t[e])})).join(e)}))}function o(t){return t.map(i).join(e)}function i(e){return null==e?"":e instanceof Date?pe(e):t.test(e+="")?'"'+e.replace(/"/g,'""')+'"':e}return{parse:function(e,t){var n,a,o=r(e,(function(e,r){if(n)return n(e,r-1);a=e,n=t?function(e,t){var n=ue(e);return function(r,a){return t(n(r),a,e)}}(e,t):ue(e)}));return o.columns=a||[],o},parseRows:r,format:function(t,n){return null==n&&(n=fe(t)),[n.map(i).join(e)].concat(a(t,n)).join("\n")},formatBody:function(e,t){return null==t&&(t=fe(e)),a(e,t).join("\n")},formatRows:function(e){return e.map(o).join("\n")},formatRow:o,formatValue:i}}var he=me(","),be=he.parse,we=he.parseRows,ve=me("\t"),ye=ve.parse,_e=ve.parseRows;function ge(e){for(var t in e){var n,r,a=e[t].trim();if(a)if("true"===a)a=!0;else if("false"===a)a=!1;else if("NaN"===a)a=NaN;else if(isNaN(n=+a)){if(!(r=a.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)))continue;Ee&&r[4]&&!r[7]&&(a=a.replace(/-/g,"/").replace(/T/," ")),a=new Date(a)}else a=n;else a=null;e[t]=a}return e}const Ee=new Date("2019-01-01T00:00").getHours()||new Date("2019-07-01T00:00").getHours();function Ce(e,t,n){return{resolve:(r=n)=>`${e}@${t}/${r}`}}const Ne=Ce("d3","7.8.5","dist/d3.min.js"),xe=Ce("@observablehq/inputs","0.10.6","dist/inputs.min.js"),Te=Ce("@observablehq/plot","0.6.11","dist/plot.umd.min.js"),Ae=Ce("@observablehq/graphviz","0.2.1","dist/graphviz.min.js"),je=Ce("@observablehq/highlight.js","2.0.0","highlight.min.js"),$e=Ce("@observablehq/katex","0.11.1","dist/katex.min.js"),Se=Ce("lodash","4.17.21","lodash.min.js"),qe=Ce("htl","0.3.1","dist/htl.min.js"),Oe=Ce("jszip","3.10.1","dist/jszip.min.js"),Le=Ce("marked","0.3.12","marked.min.js"),ke=Ce("sql.js","1.8.0","dist/sql-wasm.js"),Me=Ce("vega","5.22.1","build/vega.min.js"),Ie=Ce("vega-lite","5.6.0","build/vega-lite.min.js"),Pe=Ce("vega-lite-api","5.0.0","build/vega-lite-api.min.js"),Re=Ce("apache-arrow","4.0.1","Arrow.es2015.min.js"),Ue=Ce("apache-arrow","9.0.0","+esm"),De=Ce("apache-arrow","11.0.0","+esm"),Fe=Ce("arquero","4.8.8","dist/arquero.min.js"),Be=Ce("topojson-client","3.1.0","dist/topojson-client.min.js"),ze=Ce("exceljs","4.3.0","dist/exceljs.min.js"),We=Ce("mermaid","9.2.2","dist/mermaid.min.js"),He=Ce("leaflet","1.9.3","dist/leaflet.js"),Ve=Ce("@duckdb/duckdb-wasm","1.24.0","+esm"),Ge=new Map,Ye=[],Ze=Ye.map,Je=Ye.some,Ke=Ye.hasOwnProperty,Xe=/^((?:@[^/@]+\/)?[^/@]+)(?:@([^/]+))?(?:\/(.*))?$/,Qe=/^\d+\.\d+\.\d+(-[\w-.+]+)?$/,et=/(?:\.[^/]*|\/)$/;class RequireError extends Error{constructor(e){super(e)}}function tt(e){const t=Xe.exec(e);return t&&{name:t[1],version:t[2],path:t[3]}}function nt(e="https://cdn.jsdelivr.net/npm/",t=["unpkg","jsdelivr","browser","main"]){if(!/\/$/.test(e))throw new Error("origin lacks trailing slash");function n(t){const n=`${e}${t.name}${t.version?`@${t.version}`:""}/package.json`;let r=Ge.get(n);return r||Ge.set(n,r=fetch(n).then((e=>{if(!e.ok)throw new RequireError("unable to load package.json");return e.redirected&&!Ge.has(e.url)&&Ge.set(e.url,r),e.json()}))),r}return async function(r,a){if(r.startsWith(e)&&(r=r.substring(e.length)),/^(\w+:)|\/\//i.test(r))return r;if(/^[.]{0,2}\//i.test(r))return new URL(r,null==a?location:a).href;if(!r.length||/^[\s._]/.test(r)||/\s$/.test(r))throw new RequireError("illegal name");const o=tt(r);if(!o)return`${e}${r}`;if(!o.version&&null!=a&&a.startsWith(e)){const t=await n(tt(a.substring(e.length)));o.version=t.dependencies&&t.dependencies[o.name]||t.peerDependencies&&t.peerDependencies[o.name]}if(o.path&&!et.test(o.path)&&(o.path+=".js"),o.path&&o.version&&Qe.test(o.version))return`${e}${o.name}@${o.version}/${o.path}`;const i=await n(o);return`${e}${i.name}@${i.version}/${o.path||function(e){for(const n of t){let t=e[n];if("string"==typeof t)return t.startsWith("./")&&(t=t.slice(2)),et.test(t)?t:`${t}.js`}}(i)||"index.js"}`}}RequireError.prototype.name=RequireError.name;var rt=at(nt());function at(e){const t=new Map,n=a(null);function r(e){if("string"!=typeof e)return e;let n=t.get(e);return n||t.set(e,n=new Promise(((t,n)=>{const r=document.createElement("script");r.onload=()=>{try{t(Ye.pop()(a(e)))}catch(e){n(new RequireError("invalid module"))}r.remove()},r.onerror=()=>{n(new RequireError("unable to load module")),r.remove()},r.async=!0,r.src=e,window.define=ct,document.head.appendChild(r)}))),n}function a(t){return n=>Promise.resolve(e(n,t)).then(r)}function o(e){return arguments.length>1?Promise.all(Ze.call(arguments,n)).then(ot):n(e)}return o.alias=function(t){return at(((n,r)=>n in t&&(r=null,"string"!=typeof(n=t[n]))?n:e(n,r)))},o.resolve=e,o}function ot(e){const t={};for(const n of e)for(const e in n)Ke.call(n,e)&&(null==n[e]?Object.defineProperty(t,e,{get:it(n,e)}):t[e]=n[e]);return t}function it(e,t){return()=>e[t]}function st(e){return"exports"===(e+="")||"module"===e}function ct(e,t,n){const r=arguments.length;r<2?(n=e,t=[]):r<3&&(n=t,t="string"==typeof e?[]:e),Ye.push(Je.call(t,st)?e=>{const r={},a={exports:r};return Promise.all(Ze.call(t,(t=>"exports"===(t+="")?r:"module"===t?a:e(t)))).then((e=>(n.apply(null,e),a.exports)))}:e=>Promise.all(Ze.call(t,e)).then((e=>"function"==typeof n?n.apply(null,e):n)))}ct.amd={};const lt="https://cdn.observableusercontent.com/npm/";let ut,ft=rt;async function dt(e){const[t,n]=await Promise.all([e(ke.resolve()),e.resolve(ke.resolve("dist/"))]);return t({locateFile:e=>`${n}${e}`})}class SQLiteDatabaseClient{constructor(e){Object.defineProperties(this,{_db:{value:e}})}static async open(e){const[t,n]=await Promise.all([dt(ft),Promise.resolve(e).then(mt)]);return new SQLiteDatabaseClient(new t.Database(n))}async query(e,t){return await async function(e,t,n){const[r]=await e.exec(t,n);if(!r)return[];const{columns:a,values:o}=r,i=o.map((e=>Object.fromEntries(e.map(((e,t)=>[a[t],e])))));return i.columns=a,i}(this._db,e,t)}async queryRow(e,t){return(await this.query(e,t))[0]||null}async explain(e,t){return ht("pre",{className:"observablehq--inspect"},[bt((await this.query(`EXPLAIN QUERY PLAN ${e}`,t)).map((e=>e.detail)).join("\n"))])}async describeTables({schema:e}={}){return this.query(`SELECT NULLIF(schema, 'main') AS schema, name FROM pragma_table_list() WHERE type = 'table'${null==e?"":" AND schema = ?"} AND name NOT LIKE 'sqlite_%' ORDER BY schema, name`,null==e?[]:[e])}async describeColumns({schema:e,table:t}={}){if(null==t)throw new Error("missing table");const n=await this.query(`SELECT name, type, "notnull" FROM pragma_table_info(?${null==e?"":", ?"}) ORDER BY cid`,null==e?[t]:[t,e]);if(!n.length)throw new Error(`table not found: ${t}`);return n.map((({name:e,type:t,notnull:n})=>({name:e,type:pt(t),databaseType:t,nullable:!n})))}async describe(e){const t=await(void 0===e?this.query("SELECT name FROM sqlite_master WHERE type = 'table'"):this.query("SELECT * FROM pragma_table_info(?)",[e]));if(!t.length)throw new Error("Not found");const{columns:n}=t;return ht("table",{value:t},[ht("thead",[ht("tr",n.map((e=>ht("th",[bt(e)]))))]),ht("tbody",t.map((e=>ht("tr",n.map((t=>ht("td",[bt(e[t])])))))))])}async sql(){return this.query(...this.queryTag.apply(this,arguments))}queryTag(e,...t){return[e.join("?"),t]}}function pt(e){switch(e){case"NULL":return"null";case"INT":case"INTEGER":case"TINYINT":case"SMALLINT":case"MEDIUMINT":case"BIGINT":case"UNSIGNED BIG INT":case"INT2":case"INT8":return"integer";case"TEXT":case"CLOB":case"DATE":case"DATETIME":return"string";case"REAL":case"DOUBLE":case"DOUBLE PRECISION":case"FLOAT":case"NUMERIC":return"number";case"BLOB":return"buffer";default:return/^(?:(?:(?:VARYING|NATIVE) )?CHARACTER|(?:N|VAR|NVAR)CHAR)\(/.test(e)?"string":/^(?:DECIMAL|NUMERIC)\(/.test(e)?"number":"other"}}function mt(e){return"string"==typeof e?fetch(e).then(mt):e instanceof Response||e instanceof Blob?e.arrayBuffer().then(mt):e instanceof ArrayBuffer?new Uint8Array(e):e}function ht(e,t,n){2===arguments.length&&(n=t,t=void 0);const r=document.createElement(e);if(void 0!==t)for(const e in t)r[e]=t[e];if(void 0!==n)for(const e of n)r.appendChild(e);return r}function bt(e){return document.createTextNode(e)}function wt(e,t){return null==e||null==t?NaN:e<t?-1:e>t?1:e>=t?0:NaN}function vt(e,t=wt){let n,r=!1;if(1===t.length){let a;for(const o of e){const e=t(o);(r?wt(e,a)>0:0===wt(e,e))&&(n=o,a=e,r=!0)}}else for(const a of e)(r?t(a,n)>0:0===t(a,a))&&(n=a,r=!0);return n}function yt(e){return e&&"function"==typeof e.toArrowBuffer}function _t(e){return e&&"function"==typeof e.getChild&&"function"==typeof e.toArray&&e.schema&&Array.isArray(e.schema.fields)}function gt(e){return{name:e.name,type:Et(e.type),nullable:e.nullable,databaseType:String(e.type)}}function Et(e){switch(e.typeId){case 2:return"integer";case 3:case 7:return"number";case 4:case 15:return"buffer";case 5:return"string";case 6:return"boolean";case 8:case 9:case 10:return"date";case 12:case 16:return"array";case 13:case 14:return"object";default:return"other"}}async function Ct(){return await import(`${lt}${De.resolve()}`)}Object.defineProperty(SQLiteDatabaseClient.prototype,"dialect",{value:"sqlite"});class DuckDBClient{constructor(e){Object.defineProperties(this,{_db:{value:e}})}async queryStream(e,t){const n=await this._db.connect();let r,a;try{if(t?.length>0){const a=await n.prepare(e);r=await a.send(...t)}else r=await n.send(e);if(a=await r.next(),a.done)throw new Error("missing first batch")}catch(e){throw await n.close(),e}return{schema:(o=a.value,o.schema.fields.map(gt)),async*readRows(){try{for(;!a.done;)yield a.value.toArray(),a=await r.next()}finally{await n.close()}}};var o}async query(e,t){const n=await this.queryStream(e,t),r=[];for await(const e of n.readRows())for(const t of e)r.push(t);return r.schema=n.schema,r}async queryRow(e,t){const n=(await this.queryStream(e,t)).readRows();try{const{done:e,value:t}=await n.next();return e||!t.length?null:t[0]}finally{await n.return()}}async sql(e,...t){return await this.query(e.join("?"),t)}queryTag(e,...t){return[e.join("?"),t]}escape(e){return`"${e}"`}async describeTables(){return(await this.query("SHOW TABLES")).map((({name:e})=>({name:e})))}async describeColumns({table:e}={}){return(await this.query(`DESCRIBE ${this.escape(e)}`)).map((({column_name:e,column_type:t,null:n})=>({name:e,type:At(t),nullable:"NO"!==n,databaseType:t})))}static async of(e={},t={}){const n=await async function(){void 0===ut&&(ut=async function(){const e=await import(`${lt}${Ve.resolve()}`),t=await e.selectBundle({mvp:{mainModule:`${lt}${Ve.resolve("dist/duckdb-mvp.wasm")}`,mainWorker:`${lt}${Ve.resolve("dist/duckdb-browser-mvp.worker.js")}`},eh:{mainModule:`${lt}${Ve.resolve("dist/duckdb-eh.wasm")}`,mainWorker:`${lt}${Ve.resolve("dist/duckdb-browser-eh.worker.js")}`}}),n=new e.ConsoleLogger;return{module:e,bundle:t,logger:n}}());const{module:e,bundle:t,logger:n}=await ut,r=await e.createWorker(t.mainWorker),a=new e.AsyncDuckDB(n,r);return await a.instantiate(t.mainModule),a}();return void 0===t.query?.castTimestampToDate&&(t={...t,query:{...t.query,castTimestampToDate:!0}}),void 0===t.query?.castBigIntToDouble&&(t={...t,query:{...t.query,castBigIntToDouble:!0}}),await n.open(t),await Promise.all(Object.entries(e).map((async([e,t])=>{if(t instanceof FileAttachment)await Nt(n,e,t);else if(_t(t))await xt(n,e,t);else if(Array.isArray(t))await Tt(n,e,t);else if(yt(t))await async function(e,t,n){const r=(await Ct()).tableFromIPC(n.toArrowBuffer());return await xt(e,t,r)}(n,e,t);else if("data"in t){const{data:r,...a}=t;_t(r)?await xt(n,e,r,a):await Tt(n,e,r,a)}else{if(!("file"in t))throw new Error(`invalid source: ${t}`);{const{file:r,...a}=t;await Nt(n,e,r,a)}}}))),new DuckDBClient(n)}}async function Nt(e,t,n,r){const a=await n.url();if(a.startsWith("blob:")){const t=await n.arrayBuffer();await e.registerFileBuffer(n.name,new Uint8Array(t))}else await e.registerFileURL(n.name,new URL(a,location).href,4);const o=await e.connect();try{switch(n.mimeType){case"text/csv":case"text/tab-separated-values":return await o.insertCSVFromPath(n.name,{name:t,schema:"main",...r}).catch((async e=>{if(e.toString().includes("Could not convert"))return await async function(e,t,n){const r=await e.prepare(`CREATE TABLE '${n}' AS SELECT * FROM read_csv_auto(?, ALL_VARCHAR=TRUE)`);return await r.send(t.name)}(o,n,t);throw e}));case"application/json":return await o.insertJSONFromPath(n.name,{name:t,schema:"main",...r});default:if(/\.arrow$/i.test(n.name)){const e=new Uint8Array(await n.arrayBuffer());return await o.insertArrowFromIPCStream(e,{name:t,schema:"main",...r})}if(/\.parquet$/i.test(n.name))return await o.query(`CREATE VIEW '${t}' AS SELECT * FROM parquet_scan('${n.name}')`);throw new Error(`unknown file type: ${n.mimeType}`)}}finally{await o.close()}}async function xt(e,t,n,r){const a=await e.connect();try{await a.insertArrowTable(n,{name:t,schema:"main",...r})}finally{await a.close()}}async function Tt(e,t,n,r){const a=(await Ct()).tableFromJSON(n);return await xt(e,t,a,r)}function At(e){switch(e){case"BIGINT":case"HUGEINT":case"UBIGINT":return"bigint";case"DOUBLE":case"REAL":case"FLOAT":return"number";case"INTEGER":case"SMALLINT":case"TINYINT":case"USMALLINT":case"UINTEGER":case"UTINYINT":return"integer";case"BOOLEAN":return"boolean";case"DATE":case"TIMESTAMP":case"TIMESTAMP WITH TIME ZONE":return"date";case"VARCHAR":case"UUID":return"string";default:return/^DECIMAL\(/.test(e)?"integer":"other"}}Object.defineProperty(DuckDBClient.prototype,"dialect",{value:"duckdb"});function jt(e){return Array.isArray(e)&&($t(e.schema)||St(e.columns)||function(e){const t=Math.min(20,e.length);for(let n=0;n<t;++n){const t=e[n];if(null===t||"object"!=typeof t)return!1}return t>0&&function(e){for(const t in e)return!0;return!1}(e[0])}(e)||Lt(e)||kt(e))||Mt(e)}function $t(e){return Array.isArray(e)&&e.every(qt)}function St(e){return Array.isArray(e)&&e.every((e=>"string"==typeof e))}function qt(e){return e&&"string"==typeof e.name&&"string"==typeof e.type}function Ot(e){return Mt(e)||Lt(e)||kt(e)}function Lt(e){const t=Math.min(20,e.length);if(!(t>0))return!1;let n,r=!1;for(let a=0;a<t;++a){const t=e[a];if(null==t)continue;const o=typeof t;if(void 0===n)switch(o){case"number":case"boolean":case"string":case"bigint":n=o;break;default:return!1}else if(o!==n)return!1;r=!0}return r}function kt(e){const t=Math.min(20,e.length);if(!(t>0))return!1;let n=!1;for(let r=0;r<t;++r){const t=e[r];if(null!=t){if(!(t instanceof Date))return!1;n=!0}}return n}function Mt(e){return e instanceof Int8Array||e instanceof Int16Array||e instanceof Int32Array||e instanceof Uint8Array||e instanceof Uint8ClampedArray||e instanceof Uint16Array||e instanceof Uint32Array||e instanceof Float32Array||e instanceof Float64Array}const It=Object.assign((async(e,t,n,r)=>{if(e=await Rt(await e,r),(a=e)&&("function"==typeof a.sql||"function"==typeof a.queryTag&&("function"==typeof a.query||"function"==typeof a.queryStream))&&("table"!==o||"function"==typeof a.describeColumns)&&a!==It)return Ft(e,function(e,t){const n="function"==typeof t.escape?t.escape:e=>e,{select:r,from:a,filter:o,sort:i,slice:s}=e;if(!a.table)throw new Error("missing from table");if(r.columns&&0===r.columns.length)throw new Error("at least one column must be selected");const c=new Map(e.names?.map((({column:e,name:t})=>[e,t]))),l=[[`SELECT ${r.columns?r.columns.map((e=>{const t=c.get(e);return t?`${n(e)} AS ${n(t)}`:n(e)})).join(", "):"*"} FROM ${Bt(a.table,n)}`]];for(let e=0;e<o.length;++e)zt(e?"\nAND ":"\nWHERE ",l),Ht(o[e],l,n);for(let e=0;e<i.length;++e)zt(e?", ":"\nORDER BY ",l),Wt(i[e],l,n);if("mssql"===t.dialect||"oracle"===t.dialect){if(null!==s.to||null!==s.from){if(!i.length){if(!r.columns)throw new Error("at least one column must be explicitly specified. Received '*'.");zt("\nORDER BY ",l),Wt({column:r.columns[0],direction:"ASC"},l,n)}zt(`\nOFFSET ${s.from||0} ROWS`,l),zt(`\nFETCH NEXT ${null!==s.to?s.to-(s.from||0):1e9} ROWS ONLY`,l)}}else null===s.to&&null===s.from||zt("\nLIMIT "+(null!==s.to?s.to-(s.from||0):1e9),l),null!==s.from&&zt(` OFFSET ${s.from}`,l);return l}(t,e),n);var a,o;if(jt(e))return function(e,t){const n=new Map,r=e,a=un(e,t);e=a.source;let o=a.schema;if(t.derive){const r=[];t.derive.map((({name:a,value:o})=>{let i=[];fn(e,t).map(((e,t)=>{let n;try{n=o(e)}catch(e){i.push({index:t,error:e}),n=void 0}r[t]?r[t]={...r[t],[a]:n}:r.push({[a]:n})})),i.length&&n.set(a,i)}));const a=un(r,t);e=e.map(((e,t)=>({...e,...a.source[t]}))),o=[...o,...a.schema]}for(const{type:n,operands:r}of t.filter){const[{value:t}]=r,a=r.slice(1).map((({value:e})=>e));switch(n){case"v":{const[n]=a,r=sn(n);e=e.filter((e=>r(e[t])));break}case"nv":{const[n]=a,r=sn(n);e=e.filter((e=>!r(e[t])));break}case"eq":{const[n]=a;if(n instanceof Date){const r=+n;e=e.filter((e=>+e[t]===r))}else e=e.filter((e=>e[t]===n));break}case"ne":{const[n]=a;e=e.filter((e=>e[t]!==n));break}case"c":{const[n]=a;e=e.filter((e=>"string"==typeof e[t]&&e[t].includes(n)));break}case"nc":{const[n]=a;e=e.filter((e=>"string"==typeof e[t]&&!e[t].includes(n)));break}case"in":{const n=new Set(a);e=e.filter((e=>n.has(e[t])));break}case"nin":{const n=new Set(a);e=e.filter((e=>!n.has(e[t])));break}case"n":e=e.filter((e=>null==e[t]));break;case"nn":e=e.filter((e=>null!=e[t]));break;case"lt":{const[n]=a;e=e.filter((e=>e[t]<n));break}case"lte":{const[n]=a;e=e.filter((e=>e[t]<=n));break}case"gt":{const[n]=a;e=e.filter((e=>e[t]>n));break}case"gte":{const[n]=a;e=e.filter((e=>e[t]>=n));break}default:throw new Error(`unknown filter type: ${n}`)}}for(const{column:n,direction:a}of function(e){if("function"!=typeof e[Symbol.iterator])throw new TypeError("values is not iterable");return Array.from(e).reverse()}(t.sort)){const t="desc"===a?Zt:Yt;e===r&&(e=e.slice()),e.sort(((e,r)=>t(e[n],r[n])))}let{from:i,to:s}=t.slice;i=null==i?0:Math.max(0,i),s=null==s?1/0:Math.max(0,s),(i>0||s<1/0)&&(e=e.slice(Math.max(0,i),Math.max(0,s)));let c=o.slice();if(t.select.columns){if(o){const e=new Map(o.map((e=>[e.name,e])));o=t.select.columns.map((t=>e.get(t)))}e=e.map((e=>Object.fromEntries(t.select.columns.map((t=>[t,e[t]])))))}if(t.names){const n=new Map(t.names.map((e=>[e.column,e])));o&&(o=o.map((e=>{const t=n.get(e.name);return{...e,...t?{name:t.name}:null}}))),c&&(c=c.map((e=>{const t=n.get(e.name);return{...e,...t?{name:t.name}:null}}))),e=fn(e,t)}e!==r&&o&&(e.schema=o);return e.fullSchema=c,e.errors=n,e}(e,t);if(!e)throw new Error("missing data source");throw new Error("invalid data source")}),{sql:(e,t,n)=>async function(){return Ft(await Ut(await e,n),arguments,t)}});function Pt(e){const t=new WeakMap;return(n,r)=>{if(!n||"object"!=typeof n)throw new Error("invalid data source");let a=t.get(n);return(!a||jt(n)&&n.length!==a._numRows)&&(a=e(n,r),a._numRows=n.length,t.set(n,a)),a}}const Rt=Pt((async(e,t)=>{if(e instanceof FileAttachment){switch(e.mimeType){case"text/csv":return e.csv();case"text/tab-separated-values":return e.tsv();case"application/json":return e.json();case"application/x-sqlite3":return e.sqlite()}if(/\.(arrow|parquet)$/i.test(e.name))return Dt(e,t);throw new Error(`unsupported file type: ${e.mimeType}`)}return _t(e)||yt(e)?Dt(e,t):jt(e)&&Ot(e)?Array.from(e,(e=>({value:e}))):e})),Ut=Pt((async(e,t)=>{if(e instanceof FileAttachment){switch(e.mimeType){case"text/csv":case"text/tab-separated-values":case"application/json":return Dt(e,t);case"application/x-sqlite3":return e.sqlite()}if(/\.(arrow|parquet)$/i.test(e.name))return Dt(e,t);throw new Error(`unsupported file type: ${e.mimeType}`)}return jt(e)?Dt(await async function(e,t){const n=await Ct();return Ot(e)?n.tableFromArrays({[t]:e}):n.tableFromJSON(e)}(e,t),t):_t(e)||yt(e)?Dt(e,t):e}));function Dt(e,t=(e instanceof FileAttachment?function(e){return e.name.replace(/@\d+(?=\.|$)/,"").replace(/\.\w+$/,"")}(e):"__table")){return DuckDBClient.of({[t]:e})}async function Ft(e,t,n){if(!e)throw new Error("missing data source");if("function"==typeof e.queryTag){const r=new AbortController,a={signal:r.signal};if(n.then((()=>r.abort("invalidated"))),"function"==typeof e.queryStream)return async function*(e){let t=performance.now();const n=await e,r=[];r.done=!1,r.error=null,r.schema=n.schema;try{for await(const e of n.readRows()){performance.now()-t>150&&r.length>0&&(yield r,t=performance.now());for(const t of e)r.push(t)}r.done=!0,yield r}catch(e){r.error=e,yield r}}(e.queryStream(...e.queryTag.apply(e,t),a));if("function"==typeof e.query)return e.query(...e.queryTag.apply(e,t),a)}if("function"==typeof e.sql)return e.sql.apply(e,t);throw new Error("source does not implement query, queryStream, or sql")}function Bt(e,t){if("object"==typeof e){let n="";return null!=e.database&&(n+=t(e.database)+"."),null!=e.schema&&(n+=t(e.schema)+"."),n+=t(e.table),n}return t(e)}function zt(e,t){const n=t[0];n[n.length-1]+=e}function Wt({column:e,direction:t},n,r){zt(`${r(e)} ${t.toUpperCase()}`,n)}function Ht({type:e,operands:t},n,r){if(t.length<1)throw new Error("Invalid operand length");if(1===t.length||"v"===e||"nv"===e)switch(Vt(t[0],n,r),e){case"n":case"nv":return void zt(" IS NULL",n);case"nn":case"v":return void zt(" IS NOT NULL",n);default:throw new Error("Invalid filter operation")}if(2!==t.length||["in","nin"].includes(e)){var a;switch(Vt(t[0],n,r),e){case"in":zt(" IN (",n);break;case"nin":zt(" NOT IN (",n);break;default:throw new Error("Invalid filter operation")}!function(e,t){let n=!0;for(const r of e)n?n=!1:zt(",",t),t.push(r.value),t[0].push("")}(t.slice(1),n),zt(")",n)}else{if(["c","nc"].includes(e)){switch(Vt(t[0],n,r),e){case"c":zt(" LIKE ",n);break;case"nc":zt(" NOT LIKE ",n)}return void Vt((a=t[1],{...a,value:`%${a.value}%`}),n,r)}switch(Vt(t[0],n,r),e){case"eq":zt(" = ",n);break;case"ne":zt(" <> ",n);break;case"gt":zt(" > ",n);break;case"lt":zt(" < ",n);break;case"gte":zt(" >= ",n);break;case"lte":zt(" <= ",n);break;default:throw new Error("Invalid filter operation")}Vt(t[1],n,r)}}function Vt(e,t,n){"column"===e.type?zt(n(e.value),t):(t.push(e.value),t[0].push(""))}function Gt(e,t){return(null==e||!(e>=e))-(null==t||!(t>=t))}function Yt(e,t){return Gt(e,t)||(e<t?-1:e>t?1:0)}function Zt(e,t){return Gt(e,t)||(e>t?-1:e<t?1:0)}const Jt=e=>"number"==typeof e&&!Number.isNaN(e),Kt=e=>Number.isInteger(e)&&!Number.isNaN(e),Xt=e=>"string"==typeof e,Qt=e=>"boolean"==typeof e,en=e=>"bigint"==typeof e,tn=e=>e instanceof Date&&!isNaN(e),nn=e=>e instanceof ArrayBuffer,rn=e=>Array.isArray(e),an=e=>"object"==typeof e&&null!==e,on=e=>null!=e;function sn(e){switch(e){case"string":return Xt;case"bigint":return en;case"boolean":return Qt;case"number":return Jt;case"integer":return Kt;case"date":return tn;case"buffer":return nn;case"array":return rn;case"object":return an;default:return on}}const cn=/^(([-+]\d{2})?\d{4}(-\d{2}(-\d{2}))|(\d{1,2})\/(\d{1,2})\/(\d{2,4}))([T ]\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/;function ln(e,t){switch(t){case"string":return"string"==typeof e||null==e?e:String(e);case"boolean":if("string"==typeof e){const t=e.trim().toLowerCase();return"true"===t||"false"!==t&&null}return"boolean"==typeof e||null==e?e:Boolean(e);case"bigint":return"bigint"==typeof e||null==e?e:Number.isInteger("string"!=typeof e||e.trim()?+e:NaN)?BigInt(e):void 0;case"integer":case"number":return"number"==typeof e?e:null==e||"string"==typeof e&&!e.trim()?NaN:Number(e);case"date":{if(e instanceof Date||null==e)return e;if("number"==typeof e)return new Date(e);const t=String(e).trim();return"string"!=typeof e||t?new Date(cn.test(t)?t:NaN):null}case"array":case"object":case"buffer":case"other":return e;default:throw new Error(`Unable to coerce to type: ${t}`)}}function un(e,t){const n=e;let{schema:r,inferred:a}=function(e){const{columns:t}=e;let{schema:n}=e;return $t(n)?{schema:n,inferred:!1}:(n=mn(e,St(t)?t:void 0),{schema:n,inferred:!0})}(e);const o=new Map(r.map((({name:e,type:t})=>[e,t])));if(t.types){for(const{name:e,type:a}of t.types){o.set(e,a),r===n.schema&&(r=r.slice());const t=r.findIndex((t=>t.name===e));t>-1&&(r[t]={...r[t],type:a})}e=e.map((e=>dn(e,o,r)))}else a&&(e=e.map((e=>dn(e,o,r))));return{source:e,schema:r}}function fn(e,t){if(!t.names)return e;const n=new Map(t.names.map((e=>[e.column,e])));return e.map((e=>Object.fromEntries(Object.keys(e).map((t=>[n.get(t)?.name??t,e[t]])))))}function dn(e,t,n){const r={};for(const a of n){const n=t.get(a.name),o=e[a.name];r[a.name]="raw"===n?o:ln(o,n)}return r}const pn=["boolean","integer","number","date","bigint","array","object","buffer"];function mn(e,t=function(e){const t=new Set;for(const n of e)if(n)for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t.add(e);return Array.from(t)}(e)){const n=[],r=e.slice(0,100);for(const e of t){const t={boolean:0,integer:0,number:0,date:0,string:0,array:0,object:0,bigint:0,buffer:0,defined:0};for(const n of r){let r=n[e];if(null==r)continue;const a=typeof r;if("string"!==a)++t.defined,Array.isArray(r)?++t.array:r instanceof Date?++t.date:r instanceof ArrayBuffer?++t.buffer:"number"===a?(++t.number,Number.isInteger(r)&&++t.integer):a in t&&++t[a];else{if(r=r.trim(),!r)continue;++t.defined,++t.string,/^(true|false)$/i.test(r)?++t.boolean:r&&!isNaN(r)?(++t.number,Number.isInteger(+r)&&++t.integer):cn.test(r)&&++t.date}}const a=Math.max(1,.9*t.defined),o=vt(pn,(e=>t[e]>=a?t[e]:NaN))??(t.string>=a?"string":"other");n.push({name:e,type:o,inferred:o})}return n}class Workbook{constructor(e){Object.defineProperties(this,{_:{value:e},sheetNames:{value:e.worksheets.map((e=>e.name)),enumerable:!0}})}sheet(e,t){const n="number"==typeof e?this.sheetNames[e]:this.sheetNames.includes(e+="")?e:null;if(null==n)throw new Error(`Sheet not found: ${e}`);return function(e,{range:t,headers:n}={}){let[[r,a],[o,i]]=function(e=":",{columnCount:t,rowCount:n}){if(!(e+="").match(/^[A-Z]*\d*:[A-Z]*\d*$/))throw new Error("Malformed range specifier");const[[r=0,a=0],[o=t-1,i=n-1]]=e.split(":").map(vn);return[[r,a],[o,i]]}(t,e);const s=n?e._rows[a++]:null;let c=new Set(["#"]);for(let e=r;e<=o;e++){const t=s?hn(s.findCell(e+1)):null;let n=t&&t+""||wn(e);for(;c.has(n);)n+="_";c.add(n)}c=new Array(r).concat(Array.from(c));const l=new Array(i-a+1);for(let t=a;t<=i;t++){const n=l[t-a]=Object.create(null,{"#":{value:t+1}}),i=e.getRow(t+1);if(i.hasValues)for(let e=r;e<=o;e++){const t=hn(i.findCell(e+1));null!=t&&(n[c[e+1]]=t)}}return l.columns=c.filter((()=>!0)),l}(this._.getWorksheet(n),t)}}function hn(e){if(!e)return;const{value:t}=e;if(t&&"object"==typeof t&&!(t instanceof Date)){if(t.formula||t.sharedFormula)return t.result&&t.result.error?NaN:t.result;if(t.richText)return bn(t);if(t.text){let{text:e}=t;return e.richText&&(e=bn(e)),t.hyperlink&&t.hyperlink!==e?`${t.hyperlink} ${e}`:e}return t}return t}function bn(e){return e.richText.map((e=>e.text)).join("")}function wn(e){let t="";e++;do{t=String.fromCharCode(64+(e%26||26))+t}while(e=Math.floor((e-1)/26));return t}function vn(e){const[,t,n]=e.match(/^([A-Z]*)(\d*)$/);let r=0;if(t)for(let e=0;e<t.length;e++)r+=Math.pow(26,t.length-e-1)*(t.charCodeAt(e)-64);return[r?r-1:void 0,n?+n-1:void 0]}async function yn(e){const t=await fetch(await e.url());if(!t.ok)throw new Error(`Unable to load file: ${e.name}`);return t}async function _n(e,t,{array:n=!1,typed:r=!1}={}){const a=await e.text(),o="\t"===t?n?_e:ye:n?we:be;if("auto"===r&&!n){const e=o(a);return function(e,t){const n=new Map(t.map((({name:e,type:t})=>[e,t])));return Object.assign(e.map((e=>dn(e,n,t))),{schema:t})}(e,mn(e,e.columns))}return o(a,r&&ge)}class gn{constructor(e,t){Object.defineProperty(this,"name",{value:e,enumerable:!0}),void 0!==t&&Object.defineProperty(this,"mimeType",{value:t+"",enumerable:!0})}async blob(){return(await yn(this)).blob()}async arrayBuffer(){return(await yn(this)).arrayBuffer()}async text(){return(await yn(this)).text()}async json(){return(await yn(this)).json()}async stream(){return(await yn(this)).body}async csv(e){return _n(this,",",e)}async tsv(e){return _n(this,"\t",e)}async image(e){const t=await this.url();return new Promise(((n,r)=>{const a=new Image;new URL(t,document.baseURI).origin!==new URL(location).origin&&(a.crossOrigin="anonymous"),Object.assign(a,e),a.onload=()=>n(a),a.onerror=()=>r(new Error(`Unable to load file: ${this.name}`)),a.src=t}))}async arrow({version:e=4}={}){switch(e){case 4:{const[e,t]=await Promise.all([ft(Re.resolve()),yn(this)]);return e.Table.from(t)}case 9:{const[e,t]=await Promise.all([import(`${lt}${Ue.resolve()}`),yn(this)]);return e.tableFromIPC(t)}case 11:{const[e,t]=await Promise.all([import(`${lt}${De.resolve()}`),yn(this)]);return e.tableFromIPC(t)}default:throw new Error(`unsupported arrow version: ${e}`)}}async sqlite(){return SQLiteDatabaseClient.open(yn(this))}async zip(){const[e,t]=await Promise.all([ft(Oe.resolve()),this.arrayBuffer()]);return new ZipArchive(await e.loadAsync(t))}async xml(e="application/xml"){return(new DOMParser).parseFromString(await this.text(),e)}async html(){return this.xml("text/html")}async xlsx(){const[e,t]=await Promise.all([ft(ze.resolve()),this.arrayBuffer()]);return new Workbook(await(new e.Workbook).xlsx.load(t))}}class FileAttachment extends gn{constructor(e,t,n){super(t,n),Object.defineProperty(this,"_url",{value:e})}async url(){return await this._url+""}}function En(e){throw new Error(`File not found: ${e}`)}class ZipArchive{constructor(e){Object.defineProperty(this,"_",{value:e}),this.filenames=Object.keys(e.files).filter((t=>!e.files[t].dir))}file(e){const t=this._.file(e+="");if(!t||t.dir)throw new Error(`file not found: ${e}`);return new ZipArchiveEntry(t)}}class ZipArchiveEntry extends gn{constructor(e){super(e.name),Object.defineProperty(this,"_",{value:e}),Object.defineProperty(this,"_url",{writable:!0})}async url(){return this._url||(this._url=this.blob().then(URL.createObjectURL))}async blob(){return this._.async("blob")}async arrayBuffer(){return this._.async("arraybuffer")}async text(){return this._.async("text")}async json(){return JSON.parse(await this.text())}}var Cn={math:"http://www.w3.org/1998/Math/MathML",svg:"http://www.w3.org/2000/svg",xhtml:"http://www.w3.org/1999/xhtml",xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};var Nn=0;function xn(e){return new Tn("O-"+(null==e?"":e+"-")+ ++Nn)}function Tn(e){this.id=e,this.href=new URL(`#${e}`,location)+""}Tn.prototype.toString=function(){return"url("+this.href+")"};var An=Object.freeze({__proto__:null,canvas:function(e,t){var n=document.createElement("canvas");return n.width=e,n.height=t,n},context2d:function(e,t,n){null==n&&(n=devicePixelRatio);var r=document.createElement("canvas");r.width=e*n,r.height=t*n,r.style.width=e+"px";var a=r.getContext("2d");return a.scale(n,n),a},download:function(e,t="untitled",n="Save"){const r=document.createElement("a"),a=r.appendChild(document.createElement("button"));async function o(){await new Promise(requestAnimationFrame),URL.revokeObjectURL(r.href),r.removeAttribute("href"),a.textContent=n,a.disabled=!1}return a.textContent=n,r.download=t,r.onclick=async t=>{if(a.disabled=!0,r.href)return o();a.textContent="Saving…";try{const t=await("function"==typeof e?e():e);a.textContent="Download",r.href=URL.createObjectURL(t)}catch(e){a.textContent=n}if(t.eventPhase)return o();a.disabled=!1},r},element:function(e,t){var n,r=e+="",a=r.indexOf(":");a>=0&&"xmlns"!==(r=e.slice(0,a))&&(e=e.slice(a+1));var o=Cn.hasOwnProperty(r)?document.createElementNS(Cn[r],e):document.createElement(e);if(t)for(var i in t)a=(r=i).indexOf(":"),n=t[i],a>=0&&"xmlns"!==(r=i.slice(0,a))&&(i=i.slice(a+1)),Cn.hasOwnProperty(r)?o.setAttributeNS(Cn[r],i,n):o.setAttribute(i,n);return o},input:function(e){var t=document.createElement("input");return null!=e&&(t.type=e),t},range:function(e,t,n){1===arguments.length&&(t=e,e=null);var r=document.createElement("input");return r.min=e=null==e?0:+e,r.max=t=null==t?1:+t,r.step=null==n?"any":n=+n,r.type="range",r},select:function(e){var t=document.createElement("select");return Array.prototype.forEach.call(e,(function(e){var n=document.createElement("option");n.value=n.textContent=e,t.appendChild(n)})),t},svg:function(e,t){var n=document.createElementNS("http://www.w3.org/2000/svg","svg");return n.setAttribute("viewBox",[0,0,e,t]),n.setAttribute("width",e),n.setAttribute("height",t),n},text:function(e){return document.createTextNode(e)},uid:xn});var jn=Object.freeze({__proto__:null,buffer:function(e){return new Promise((function(t,n){var r=new FileReader;r.onload=function(){t(r.result)},r.onerror=n,r.readAsArrayBuffer(e)}))},text:function(e){return new Promise((function(t,n){var r=new FileReader;r.onload=function(){t(r.result)},r.onerror=n,r.readAsText(e)}))},url:function(e){return new Promise((function(t,n){var r=new FileReader;r.onload=function(){t(r.result)},r.onerror=n,r.readAsDataURL(e)}))}});function $n(){return this}function Sn(e,t){let n=!1;if("function"!=typeof t)throw new Error("dispose is not a function");return{[Symbol.iterator]:$n,next:()=>n?{done:!0}:(n=!0,{done:!1,value:e}),return:()=>(n=!0,t(e),{done:!0}),throw:()=>({done:n=!0})}}function qn(e){let t,n,r=!1;const a=e((function(e){n?(n(e),n=null):r=!0;return t=e}));if(null!=a&&"function"!=typeof a)throw new Error("function"==typeof a.then?"async initializers are not supported":"initializer returned something, but not a dispose function");return{[Symbol.iterator]:$n,throw:()=>({done:!0}),return:()=>(null!=a&&a(),{done:!0}),next:function(){return{done:!1,value:r?(r=!1,Promise.resolve(t)):new Promise((e=>n=e))}}}}function On(e){switch(e.type){case"range":case"number":return e.valueAsNumber;case"date":return e.valueAsDate;case"checkbox":return e.checked;case"file":return e.multiple?e.files:e.files[0];case"select-multiple":return Array.from(e.selectedOptions,(e=>e.value));default:return e.value}}var Ln=Object.freeze({__proto__:null,disposable:Sn,filter:function*(e,t){for(var n,r=-1;!(n=e.next()).done;)t(n.value,++r)&&(yield n.value)},input:function(e){return qn((function(t){var n=function(e){switch(e.type){case"button":case"submit":case"checkbox":return"click";case"file":return"change";default:return"input"}}(e),r=On(e);function a(){t(On(e))}return e.addEventListener(n,a),void 0!==r&&t(r),function(){e.removeEventListener(n,a)}}))},map:function*(e,t){for(var n,r=-1;!(n=e.next()).done;)yield t(n.value,++r)},observe:qn,queue:function(e){let t;const n=[],r=e((function(e){n.push(e),t&&(t(n.shift()),t=null);return e}));if(null!=r&&"function"!=typeof r)throw new Error("function"==typeof r.then?"async initializers are not supported":"initializer returned something, but not a dispose function");return{[Symbol.iterator]:$n,throw:()=>({done:!0}),return:()=>(null!=r&&r(),{done:!0}),next:function(){return{done:!1,value:n.length?Promise.resolve(n.shift()):new Promise((e=>t=e))}}}},range:function*(e,t,n){e=+e,t=+t,n=(a=arguments.length)<2?(t=e,e=0,1):a<3?1:+n;for(var r=-1,a=0|Math.max(0,Math.ceil((t-e)/n));++r<a;)yield e+r*n},valueAt:function(e,t){if(!(!isFinite(t=+t)||t<0||t!=t|0))for(var n,r=-1;!(n=e.next()).done;)if(++r===t)return n.value},worker:function(e){const t=URL.createObjectURL(new Blob([e],{type:"text/javascript"})),n=new Worker(t);return Sn(n,(()=>{n.terminate(),URL.revokeObjectURL(t)}))}});function kn(e,t){return function(n){var r,a,o,i,s,c,l,u,f=n[0],d=[],p=null,m=-1;for(s=1,c=arguments.length;s<c;++s){if((r=arguments[s])instanceof Node)d[++m]=r,f+="\x3c!--o:"+m+"--\x3e";else if(Array.isArray(r)){for(l=0,u=r.length;l<u;++l)(a=r[l])instanceof Node?(null===p&&(d[++m]=p=document.createDocumentFragment(),f+="\x3c!--o:"+m+"--\x3e"),p.appendChild(a)):(p=null,f+=a);p=null}else f+=r;f+=n[s]}if(p=e(f),++m>0){for(o=new Array(m),i=document.createTreeWalker(p,NodeFilter.SHOW_COMMENT,null,!1);i.nextNode();)a=i.currentNode,/^o:/.test(a.nodeValue)&&(o[+a.nodeValue.slice(2)]=a);for(s=0;s<m;++s)(a=o[s])&&a.parentNode.replaceChild(d[s],a)}return 1===p.childNodes.length?p.removeChild(p.firstChild):11===p.nodeType?((a=t()).appendChild(p),a):p}}const Mn=kn((function(e){var t=document.createElement("template");return t.innerHTML=e.trim(),document.importNode(t.content,!0)}),(function(){return document.createElement("span")}));function In(e){let t;Object.defineProperties(this,{generator:{value:qn((e=>{t=e}))},value:{get:()=>e,set:n=>t(e=n)}}),void 0!==e&&t(e)}function*Pn(){for(;;)yield Date.now()}var Rn=new Map;function Un(e,t){var n;return(n=Rn.get(e=+e))?n.then((()=>t)):(n=Date.now())>=e?Promise.resolve(t):function(e,t){var n=new Promise((function(n){Rn.delete(t);var r=t-e;if(!(r>0))throw new Error("invalid time");if(r>2147483647)throw new Error("too long to wait");setTimeout(n,r)}));return Rn.set(t,n),n}(n,e).then((()=>t))}var Dn=Object.freeze({__proto__:null,delay:function(e,t){return new Promise((function(n){setTimeout((function(){n(t)}),e)}))},tick:function(e,t){return Un(Math.ceil((Date.now()+1)/e)*e,t)},when:Un});function Fn(e,t){if(/^(\w+:)|\/\//i.test(e))return e;if(/^[.]{0,2}\//i.test(e))return new URL(e,null==t?location:t).href;if(!e.length||/^[\s._]/.test(e)||/\s$/.test(e))throw new Error("illegal name");return"https://unpkg.com/"+e}const Bn=kn((function(e){var t=document.createElementNS("http://www.w3.org/2000/svg","g");return t.innerHTML=e.trim(),t}),(function(){return document.createElementNS("http://www.w3.org/2000/svg","g")}));var zn=String.raw;function Wn(e){return new Promise((function(t,n){var r=document.createElement("link");r.rel="stylesheet",r.href=e,r.onerror=n,r.onload=t,document.head.appendChild(r)}))}function Hn(){return qn((function(e){var t=e(document.body.clientWidth);function n(){var n=document.body.clientWidth;n!==t&&e(t=n)}return window.addEventListener("resize",n),function(){window.removeEventListener("resize",n)}}))}const Library=Object.assign(Object.defineProperties((function(e){const t=function(e){return null==e?ft:at(e)}(e);var n;Object.defineProperties(this,(n={FileAttachment:()=>En,Mutable:()=>In,now:Pn,width:Hn,dot:()=>t(Ae.resolve()),htl:()=>t(qe.resolve()),html:()=>Mn,md:()=>function(e){return e(Le.resolve()).then((function(t){return kn((function(n){var r=document.createElement("div");r.innerHTML=t(n,{langPrefix:""}).trim();var a=r.querySelectorAll("pre code[class]");return a.length>0&&e(je.resolve()).then((function(t){a.forEach((function(n){function r(){t.highlightBlock(n),n.parentNode.classList.add("observablehq--md-pre")}t.getLanguage(n.className)?r():e(je.resolve("async-languages/index.js")).then((r=>{if(r.has(n.className))return e(je.resolve("async-languages/"+r.get(n.className))).then((e=>{t.registerLanguage(n.className,e)}))})).then(r,r)}))})),r}),(function(){return document.createElement("div")}))}))}(t),svg:()=>Bn,tex:()=>function(e){return Promise.all([e($e.resolve()),e.resolve($e.resolve("dist/katex.min.css")).then(Wn)]).then((function(e){var t=e[0],n=r();function r(e){return function(){var n=document.createElement("div");return t.render(zn.apply(String,arguments),n,e),n.removeChild(n.firstChild)}}return n.options=r,n.block=r({displayMode:!0}),n}))}(t),_:()=>t(Se.resolve()),aq:()=>t.alias({"apache-arrow":Re.resolve()})(Fe.resolve()),Arrow:()=>t(Re.resolve()),d3:()=>t(Ne.resolve()),DuckDBClient:()=>DuckDBClient,Inputs:()=>t(xe.resolve()).then((e=>({...e,file:e.fileOf(gn)}))),L:()=>async function(e){const t=await e(He.resolve());if(!t._style){const n=document.createElement("link");n.rel="stylesheet",n.href=await e.resolve(He.resolve("dist/leaflet.css")),t._style=document.head.appendChild(n)}return t}(t),mermaid:()=>async function(e){const t=await e(We.resolve());return t.initialize({securityLevel:"loose",theme:"neutral"}),function(){const e=document.createElement("div");return e.innerHTML=t.render(xn().id,String.raw.apply(String,arguments)),e.removeChild(e.firstChild)}}(t),Plot:()=>t(Te.resolve()),__query:()=>It,require:()=>t,resolve:()=>Fn,SQLite:()=>dt(t),SQLiteDatabaseClient:()=>SQLiteDatabaseClient,topojson:()=>t(Be.resolve()),vl:()=>async function(e){const[t,n,r]=await Promise.all([Me,Ie,Pe].map((t=>e(t.resolve()))));return r.register(t,n)}(t),aapl:()=>new FileAttachment("https://static.observableusercontent.com/files/3ccff97fd2d93da734e76829b2b066eafdaac6a1fafdec0faf6ebc443271cfc109d29e80dd217468fcb2aff1e6bffdc73f356cc48feb657f35378e6abbbb63b9").csv({typed:!0}),alphabet:()=>new FileAttachment("https://static.observableusercontent.com/files/75d52e6c3130b1cae83cda89305e17b50f33e7420ef205587a135e8562bcfd22e483cf4fa2fb5df6dff66f9c5d19740be1cfaf47406286e2eb6574b49ffc685d").csv({typed:!0}),cars:()=>new FileAttachment("https://static.observableusercontent.com/files/048ec3dfd528110c0665dfa363dd28bc516ffb7247231f3ab25005036717f5c4c232a5efc7bb74bc03037155cb72b1abe85a33d86eb9f1a336196030443be4f6").csv({typed:!0}),citywages:()=>new FileAttachment("https://static.observableusercontent.com/files/39837ec5121fcc163131dbc2fe8c1a2e0b3423a5d1e96b5ce371e2ac2e20a290d78b71a4fb08b9fa6a0107776e17fb78af313b8ea70f4cc6648fad68ddf06f7a").csv({typed:!0}),diamonds:()=>new FileAttachment("https://static.observableusercontent.com/files/87942b1f5d061a21fa4bb8f2162db44e3ef0f7391301f867ab5ba718b225a63091af20675f0bfe7f922db097b217b377135203a7eab34651e21a8d09f4e37252").csv({typed:!0}),flare:()=>new FileAttachment("https://static.observableusercontent.com/files/a6b0d94a7f5828fd133765a934f4c9746d2010e2f342d335923991f31b14120de96b5cb4f160d509d8dc627f0107d7f5b5070d2516f01e4c862b5b4867533000").csv({typed:!0}),industries:()=>new FileAttachment("https://static.observableusercontent.com/files/76f13741128340cc88798c0a0b7fa5a2df8370f57554000774ab8ee9ae785ffa2903010cad670d4939af3e9c17e5e18e7e05ed2b38b848ac2fc1a0066aa0005f").csv({typed:!0}),miserables:()=>new FileAttachment("https://static.observableusercontent.com/files/31d904f6e21d42d4963ece9c8cc4fbd75efcbdc404bf511bc79906f0a1be68b5a01e935f65123670ed04e35ca8cae3c2b943f82bf8db49c5a67c85cbb58db052").json(),olympians:()=>new FileAttachment("https://static.observableusercontent.com/files/31ca24545a0603dce099d10ee89ee5ae72d29fa55e8fc7c9ffb5ded87ac83060d80f1d9e21f4ae8eb04c1e8940b7287d179fe8060d887fb1f055f430e210007c").csv({typed:!0}),penguins:()=>new FileAttachment("https://static.observableusercontent.com/files/715db1223e067f00500780077febc6cebbdd90c151d3d78317c802732252052ab0e367039872ab9c77d6ef99e5f55a0724b35ddc898a1c99cb14c31a379af80a").csv({typed:!0}),pizza:()=>new FileAttachment("https://static.observableusercontent.com/files/c653108ab176088cacbb338eaf2344c4f5781681702bd6afb55697a3f91b511c6686ff469f3e3a27c75400001a2334dbd39a4499fe46b50a8b3c278b7d2f7fb5").csv({typed:!0}),weather:()=>new FileAttachment("https://static.observableusercontent.com/files/693a46b22b33db0f042728700e0c73e836fa13d55446df89120682d55339c6db7cc9e574d3d73f24ecc9bc7eb9ac9a1e7e104a1ee52c00aab1e77eb102913c1f").csv({typed:!0}),DOM:An,Files:jn,Generators:Ln,Promises:Dn},Object.fromEntries(Object.entries(n).map(Vn))))}),{resolve:{get:()=>ft.resolve,enumerable:!0,configurable:!0},require:{get:()=>ft,set:function(e){ft=e},enumerable:!0,configurable:!0}}),{resolveFrom:nt,requireFrom:at});function Vn([e,t]){return[e,{value:t,writable:!0,enumerable:!0}]}class RuntimeError extends Error{constructor(e,t){super(e),this.input=t}}function Gn(e){return()=>e}function Yn(e){return e}RuntimeError.prototype.name="RuntimeError";const Zn=Array.prototype.map;function Jn(){}const Kn=Symbol("no-observer");function Variable(e,t,n,r){var a;n||(n=Kn),Object.defineProperties(this,{_observer:{value:n,writable:!0},_definition:{value:tr,writable:!0},_duplicate:{value:void 0,writable:!0},_duplicates:{value:void 0,writable:!0},_indegree:{value:NaN,writable:!0},_inputs:{value:[],writable:!0},_invalidate:{value:Jn,writable:!0},_module:{value:t},_name:{value:null,writable:!0},_outputs:{value:new Set,writable:!0},_promise:{value:Promise.resolve(void 0),writable:!0},_reachable:{value:n!==Kn,writable:!0},_rejector:{value:(a=this,e=>{if(e===nr)throw e;if(e===tr)throw new RuntimeError(`${a._name} is not defined`,a._name);if(e instanceof Error&&e.message)throw new RuntimeError(e.message,a._name);throw new RuntimeError(`${a._name} could not be resolved`,a._name)})},_shadow:{value:Xn(t,r)},_type:{value:e},_value:{value:void 0,writable:!0},_version:{value:0,writable:!0}})}function Xn(e,t){return t?.shadow?new Map(Object.entries(t.shadow).map((([t,n])=>[t,new Variable(2,e).define([],n)]))):null}function Qn(e){e._module._runtime._dirty.add(e),e._outputs.add(this)}function er(e){e._module._runtime._dirty.add(e),e._outputs.delete(this)}function tr(){throw tr}function nr(){throw nr}function rr(e){return()=>{throw new RuntimeError(`${e} is defined more than once`)}}function ar(e,t,n){const r=this._module._scope,a=this._module._runtime;if(this._inputs.forEach(er,this),t.forEach(Qn,this),this._inputs=t,this._definition=n,this._value=void 0,n===Jn?a._variables.delete(this):a._variables.add(this),e!==this._name||r.get(e)!==this){let t,o;if(this._name)if(this._outputs.size)r.delete(this._name),o=this._module._resolve(this._name),o._outputs=this._outputs,this._outputs=new Set,o._outputs.forEach((function(e){e._inputs[e._inputs.indexOf(this)]=o}),this),o._outputs.forEach(a._updates.add,a._updates),a._dirty.add(o).add(this),r.set(this._name,o);else if((o=r.get(this._name))===this)r.delete(this._name);else{if(3!==o._type)throw new Error;o._duplicates.delete(this),this._duplicate=void 0,1===o._duplicates.size&&(o=o._duplicates.keys().next().value,t=r.get(this._name),o._outputs=t._outputs,t._outputs=new Set,o._outputs.forEach((function(e){e._inputs[e._inputs.indexOf(t)]=o})),o._definition=o._duplicate,o._duplicate=void 0,a._dirty.add(t).add(o),a._updates.add(o),r.set(this._name,o))}if(this._outputs.size)throw new Error;e&&((o=r.get(e))?3===o._type?(this._definition=rr(e),this._duplicate=n,o._duplicates.add(this)):2===o._type?(this._outputs=o._outputs,o._outputs=new Set,this._outputs.forEach((function(e){e._inputs[e._inputs.indexOf(o)]=this}),this),a._dirty.add(o).add(this),r.set(e,this)):(o._duplicate=o._definition,this._duplicate=n,t=new Variable(3,this._module),t._name=e,t._definition=this._definition=o._definition=rr(e),t._outputs=o._outputs,o._outputs=new Set,t._outputs.forEach((function(e){e._inputs[e._inputs.indexOf(o)]=t})),t._duplicates=new Set([this,o]),a._dirty.add(o).add(t),a._updates.add(o).add(t),r.set(e,t)):r.set(e,this)),this._name=e}return this._version>0&&++this._version,a._updates.add(this),a._compute(),this}Object.defineProperties(Variable.prototype,{_pending:{value:function(){this._observer.pending&&this._observer.pending()},writable:!0,configurable:!0},_fulfilled:{value:function(e){this._observer.fulfilled&&this._observer.fulfilled(e,this._name)},writable:!0,configurable:!0},_rejected:{value:function(e){this._observer.rejected&&this._observer.rejected(e,this._name)},writable:!0,configurable:!0},_resolve:{value:function(e){return this._shadow?.get(e)??this._module._resolve(e)},writable:!0,configurable:!0},define:{value:function(e,t,n){switch(arguments.length){case 1:n=e,e=t=null;break;case 2:n=t,"string"==typeof e?t=null:(t=e,e=null)}return ar.call(this,null==e?null:String(e),null==t?[]:Zn.call(t,this._resolve,this),"function"==typeof n?n:Gn(n))},writable:!0,configurable:!0},delete:{value:function(){return ar.call(this,null,[],Jn)},writable:!0,configurable:!0},import:{value:function(e,t,n){arguments.length<3&&(n=t,t=e);return ar.call(this,String(t),[n._resolve(String(e))],Yn)},writable:!0,configurable:!0}});const or=Symbol("variable"),ir=Symbol("invalidation"),sr=Symbol("visibility");function Module(e,t=[]){Object.defineProperties(this,{_runtime:{value:e},_scope:{value:new Map},_builtins:{value:new Map([["@variable",or],["invalidation",ir],["visibility",sr],...t])},_source:{value:null,writable:!0}})}async function cr(e,t){await e._compute();try{return await t._promise}catch(n){if(n===nr)return cr(e,t);throw n}}function lr(e){return e._name}Object.defineProperties(Module.prototype,{_resolve:{value:function(e){let t,n=this._scope.get(e);if(!n)if(n=new Variable(2,this),this._builtins.has(e))n.define(e,Gn(this._builtins.get(e)));else if(this._runtime._builtin._scope.has(e))n.import(e,this._runtime._builtin);else{try{t=this._runtime._global(e)}catch(t){return n.define(e,function(e){return()=>{throw e}}(t))}void 0===t?this._scope.set(n._name=e,n):n.define(e,Gn(t))}return n},writable:!0,configurable:!0},redefine:{value:function(e){const t=this._scope.get(e);if(!t)throw new RuntimeError(`${e} is not defined`);if(3===t._type)throw new RuntimeError(`${e} is defined more than once`);return t.define.apply(t,arguments)},writable:!0,configurable:!0},define:{value:function(){const e=new Variable(1,this);return e.define.apply(e,arguments)},writable:!0,configurable:!0},derive:{value:function(e,t){const n=new Map,r=new Set,a=[];function o(e){let t=n.get(e);return t||(t=new Module(e._runtime,e._builtins),t._source=e,n.set(e,t),a.push([t,e]),r.add(e),t)}const i=o(this);for(const n of e){const{alias:e,name:r}="object"==typeof n?n:{name:n};i.import(r,null==e?r:e,t)}for(const e of r)for(const[t,n]of e._scope)if(n._definition===Yn){if(e===this&&i._scope.has(t))continue;const r=n._inputs[0]._module;r._source&&o(r)}for(const[e,t]of a)for(const[r,a]of t._scope){const t=e._scope.get(r);if(!t||2===t._type)if(a._definition===Yn){const t=a._inputs[0],o=t._module;e.import(t._name,r,n.get(o)||o)}else e.define(r,a._inputs.map(lr),a._definition)}return i},writable:!0,configurable:!0},import:{value:function(){const e=new Variable(1,this);return e.import.apply(e,arguments)},writable:!0,configurable:!0},value:{value:async function(e){let t=this._scope.get(e);if(!t)throw new RuntimeError(`${e} is not defined`);if(t._observer!==Kn)return cr(this._runtime,t);t=this.variable(!0).define([e],Yn);try{return await cr(this._runtime,t)}finally{t.delete()}},writable:!0,configurable:!0},variable:{value:function(e,t){return new Variable(1,this,e,t)},writable:!0,configurable:!0},builtin:{value:function(e,t){this._builtins.set(e,t)},writable:!0,configurable:!0}});const ur="function"==typeof requestAnimationFrame?requestAnimationFrame:"function"==typeof setImmediate?setImmediate:e=>setTimeout(e,0);function Runtime(e=new Library,t=yr){const n=this.module();if(Object.defineProperties(this,{_dirty:{value:new Set},_updates:{value:new Set},_precomputes:{value:[],writable:!0},_computing:{value:null,writable:!0},_init:{value:null,writable:!0},_modules:{value:new Map},_variables:{value:new Set},_disposed:{value:!1,writable:!0},_builtin:{value:n},_global:{value:t}}),e)for(const t in e)new Variable(2,n).define(t,[],e[t])}function fr(e){const t=new Set(e._inputs);for(const n of t){if(n===e)return!0;n._inputs.forEach(t.add,t)}return!1}function dr(e){++e._indegree}function pr(e){--e._indegree}function mr(e){return e._promise.catch(e._rejector)}function hr(e){return new Promise((function(t){e._invalidate=t}))}function br(e,t){let n,r,a="function"==typeof IntersectionObserver&&t._observer&&t._observer._node,o=!a,i=Jn,s=Jn;return a&&(r=new IntersectionObserver((([e])=>(o=e.isIntersecting)&&(n=null,i()))),r.observe(a),e.then((()=>(r.disconnect(),r=null,s())))),function(e){return o?Promise.resolve(e):r?(n||(n=new Promise(((e,t)=>(i=e,s=t)))),n.then((()=>e))):Promise.reject()}}function wr(e){e._invalidate(),e._invalidate=Jn,e._pending();const t=e._value,n=++e._version;let r=null;const a=e._promise=(e._inputs.length?Promise.all(e._inputs.map(mr)).then((function(a){if(e._version!==n)throw nr;for(let t=0,n=a.length;t<n;++t)switch(a[t]){case ir:a[t]=r=hr(e);break;case sr:r||(r=hr(e)),a[t]=br(r,e);break;case or:a[t]=e}return e._definition.apply(t,a)})):new Promise((n=>n(e._definition.call(t))))).then((function(t){if(e._version!==n)throw nr;if(function(e){return e&&"function"==typeof e.next&&"function"==typeof e.return}(t))return(r||hr(e)).then((a=t,function(){a.return()})),function(e,t,n){const r=e._module._runtime;let a;function o(e){return new Promise((e=>e(n.next(a)))).then((({done:t,value:n})=>t?void 0:Promise.resolve(n).then(e)))}function i(){const n=o((o=>{if(e._version!==t)throw nr;return a=o,s(o,n).then((()=>r._precompute(i))),e._fulfilled(o),o}));n.catch((r=>{r!==nr&&e._version===t&&(s(void 0,n),e._rejected(r))}))}function s(t,n){return e._value=t,e._promise=n,e._outputs.forEach(r._updates.add,r._updates),r._compute()}return o((n=>{if(e._version!==t)throw nr;return a=n,r._precompute(i),n}))}(e,n,t);var a;return t}));a.then((t=>{e._value=t,e._fulfilled(t)}),(t=>{t!==nr&&e._version===n&&(e._value=void 0,e._rejected(t))}))}function vr(e,t){e._invalidate(),e._invalidate=Jn,e._pending(),++e._version,e._indegree=NaN,(e._promise=Promise.reject(t)).catch(Jn),e._value=void 0,e._rejected(t)}function yr(e){return globalThis[e]}Object.defineProperties(Runtime.prototype,{_precompute:{value:function(e){this._precomputes.push(e),this._compute()},writable:!0,configurable:!0},_compute:{value:function(){return this._computing||(this._computing=this._computeSoon())},writable:!0,configurable:!0},_computeSoon:{value:function(){return new Promise(ur).then((()=>this._disposed?void 0:this._computeNow()))},writable:!0,configurable:!0},_computeNow:{value:async function(){let e,t,n=[],r=this._precomputes;if(r.length){this._precomputes=[];for(const e of r)e();await function(e=0){let t=Promise.resolve();for(let n=0;n<e;++n)t=t.then((()=>{}));return t}(3)}e=new Set(this._dirty),e.forEach((function(t){t._inputs.forEach(e.add,e);const n=function(e){if(e._observer!==Kn)return!0;const t=new Set(e._outputs);for(const e of t){if(e._observer!==Kn)return!0;e._outputs.forEach(t.add,t)}return!1}(t);n>t._reachable?this._updates.add(t):n<t._reachable&&t._invalidate(),t._reachable=n}),this),e=new Set(this._updates),e.forEach((function(t){t._reachable?(t._indegree=0,t._outputs.forEach(e.add,e)):(t._indegree=NaN,e.delete(t))})),this._computing=null,this._updates.clear(),this._dirty.clear(),e.forEach((function(e){e._outputs.forEach(dr)}));do{for(e.forEach((function(e){0===e._indegree&&n.push(e)}));t=n.pop();)wr(t),t._outputs.forEach(a),e.delete(t);e.forEach((function(t){fr(t)&&(vr(t,new RuntimeError("circular definition")),t._outputs.forEach(pr),e.delete(t))}))}while(e.size);function a(e){0==--e._indegree&&n.push(e)}},writable:!0,configurable:!0},dispose:{value:function(){this._computing=Promise.resolve(),this._disposed=!0,this._variables.forEach((e=>{e._invalidate(),e._version=NaN}))},writable:!0,configurable:!0},module:{value:function(e,t=Jn){let n;if(void 0===e)return(n=this._init)?(this._init=null,n):new Module(this);if(n=this._modules.get(e),n)return n;this._init=n=new Module(this),this._modules.set(e,n);try{e(this,t)}finally{this._init=null}return n},writable:!0,configurable:!0},fileAttachments:{value:function(e){return Object.assign((t=>{const n=e(t+="");if(null==n)throw new Error(`File not found: ${t}`);if("object"==typeof n&&"url"in n){const{url:e,mimeType:r}=n;return new FileAttachment(e,t,r)}return new FileAttachment(n,t)}),{prototype:FileAttachment.prototype})},writable:!0,configurable:!0}});export{Inspector,Library,Runtime,RuntimeError};
                                                                                                    ./package.json                                                                                      000644  000000  000000  00000000503 14462206250 011646  0                                                                                                    ustar 00                                                                000000  000000                                                                                                                                                                         {
  "name": "@d3/bar-chart-race",
  "main": "3ff9fa2c6593d814@3087.js",
  "version": "3087.0.0",
  "homepage": "https://observablehq.com/@d3/bar-chart-race",
  "author": {
    "name": "D3",
    "url": "https://observablehq.com/@d3"
  },
  "type": "module",
  "peerDependencies": {
    "@observablehq/runtime": "4 - 5"
  }
}                                                                                                                                                                                             ./README.md                                                                                         000644  000000  000000  00000001421 14462206250 010637  0                                                                                                    ustar 00                                                                000000  000000                                                                                                                                                                         # Bar Chart Race

https://observablehq.com/@d3/bar-chart-race@3087

View this notebook in your browser by running a web server in this folder. For
example:

~~~sh
npx http-server
~~~

Or, use the [Observable Runtime](https://github.com/observablehq/runtime) to
import this module directly into your application. To npm install:

~~~sh
npm install @observablehq/runtime@5
npm install https://api.observablehq.com/@d3/bar-chart-race@3087.tgz?v=3
~~~

Then, import your notebook and the runtime as:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "@d3/bar-chart-race";
~~~

To log the value of the cell named “foo”:

~~~js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~
                                                                                                                                                                                                                                               ./LICENSE.txt                                                                                       000644  000000  000000  00000001341 14462206250 011204  0                                                                                                    ustar 00                                                                000000  000000                                                                                                                                                                         Copyright 2019–2023 Observable, Inc.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
