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
        var lista = {};
        d3.select('tr#resultDataRow1').each(function(){
          lista = {
            "investigador": d3.select(this).select('td.authorResultsNamesCol').select('a').text().trim(),
            "articulos": d3.select(this).select('td.dataCol3').text().trim(),
            "hindex": d3.select(this).select('td.dataCol4').text().trim(),
            "afiliacion": d3.select(this).select('td.dataCol5').text().trim()
          }
        })
        return lista
      })

      // console.log(data);
      // let obj = {};
      // let name = invs[k][0]+' '+invs[k][1];
      // obj[name] = data;
      // data_final.push(obj);
      data_final.push(data);

      let json = JSON.stringify(data_final);
      writeFileSync("sni_scopus.json", json);
  }
  yield nightmare.end();
  return 0;
}

vo(run)(function(err, arreglo){})