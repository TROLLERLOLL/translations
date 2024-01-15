var langs = [];
var heightpercell = 100;
var widthperlang = 250;

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("submitbtn").addEventListener("click", function() {
    readFile();
  })

  document.getElementById("clearbtn").addEventListener("click", function() {
    langs = [];
    document.getElementById("langtable").innerHTML = "";
  })

  document.getElementById("savebtn").addEventListener("click", function() {
    save();
  })
}, false);

function readFile() {
  var files = document.getElementById("fileinput").files;
  for(var i = 0; i < files.length; i++) {
    var file = files[i];
    
    read(file);
  }
}

function read(file) {
  var reader = new FileReader();
  
    reader.addEventListener(
      "load",
      () => {
          fileread(reader.result, file);
          document.getElementById("fileinput").value = "";
      },
      false,
    );
  
    reader.readAsText(file)
}

function fileread(data, file) {
  var parser = new DOMParser();
  var xml = parser.parseFromString(data,"text/xml");

  var datatag = xml.getElementsByTagName("data");
  var lang = {
    name: file.name.replace(".resx", ""),
    values: [],
    xml: xml
  }
  for(var i = 0; i < datatag.length; i++) {
    lang.values[i] = {
      key: datatag[i].attributes[0].nodeValue,
      value: datatag[i].childNodes[1].textContent
    }
  }

  for(var i = 0; i < langs.length; i++) {
    if(langs[i].name == lang.name) {
      langs[i] = lang;
      loadTable();
      return;
    }
  }

  langs[langs.length] = lang;

  if(langs[0].name != "en_us") {
    var templangs = [];
    for(var i = 0; i < langs.length; i++) {
      if(langs[i].name != "en_us")
        templangs[templangs.length] = langs[i];
    }
    var found = false;
    var en = {};
    for(var i = 0; i < langs.length; i++) {
      if(langs[i].name == "en_us") {
        en = langs[i];
        found = true;
        break;
      }
    }
    if(found) {
      langs = [];
      langs[0] = en;
      for(var i = 0; i < templangs.length; i++) {
        langs[i + 1] = templangs[i];
      }
    }
  }
  
  loadTable();
}

function loadTable() {
  tableCreate();
}

function tableCreate() {
  const body = document.getElementById("langtable"),
        tbl = document.createElement('table');
  body.innerHTML = "";

  applystyle(tbl);
  tbl.style.width = (widthperlang * (langs.length + 1)) + 'px';
  tbl.style.height = '';
  
  var keys = [];
  for(var i = 0; i < langs.length; i++) {
    for(var x = 0; x < langs[i].values.length; x++) {
      var found = false;
      for(var y = 0; y < keys.length; y++) {
        if(keys[y] == langs[i].values[x].key) {
          found = true;
          break;
        }
      }

      if(!found) {
        keys[keys.length] = langs[i].values[x].key;
      }
    }
  }

  var row1 = tbl.insertRow();
  applystyle(row1);

  for(var i = -1; i < langs.length; i++) {
    var name = "Key";
    if(i != -1)
      name = langs[i].name.toString().replace("_", " ").toUpperCase();

    var namecell = row1.insertCell();
    namecell.appendChild(document.createTextNode(name));
    applystyle(namecell);
    namecell.style.border = '2px solid black';
  }
  
  for(var m = 0; m < keys.length; m++) {
    var row = tbl.insertRow();
    applystyle(row);


    var cellkey = row.insertCell(0);
        cellkey.appendChild(document.createTextNode(keys[m]));
        applystyle(cellkey);
        cellkey.style.border = '2px solid black';



    for(var i = 0; i < langs.length; i++) {
      
        var cell = row.insertCell(-1);
        applystyle(cell);


        var value = "";
        for(var b = 0; b < langs[i].values.length; b++) {
          if(langs[i].values[b].key == keys[m]) {
            value = langs[i].values[b].value;
            break;
          }
        }

      var input = document.createElement("textarea");
      input.value = value;
      applystyle(input);
    input.style.border = '0px none transparent';

      input.id = langs[i].name + "_" + keys[m];
                  cell.appendChild(input);

    }
  }
  
  
  body.appendChild(tbl);
}

function applystyle(obj) {
  obj.style.outline = '0px';
  obj.style.border = '1px solid gray';
  obj.style.width = widthperlang + 'px';
  obj.style.height = heightpercell + 'px';    
  obj.style.borderSpacing = "0px";
  obj.style.padding = "0px";
  obj.style.resize = "none";
}


function save() {
  var zip = new JSZip();
  for(var i = 0; i < langs.length; i++) {
    for(var x = 0; x < langs[i].values.length; x++) {
      var textbox = document.getElementById(langs[i].name + "_" + langs[i].values[x].key);

      if(textbox != null) {
        langs[i].values[x].value = textbox.value;
      }
    }

    var datatag = langs[i].xml.getElementsByTagName("data");
    for(var x = 0; x < datatag.length; x++) {
      for(var b = 0; b < langs[i].values.length; b++) {
        if(datatag[x].attributes[0].nodeValue == langs[i].values[b].key) {
          datatag[x].childNodes[1].textContent = langs[i].values[b].value;
          break;
        }
      }
    }

    const serializer = new XMLSerializer();
    const xmlStr = serializer.serializeToString(langs[i].xml);
    zip.file(langs[i].name + ".resx", xmlStr);

    zip.generateAsync({type:"base64"}).then(function(content) {
        location.href="data:application/zip;base64," + content;
    });
  }
}

function toexcel() {
var tabledata = [];

for(var i = 0; i < langs.length; i++) {
for (var b = 0; b < langs[i].values.length; b++) {
var found = false;
var Index = -1;
for (var z = 0; z < tabledata.length; z++) {
if (tabledata[z][0] == langs[i].values[b].key)  {
found = true;
Index = z;
break;
}
}

if (found) {
tabledata[Index].push(langs[i].values[b].value);
} else {
tabledata.push([langs[i].values[b].key, langs[i].values[b].value])
}
}
}

return ExcellentExport.convert({ anchor: this, filename: 'data_123.array', format: 'xlsx'},[{name: 'Sheet Name Here 1', from: {array: tabledata}}]);
}
