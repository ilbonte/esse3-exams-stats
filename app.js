//224
//
//

function Esame(materia, crediti, voto) {
  this.materia = materia;
  this.crediti = crediti;
  this.voto = voto;
}

function esameFatto(riga) {
    var numero = "a";
    testo = riga.find('td:nth-child(10)').text();
    numero = /[^-]+/.exec(testo);
    if (isNaN(numero) || numero === null) {
        return false;
    } else {
        return true;
    }
}

function trovaEsamiFatti(tabella) {
    
    $(tabella).children('tr').each(function() {
        if (esameFatto($(this)) === true) {
            nodiEsami.push(this);
        }
    });
    console.log(nodiEsami);
}


var tabella = $("tr>td>table>tbody:contains(Attività Didattiche)");
var nodiEsami = [];
trovaEsamiFatti(tabella);
