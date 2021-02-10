const { csvFormat } = require('d3-dsv');
const Nightmare = require('nightmare');
const { readFileSync, writeFileSync } = require('fs');
const vo = require('vo');
const d3 = require('d3');


nightmare = new Nightmare({show:true});


const rows = readFileSync('./milistaexterna.csv', 
  {encoding: 'utf8'}).trim().split('\n');
// console.log(rows);
// let col = rows.split(',');
// console.log(col[0])
// console.log(col[1])

const invs = rows.map(row => {
  let col = row.split(',');
  return col;
})
console.log(invs)

// var invs=[['Hugo','López Gatell'],['Juan','López'],['Pedro','Suárez']]

var run = function*() {
var data_final=[];

for (var k = invs.length - 1; k >= 0; k--) {
  var data = yield nightmare
    .goto('https://www.scopus.com/freelookup/form/author.uri?zone=TopNavBar&origin=NO%20ORIGIN%20DEFINED')
    .wait('form')
    .evaluate(function() {
      document.querySelector('input#lastname').value = ''
      })
    .type('input#lastname', invs[k][1])
    .evaluate(function() {
      document.querySelector('input#firstname').value = ''
      })
    .type('input#firstname', invs[k][0])
    .click('#authorSubmitBtn')
    .wait('table#srchResultsList')
    .inject('js','node_modules/d3/dist/d3.js')
    .evaluate(function() {
      //lista para los datos extraidos
      var lista=[];
      d3.select('tr#resultDataRow1').each(function(d,i){
            var investigador=d3.select(this).select('td.authorResultsNamesCol').select('a').text();
            var articulos=d3.select(this).select('td.dataCol3').text();
            var hindex=d3.select(this).select('td.dataCol4').text();
            var afiliacion=d3.select(this).select('td.dataCol5').text();
        lista.push([investigador,articulos,hindex,afiliacion]);
        })
      return lista
    })

    console.log(data);
    data_final.push([invs[k],data]);

    let json = JSON.stringify(data_final);
    writeFileSync("sni_scopus.json",json);
  }
  yield nightmare.end();
  return 0;   
}


vo(run)(function(err, arreglo){

})