var app = {

  model: {
    "notas": [{"titulo": "Comprar pan", "contenido": "Oferta en la panaderia de la esquina"}]
  },

  firebaseConfig: {
    apiKey: "AIzaSyD-I-5CYGq5bIsCe37vb9ZtAWLA2Z3BxW0",
    authDomain: "notas-f4be7.firebaseapp.com",
    databaseURL: "https://notas-f4be7.firebaseio.com",
    projectId: "notas-f4be7",
    storageBucket: "gs://notas-f4be7.appspot.com",
    messagingSenderId: "702358746620"
  },

  inicio: function(){
    this.mostrarEstado();
    this.iniciaFastClick();
    this.iniciaFirebase();
    this.iniciaBotones();
    this.refrescarLista();
  },

  iniciaFastClick: function() {
    FastClick.attach(document.body);
  },

  iniciaFirebase: function() {
    firebase.initializeApp(this.firebaseConfig);
  },

  iniciaBotones: function() {
    var salvar = document.querySelector('#salvar');
    var anadir = document.querySelector('#anadir');

    anadir.addEventListener('click' ,this.mostrarEditor ,false);
    salvar.addEventListener('click' ,this.salvarNota ,false);
  },

  mostrarEditor: function() {
    document.getElementById('titulo').value = "";
    document.getElementById('comentario').value = "";
    document.getElementById("note-editor").style.display = "block";
    document.getElementById('titulo').focus();
  },

  salvarNota: function() {
    app.construirNota();
    app.ocultarEditor();
    app.refrescarLista();
    app.grabarDatos();
  },

  construirNota: function() {
    var notas = app.model.notas;
    notas.push({"titulo": app.extraerTitulo() , "contenido": app.extraerComentario() });
  },

  extraerTitulo: function() {
    return document.getElementById('titulo').value;
  },

  extraerComentario: function() {
    return document.getElementById('comentario').value;
  },

  ocultarEditor: function() {
    document.getElementById("note-editor").style.display = "none";
  },

  refrescarLista: function() {
    var div = document.getElementById('notes-list');
    div.innerHTML = this.anadirNotasALista();
  },

  mostrarEstado: function(){
    var estado = document.getElementById('info');
    estado.innerHTML = app.checkConnection();
  },

  anadirNotasALista: function() {
    var notas = this.model.notas;
    var notasDivs = '';
    for (var i in notas) {
      var titulo = notas[i].titulo;
      notasDivs = notasDivs + this.anadirNota(i, titulo);
    }
    return notasDivs;
  },

  anadirNota: function(id, titulo) {
    return "<div class='note-item' id='notas[" + id + "]'>" + titulo + "</div>";
  },


  grabarDatos: function() {
    window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.gotFS, this.fail);
  },

  gotFS: function(fileSystem) {
    fileSystem.getFile("files/"+"model.json", {create: true, exclusive: false}, app.gotFileEntry, app.fail);
  },

  gotFileEntry: function(fileEntry) {
    fileEntry.createWriter(app.gotFileWriter, app.fail);
  },

  gotFileWriter: function(writer) {
    writer.onwriteend = function(evt) {
      console.log("datos grabados en externalApplicationStorageDirectory");
      if(app.hayWifi()) {
        app.salvarFirebase();
      }
    };
    writer.write(JSON.stringify(app.model));
  },

  salvarFirebase: function() {
    var ref = firebase.storage().ref('model.json');
    ref.putString(JSON.stringify(app.model));
  },

  hayWifi: function() {
    return navigator.connection.type==='wifi';
  },

  leerDatos: function() {
    window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.obtenerFS, this.fail);
  },

  obtenerFS: function(fileSystem) {
    fileSystem.getFile("files/"+"model.json", null, app.obtenerFileEntry, app.noFile);
  },

  obtenerFileEntry: function(fileEntry) {
    fileEntry.file(app.leerFile, app.fail);
  },

  leerFile: function(file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
      var data = evt.target.result;
      app.model = JSON.parse(data);
      app.inicio();
    };
    reader.readAsText(file);
  },

  noFile: function(error) {
    app.inicio();
  },

  fail: function(error) {
    console.log(error.code);
  },

  checkConnection: function() {
    var networkState = navigator.connection.type;
    var estado='';

    if(networkState==='wifi') estado='Conexión WIFI';
    if(networkState==='ethernet') estado='Conexión por cable';
    if(networkState==='none') estado='Sin conexión a internet';
    if(networkState==='unknown') estado='Conexión desconocida';
    
    return estado;
  },

};

if ('addEventListener' in document) {
  document.addEventListener("deviceready", function() {
    app.leerDatos();
  }, false);
};
