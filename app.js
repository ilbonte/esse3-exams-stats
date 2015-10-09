var tabella = $("tr>td>table>tbody:contains(Attività Didattiche)");
var nodiEsami = [];
var esami = [];

function Esame(materia, crediti, voto, data) {
    this.materia = materia;
    this.crediti = crediti;
    this.voto = voto;
    this.data = data;
}

function init() {
    trovaEsamiFatti(tabella);
    for (var i = 0; i < nodiEsami.length; i++) {
        esami[i]=creaEsame($(nodiEsami[i]));
    }
    console.log(esami);
}

function trovaEsamiFatti(tabella) {
    $(tabella).children('tr').each(function() {
        if (esameFatto($(this)) === true) {
            nodiEsami.push(this);
        }
    });
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

function creaEsame(nodoEsame) {
    var materia = "";
    var crediti = 0;
    var voto = 0;
    var data = "";
    materia = materiaDaNodo(nodoEsame);
    crediti = parseInt(nodoEsame.find('td:nth-child(7)').text());
    voto = parseInt(votoDaNodo(nodoEsame));
    data = dataDaNodo(nodoEsame);
    /*
    console.log(materia);
    console.log(crediti);
    console.log(data);
    console.log(voto);
    console.log("----------------------");*/
    return new Esame(materia,crediti, voto, data);

}

function materiaDaNodo(nodo) {
    testo = nodo.find('td:nth-child(2)').text();
    // return /\D+[\d]+/.exec(testo).toString();
    return testo.substring(9).toString();
}

function votoDaNodo(nodo) {
    var votoS = nodo.find('td:nth-child(10)').text();
    return /[^-]+/.exec(votoS).toString();
}

function dataDaNodo(nodo) {
    testo = nodo.find('td:nth-child(10)').text();
    var sub = /[0-9]+\D+/.exec(testo).toString();
    return testo.replace(sub,"");
}
