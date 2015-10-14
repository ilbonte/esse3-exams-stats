var tabella = $("tr>td>table>tbody:contains(Attività Didattiche)");
var nodiEsami = [];
var nodiAtt = [];
var esami = [];
var arrayEsami = [];
var data = [];
var attDaSostenere = [];
var media = 0;
loadLib();
waitForElement();
/*
FLOW:
loadLib() carica le librerie
waitForElement() controlla che le librerie siano caricate e chiama init
init()
	trovaAttDidattiche() riempie nodiEsami con le attività valide
		attValida() controlla che la riga della tabella che stiamo esaminando sia un attività
	riempiEsami() crea il vettore di esami (oggetti esame)
		creaEsame() prende la riga della tabella ed estrapola i dati
			materiaDaNodo() estrae la materia
			esameFatto() determina se un esame è stato sotenuto o meno
			esameConVoto() determina se un esame ha un voto numerico oppure soltanto approvato/idoneo/ecc
			votoDaNodo() estrae il voto dal nodo
			dataDaNodo() estrae la data in cui è stato sostenuto l'esame
	calcolaMedia() calcola la media ponderata dei voti
	aggiornaEsamiSenzaVoto() imposta la media come voto degli esami senza voti
	ordinaEsami() separa gli esami da sostenere da quelli sostenuti
	riempiArrayDaEsami() crea un vettore di vettori contenete gli esami. questo perché la libreria js-xlsx accetta solo vettori
		estraiValoriDaArray() prende un oggetto generico e restiutisce un array con i suoi elementi
	inserisciDati() inserisci i vettori estratti nel vettore che verrà "stampato" nel file xlsx
salva() crea e scarica il file xlsx

 */
function Esame(materia, crediti, data, voto, sostenuto) {
    this.materia = materia;
    this.crediti = crediti;
    this.data = data;
    this.voto = voto;
    this.sostenuto = sostenuto;
}

function init() {
    trovaAttDidattiche();
    riempiEsami();
    calcolaMedia();
    aggiornaEsamiSenzaVoto();
    ordinaEsami();
    riempiArrayDaEsami();
    inserisciDati();
    salva();
    console.log(esami);
}

function trovaAttDidattiche() {
    $(tabella).children('tr').each(function() {
        if (attValida($(this))) {
            nodiEsami.push(this);
        }
    });
}

function attValida(riga) {
    //concateno '.' perché isNaN("") è true allora devo fare questo workaround
    if (isNaN(riga.find('td:nth-child(1)').text() + ".")) {
        return false;
    } else {
        return true;
    }
}

function loadLib() {
    var imported0 = document.createElement('script');
    imported0.src = 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment-with-locales.min.js';
    document.head.appendChild(imported0);
    var imported = document.createElement('script');
    imported.src = 'https://cdn.rawgit.com/SheetJS/js-xlsx/master/dist/xlsx.core.min.js';
    document.head.appendChild(imported);
    var imported1 = document.createElement('script');
    imported1.src = 'https://cdn.rawgit.com/eligrey/Blob.js/master/Blob.js';
    document.head.appendChild(imported1);
    var imported2 = document.createElement('script');
    imported2.src = 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min.js';
    document.head.appendChild(imported2);
}

function esameFatto(riga) {
    var numero = "a";
    testo = riga.find('td:nth-child(10)').text();
    if (testo === "") {
        return false;
    } else return true;
}

function esameConVoto(riga) {
    var numero = "a";
    testo = riga.find('td:nth-child(10)').text();
    numero = /[^-]+/.exec(testo);
    if (isNaN(numero) || numero === null) {
        if (numero.toString() === "30L ") {
            return true;
        }
        return false;
    } else {
        return true;
    }
}

function riempiEsami() {
    for (var i = 0; i < nodiEsami.length; i++) {
        esami[i] = creaEsame($(nodiEsami[i]));
    }
}

function ordinaEsami() {
    for (var i = 0; i < esami.length; i++) {
        if (!esami[i].sostenuto) {
            attDaSostenere.push(esami[i]);
        }
    }
}

function creaEsame(nodoEsame) {
    var materia = "";
    var crediti = 0;
    var voto = 0;
    var data;
    var sostenuto;
    materia = materiaDaNodo(nodoEsame);
    crediti = parseInt(nodoEsame.find('td:nth-child(7)').text());
    if (esameFatto(nodoEsame)) {
        if (esameConVoto(nodoEsame)) {
            voto = parseInt(votoDaNodo(nodoEsame));
        } else {
            voto = 0; //temporaneamente lasciato a 0 
        }
        sostenuto = true;
        data = dataDaNodo(nodoEsame);
    } else {
        sostenuto = false;
    }
    return new Esame(materia, crediti, new Date(moment(data, "DD-MM-YYYY")), voto, sostenuto);
}

function materiaDaNodo(nodo) {
    testo = nodo.find('td:nth-child(2)').text();
    return testo.substring(9).toString();
}

function votoDaNodo(nodo) {
    var votoS = nodo.find('td:nth-child(10)').text();
    var voto;
    voto = /[^-]+/.exec(votoS).toString();
    if (voto === "30L ") {
        return 31;
    } else {
        return voto;
    }
}

function dataDaNodo(nodo) {
    testo = nodo.find('td:nth-child(10)').text();
    return testo.slice(-10).toString();
}

function calcolaMedia() {
    var sommaVoti = 0,
        sommaCrediti = 0;
    for (var i = 0; i < esami.length; i++) {
        if (esami[i].sostenuto && esami[i].voto > 0) {
            sommaVoti = sommaVoti + (esami[i].voto * esami[i].crediti);
            sommaCrediti += esami[i].crediti;
        }
    }
    media = sommaVoti / sommaCrediti;
}

function aggiornaEsamiSenzaVoto() {
    for (var i = 0; i < esami.length; i++) {
        if (esami[i].sostenuto && esami[i].voto === 0) {
            esami[i].voto = Math.ceil(media);
        }
    }
}
//
function waitForElement() {
    if ((typeof moment !== "undefined") && (typeof XLSX !== "undefined")) {
        //variable exists, do what you want
        init();
    } else {
        console.log("caricamento...");
        setTimeout(function() {
            waitForElement();
        }, 250);
    }
}

function Workbook() {
    if (!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
}

function riempiArrayDaEsami() {
    for (var i = 0; i < esami.length; i++) {
        if (esami[i].sostenuto) {
            arrayEsami.push(estraiValoriDaArray(esami[i]));
        }
    }
    for (var i = 0; i < attDaSostenere.length; i++) {
        arrayEsami.push(estraiValoriDaArray(attDaSostenere[i]));
    }
}

function estraiValoriDaArray(obj) {
    return Object.keys(obj).map(function(key) {
        return obj[key];
    });
}

function inserisciDati() {
    data[0] = Object.getOwnPropertyNames(esami[0]); //intestazione della tabella
    for (var i = 0; i < arrayEsami.length; i++) {
        data[i + 1] = arrayEsami[i];
    }
}

function salva() {
    var ws_name = "Esse3";
    /* dummy workbook constructor */
    function Workbook() {
        if (!(this instanceof Workbook)) return new Workbook();
        this.SheetNames = [];
        this.Sheets = {};
    }
    var wb = new Workbook();
    /* TODO: date1904 logic */
    function datenum(v, date1904) {
        if (date1904) v += 1462;
        var epoch = Date.parse(v);
        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    }
    /* convert an array of arrays in JS to a CSF spreadsheet */
    function sheet_from_array_of_arrays(data, opts) {
        var ws = {};
        var range = {
            s: {
                c: 10000000,
                r: 10000000
            },
            e: {
                c: 0,
                r: 0
            }
        };
        for (var R = 0; R != data.length; ++R) {
            for (var C = 0; C != data[R].length; ++C) {
                if (range.s.r > R) range.s.r = R;
                if (range.s.c > C) range.s.c = C;
                if (range.e.r < R) range.e.r = R;
                if (range.e.c < C) range.e.c = C;
                var cell = {
                    v: data[R][C]
                };
                if (cell.v == null) continue;
                var cell_ref = XLSX.utils.encode_cell({
                    c: C,
                    r: R
                });
                /* TEST: proper cell types and value handling */
                if (typeof cell.v === 'number') cell.t = 'n';
                else if (typeof cell.v === 'boolean') cell.t = 'b';
                else if (cell.v instanceof Date) {
                    cell.t = 'n';
                    cell.z = XLSX.SSF._table[14];
                    cell.v = datenum(cell.v);
                } else cell.t = 's';
                ws[cell_ref] = cell;
            }
        }
        /* TEST: proper range */
        if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
        return ws;
    }
    var ws = sheet_from_array_of_arrays(data);
    /* TEST: add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    /* write file */
    //XLSX.writeFile(wb, 'sheetjs.xlsx');
    var wopts = {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    };
    var wbout = XLSX.write(wb, wopts);

    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    /* the saveAs call downloads a file on the local machine */
    saveAs(new Blob([s2ab(wbout)], {
        type: ""
    }), "esami.xlsx")
}
