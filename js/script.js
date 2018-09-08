"use strict";

function setPixel(_imgData, _x, _y, _r, _g, _b, _a){
  let index = (_x+_y*_imgData.width)*4;
  _imgData.data[index+0] = _r;
  _imgData.data[index+1] = _g;
  _imgData.data[index+2] = _b;
  _imgData.data[index+3] = _a;
}

function getRed(imageData, x, y){
  let index = (x+y*imageData.width)*4;
  return imageData.data[index+0];
}

function getGreen(imageData, x, y){
  let index = (x+y*imageData.width)*4;
  return imageData.data[index+1];
}

function getBlue(imageData, x, y){
  let index = (x+y*imageData.width)*4;
  return imageData.data[index+2];
}

//Cambia el color de fondo
function backgroundColor(imageData,r,g,b){
  for(let x = 0; x<imageData.width ;x++){
    for(let y = 0; y<imageData.height;y++){
      setPixel(imageData,x,y,r,g,b,255);
    }
  }
}

//Descarga la imagen
function saveFile(canvas){
  let link = document.createElement('a');
  let img = canvas[0].toDataURL("image/png;base64;");
  $(link).attr("href", img);
  $(link).attr("download", "MiDibujo.png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

//Nuevo lienzo en blanco
function newFile(imageData, ctx){
  backgroundColor(imageData,255,255,255);
  ctx.putImageData(imageData,0,0);
}

$( document ).ready(function() {
  let canvas = $('#canvas');
  let ctx = $(canvas)[0].getContext("2d");
  let imageData = ctx.createImageData($(canvas).attr("width"), $(canvas).attr("height"));
  let mouseX = 0;
  let mouseY = 0;
  let lastX = null;
  let lastY = null;
  let tool_mode = false;
  let tool_value = 0;
  let color = {r:0,g:0,b:0};
  let cursor = null;
  let backupImage = new Image();
  //Almaceno las coordenadas de los cursores personalizados
  let coordinates = {
    "pencil" :{"x":-1, "y":27},
    "eraser" :{"x":0, "y":7 }
  }
  //Array que contiene los filtros
  let filters = [
    //Filtro blanco y negro
    function grayScaleFilter(imageData){
      for(let x = 0; x<imageData.width ;x++){
        for(let y = 0; y<imageData.height;y++){
          let greyValue = (getRed(imageData,x,y)+getGreen(imageData,x,y)+getBlue(imageData,x,y))/3;
          setPixel(imageData,x,y,greyValue,greyValue,greyValue,255);
        }
      }
    },
    //Filtro que aumenta el brillo
    function brightnessFilter(imageData){
      for(let x = 0; x<imageData.width ;x++){
        for(let y = 0; y<imageData.height;y++){
          let greyValue = (getRed(imageData,x,y)+getGreen(imageData,x,y)+getBlue(imageData,x,y))/3;
          setPixel(imageData,x,y,getRed(imageData,x,y)+100,getGreen(imageData,x,y)+100,getBlue(imageData,x,y)+100,255);
        }
      }
    },
    //Filtro binarización
    function binaryFilter(imageData){
      filters[0](imageData);
      let umbral = 127;
      for(let x = 0; x<imageData.width ;x++){
        for(let y = 0; y<imageData.height;y++){
          let value = 0;
          if(getRed(imageData,x,y) >= umbral){
            value = 255;
          }
          setPixel(imageData,x,y,value,value,value,255);
        }
      }
    },
    //Filtro sepia
    function sepiaFilter(imageData){
      for(let x = 0; x<imageData.width ; x++){
        for(let y = 0 ; y<imageData.height ; y++){
          let r = getRed(imageData,x,y)*0.393+getGreen(imageData,x,y)*0.769+getBlue(imageData,x,y)*0.189;
          let g = getRed(imageData,x,y)*0.349+getGreen(imageData,x,y)*0.686+getBlue(imageData,x,y)*0.168;
          let b = getRed(imageData,x,y)*0.272+getGreen(imageData,x,y)*0.534+getBlue(imageData,x,y)*0.131;
          setPixel(imageData,x,y,r,g,b,255);
        }
      }
    }
  ]

  newFile(imageData, ctx);

  $(".toolIcon").on("click",function(){
    //Herramienta seleccionada
    let tool = $(this).data("target");
    tool_value = $(this).attr("value");
    //Coordenadas de la herramienta
    let x = coordinates[tool].x;
    let y = coordinates[tool].y;
    //Construyo el value css con los datos obtenidos
    cursor = "url('img/cursors/"+tool+".png')"+x+" "+y+", default";
  });

  $(".fileIcon").on("click",function(){
    //Almaceno el value del boton clickeado
    /* 0 => save
    1 => import
    2 => new file
    */
    let action = $(this).attr("value");

    //Guardar imagen
    if(action == 0){
      saveFile(canvas);
    }

    //Importar imagen
    else if(action == 1){
      //Crea un input tag de tipo file y lo ejecuta
      // para levantar el archivo
      let input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/x-png,image/jpeg';
      input.click();
      //Cuando el archivo este cargado
      $(input).change(function(){
        //Obtengo el archivo y usando un FileReader
        //Leo su URL
        let file = input.files[0];
        let fr = new FileReader();
        fr.readAsDataURL(file);
        //Una vez cargada la URL
        fr.onload = function(event){
          if(event.target.readyState == fr.DONE){
            //Creo un objeto imagen y la dibujo sobre el canvas
            let img = new Image();
            img.src = event.target.result;
            backupImage.src = event.target.result;
            img.onload = function(){
              //Si el tamaño de la imagen es mayor al del canvas
              //La resizeo
              if(img.width>$(canvas).width() && img.height>$(canvas).height()){
                ctx.drawImage(img,0,0,$(canvas).width(),$(canvas).height());
              }
              //Si no la importo con su tamaño original
              else{
                ctx.drawImage(img,0,0);
              }
            }
          }
        }
      });
    }
    //Nuevo archivo
    else{
      $(function() {
        $("#confirmDialog").dialog({
          resizable: false,
          height: "auto",
          width: "auto",
          modal: true,
          buttons: {
            //Guardo la imagen
            Conservar: function() {
              saveFile(canvas);
              newFile(imageData,ctx);
              $(this).dialog("close");
            },
            //Descarto la imagen
            Descartar: function() {
              newFile(imageData, ctx);
              $(this).dialog("close");
            }
          }
        });
      });
    }
  });

  //Función ejecutada al pasar el mouse sobre eimgl canvas
  $(canvas).hover(function(){
    $(this).css("cursor", cursor);
  });

  //Función ejecutada mientras el mouse esta clickeado sobre el canvas
  $(canvas).on("mousedown", function(event){
    //Cuando se clickea el canvas se activa el modo dibujo
    tool_mode = true;
  });

  //Función ejecutada cuando el click es soltado
  //O el mouse deja el canvas
  $(canvas).on("mouseup mouseleave", function(){
    //Cuando el mouse es soltado o deja el canvas se desactiva el modo herramienta
    tool_mode = false;
    lastX = null;
    lastY = null;
  });

  //Función ejecutada cuando el mouse se mueve sobre el canvas
  $(canvas).on("mousemove",function(event){
    //Si esta activado el modo dibujo
    if(tool_mode){
      //Obtengo las coordenadas del mouse con respecto al canvas
      mouseX = event.clientX - this.offsetLeft;
      mouseY = event.clientY - this.offsetTop;
      //Si estoy dibujando un trazo continuó
      if(lastX!=null && lastY!=null){
        //Uno el punto anterior con el punto actual
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(mouseX, mouseY);
        //Seteo las propiedades segun la herramienta seleccionada
        /* 0: lapiz
        1: goma
        */
        if(tool_value == 0){
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#000000';
        }
        else{
          ctx.lineWidth = 12;
          ctx.strokeStyle = '#FFFFFF';
        }
        ctx.stroke();
      }
      //Recuerdo la ultima posición
      lastX = mouseX;
      lastY = mouseY;
    }
  });

  $('.filterIMG').on("click", function(){
    let action = $(this).data("target");
    imageData = ctx.getImageData(0,0,$(canvas).width(),$(canvas).height());
    filters[action](imageData);
    ctx.putImageData(imageData,0,0)
  });

  //Restaura la imagen
  $('#restoreButton').on("click",function() {
    ctx.drawImage(backupImage,0,0,$(canvas).width(),canvas.height());
  });
});
