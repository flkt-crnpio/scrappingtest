const Nightmare = require('nightmare');
const { readFileSync, writeFileSync } = require('fs');
const vo = require('vo');


nightmare = new Nightmare({show:true});

// se lee el csv y se separa por filas
const rows = readFileSync('./milistaexterna.csv', {encoding: 'utf8'}).trim().split('\n');
// se hace un subarreglo separando por las comas en cada renglon
const invs = rows.map(row => row.split(','));
console.log(invs);


// generator function* ()
const run = function*() {
  var data_final = [];

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
        var lista = [];
        d3.select('tr#resultDataRow1').each(function(){
          let investigador = d3.select(this).select('td.authorResultsNamesCol').select('a').text().trim();
          let articulos = d3.select(this).select('td.dataCol3').text().trim();
          let hindex = d3.select(this).select('td.dataCol4').text().trim();
          let afiliacion = d3.select(this).select('td.dataCol5').text().trim();
          lista.push([investigador, articulos, hindex, afiliacion]);
        })
        return lista
      })

      console.log(data);
      data_final.push([invs[k], data]);

      let json = JSON.stringify(data_final);
      writeFileSync("sni_scopus.json", json);
  }
  yield nightmare.end();
  return 0;
}

vo(run)(function(err, arreglo){})